export interface ConsentPreferences {
  version: number;
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export const COOKIE_CONSENT_KEY = "portfolio_cookie_consent";
export const COOKIE_EXPIRY_DAYS = 180;
export const CURRENT_CONSENT_VERSION = 1;

export const DEFAULT_CONSENT: ConsentPreferences = {
  version: CURRENT_CONSENT_VERSION,
  essential: true,
  analytics: false,
  marketing: false,
  timestamp: "",
};

/**
 * Reads cookie consent from browser cookie or localStorage fallback
 */
export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    // 1. Try reading document.cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === COOKIE_CONSENT_KEY && value) {
        const parsed = JSON.parse(decodeURIComponent(value));
        if (parsed && typeof parsed === "object") {
          return {
            ...DEFAULT_CONSENT,
            ...parsed,
            essential: true, // Essential is non-negotiable
          };
        }
      }
    }

    // 2. Fallback to localStorage if cookie isn't accessible
    const local = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && typeof parsed === "object") {
        return {
          ...DEFAULT_CONSENT,
          ...parsed,
          essential: true,
        };
      }
    }
  } catch (error) {
    console.error("Error reading cookie consent:", error);
  }

  return null;
}

/**
 * Saves cookie consent preferences to first-party cookie and localStorage
 */
export function setStoredConsent(
  prefs: Partial<ConsentPreferences>
): ConsentPreferences {
  const current = getStoredConsent() || DEFAULT_CONSENT;
  const updated: ConsentPreferences = {
    ...current,
    ...prefs,
    version: CURRENT_CONSENT_VERSION,
    essential: true, // Always active
    timestamp: new Date().toISOString(),
  };

  const jsonValue = JSON.stringify(updated);

  if (typeof window !== "undefined") {
    try {
      // Set first-party cookie (180 days retention, SameSite=Lax)
      const maxAge = COOKIE_EXPIRY_DAYS * 24 * 60 * 60;
      document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(
        jsonValue
      )}; max-age=${maxAge}; path=/; SameSite=Lax`;

      // Set localStorage fallback
      localStorage.setItem(COOKIE_CONSENT_KEY, jsonValue);

      // Dispatch custom window event so scripts/components react immediately
      window.dispatchEvent(
        new CustomEvent("cookie_consent_updated", { detail: updated })
      );
    } catch (error) {
      console.error("Error saving cookie consent:", error);
    }
  }

  return updated;
}

/**
 * Checks if the visitor has already recorded a consent preference
 */
export function hasGivenConsent(): boolean {
  return getStoredConsent() !== null;
}

/**
 * Resets stored consent (for testing or re-triggering)
 */
export function resetConsent(): void {
  if (typeof window === "undefined") return;

  try {
    document.cookie = `${COOKIE_CONSENT_KEY}=; max-age=0; path=/; SameSite=Lax`;
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.dispatchEvent(
      new CustomEvent("cookie_consent_updated", { detail: null })
    );
  } catch (error) {
    console.error("Error resetting cookie consent:", error);
  }
}
