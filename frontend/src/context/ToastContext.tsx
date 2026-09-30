"use client";

import { createContext, useCallback, useState, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiCheckCircle, HiExclamationCircle, HiX } from "react-icons/hi";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastContextProps {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 4500) => {
      const id = typeof window !== "undefined" ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:bottom-6 sm:right-6 sm:px-0"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 bg-[#14141f]/95 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              {t.type === "success" ? (
                <HiCheckCircle className="mt-0.5 shrink-0 text-lg text-emerald-400" />
              ) : (
                <HiExclamationCircle className="mt-0.5 shrink-0 text-lg text-red-400" />
              )}
              <p className="flex-1 text-sm text-gray-200">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-gray-500 hover:text-white cursor-pointer"
                aria-label="Dismiss"
              >
                <HiX />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
