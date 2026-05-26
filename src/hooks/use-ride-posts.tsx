"use client";

import { useQuery } from "@/lib/query-provider";

export function useRidePosts() {
  const { posts, loading, error, createPost, deletePost } = useQuery();

  return {
    posts,
    isLoading: loading,
    error,
    createPost,
    deletePost,
  };
}
