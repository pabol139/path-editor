import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function CommandLetter({
  id,
  letter,
  backgroundColorLetter,
}: {
  id: string;
  letter: string;
  backgroundColorLetter: string;
}) {
  const counterRef = useRef(0);
  const prevLetterRef = useRef(letter);

  if (prevLetterRef.current !== letter) {
    counterRef.current += 1;
    prevLetterRef.current = letter;
  }

  const letterKey = letter + id + counterRef.current;

  return (
    <div
      className={`text-sm px-2 py-1 w-7 relative overflow-hidden ${backgroundColorLetter} transition-colors text-center rounded-tl-[5px] rounded-bl-[5px]`}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          className="flex justify-center items-center"
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0.3,
          }}
          key={letterKey}
          initial={{ x: -50, opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 25, opacity: 0 }}
        >
          {letter}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
