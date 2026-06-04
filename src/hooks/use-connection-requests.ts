import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { useProfile } from "@/hooks/use-profile";

export type ConnectionRequestStatus = "pending" | "accepted" | "rejected";

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  ride_id: string;
  status: ConnectionRequestStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  sender?: {
    name: string;
    bio?: string;
    avatar_url?: string;
  };
  receiver?: {
    name: string;
    bio?: string;
    avatar_url?: string;
  };
  ride?: {
    pickup_location: string;
    drop_location: string;
    journey_date: string;
    vehicle_type: string;
  };
}

export interface UnlockedProfile {
  id: string;
  user_id: string;
  profile_id: string;
  request_id: string;
  unlocked_at: string;
  // Joined fields
  profile?: {
    name: string;
    bio?: string;
    avatar_url?: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    telegram?: string;
    email?: string;
    connect_method?: string;
    connect_id?: string;
  };
}

export function useConnectionRequests() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  // Get daily request limit based on plan
  const getDailyRequestLimit = (): number => {
    const plan = profile?.plan || "free";
    switch (plan) {
      case "weekly":
        return 5;
      case "monthly":
        return 8;
      case "free":
      default:
        return 2;
    }
  };

  // Fetch today's request count for current user
  const todayRequestCount = useQuery({
    queryKey: ["today-request-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const today = new Date().toISOString().split("T")[0];
      const { count, error } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", user.id)
        .gte("created_at", today);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Check if user can send more requests
  const canSendRequest = (): boolean => {
    const limit = getDailyRequestLimit();
    const todayCount = todayRequestCount.data || 0;
    return todayCount < limit;
  };

  // Get remaining requests for today
  const getRemainingRequests = (): number => {
    const limit = getDailyRequestLimit();
    const todayCount = todayRequestCount.data || 0;
    return Math.max(0, limit - todayCount);
  };

  // Create a connection request
  const createRequest = useMutation({
    mutationFn: async ({ receiverId, rideId }: { receiverId: string; rideId: string }) => {
      if (!user) throw new Error("User not authenticated");

      // Check daily request limit
      if (!canSendRequest()) {
        const limit = getDailyRequestLimit();
        const plan = profile?.plan || "free";
        if (plan === "free") {
          throw new Error("You have reached today's request limit. Upgrade to send more connection requests.");
        } else {
          throw new Error(`You have used all ${limit} requests for today.`);
        }
      }

      // Check if request already exists
      const { data: existing } = await supabase
        .from("connection_requests")
        .select("id")
        .eq("sender_id", user.id)
        .eq("receiver_id", receiverId)
        .eq("ride_id", rideId)
        .single();

      if (existing) {
        throw new Error("Request already exists");
      }

      const { data, error } = await supabase
        .from("connection_requests")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          ride_id: rideId,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["sent-requests", user?.id], (oldData: any) => {
        if (!oldData) return [data];
        return [data, ...oldData];
      });
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["today-request-count"] });
    },
  });

  // Fetch incoming requests (requests where current user is receiver)
  const incomingRequests = useQuery({
    queryKey: ["incoming-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("connection_requests")
        .select(`
          *,
          sender:profiles!sender_id(name, bio, avatar_url),
          ride:ride_posts(pickup_location, drop_location, journey_date, vehicle_type)
        `)
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ConnectionRequest[];
    },
    enabled: !!user,
  });

  // Fetch sent requests (requests where current user is sender)
  const sentRequests = useQuery({
    queryKey: ["sent-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("connection_requests")
        .select(`
          *,
          receiver:profiles!receiver_id(name, bio, avatar_url),
          ride:ride_posts(pickup_location, drop_location, journey_date, vehicle_type)
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ConnectionRequest[];
    },
    enabled: !!user,
  });

  // Fetch pending notification count
  const pendingCount = useQuery({
    queryKey: ["pending-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Accept a request
  const acceptRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Update request status
      const { data: requestData, error: requestError } = await supabase
        .from("connection_requests")
        .update({ status: "accepted" })
        .eq("id", requestId)
        .select()
        .single();

      if (requestError) throw requestError;

      // Create unlocked profile record
      const { error: unlockError } = await supabase.from("unlocked_profiles").insert({
        user_id: requestData.sender_id,
        profile_id: requestData.receiver_id,
        request_id: requestId,
      });

      if (unlockError) throw unlockError;

      return requestData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["unlocked-profiles"] });
    },
  });

  // Reject a request
  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("connection_requests")
        .update({ status: "rejected" })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-count"] });
    },
  });

  // Fetch unlocked profiles (accepted connections)
  const unlockedProfiles = useQuery({
    queryKey: ["unlocked-profiles", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("unlocked_profiles")
        .select(`
          *,
          profile:profiles(name, bio, avatar_url, phone, whatsapp, instagram, telegram, email, connect_method, connect_id)
        `)
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;
      return data as UnlockedProfile[];
    },
    enabled: !!user,
  });

  // Check if request exists for a specific ride
  const checkRequestStatus = useMutation({
    mutationFn: async ({ receiverId, rideId }: { receiverId: string; rideId: string }) => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("connection_requests")
        .select("id, status")
        .eq("sender_id", user.id)
        .eq("receiver_id", receiverId)
        .eq("ride_id", rideId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return {
    createRequest,
    incomingRequests,
    sentRequests,
    pendingCount,
    acceptRequest,
    rejectRequest,
    unlockedProfiles,
    checkRequestStatus,
    todayRequestCount,
    canSendRequest,
    getRemainingRequests,
    getDailyRequestLimit,
  };
}
