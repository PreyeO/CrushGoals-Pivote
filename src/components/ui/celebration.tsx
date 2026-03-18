"use client";

import React, { useEffect, useState } from 'react';
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

export const Celebration = ({ active, onComplete }: { active: boolean; onComplete?: () => void }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: 50, // Start from center
        y: 50,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        speed: Math.random() * 10 + 5,
        delay: Math.random() * 0.2
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
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
            '--tx': `${(Math.random() - 0.5) * 400}px`,
            '--ty': `${(Math.random() - 0.5) * 400}px`,
            '--tr': `${Math.random() * 720}deg`,
            animationDelay: `${p.delay}s`,
            animationDuration: '1.5s',
            opacity: 0,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
