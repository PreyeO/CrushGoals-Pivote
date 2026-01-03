import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validations";
import { useRateLimiter } from "@/hooks/useRateLimiter";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { checkRateLimit, recordAttempt } = useRateLimiter();

  const validateForm = () => {
    setErrors({});
    try {
      loginSchema.parse({ email, password });
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

    const { allowed, remainingAttempts } = await checkRateLimit(email);
    if (!allowed) {
      toast.error("Too many login attempts. Please try again in 15 minutes.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        await recordAttempt(email, false);
        const { remainingAttempts: remaining } = await checkRateLimit(email);

        if (error.message.includes("Invalid login credentials")) {
          if (remaining > 0) {
            toast.error(`Invalid email or password. ${remaining} attempts remaining.`);
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
        await recordAttempt(email, true);
        toast.success("Welcome back!");
        navigate("/dashboard", { replace: true });
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && password.length >= 6;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md">
              <Target className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back!</CardTitle>
          <CardDescription>Sign in to continue crushing your goals</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email" className="text-foreground-secondary">
                Email
              </Label>
              <Input
                id="signin-email"
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
                <Label htmlFor="signin-password" className="text-foreground-secondary">
                  Password
                </Label>
                <Link to="/auth/forgot" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="signin-password"
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

            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember-signin"
                onCheckedChange={(checked) => {
                  if (checked) {
                    localStorage.setItem("crushgoals_remember_me", "true");
                  } else {
                    localStorage.removeItem("crushgoals_remember_me");
                  }
                }}
                defaultChecked={localStorage.getItem("crushgoals_remember_me") === "true"}
              />
              <Label htmlFor="remember-signin" className="text-sm text-muted-foreground">
                Remember me
              </Label>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!isFormValid || isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/?auth=signup" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </p>

          <div className="pt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
