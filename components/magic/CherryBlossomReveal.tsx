"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CherryBlossomRevealProps {
  children: React.ReactNode;
  onComplete?: () => void;
}

export default function CherryBlossomReveal({ children, onComplete }: CherryBlossomRevealProps) {
  const [stage, setStage] = useState<"seed" | "growing" | "blooming" | "complete">("seed");
  const [petals, setPetals] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Seed falling
    setTimeout(() => setStage("growing"), 500);
    
    // Tree growing
    setTimeout(() => setStage("blooming"), 2000);
    
    // Generate petals
    const newPetals = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setPetals(newPetals);
    
    // Complete
    setTimeout(() => {
      setStage("complete");
      onComplete?.();
    }, 4000);
  }, [onComplete]);

  return (
    <div className="relative w-full h-full">
      {/* Seed falling */}
      <AnimatePresence>
        {stage === "seed" && (
          <motion.div
            initial={{ y: -100, opacity: 1, scale: 0.5 }}
            animate={{ y: "50%", opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
            className="absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full z-50"
          />
        )}
      </AnimatePresence>

      {/* Tree growing */}
      <AnimatePresence>
        {stage === "growing" && (
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-1/2 bottom-0 -translate-x-1/2 w-2 h-full bg-gradient-to-t from-amber-800 to-amber-600 origin-bottom z-40"
          />
        )}
      </AnimatePresence>

      {/* Blooming tree */}
      <AnimatePresence>
        {stage === "blooming" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 z-30"
          >
            {/* Tree branches */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <motion.path
                d="M 100 200 Q 50 150 30 100 Q 20 50 100 50 Q 180 50 170 100 Q 150 150 100 200"
                stroke="url(#branchGradient)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
              <defs>
                <linearGradient id="branchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Falling petals */}
      <AnimatePresence>
        {stage === "blooming" &&
          petals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute w-3 h-3 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full z-20"
              style={{
                left: `${petal.x}%`,
                top: `${petal.y}%`,
              }}
              initial={{
                opacity: 0,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                y: [0, typeof window !== "undefined" ? window.innerHeight : 1000],
                rotate: 360,
                x: [0, (Math.random() - 0.5) * 200],
              }}
              transition={{
                duration: 3,
                delay: petal.delay,
                ease: "easeIn",
              }}
            />
          ))}
      </AnimatePresence>

      {/* Content reveal */}
      <AnimatePresence>
        {stage === "complete" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

