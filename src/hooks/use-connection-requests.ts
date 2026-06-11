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
    gender?: string;
    connect_method?: string;
    connect_id?: string;
  };
  receiver?: {
    name: string;
    bio?: string;
    gender?: string;
    connect_method?: string;
    connect_id?: string;
  };
  ride?: {
    pickup_location?: string | null;
    drop_location?: string | null;
    journey_date?: string | null;
    journey_time?: string | null;
    vehicle_type?: string | null;
    seats?: number | null;
    ride_type?: string | null;
    days?: string[] | null;
    return_journey?: boolean | null;
    return_time?: string | null;
  };
}

const CONNECTION_REQUEST_SELECT =
  "id, sender_id, receiver_id, ride_id, status, created_at, updated_at";

const RIDE_SELECT =
  "id, pickup_location, drop_location, journey_date, journey_time, vehicle_type, seats, ride_type, days, return_journey, return_time";

const PROFILE_SELECT = "id, name, bio, gender, connect_method, connect_id";

type ProfileRow = {
  id: string;
  name: string;
  bio?: string;
  gender?: string;
  connect_method?: string;
  connect_id?: string;
};

type RideRow = {
  id: string;
  pickup_location?: string | null;
  drop_location?: string | null;
  journey_date?: string | null;
  journey_time?: string | null;
  vehicle_type?: string | null;
  seats?: number | null;
  ride_type?: string | null;
  days?: string[] | null;
  return_journey?: boolean | null;
  return_time?: string | null;
};

async function enrichConnectionRequests(
  requests: ConnectionRequest[],
  profileKey: "sender" | "receiver",
  profileIds: string[],
): Promise<ConnectionRequest[]> {
  if (requests.length === 0) return [];

  const uniqueProfileIds = [...new Set(profileIds.filter(Boolean))];
  const rideIds = [...new Set(requests.map((r) => r.ride_id).filter(Boolean))];

  const [profilesResult, ridesResult] = await Promise.all([
    uniqueProfileIds.length > 0
      ? supabase.from("profiles").select(PROFILE_SELECT).in("id", uniqueProfileIds)
      : Promise.resolve({ data: [] as ProfileRow[], error: null }),
    rideIds.length > 0
      ? supabase.from("ride_posts").select(RIDE_SELECT).in("id", rideIds)
      : Promise.resolve({ data: [] as RideRow[], error: null }),
  ]);

  if (profilesResult.error) {
    console.error("Failed to load profiles for connection requests:", profilesResult.error);
  }
  if (ridesResult.error) {
    console.error("Failed to load rides for connection requests:", ridesResult.error);
  }

  const profilesById = new Map(
    (profilesResult.data ?? []).map((p) => [p.id, p]),
  );
  const ridesById = new Map((ridesResult.data ?? []).map((r) => [r.id, r]));

  return requests.map((request) => {
    const profileId =
      profileKey === "sender" ? request.sender_id : request.receiver_id;
    const profile = profilesById.get(profileId);
    const ride = ridesById.get(request.ride_id);

    return {
      ...request,
      [profileKey]: profile
        ? {
            name: profile.name,
            bio: profile.bio,
            gender: profile.gender,
            connect_method: profile.connect_method,
            connect_id: profile.connect_id,
          }
        : undefined,
      ride: ride
        ? {
            pickup_location: ride.pickup_location,
            drop_location: ride.drop_location,
            journey_date: ride.journey_date,
            journey_time: ride.journey_time,
            vehicle_type: ride.vehicle_type,
            seats: ride.seats,
            ride_type: ride.ride_type,
            days: ride.days,
            return_journey: ride.return_journey,
            return_time: ride.return_time,
          }
        : undefined,
    };
  });
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

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("connection_requests")
        .select("id", { count: "exact", head: true })
        .eq("sender_id", user.id)
        .gte("created_at", startOfToday.toISOString());

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
        .select(CONNECTION_REQUEST_SELECT)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
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
        .select(CONNECTION_REQUEST_SELECT)
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return enrichConnectionRequests(
        (data ?? []) as ConnectionRequest[],
        "sender",
        (data ?? []).map((r) => r.sender_id),
      );
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
        .select(CONNECTION_REQUEST_SELECT)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return enrichConnectionRequests(
        (data ?? []) as ConnectionRequest[],
        "receiver",
        (data ?? []).map((r) => r.receiver_id),
      );
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
        .select("id", { count: "exact", head: true })
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

      console.log("ACCEPT REQUEST - Starting accept for requestId:", requestId);

      // Update request status
      const { data: requestData, error: requestError } = await supabase
        .from("connection_requests")
        .update({ status: "accepted" })
        .eq("id", requestId)
        .select(CONNECTION_REQUEST_SELECT)
        .single();

      if (requestError) {
        console.error("ACCEPT REQUEST - Failed to update request status:", requestError);
        throw requestError;
      }
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
        .update({ status: "rejected" })
        .eq("id", requestId)
        .select(CONNECTION_REQUEST_SELECT)
        .single();

      if (error) {
        console.error("REJECT REQUEST - Failed to reject request:", error);
        throw error;
      }
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

      const { data: rows, error } = await supabase
        .from("unlocked_profiles")
        .select("id, user_id, profile_id, request_id, unlocked_at")
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;
      if (!rows?.length) return [];

      const profileIds = [...new Set(rows.map((r) => r.profile_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, bio, phone, email, connect_method, connect_id")
        .in("id", profileIds);

      if (profilesError) {
        console.error("Failed to load unlocked profile details:", profilesError);
      }

      const profilesById = new Map((profiles ?? []).map((p) => [p.id, p]));

      return rows.map((row) => ({
        ...row,
        profile: profilesById.get(row.profile_id),
      })) as UnlockedProfile[];
    },
    enabled: !!user,
  });

  // Delete a sent request (sender only)
  const deleteRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("connection_requests")
        .delete()
        .eq("id", requestId)
        .eq("sender_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sent-requests"] });
      queryClient.invalidateQueries({ queryKey: ["today-request-count"] });
      queryClient.invalidateQueries({ queryKey: ["pending-count"] });
    },
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
    deleteRequest,
    unlockedProfiles,
    checkRequestStatus,
    todayRequestCount,
    canSendRequest,
    getRemainingRequests,
    getDailyRequestLimit,
  };
}
