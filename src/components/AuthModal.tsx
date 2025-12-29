import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Loader2, Target, User, AtSign, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loginSchema, signupSchema } from "@/lib/validations";
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { useResendEmail } from "@/hooks/useResendEmail";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userData: { name: string; email: string }) => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true); // Default to ON
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingUsername, setCheckingUsername] = useState(false);
  const { checkRateLimit, recordAttempt } = useRateLimiter();
  const { sendWelcomeEmail } = useResendEmail();

  const checkUsernameAvailability = async (value: string) => {
    if (value.length < 3) return;
    
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', value.toLowerCase())
        .maybeSingle();

      if (data) {
        setErrors(prev => ({ ...prev, username: "Username is already taken" }));
      } else {
        setErrors(prev => {
          const { username, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      // Ignore errors during availability check
    } finally {
      setCheckingUsername(false);
    }
  };

  const validateForm = () => {
    setErrors({});
    
    try {
      if (tab === "signup") {
        signupSchema.parse({ name, username, email, password, agreed });
      } else {
        loginSchema.parse({ email, password });
      }
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          if (field && !newErrors[field]) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Check rate limit for sign-in only (server-side)
    if (tab === "signin") {
      const { allowed, remainingAttempts } = await checkRateLimit(email);
      if (!allowed) {
        toast.error("Too many login attempts. Please try again in 15 minutes.");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (tab === "signup") {
        // Check username availability one more time
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username.toLowerCase())
          .maybeSingle();

        if (existingUser) {
          setErrors(prev => ({ ...prev, username: "Username is already taken" }));
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: name.trim(),
              username: username.toLowerCase().trim(),
              show_on_leaderboard: showOnLeaderboard,
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
          // Update profile with username and leaderboard preference
          await supabase
            .from('profiles')
            .update({
              username: username.toLowerCase().trim(),
              show_on_leaderboard: showOnLeaderboard,
            })
            .eq('user_id', data.user.id);

          // Generate OTP and send verification email via Resend
          const { data: otpCode, error: otpError } = await supabase.rpc('generate_email_otp', {
            p_email: email.trim(),
            p_user_id: data.user.id,
          });

          if (!otpError && otpCode) {
            // Send verification email via Resend
            await supabase.functions.invoke('send-email-resend', {
              body: {
                to: email.trim(),
                subject: "Verify your CrushGoals email 🎯",
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0b;">
                    <div style="text-align: center; margin-bottom: 32px;">
                      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="font-size: 32px;">🎯</span>
                      </div>
                      <h1 style="font-size: 28px; font-weight: 700; color: #ffffff; margin: 0;">Verify Your Email</h1>
                    </div>
                    <div style="background: #1a1a1d; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
                      <p style="font-size: 18px; color: #ffffff; margin: 0 0 16px 0;">Hey ${name.trim()}! 👋</p>
                      <p style="font-size: 16px; color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                        Enter this code to verify your email and start crushing your goals:
                      </p>
                      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #ffffff; font-family: monospace;">${otpCode}</span>
                      </div>
                      <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
                        This code expires in 10 minutes.
                      </p>
                    </div>
                    <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">
                      If you didn't create an account, you can safely ignore this email.
                    </p>
                  </div>
                `,
              },
            });
          }

          // Store pending invite token if exists (for after verification)
          const urlParams = new URLSearchParams(window.location.search);
          const inviteToken = urlParams.get('invite');
          if (inviteToken) {
            localStorage.setItem('pendingInviteToken', inviteToken);
          }
          
          // Close modal first, then navigate after a brief delay to ensure smooth transition
          onOpenChange(false);
          
          // Navigate to verification page after modal closes
          setTimeout(() => {
            navigate('/verify-email');
          }, 150);
          
          // Reset form
          setName("");
          setUsername("");
          setEmail("");
          setPassword("");
          setAgreed(false);
          setShowOnLeaderboard(true);
        }
        setIsLoading(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          // Record failed attempt server-side
          await recordAttempt(email, false);
          const { remainingAttempts } = await checkRateLimit(email);
          
          if (error.message.includes("Invalid login credentials")) {
            if (remainingAttempts > 0) {
              toast.error(`Invalid email or password. ${remainingAttempts} attempts remaining.`);
            } else {
              toast.error("Too many failed attempts. Account locked for 15 minutes.");
            }
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Record successful login server-side
          await recordAttempt(email, true);
          const userName = data.user.user_metadata?.full_name || email.split("@")[0];
          
          toast.success("Welcome back!");
          onSuccess({ name: userName, email: email.trim() });
          onOpenChange(false);
          // Navigation is handled by Landing page's useEffect based on admin status
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = tab === "signin" 
    ? email && password.length >= 6 
    : name && username.length >= 3 && email && password.length >= 6 && agreed && !errors.username;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-white/10 backdrop-blur-xl p-0 animate-scale-in">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Logo & Welcome */}
          <DialogHeader className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md">
                <Target className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold">Welcome to CrushGoals 🚀</DialogTitle>
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


          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <>
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
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground-secondary">Username</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="FitWarrior23"
                      value={username}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                        setUsername(value);
                        if (value.length >= 3) {
                          checkUsernameAvailability(value);
                        }
                      }}
                      className="bg-secondary border-border focus:border-primary h-12 pl-10"
                      disabled={isLoading}
                    />
                    {checkingUsername && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">This is your public display name on leaderboards</p>
                  {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                </div>
              </>
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
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground-secondary">Password</Label>
                {tab === "signin" && (
                  <button 
                    type="button" 
                    className="text-xs text-primary hover:underline"
                    onClick={() => setShowForgotPassword(true)}
                  >
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
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {tab === "signup" && (
              <>
                {/* Leaderboard Opt-in */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-premium/20 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-premium" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="leaderboard" className="text-sm font-medium cursor-pointer">
                          Compete on Global Leaderboard
                        </Label>
                        <Switch
                          id="leaderboard"
                          checked={showOnLeaderboard}
                          onCheckedChange={setShowOnLeaderboard}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your username will be visible to other users. You can change this anytime in settings.
                      </p>
                    </div>
                  </div>
                </div>

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
              </>
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

      <ForgotPasswordModal
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        onBack={() => setShowForgotPassword(false)}
      />
    </Dialog>
  );
}