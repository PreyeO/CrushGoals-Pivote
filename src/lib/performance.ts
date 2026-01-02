// Performance monitoring utilities for CrushGoals

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: "measure" | "mark";
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initObservers();
  }

  private initObservers() {
    // Observe navigation timing
    if ("PerformanceObserver" in window) {
      try {
        // Observe Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric("LCP", lastEntry.startTime, "measure");
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
        this.observers.push(lcpObserver);

        // Observe First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric(
              "FID",
              entry.processingStart - entry.startTime,
              "measure"
            );
          });
        });
        fidObserver.observe({ entryTypes: ["first-input"] });
        this.observers.push(fidObserver);

        // Observe Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric("CLS", clsValue, "measure");
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn("Performance monitoring not fully supported:", error);
      }
    }
  }

  mark(name: string) {
    if ("performance" in window && performance.mark) {
      performance.mark(name);
      this.recordMetric(name, performance.now(), "mark");
    }
  }

  measure(name: string, startMark?: string, endMark?: string) {
    if ("performance" in window && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        this.recordMetric(name, measure.duration, "measure");
      } catch (error) {
        console.warn("Performance measure failed:", error);
      }
    }
  }

  private recordMetric(name: string, value: number, type: "measure" | "mark") {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      type,
    });

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.find((metric) => metric.name === name);
  }

  getAverageMetric(name: string): number | null {
    const metrics = this.metrics.filter((metric) => metric.name === name);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  // Report metrics to analytics service
  async reportMetrics() {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return;

    try {
      // Send to analytics endpoint
      await fetch("/api/analytics/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metrics,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.warn("Failed to report performance metrics:", error);
    }
  }

  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Mark component mount
    performanceMonitor.mark("component-mount");

    return () => {
      // Mark component unmount
      performanceMonitor.mark("component-unmount");
    };
  }, []);

  const mark = useCallback((name: string) => {
    performanceMonitor.mark(name);
  }, []);

  const measure = useCallback(
    (name: string, startMark?: string, endMark?: string) => {
      performanceMonitor.measure(name, startMark, endMark);
    },
    []
  );

  return { mark, measure };
};

// Utility to measure function execution time
export const measureExecutionTime = async <T>(
  fn: () => Promise<T> | T,
  name: string
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const endTime = performance.now();
    performanceMonitor.recordMetric(name, endTime - startTime, "measure");
    return result;
  } catch (error) {
    const endTime = performance.now();
    performanceMonitor.recordMetric(
      `${name}-error`,
      endTime - startTime,
      "measure"
    );
    throw error;
  }
};

// Web Vitals utilities
export const reportWebVitals = (metric: any) => {
  // Send to analytics
  console.log("Web Vital:", metric);

  // Could send to analytics service
  performanceMonitor.recordMetric(metric.name, metric.value, "measure");
};
