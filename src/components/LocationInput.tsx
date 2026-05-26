"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, MapPin, Loader2 } from "lucide-react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: { address: string; lat: number; lon: number }) => void;
  onClear?: () => void;
}

export default function LocationInput({ placeholder, value, onChange, onSelect, onClear }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSelectedRef = useRef<string | null>(null);
  const searchIdRef = useRef(0);

  const searchLocation = useCallback(async (text: string) => {
    const searchId = ++searchIdRef.current;
    try {
      setLoading(true);
      setActiveIndex(-1);

      // Hyderabad focused bounding box
      const viewbox = "78.2311,17.6033,78.5911,17.2161";

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          text,
        )}&format=json&countrycodes=in&limit=8&viewbox=${viewbox}&bounded=0&addressdetails=1&accept-language=en`,
      );

      const data = await res.json();

      // Hyderabad results first
      data.sort((a: Suggestion, b: Suggestion) => {
        const aHyd = a.display_name.toLowerCase().includes("hyderabad") ? 0 : 1;

        const bHyd = b.display_name.toLowerCase().includes("hyderabad") ? 0 : 1;

        return aHyd - bHyd;
      });

      if (searchId !== searchIdRef.current) return;

      setSuggestions(data);
      setIsOpen(true);
    } catch (err) {
      console.error("Location search error:", err);
    } finally {
      if (searchId === searchIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (lastSelectedRef.current !== null && value === lastSelectedRef.current) {
        return;
      }

      if (value.length >= 2) {
        searchLocation(value);
      } else {
        setSuggestions([]);
        setActiveIndex(-1);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [value, searchLocation]);

  const handleClear = useCallback(() => {
    lastSelectedRef.current = null;
    searchIdRef.current++;
    onChange("");
    setSuggestions([]);
    setActiveIndex(-1);
    setIsOpen(false);
    onClear?.();
  }, [onChange, onClear]);

  const handleSelect = useCallback(
    (s: Suggestion) => {
      lastSelectedRef.current = s.display_name;
      searchIdRef.current++;
      onChange(s.display_name);
      onSelect({
        address: s.display_name,
        lat: Number(s.lat),
        lon: Number(s.lon),
      });
      setSuggestions([]);
      setActiveIndex(-1);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange, onSelect],
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsOpen(false);
      setActiveIndex(-1);
    }, 150);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < suggestions.length) {
            handleSelect(suggestions[activeIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, suggestions, activeIndex, handleSelect],
  );

  const handleFocus = useCallback(() => {
    if (
      value.length >= 2 &&
      (lastSelectedRef.current === null || value !== lastSelectedRef.current)
    ) {
      setIsOpen(true);
    }
  }, [value]);

  return (
    <div id="6l5rlu" className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        <input
          ref={inputRef}
          id="x9vk6m"
          value={value}
          onChange={(e) => {
            lastSelectedRef.current = null;
            onChange(e.target.value);
          }}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-border bg-background px-10 py-3 pr-10 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/20"
        />

        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div
          id="r5biv5"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 sm:max-h-72 overflow-y-auto rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl"
        >
          {suggestions.map((s, i) => (
            <button
              id={`7x5ysf-${i}`}
              key={i}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(i)}
              onTouchStart={() => setActiveIndex(i)}
              className={`flex w-full items-start gap-3 border-b border-border p-3 sm:p-4 text-left transition-colors touch-manipulation ${
                i === activeIndex ? "bg-primary/10" : "hover:bg-muted active:bg-muted"
              }`}
            >
              <MapPin className="mt-1 h-4 w-4 text-primary flex-shrink-0" />

              <span className="text-sm text-popover-foreground break-words">
                {s.display_name.length > 40
                  ? `${s.display_name.substring(0, 40)}...`
                  : s.display_name}
              </span>
            </button>
          ))}

          {loading && (
            <div className="p-3 sm:p-4 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span className="break-words">Searching...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
