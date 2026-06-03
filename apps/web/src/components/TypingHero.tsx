import { phrases } from "@/data";
import { useEffect, useState } from "react";

const TypingHero = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const current = phrases[phraseIndex];

  useEffect(() => {
    const speed = deleting ? 30 : 60;

    const timeout = setTimeout(() => {
      if (!deleting && charIndex < current.length) {
        setCharIndex(charIndex + 1);
      } else if (!deleting && charIndex === current.length) {
        setTimeout(() => setDeleting(true), 1500);
      } else if (deleting && charIndex > 0) {
        setCharIndex(charIndex - 1);
      } else if (deleting && charIndex === 0) {
        setDeleting(false);
        setPhraseIndex((phraseIndex + 1) % phrases.length);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex, current.length]);

  return (
    <span className="text-gradient-violet">
      {current.slice(0, charIndex)}
      <span className="inline-block border-r-[3px] border-primary animate-typing-cursor ml-0.5">&nbsp;</span>
    </span>
  );
};

export default TypingHero;
