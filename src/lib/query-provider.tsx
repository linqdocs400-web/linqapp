/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Database } from "./database.types";

type RidePost = Database["public"]["Tables"]["ride_posts"]["Row"];

interface QueryContextType {
  posts: RidePost[] | null;
  loading: boolean;
  error: string | null;
  createPost: (post: Omit<RidePost, "id" | "created_at">) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

const QueryContext = createContext<QueryContextType | null>(null);

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
          },
        },
      }),
  );

  const [posts, setPosts] = useState<RidePost[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.from("ride_posts").select("*").order("created_at", {
        ascending: false,
      });

      if (error) {
        setError(error.message);
      } else {
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }

  async function createPost(
    postData: Omit<
      Database["public"]["Tables"]["ride_posts"]["Row"],
      "id" | "created_at" | "owner_id" | "updated_at"
    >,
  ) {
    try {
      // Sanitize payload: PostgreSQL rejects "" for dates, uuids, and numbers.
      const sanitizedData = Object.fromEntries(
        Object.entries(postData).map(([key, value]) => [key, value === "" ? null : value]),
      );

      console.log("SANITIZED POST DATA:", JSON.stringify(sanitizedData, null, 2));

      const { data, error } = await (supabase as any)
        .from("ride_posts")
        .insert([sanitizedData])
        .select();
      console.log("SUPABASE ERROR:", error);
      console.log("SUPABASE DATA:", data);

      if (error) {
        console.error("SUPABASE ERROR DUMP:", JSON.stringify(error, null, 2));
        setError(error.message);
        throw error;
      }

      if (data?.[0]) {
        setPosts((prev) => [data[0], ...(prev ?? [])]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create post");
      throw err;
    }
  }

  async function deletePost(id: string) {
    try {
      const { error } = await supabase.from("ride_posts").delete().eq("id", id);

      if (error) {
        setError(error.message);
        throw error;
      }

      setPosts((prev) => prev?.filter((post) => post.id !== id) ?? null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete post");
      throw err;
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <QueryContext.Provider
        value={{
          posts,
          loading,
          error,
          createPost,
          deletePost,
          setError,
        }}
      >
        {children}
      </QueryContext.Provider>
    </QueryClientProvider>
  );
}

export function useQuery() {
  const context = useContext(QueryContext);

  if (!context) {
    throw new Error("useQuery must be used within QueryProvider");
  }

  return context;
}
