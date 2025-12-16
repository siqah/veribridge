import { useState, useEffect } from "react";

/**
 * Custom hook for managing dark/light theme
 * Persists theme preference to localStorage
 * Detects system preference on first load
 */
export const useTheme = () => {
  // Initialize theme from localStorage or system preference
  const getInitialTheme = () => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("veribridge-theme");
    if (savedTheme) {
      return savedTheme;
    }

    // Fall back to system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("veribridge-theme", theme);
  }, [theme]);

  // Toggle between dark and light
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
};
