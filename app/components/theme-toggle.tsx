"use client";

import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ThemeToggleProps {
  isDark: boolean;
  onChange: (dark: boolean) => void;
}

export function ThemeToggle({ isDark, onChange }: ThemeToggleProps) {

  return (
    <div className="theme-control">
      <span className="theme-control-label" id="theme-toggle-label">Dark mode</span>
      <span className={`theme-switch-visual${isDark ? " is-dark" : ""}`} aria-hidden="true">
        <Sun className="theme-sun" />
        <Moon className="theme-moon" />
        <span className="theme-switch-disk" />
      </span>
      <Switch
        className="theme-switch"
        checked={isDark}
        onCheckedChange={onChange}
        aria-labelledby="theme-toggle-label"
      />
    </div>
  );
}
