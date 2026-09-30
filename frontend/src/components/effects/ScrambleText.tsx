"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface ScrambleTextProps {
  text: string;
  className?: string;
  triggerOnHover?: boolean;
}

const GLITCH_CHARS = "01$#@!%&*?+=<>[]{}¥§∆πΩ";

export default function ScrambleText({
  text,
  className = "",
  triggerOnHover = true,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const originalText = useRef(text);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    originalText.current = text;
    setDisplayText(text);
  }, [text]);

  const scramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const maxIterations = originalText.current.length;

    const tick = () => {
      setDisplayText(() => {
        return originalText.current
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return originalText.current[index];
            }
            if (char === " ") return " ";
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join("");
      });

      if (iteration >= maxIterations) {
        setDisplayText(originalText.current);
        setIsScrambling(false);
      } else {
        iteration += 0.85;
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [isScrambling]);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <span
      className={`cursor-default ${className}`}
      onMouseEnter={triggerOnHover ? scramble : undefined}
    >
      {displayText}
    </span>
  );
}
