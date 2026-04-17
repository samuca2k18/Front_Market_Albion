// src/components/common/ThemeToggle.tsx
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative h-8 w-8 rounded-xl bg-background/40 border border-border/40 hover:border-primary/30 hover:bg-background/60 flex items-center justify-center transition-all group overflow-hidden"
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
    >
      <Sun
        className={`h-4 w-4 absolute transition-all duration-300 ${
          theme === "light"
            ? "rotate-0 scale-100 text-amber-500"
            : "-rotate-90 scale-0 text-amber-500"
        }`}
      />
      <Moon
        className={`h-4 w-4 absolute transition-all duration-300 ${
          theme === "dark"
            ? "rotate-0 scale-100 text-blue-400"
            : "rotate-90 scale-0 text-blue-400"
        }`}
      />
    </button>
  );
}
