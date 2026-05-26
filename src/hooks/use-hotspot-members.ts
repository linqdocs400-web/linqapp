/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type RidePost } from "./use-ride-posts";

export type HotspotMember = {
  userId: string;
  name: string;
  connect_method?: "instagram" | "whatsapp" | "telegram";
  connect_id?: string;
  bio?: string;
  ride: RidePost | null;
};

function mapRide(d: any): RidePost {
  return {
    ...d,
    owner_name: d.profiles?.name || "Member",
    connect_method: d.profiles?.connect_method,
    connect_id: d.profiles?.connect_id,
    bio: d.profiles?.bio,
  };
}

export function useHotspotMembers(hotspotId: string | undefined, currentUserId?: string) {
  return useQuery({
    queryKey: ["hotspot-members", hotspotId, currentUserId],
    enabled: !!hotspotId,
    queryFn: async (): Promise<HotspotMember[]> => {
      const { data: members, error: membersError } = await supabase
        .from("hotspot_members")
        .select("user_id")
        .eq("hotspot_id", hotspotId!);

      if (membersError) throw membersError;

      const userIds = (members || [])
        .map((m) => m.user_id)
        .filter((id) => id && id !== currentUserId);

      if (userIds.length === 0) return [];

      const [{ data: profiles, error: profilesError }, { data: rides, error: ridesError }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, name, connect_method, connect_id, bio")
            .in("id", userIds),
          supabase
            .from("ride_posts")
            .select("*, profiles:owner_id(name, connect_method, connect_id, bio)")
            .in("owner_id", userIds)
            .eq("status", "active")
            .order("created_at", { ascending: false }),
        ]);

      if (profilesError) throw profilesError;
      if (ridesError) throw ridesError;

      const ridesByOwner = new Map<string, RidePost>();
      for (const row of rides || []) {
        const ownerId = row.owner_id as string;
        if (!ridesByOwner.has(ownerId)) {
          ridesByOwner.set(ownerId, mapRide(row));
        }
      }

      const profileById = new Map((profiles || []).map((p) => [p.id, p]));

      return userIds.map((userId) => {
        const profile = profileById.get(userId);
        const ride = ridesByOwner.get(userId) ?? null;
        return {
          userId,
          name: profile?.name || ride?.owner_name || "Member",
          connect_method: profile?.connect_method ?? ride?.connect_method,
          connect_id: profile?.connect_id ?? ride?.connect_id,
          bio: profile?.bio ?? ride?.bio,
          ride,
        };
      });
    },
  });
}
