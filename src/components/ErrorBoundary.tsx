import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Bug, Copy } from "lucide-react";
import { logError } from "@/lib/logger";

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
  showErrorDetails?: boolean;
  onError?: (error: unknown, errorInfo: unknown) => void;
};

type State = {
  hasError: boolean;
  error?: unknown;
  errorInfo?: unknown;
  errorId?: string;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // Enhanced error logging
    const errorDetails = {
      error,
      errorInfo,
      errorId: this.state.errorId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      componentStack: (errorInfo as any)?.componentStack,
    };

    // Log to our logging service
    logError("ErrorBoundary caught error", errorDetails);

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Keep console.error for debugging
    console.error("[ErrorBoundary] Uncaught error", errorDetails);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleCopyError = async () => {
    const errorText = `
Error ID: ${this.state.errorId}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Error: ${this.state.error}
Component Stack: ${(this.state.errorInfo as any)?.componentStack}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const showDetails =
      this.props.showErrorDetails || process.env.NODE_ENV === "development";

    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {this.props.fallbackTitle ?? "Something went wrong"}
              </h1>
              <p className="text-sm text-muted-foreground">
                A screen crashed unexpectedly. Please try again or reload the
                page.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={this.handleReload} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={this.handleRetry}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>

            {showDetails && (
              <div className="border border-border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Error Details
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.handleCopyError}
                    className="h-8 px-2"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="space-y-2 text-xs font-mono text-muted-foreground">
                  <div>
                    <span className="font-medium">Error ID:</span>{" "}
                    {this.state.errorId}
                  </div>
                  <div>
                    <span className="font-medium">Error:</span>{" "}
                    {String(this.state.error)}
                  </div>
                  {(this.state.errorInfo as any)?.componentStack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">
                        Component Stack
                      </summary>
                      <pre className="mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-32">
                        {(this.state.errorInfo as any).componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center">
              If this keeps happening, please contact support with the error
              details above.
            </div>
          </div>
        </Card>
      </main>
    );
  }
}
