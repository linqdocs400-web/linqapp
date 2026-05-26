"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { useAuth } from "@/lib/auth-provider";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileContext {
  profile: Profile | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const ProfileContext = createContext<ProfileContext | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  async function fetchProfile() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Profile update error:", error);
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      throw err;
    }
  }

  const value: ProfileContext = {
    profile,
    isLoading,
    updateProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
