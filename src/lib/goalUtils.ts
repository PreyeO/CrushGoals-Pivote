import type { Goal } from "@/hooks/useGoals";

export const calculateExpectedProgress = (goal: Goal): number => {
  if (!goal.start_date || !goal.deadline) return goal.progress || 0;
  const start = new Date(goal.start_date).getTime();
  const end = new Date(goal.deadline).getTime();
  const now = Date.now();

  if (now <= start) return 0;

  const totalDuration = end - start;
  const elapsed = now - start;
  if (totalDuration <= 0) return 0;

  return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
};

export const getDisplayStatus = (goal: Goal): 'on-track' | 'ahead' | 'behind' | 'completed' => {
  if (goal.status === 'completed' || (goal.progress ?? 0) >= 100) return 'completed';

  // If goal hasn't started yet, it cannot be behind.
  if (goal.start_date) {
    const start = new Date(goal.start_date).getTime();
    if (Date.now() < start) return 'on-track';
  }

  const progress = goal.progress ?? 0;
  const expected = calculateExpectedProgress(goal);

  // Small buffer to avoid instant "behind" right after creating a goal.
  if (progress + 5 < expected) return 'behind';
  if (progress > expected + 10) return 'ahead';
  return 'on-track';
};
