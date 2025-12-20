import { useState, useEffect } from "react";

/**
 * Hook to detect if user is likely in Kenya based on browser timezone
 * Returns true if timezone is Africa/Nairobi, false otherwise
 */
export function useLocale() {
  const [isKenyan, setIsKenyan] = useState(false);

  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setIsKenyan(timezone === "Africa/Nairobi");
    } catch (error) {
      // Fallback to false if timezone detection fails
      console.warn("Timezone detection failed:", error);
      setIsKenyan(false);
    }
  }, []);

  return { isKenyan };
}
