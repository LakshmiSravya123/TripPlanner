"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Butterfly {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  color: string;
}

interface ButterflyConfettiProps {
  trigger: boolean;
  count?: number;
}

const colors = [
  "from-yellow-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-purple-400 to-indigo-500",
  "from-blue-400 to-cyan-500",
];

export default function ButterflyConfetti({ trigger, count = 30 }: ButterflyConfettiProps) {
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);

  useEffect(() => {
    if (trigger) {
      const newButterflies: Butterfly[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        delay: Math.random() * 0.5,
        duration: 3 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setButterflies(newButterflies);
    }
  }, [trigger, count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {butterflies.map((butterfly) => (
        <motion.div
          key={butterfly.id}
          className={`absolute w-6 h-6 bg-gradient-to-br ${butterfly.color} rounded-full`}
          style={{
            left: `${butterfly.x}%`,
          }}
          initial={{
            y: butterfly.y,
            x: 0,
            opacity: 0,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 200,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: butterfly.duration,
            delay: butterfly.delay,
            ease: "easeOut",
          }}
        >
          {/* Butterfly wings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-white/30 rounded-full blur-sm" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

