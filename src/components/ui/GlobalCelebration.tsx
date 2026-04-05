"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  speed: number;
  delay: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const GlobalCelebration = () => {
  const showCelebration = useStore((state) => state.showCelebration);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (showCelebration) {
      // Create a burst of confetti
      const newPieces = Array.from({ length: 80 }).map((_, i) => ({
        id: Date.now() + i,
        x: 50, // Center X
        y: 50, // Center Y
        size: Math.random() * 10 + 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        speed: Math.random() * 15 + 10,
        delay: Math.random() * 0.3
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti-burst"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            '--tx': `${(Math.random() - 0.5) * 800}px`,
            '--ty': `${(Math.random() - 0.5) * 800}px`,
            '--tr': `${Math.random() * 1440}deg`,
            animationDelay: `${p.delay}s`,
            animationDuration: '2.5s',
            opacity: 0,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
