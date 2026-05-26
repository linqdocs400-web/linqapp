import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useLiveRiderCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      const { count: c } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (c !== null) setCount(c);
    }
    fetchCount();
  }, []);

  return count;
}
