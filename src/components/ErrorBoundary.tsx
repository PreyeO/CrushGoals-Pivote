import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
};

type State = {
  hasError: boolean;
  error?: unknown;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // Keep this console.error: it helps us debug blank screens in production.
    console.error("[ErrorBoundary] Uncaught error", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-lg p-6">
          <h1 className="text-lg font-semibold">
            {this.props.fallbackTitle ?? "Something went wrong"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A screen crashed unexpectedly. Please reload. If it keeps happening, tell me what you
            clicked right before it happened.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={this.handleReload}>Reload</Button>
            <Button variant="outline" onClick={() => this.setState({ hasError: false, error: undefined })}>
              Try again
            </Button>
          </div>
        </Card>
      </main>
    );
  }
}
