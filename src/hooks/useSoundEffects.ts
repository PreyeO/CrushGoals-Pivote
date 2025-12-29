import { useCallback, useRef, useEffect } from 'react';
import { logWarn } from '@/lib/logger';

type SoundType = 'taskComplete' | 'perfectDay' | 'levelUp' | 'milestone' | 'xpGain' | 'error';

// Check localStorage for initial state
const getInitialEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('soundEffects');
  return saved !== 'false';
};

// Haptic feedback utility
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate([50, 30, 50]);
        break;
    }
  }
};

class AudioSynthesizer {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = getInitialEnabled();

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      // Envelope: quick attack, sustain, decay
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      logWarn('Audio playback failed:', e);
    }
  }

  // Satisfying "ding" for task completion
  playTaskComplete() {
    if (!this.enabled) return;
    
    triggerHaptic('medium');
    
    // Two-tone pleasant completion sound
    this.playTone(880, 0.15, 'sine', 0.2); // A5
    setTimeout(() => this.playTone(1318.5, 0.25, 'sine', 0.15), 80); // E6
  }

  // XP gain subtle sound
  playXPGain() {
    triggerHaptic('light');
    this.playTone(1046.5, 0.1, 'sine', 0.1); // C6 - subtle
  }

  // Triumphant fanfare for perfect day
  playPerfectDay() {
    if (!this.enabled) return;
    
    triggerHaptic('heavy');
    
    // Ascending triumphant melody
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'triangle', 0.2), i * 100);
    });
    
    // Final chord
    setTimeout(() => {
      this.playTone(523.25, 0.5, 'triangle', 0.15);
      this.playTone(659.25, 0.5, 'triangle', 0.15);
      this.playTone(783.99, 0.5, 'triangle', 0.15);
    }, 400);
  }

  // Level up celebration
  playLevelUp() {
    if (!this.enabled) return;
    
    triggerHaptic('heavy');
    
    // Ascending sweep with harmonics
    const baseNotes = [261.63, 329.63, 392, 523.25, 659.25, 783.99]; // C4 to G5
    baseNotes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'square', 0.1), i * 60);
    });
    
    // Victory chord
    setTimeout(() => {
      this.playTone(523.25, 0.6, 'sine', 0.15);
      this.playTone(659.25, 0.6, 'sine', 0.15);
      this.playTone(783.99, 0.6, 'sine', 0.15);
      this.playTone(1046.5, 0.6, 'sine', 0.1);
    }, 360);
  }

  // Streak milestone achievement
  playMilestone() {
    if (!this.enabled) return;
    
    triggerHaptic('heavy');
    
    // Achievement unlocked style
    this.playTone(440, 0.15, 'sine', 0.2); // A4
    setTimeout(() => this.playTone(554.37, 0.15, 'sine', 0.2), 100); // C#5
    setTimeout(() => this.playTone(659.25, 0.3, 'sine', 0.25), 200); // E5
  }

  // Error/failure sound
  playError() {
    triggerHaptic('light');
    this.playTone(200, 0.2, 'sawtooth', 0.1);
  }
}

const synthesizer = new AudioSynthesizer();

export function useSoundEffects() {
  const enabledRef = useRef(getInitialEnabled());

  const playSound = useCallback((type: SoundType) => {
    if (!enabledRef.current) return;
    
    switch (type) {
      case 'taskComplete':
        synthesizer.playTaskComplete();
        break;
      case 'perfectDay':
        synthesizer.playPerfectDay();
        break;
      case 'levelUp':
        synthesizer.playLevelUp();
        break;
      case 'milestone':
        synthesizer.playMilestone();
        break;
      case 'xpGain':
        synthesizer.playXPGain();
        break;
      case 'error':
        synthesizer.playError();
        break;
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    synthesizer.setEnabled(enabled);
  }, []);

  // Also expose haptic feedback directly
  const haptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (enabledRef.current) {
      triggerHaptic(type);
    }
  }, []);

  return { playSound, setEnabled, haptic };
}

// Standalone function to play sounds from anywhere (e.g., other hooks)
export function playSoundEffect(type: SoundType) {
  switch (type) {
    case 'taskComplete':
      synthesizer.playTaskComplete();
      break;
    case 'perfectDay':
      synthesizer.playPerfectDay();
      break;
    case 'levelUp':
      synthesizer.playLevelUp();
      break;
    case 'milestone':
      synthesizer.playMilestone();
      break;
    case 'xpGain':
      synthesizer.playXPGain();
      break;
    case 'error':
      synthesizer.playError();
      break;
  }
}

export { synthesizer, triggerHaptic };

