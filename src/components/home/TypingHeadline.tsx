"use client";

import { useEffect, useState } from "react";

const DEFAULT_PHRASES = [
  "serious mock interviews.",
  "live code, video & runs together.",
  "technical stories that land.",
];

type Props = {
  /** Full sentence for assistive tech (the visible line is animated). */
  accessibleTitle: string;
  className?: string;
  phrases?: string[];
  typingMs?: number;
  deletingMs?: number;
  pauseMs?: number;
};

export function TypingHeadline({
  accessibleTitle,
  className = "",
  phrases = DEFAULT_PHRASES,
  typingMs = 42,
  deletingMs = 28,
  pauseMs = 2200,
}: Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const safePhrases = phrases.length > 0 ? phrases : DEFAULT_PHRASES;
  const phrase = safePhrases[phraseIndex % safePhrases.length] ?? "";

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < phrase.length) {
      timer = setTimeout(() => {
        setText(phrase.slice(0, text.length + 1));
      }, typingMs);
    } else if (!deleting && text.length === phrase.length) {
      timer = setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && text.length > 0) {
      timer = setTimeout(() => {
        setText(phrase.slice(0, text.length - 1));
      }, deletingMs);
    } else if (deleting && text.length === 0) {
      setDeleting(false);
      setPhraseIndex((i) => i + 1);
    }

    return () => clearTimeout(timer);
  }, [text, deleting, phrase, typingMs, deletingMs, pauseMs]);

  return (
    <span
      className={`bg-gradient-to-r from-accent-soft via-accent to-accent-violet bg-clip-text text-transparent ${className}`.trim()}
      aria-label={accessibleTitle}
    >
      <span aria-hidden>{text}</span>
      <span
        className="ml-0.5 inline-block min-h-[1em] w-px translate-y-px bg-accent motion-safe:animate-pulse motion-reduce:animate-none"
        aria-hidden
      />
    </span>
  );
}
