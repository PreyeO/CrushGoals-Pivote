import { useState, useEffect, useCallback } from "react";

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  disabled = false,
}: PullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;

      const touch = e.touches[0];
      if (touch && window.scrollY === 0) {
        setStartY(touch.clientY);
        setIsPulling(true);
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || disabled || isRefreshing) return;

      const touch = e.touches[0];
      if (touch) {
        const currentY = touch.clientY;
        const distance = Math.max(0, currentY - startY);

        if (distance > 0) {
          e.preventDefault();
          setPullDistance(Math.min(distance * 0.5, threshold * 2));
        }
      }
    },
    [isPulling, startY, threshold, disabled, isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled || isRefreshing) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(0);

      try {
        await onRefresh();
      } catch (error) {
        console.error("Pull to refresh failed:", error);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }

    setIsPulling(false);
  }, [isPulling, pullDistance, threshold, onRefresh, disabled, isRefreshing]);

  useEffect(() => {
    if (disabled) return;

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return {
    isRefreshing,
    pullDistance,
    progress,
    isPulling,
  };
};
