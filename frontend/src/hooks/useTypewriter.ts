import { useState, useEffect, useRef } from "react";

export function useTypewriter(
  words: string[],
  { typingSpeed = 80, deletingSpeed = 45, pauseMs = 2000 } = {}
): string {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Use ref to lock reference of words array to prevent reference-based reset loops
  const wordsRef = useRef(words);
  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    const list = wordsRef.current;
    if (!list || list.length === 0) return;

    const current = list[wordIndex % list.length];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && text === current) {
      // Finished typing, pause and prepare to delete
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && text === "") {
      // Finished deleting, transition to next word
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((i) => (i + 1) % list.length);
      }, 200); // Clean transition pause before typing next word
    } else {
      // Type or delete next character
      const next = isDeleting
        ? current.slice(0, text.length - 1)
        : current.slice(0, text.length + 1);

      timeout = setTimeout(
        () => setText(next),
        isDeleting ? deletingSpeed : typingSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, typingSpeed, deletingSpeed, pauseMs]);

  return text;
}
