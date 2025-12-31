import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { X } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  velocityX: number;
  velocityY: number;
  shape: 'square' | 'circle' | 'star';
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
  particleCount?: number;
  duration?: number;
  type?: 'default' | 'perfectDay' | 'milestone' | 'goalComplete' | 'firstGoal';
}

const colors = {
  default: ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'],
  perfectDay: ['#FFD700', '#FFA500', '#FF6B6B', '#FF8E53', '#FFCC00', '#FFE066'],
  milestone: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#E9D5FF', '#F5D0FE'],
  goalComplete: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5'],
  firstGoal: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'],
};

export function ConfettiCelebration({ 
  trigger, 
  onComplete, 
  particleCount = 100,
  duration = 3000,
  type = 'default'
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const { playSound } = useSoundEffects();

  const handleDismiss = useCallback(() => {
    setIsActive(false);
    setParticles([]);
    onComplete?.();
  }, [onComplete]);

  const createParticles = useCallback(() => {
    const colorSet = colors[type];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: colorSet[Math.floor(Math.random() * colorSet.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: 2 + Math.random() * 4,
        shape: ['square', 'circle', 'star'][Math.floor(Math.random() * 3)] as Particle['shape'],
      });
    }
    
    return newParticles;
  }, [particleCount, type]);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      setParticles(createParticles());
      
      // Play appropriate sound based on celebration type
      if (type === 'perfectDay') {
        playSound('perfectDay');
      } else if (type === 'milestone') {
        playSound('milestone');
      } else if (type === 'goalComplete' || type === 'firstGoal') {
        playSound('levelUp');
      }
      
      const timer = setTimeout(() => {
        setIsActive(false);
        setParticles([]);
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, isActive, createParticles, duration, onComplete, type, playSound]);

  if (!isActive || particles.length === 0) return null;

  const confettiContent = (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            animationDuration: `${2 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        >
          {particle.shape === 'square' && (
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: particle.color }}
            />
          )}
          {particle.shape === 'circle' && (
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          )}
          {particle.shape === 'star' && (
            <span style={{ color: particle.color, fontSize: '12px' }}>⭐</span>
          )}
        </div>
      ))}
      
      {/* Center celebration text for special events */}
      {type === 'perfectDay' && (
        <div 
          className="absolute inset-0 flex items-center justify-center animate-celebration-pop pointer-events-auto"
          onClick={handleDismiss}
        >
          <div className="text-center bg-background/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-premium/30 shadow-2xl relative max-w-[90vw]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Close celebration"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-5xl sm:text-6xl block mb-3 sm:mb-4">🔥</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-premium mb-2">Perfect Day!</h2>
            <p className="text-muted-foreground text-sm sm:text-base">+100 XP Bonus</p>
          </div>
        </div>
      )}
      
      {type === 'goalComplete' && (
        <div 
          className="absolute inset-0 flex items-center justify-center animate-celebration-pop pointer-events-auto"
          onClick={handleDismiss}
        >
          <div className="text-center bg-gradient-to-b from-background/95 to-background/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-success/40 shadow-[0_0_60px_-15px] shadow-success/30 relative max-w-[90vw]">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent rounded-3xl" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
              aria-label="Close celebration"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                <span className="text-6xl sm:text-7xl animate-bounce">🏆</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-success to-emerald-400 bg-clip-text text-transparent mb-3">
                Goal Complete!
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-4">You crushed it! Time for a new challenge?</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/30">
                <span className="text-success font-semibold">+100 XP Bonus</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {type === 'firstGoal' && (
        <div 
          className="absolute inset-0 flex items-center justify-center animate-celebration-pop pointer-events-auto"
          onClick={handleDismiss}
        >
          <div className="text-center bg-background/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl relative max-w-[90vw]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Close celebration"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-5xl sm:text-6xl block mb-3 sm:mb-4">🎯</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">First Goal Created!</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Your journey begins now! 🚀</p>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(confettiContent, document.body);
}
