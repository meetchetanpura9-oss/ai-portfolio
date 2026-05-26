import { useState, useEffect } from "react";

export function useTypewriter(words, { typingSpeed = 80, deletingSpeed = 45, pauseMs = 2000 } = {}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    let timeout;

    if (!isDeleting && text === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    } else {
      const next = isDeleting
        ? current.slice(0, text.length - 1)
        : current.slice(0, text.length + 1);
      timeout = setTimeout(
        () => setText(next),
        isDeleting ? deletingSpeed : typingSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseMs]);

  return text;
}
