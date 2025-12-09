import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userData: { name: string; email: string }) => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (tab === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: name,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          toast.success("Account created successfully!");
          onSuccess({ name, email });
          onOpenChange(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const userName = data.user.user_metadata?.full_name || email.split("@")[0];
          toast.success("Welcome back!");
          onSuccess({ name: userName, email });
          onOpenChange(false);
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const isFormValid = tab === "signin" 
    ? email && password.length >= 6 
    : name && email && password.length >= 6 && agreed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto bg-card border-white/10 backdrop-blur-xl p-0 animate-scale-in">
        <div className="p-6 sm:p-8">
          {/* Logo & Welcome */}
          <DialogHeader className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md">
                <Target className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold">Welcome to Goal Crusher 🚀</DialogTitle>
            <p className="text-muted-foreground mt-2">
              {tab === "signup" ? "Start crushing your goals today" : "Welcome back, champion!"}
            </p>
          </DialogHeader>

          {/* Tab Switcher */}
          <div className="flex bg-secondary rounded-lg p-1 mb-6">
            <button
              onClick={() => setTab("signin")}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200",
                tab === "signin"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200",
                tab === "signup"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Google Auth Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full mb-4 bg-white hover:bg-gray-100 text-gray-900 border-white/20"
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{tab === "signup" ? "Sign up" : "Sign in"} with Google</span>
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground-secondary">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary border-border focus:border-primary h-12 pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground-secondary">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border focus:border-primary h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground-secondary">Password</Label>
                {tab === "signin" && (
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border focus:border-primary h-12 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && password.length < 6 && (
                <p className="text-xs text-warning">Password must be at least 6 characters</p>
              )}
            </div>

            {tab === "signup" && (
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                  className="mt-0.5"
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <button type="button" className="text-primary hover:underline">Terms of Service</button>
                  {" "}and{" "}
                  <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                </Label>
              </div>
            )}

            {tab === "signin" && (
              <div className="flex items-center space-x-3">
                <Checkbox id="remember" className="mt-0.5" />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me
                </Label>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                tab === "signup" ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          {/* Bottom Text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {tab === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setTab("signin")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setTab("signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
