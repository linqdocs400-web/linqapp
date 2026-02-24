"use client";

import { useState } from "react";
import React from "react";
import { X } from "lucide-react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (coords: { lat: number; lon: number }) => void;
  onClear?: () => void;
}

export default function LocationInput({ placeholder, value, onChange, onSelect, onClear }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  async function searchLocation(text: string) {
    onChange(text);

    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    // Hyderabad focus + India only
    const viewbox = "78.2311,17.6033,78.5911,17.2161";

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${text}&format=json&countrycodes=in&limit=6&viewbox=${viewbox}&bounded=0`
    );

    let data = await res.json();

    // Push Hyderabad results first
    data = data.sort((a: Suggestion, b: Suggestion) => {
      const aHyd = a.display_name.toLowerCase().includes("hyderabad") ? 0 : 1;
      const bHyd = b.display_name.toLowerCase().includes("hyderabad") ? 0 : 1;
      return aHyd - bHyd;
    });

    setSuggestions(data);
  }

  function handleClear() {
    onChange("");
    setSuggestions([]);
    onClear?.();
  }

  return (
    <div className="relative w-full md:w-1/3">
      <div className="relative">
        <input
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => searchLocation(e.target.value)}
          placeholder={placeholder}
          className="w-full px-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#2F5EEA] pr-10"
        />
        
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute bg-white border rounded-xl mt-1 w-full z-50 max-h-60 overflow-y-auto">
          {suggestions.map((s: Suggestion, i: number) => (
            <div
              key={i}
              onClick={() => {
                onChange(s.display_name);
                onSelect({ lat: Number(s.lat), lon: Number(s.lon) });
                setSuggestions([]);
              }}
              className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {s.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
