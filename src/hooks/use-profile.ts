/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";

export type Hotspot = {
  id: string;
  name: string;
  type: "college" | "office";
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  bio: string;
  connect_method: "instagram" | "whatsapp" | "telegram";
  connect_id: string;
  emergency_name: string;
  emergency_phone: string;
  plan: "free" | "weekly" | "monthly";
  plan_expiry: string | null;
  ever_paid?: boolean;
  active_days: string[];
  unlocked_ids: string[];
  rating?: number;
  trips?: number;
  institution_hotspot_id?: string;
  hotspot?: Hotspot;
  hotspot_name?: string;
  hotspot_type?: "college" | "office" | "";
  hotspot_area?: string;
  college_office_name?: string;
};

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          hotspot:institution_hotspot_id (
            id,
            name,
            type
          )
        `)
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("profiles")
        .upsert({ id: user.id, ...patch })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
