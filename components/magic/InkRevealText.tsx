"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface InkRevealTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function InkRevealText({ text, className = "", delay = 0 }: InkRevealTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, 50);
      
      return () => clearInterval(interval);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [text, delay]);

  return (
    <div className={`relative ${className}`}>
      <motion.span
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {displayedText}
        {!isComplete && (
          <motion.span
            className="inline-block w-0.5 h-6 bg-gradient-to-b from-yellow-400 to-amber-600 ml-1"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.span>
      
      {/* Golden ink trail effect */}
      {isComplete && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}
      
      {/* Sparkle particles */}
      {isComplete && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                opacity: 1,
                scale: 0,
              }}
              animate={{
                opacity: [1, 0],
                scale: [0, 1.5, 0],
                y: Math.random() * 50 - 25,
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

