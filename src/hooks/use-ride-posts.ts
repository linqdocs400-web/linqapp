/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";

export type RidePost = {
  id: string;
  owner_id: string;
  owner_name: string;
  ride_type: "instant" | "daily" | "long";
  pickup_location: string;
  drop_location: string;
  vehicle_type?: string;
  seats: number;
  days?: string[];
  return_journey?: boolean;
  return_time?: string;
  journey_date?: string;
  journey_time?: string;
  status?: string;
  created_at: string;
  pickup_lat?: number;
  pickup_lon?: number;
  drop_lat?: number;
  drop_lon?: number;
  connect_method?: "instagram" | "whatsapp" | "telegram";
  connect_id?: string;
  bio?: string;
};

export function useRidePosts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["ride_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ride_posts")
        .select("*, profiles:owner_id(name, connect_method, connect_id, bio)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        owner_id: d.owner_id,
        owner_name: d.profiles?.name || "Member",
        connect_method: d.profiles?.connect_method,
        connect_id: d.profiles?.connect_id,
        bio: d.profiles?.bio,
        ride_type: d.ride_type,
        pickup_location: d.pickup_location || "",
        drop_location: d.drop_location || "",
        vehicle_type: d.vehicle_type || undefined,
        seats: d.seats || 0,
        days: d.days || undefined,
        return_journey: d.return_journey || false,
        return_time: d.return_time || undefined,
        journey_date: d.journey_date || undefined,
        journey_time: d.journey_time || undefined,
        status: d.status || "active",
        created_at: d.created_at || new Date().toISOString(),
        pickup_lat: d.pickup_lat,
        pickup_lon: d.pickup_lon,
        drop_lat: d.drop_lat,
        drop_lon: d.drop_lon,
      })) as RidePost[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (
      post: Omit<RidePost, "id" | "owner_id" | "created_at" | "owner_name" | "status">,
    ) => {
      if (!user) throw new Error("Not authenticated");

      const postData = {
        ...post,
        owner_id: user.id,
      };

      // Sanitize payload: PostgreSQL rejects "" for dates, uuids, and numbers.
      const sanitizedData = Object.fromEntries(
        Object.entries(postData).map(([key, value]) => [key, value === "" ? null : value]),
      );

      // Check for duplicate active rides with the exact same locations and type
      const { data: existing } = await (supabase as any)
        .from("ride_posts")
        .select("id")
        .eq("owner_id", user.id)
        .eq("ride_type", post.ride_type)
        .eq("pickup_location", post.pickup_location || "")
        .eq("drop_location", post.drop_location || "")
        .eq("status", "active")
        .limit(1);

      if (existing && existing.length > 0) {
        console.log("Duplicate ride post prevented.");
        return existing[0];
      }

      console.log("SANITIZED POST DATA:", JSON.stringify(sanitizedData, null, 2));

      const { data, error } = await (supabase as any)
        .from("ride_posts")
        .insert(sanitizedData)
        .select()
        .single();
      console.log("SUPABASE ERROR:", error);
      console.log("SUPABASE DATA:", data);

      if (error) {
        console.error("Supabase insert error dump:", JSON.stringify(error, null, 2));
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ride_posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("ride_posts").delete().eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ride_posts"] });
    },
  });

  return {
    posts: query.data || [],
    isLoading: query.isLoading,
    createPost: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deletePost: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
