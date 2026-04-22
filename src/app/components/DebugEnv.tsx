"use client";

import { useEffect, useState } from "react";

export default function DebugEnv() {
  const [apiUrl, setApiUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Check if environment variable is loaded
    const url = process.env.NEXT_PUBLIC_API_URL;
    
    if (!url) {
      setError("NEXT_PUBLIC_API_URL is not defined in environment");
    } else {
      setApiUrl(url);
      setError("");
    }
  }, []);

  // Only show in development or if there's an error
  if (process.env.NODE_ENV === "production" && !error) {
    return null;
  }

  return (
    <div style={{
      position: "fixed",
      top: "10px",
      right: "10px",
      background: error ? "#ff4444" : "#44ff44",
      color: "white",
      padding: "10px",
      borderRadius: "5px",
      fontSize: "12px",
      zIndex: 9999,
      maxWidth: "300px"
    }}>
      <div><strong>API Debug:</strong></div>
      {error ? (
        <div>{error}</div>
      ) : (
        <div>
          <div>URL: {apiUrl.substring(0, 50)}...</div>
          <div>Environment: {process.env.NODE_ENV}</div>
        </div>
      )}
    </div>
  );
}
