import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function DebugProfiles({ otherUserIds }: { otherUserIds: string[] }) {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!otherUserIds.length) return;
    async function fetchIt() {
      // Try fetching by id
      const res1 = await supabase.from("profiles").select("*").in("id", otherUserIds);
      // Try fetching by user_id if that fails
      const res2 = await supabase.from("profiles").select("*").in("user_id", otherUserIds);
      
      setResult({
        userIdsToFind: otherUserIds,
        byId: { data: res1.data, error: res1.error },
        byUserId: { data: res2.data, error: res2.error }
      });
    }
    fetchIt();
  }, [otherUserIds]);

  if (!result) return null;
  return (
    <div className="bg-red-50 p-4 rounded-xl border border-red-200 mt-4 overflow-auto max-h-64 text-xs font-mono">
      <h3 className="font-bold text-red-800 mb-2">DEBUG PROFILES QUERY</h3>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
