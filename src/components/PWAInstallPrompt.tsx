import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const dismissed = localStorage.getItem("pwaPromptDismissed");

    if (isStandalone || dismissed) return;

    // Check for iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // For Android/Chrome - listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Show iOS prompt after a delay
    if (iOS) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }

    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwaPromptDismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card
        variant="glass"
        className="w-full max-w-sm mx-auto border-primary/50 shadow-2xl animate-bounce-subtle"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Smartphone className="w-8 h-8 text-white" />
          </div>

          <h3 className="font-bold text-lg mb-2">📱 Install CrushGoals</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {isIOS
              ? "Get the full app experience! Add to your home screen for quick access and offline use."
              : "Install for offline access, push notifications, and the best experience!"}
          </p>

          {isIOS ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3">
                <span>Tap the</span>
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3 3h-2v6h-2V5H9l3-3zm-7 9v10h14V11h-4v2h2v6H7v-6h2v-2H5z" />
                  </svg>
                </div>
                <span>button below</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Then scroll down and tap "Add to Home Screen" → "Add"
              </p>
            </div>
          ) : (
            <Button
              variant="hero"
              size="lg"
              className="w-full animate-pulse-glow"
              onClick={handleInstall}
            >
              <Download className="w-5 h-5 mr-2" />
              Install Now - It's Free!
            </Button>
          )}

          <button
            onClick={handleDismiss}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </Card>
    </div>
  );
}
