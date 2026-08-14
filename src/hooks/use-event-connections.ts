import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { Database } from "@/lib/database.types";

export type EventConnectionStatus = "pending" | "accepted" | "declined";

type EventParticipant = Database["public"]["Tables"]["event_participants"]["Row"];

export interface EnrichedEventConnection {
  id: string;
  event_id: string;
  requester_id: string;
  receiver_id: string;
  status: EventConnectionStatus;
  created_at: string;
  updated_at: string;
  // Joined fields for the *other* person in the connection
  participant?: EventParticipant;
  profile?: {
    name: string;
    phone: string;
    avatar_url: string;
  };
}

// Helper to enrich connections with participant and profile data
async function enrichConnections(
  connections: any[],
  eventId: string,
  otherUserIdKey: "requester_id" | "receiver_id"
): Promise<EnrichedEventConnection[]> {
  if (connections.length === 0) return [];

  const otherUserIds = [...new Set(connections.map((c) => c[otherUserIdKey]).filter(Boolean))];

  if (otherUserIds.length === 0) return connections;

  // Fetch participants
  const { data: participantsData, error: participantsError } = await supabase
    .from("event_participants")
    .select("*")
    .eq("event_id", eventId)
    .in("user_id", otherUserIds);

  if (participantsError) {
    console.error("Failed to load participants for connections:", participantsError);
  }

  // Fetch profiles (for phone number and avatar)
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, user_id, name, phone, avatar_url")
    .or(`id.in.(${otherUserIds.join(",")}),user_id.in.(${otherUserIds.join(",")})`);

  if (profilesError) {
    console.error("Failed to load profiles for connections:", profilesError);
  }

  const participantsByUserId = new Map((participantsData ?? []).map((p) => [p.user_id, p]));
  const profilesByUserId = new Map((profilesData ?? []).map((p) => [p.user_id || p.id, p]));

  return connections.map((conn) => {
    const otherUserId = conn[otherUserIdKey];
    const participant = participantsByUserId.get(otherUserId);
    const profile = profilesByUserId.get(otherUserId);

    return {
      ...conn,
      participant,
      profile: profile ? {
        name: profile.name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      } : undefined,
    };
  });
}

export function useEventConnections(eventId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Sent Requests
  const sentRequests = useQuery({
    queryKey: ["event_connections", "sent", eventId, user?.id],
    enabled: !!eventId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_connections")
        .select("*")
        .eq("event_id", eventId)
        .eq("requester_id", user!.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return enrichConnections(data, eventId!, "receiver_id");
    },
  });

  // Fetch Incoming Requests
  const incomingRequests = useQuery({
    queryKey: ["event_connections", "incoming", eventId, user?.id],
    enabled: !!eventId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_connections")
        .select("*")
        .eq("event_id", eventId)
        .eq("receiver_id", user!.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return enrichConnections(data, eventId!, "requester_id");
    },
  });

  // Fetch Accepted Connections (can be requester or receiver)
  const acceptedConnections = useQuery({
    queryKey: ["event_connections", "accepted", eventId, user?.id],
    enabled: !!eventId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_connections")
        .select("*")
        .eq("event_id", eventId)
        .eq("status", "accepted")
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // We need to enrich based on who the OTHER person is
      const enrichedData = await Promise.all(data.map(async (conn) => {
        const isRequester = conn.requester_id === user!.id;
        const otherUserIdKey = isRequester ? "receiver_id" : "requester_id";
        const enrichedArray = await enrichConnections([conn], eventId!, otherUserIdKey);
        return enrichedArray[0];
      }));

      return enrichedData;
    },
  });

  // Fetch just all raw connections for the user to determine status in the UI directory
  const allUserConnections = useQuery({
    queryKey: ["event_connections", "all", eventId, user?.id],
    enabled: !!eventId && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_connections")
        .select("requester_id, receiver_id, status")
        .eq("event_id", eventId)
        .or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`);

      if (error) throw error;
      return data;
    },
  });

  // Check pending incoming count
  const pendingIncomingCount = useQuery({
    queryKey: ["event_connections", "pending_count", eventId, user?.id],
    enabled: !!eventId && !!user?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("event_connections")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("receiver_id", user!.id)
        .eq("status", "pending");

      if (error) throw error;
      return count || 0;
    },
  });

  // Send a request
  const sendRequest = useMutation({
    mutationFn: async (receiverId: string) => {
      if (!user || !eventId) throw new Error("Missing auth or event");

      const { data, error } = await supabase
        .from("event_connections")
        .insert({
          event_id: eventId,
          requester_id: user.id,
          receiver_id: receiverId,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_connections"] });
    },
  });

  // Accept a request
  const acceptRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from("event_connections")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_connections"] });
    },
  });

  // Decline a request
  const declineRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase
        .from("event_connections")
        .update({ status: "declined", updated_at: new Date().toISOString() })
        .eq("id", connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_connections"] });
    },
  });

  // Delete/Cancel a request
  const deleteRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("event_connections")
        .delete()
        .eq("id", connectionId)
        .eq("requester_id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_connections"] });
    },
  });

  return {
    sentRequests,
    incomingRequests,
    acceptedConnections,
    allUserConnections,
    pendingIncomingCount,
    sendRequest,
    acceptRequest,
    declineRequest,
    deleteRequest,
  };
}
