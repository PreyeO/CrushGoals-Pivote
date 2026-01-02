import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ErrorBoundary } from "../components/ErrorBoundary";

const ErrorComponent = () => {
  throw new Error("Test error");
};

const WorkingComponent = () => <div>Working component</div>;

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("renders error UI when an error occurs", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/A screen crashed unexpectedly/)
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("allows retry after error", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click try again
    await user.click(screen.getByText("Try Again"));

    // Rerender with working component
    rerender(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Working component")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("shows custom fallback title", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallbackTitle="Custom Error Title">
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom Error Title")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
