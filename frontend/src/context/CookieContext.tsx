"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ConsentPreferences,
  DEFAULT_CONSENT,
  getStoredConsent,
  setStoredConsent,
  resetConsent as clearStoredConsent,
} from "../lib/cookie-consent";

interface CookieContextType {
  consent: ConsentPreferences;
  hasChoice: boolean;
  showBanner: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  savePreferences: (prefs: Partial<ConsentPreferences>) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  resetConsentState: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentPreferences>(DEFAULT_CONSENT);
  const [hasChoice, setHasChoice] = useState<boolean>(true); // Default true to avoid SSR flicker
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check initial stored consent on mount
    const stored = getStoredConsent();
    if (stored) {
      setConsent(stored);
      setHasChoice(true);
      setShowBanner(false);
    } else {
      setConsent(DEFAULT_CONSENT);
      setHasChoice(false);
      setShowBanner(true);
    }

    // Listen to consent changes dispatched across components or tabs
    const handleConsentUpdate = (e: CustomEvent<ConsentPreferences | null>) => {
      if (e.detail) {
        setConsent(e.detail);
        setHasChoice(true);
      } else {
        setConsent(DEFAULT_CONSENT);
        setHasChoice(false);
      }
    };

    window.addEventListener(
      "cookie_consent_updated",
      handleConsentUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "cookie_consent_updated",
        handleConsentUpdate as EventListener
      );
    };
  }, []);

  const acceptAll = () => {
    const updated = setStoredConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
    setConsent(updated);
    setHasChoice(true);
    setShowBanner(false);
    setIsPreferencesOpen(false);
  };

  const rejectOptional = () => {
    const updated = setStoredConsent({
      essential: true,
      analytics: false,
      marketing: false,
    });
    setConsent(updated);
    setHasChoice(true);
    setShowBanner(false);
    setIsPreferencesOpen(false);
  };

  const savePreferences = (prefs: Partial<ConsentPreferences>) => {
    const updated = setStoredConsent(prefs);
    setConsent(updated);
    setHasChoice(true);
    setShowBanner(false);
    setIsPreferencesOpen(false);
  };

  const openPreferences = () => {
    setIsPreferencesOpen(true);
  };

  const closePreferences = () => {
    setIsPreferencesOpen(false);
  };

  const resetConsentState = () => {
    clearStoredConsent();
    setConsent(DEFAULT_CONSENT);
    setHasChoice(false);
    setShowBanner(true);
  };

  return (
    <CookieContext.Provider
      value={{
        consent,
        hasChoice,
        showBanner,
        isPreferencesOpen,
        acceptAll,
        rejectOptional,
        savePreferences,
        openPreferences,
        closePreferences,
        resetConsentState,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookie() {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error("useCookie must be used within a CookieProvider");
  }
  return context;
}
