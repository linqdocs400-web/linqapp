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
  sender_profile_id?: string;
  receiver_profile_id?: string;
  accepted_at?: string;
  rejected_at?: string;
  // Joined fields
  sender?: {
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
  receiver?: {
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
    phone?: string;
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

      console.log("QUERY RESULT - todayRequestCount", count);
      console.log("QUERY ERROR - todayRequestCount", error);

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
      const { data: existing, error: checkError } = await supabase
        .from("connection_requests")
        .select("id")
        .eq("sender_id", user.id)
        .eq("receiver_id", receiverId)
        .eq("ride_id", rideId)
        .maybeSingle();

      console.log("existing request", existing);

      if (checkError) {
        console.error("Error checking existing request:", checkError);
        throw checkError;
      }

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
          sender:profiles!sender_profile_id(name, bio, avatar_url, phone, whatsapp, instagram, telegram, email, connect_method, connect_id),
          ride:ride_posts(pickup_location, drop_location, journey_date, vehicle_type)
        `)
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      console.log("QUERY RESULT - incomingRequests", data);
      console.log("QUERY ERROR - incomingRequests", error);
      console.log("QUERY ERROR CODE - incomingRequests", error?.code);
      console.log("QUERY ERROR MESSAGE - incomingRequests", error?.message);
      console.log("QUERY ERROR DETAILS - incomingRequests", error?.details);
      console.log("QUERY ERROR HINT - incomingRequests", error?.hint);

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
          receiver:profiles!receiver_profile_id(name, bio, avatar_url, phone, whatsapp, instagram, telegram, email, connect_method, connect_id),
          ride:ride_posts(pickup_location, drop_location, journey_date, vehicle_type)
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      console.log("QUERY RESULT - sentRequests", data);
      console.log("QUERY ERROR - sentRequests", error);
      console.log("QUERY ERROR CODE - sentRequests", error?.code);
      console.log("QUERY ERROR MESSAGE - sentRequests", error?.message);
      console.log("QUERY ERROR DETAILS - sentRequests", error?.details);
      console.log("QUERY ERROR HINT - sentRequests", error?.hint);

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

      console.log("QUERY RESULT - pendingCount", count);
      console.log("QUERY ERROR - pendingCount", error);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Accept a request
  const acceptRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("User not authenticated");

      console.log("ACCEPT REQUEST - Starting accept for requestId:", requestId);

      // Update request status
      const { data: requestData, error: requestError } = await supabase
        .from("connection_requests")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", requestId)
        .select()
        .single();

      console.log("ACCEPT REQUEST - requestData", requestData);
      console.log("ACCEPT REQUEST - requestError", requestError);
      console.log("ACCEPT REQUEST - requestError code", requestError?.code);
      console.log("ACCEPT REQUEST - requestError message", requestError?.message);
      console.log("ACCEPT REQUEST - requestError details", requestError?.details);
      console.log("ACCEPT REQUEST - requestError hint", requestError?.hint);

      if (requestError) {
        console.error("ACCEPT REQUEST - Failed to update request status:", requestError);
        throw requestError;
      }

      // Create unlocked profile record
      const { error: unlockError } = await supabase.from("unlocked_profiles").insert({
        user_id: requestData.sender_id,
        profile_id: requestData.receiver_id,
        request_id: requestId,
      });

      console.log("ACCEPT REQUEST - unlockError", unlockError);
      console.log("ACCEPT REQUEST - unlockError code", unlockError?.code);
      console.log("ACCEPT REQUEST - unlockError message", unlockError?.message);

      if (unlockError) {
        console.error("ACCEPT REQUEST - Failed to create unlocked profile:", unlockError);
        throw unlockError;
      }

      console.log("ACCEPT REQUEST - Successfully accepted request:", requestId);
      return requestData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-count"] });
      queryClient.invalidateQueries({ queryKey: ["unlocked-profiles"] });
    },
    onError: (error) => {
      console.error("ACCEPT REQUEST - Mutation error:", error);
    },
  });

  // Reject a request
  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("User not authenticated");

      console.log("REJECT REQUEST - Starting reject for requestId:", requestId);

      const { data, error } = await supabase
        .from("connection_requests")
        .update({ status: "rejected", rejected_at: new Date().toISOString() })
        .eq("id", requestId)
        .select()
        .single();

      console.log("REJECT REQUEST - data", data);
      console.log("REJECT REQUEST - error", error);
      console.log("REJECT REQUEST - error code", error?.code);
      console.log("REJECT REQUEST - error message", error?.message);
      console.log("REJECT REQUEST - error details", error?.details);
      console.log("REJECT REQUEST - error hint", error?.hint);

      if (error) {
        console.error("REJECT REQUEST - Failed to reject request:", error);
        throw error;
      }

      console.log("REJECT REQUEST - Successfully rejected request:", requestId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["incoming-requests"] });
      queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-count"] });
    },
    onError: (error) => {
      console.error("REJECT REQUEST - Mutation error:", error);
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
          profile:profiles(name, bio, phone, email, connect_method, connect_id)
        `)
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false });

      console.log("QUERY RESULT - unlockedProfiles", data);
      console.log("QUERY ERROR - unlockedProfiles", error);
      console.log("QUERY ERROR CODE - unlockedProfiles", error?.code);
      console.log("QUERY ERROR MESSAGE - unlockedProfiles", error?.message);
      console.log("QUERY ERROR DETAILS - unlockedProfiles", error?.details);
      console.log("QUERY ERROR HINT - unlockedProfiles", error?.hint);

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
