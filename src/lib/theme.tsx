import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "sapphire" | "sapphire-dark";

const ALL: Theme[] = ["sapphire", "sapphire-dark"];

type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };
const ThemeCtx = createContext<Ctx>({ theme: "sapphire", setTheme: () => {}, toggle: () => {} });

const STORAGE_KEY = "together-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("sapphire");

  useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      localStorage.getItem(STORAGE_KEY)) as Theme | null;
    if (stored && ALL.includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    ALL.forEach((t) => root.classList.remove(`theme-${t}`));
    root.classList.add(`theme-${theme}`);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setThemeState((t) => (t === "sapphire" ? "sapphire-dark" : "sapphire"));

  return (
    <ThemeCtx.Provider value={{ theme, setTheme: setThemeState, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
