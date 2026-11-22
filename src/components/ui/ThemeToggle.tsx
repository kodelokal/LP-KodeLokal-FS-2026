"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
      title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:border-brand-blue hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!mounted ? (
          <span key="placeholder" className="h-4 w-4" />
        ) : isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
          >
            <Sun className="h-4 w-4 text-brand-amber" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 45, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -45, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
          >
            <Moon className="h-4 w-4 text-brand-blue" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
