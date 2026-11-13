import { useEffect } from "react";

/** Client-side navigation (App listens to pushState). */
export function navigate(href) {
  window.history.pushState(null, "", href);
  window.scrollTo(0, 0);
}

/** Sets <title> and the meta description while a page is shown. */
export function usePageMeta(title, description) {
  useEffect(() => {
    if (!title) return undefined;
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content");
    document.title = title;
    if (meta && description) meta.setAttribute("content", description);
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription != null) meta.setAttribute("content", previousDescription);
    };
  }, [title, description]);
}
