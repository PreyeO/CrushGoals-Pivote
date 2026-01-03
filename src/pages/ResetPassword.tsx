import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Support two reset link styles:
  // 1) Backend-style redirect: #access_token=...&type=recovery
  // 2) Our safer link: ?type=recovery&token_hash=...
  const [tokenHash, setTokenHash] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);

    const errorCode = hashParams.get("error_code") || queryParams.get("error_code");
    const errorDescription = hashParams.get("error_description") || queryParams.get("error_description");

    if (errorCode) {
      setIsValidLink(false);
      toast.error(decodeURIComponent(errorDescription || "Reset link is invalid or has expired"));
      return;
    }

    const type = hashParams.get("type") || queryParams.get("type");
    const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
    const token_hash = hashParams.get("token_hash") || queryParams.get("token_hash");
    const email = hashParams.get("email") || queryParams.get("email");

    if (type !== "recovery") {
      setIsValidLink(false);
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    // Valid if we either have an access_token already OR we have token_hash for deferred verification.
    if (!accessToken && !token_hash) {
      setIsValidLink(false);
      toast.error("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setTokenHash(token_hash);
    setResetEmail(email);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // If the link contains token_hash, verify ONLY when user submits.
      // This avoids email clients/link scanners consuming the token before the user uses it.
      if (tokenHash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });

        if (verifyError) {
          setIsValidLink(false);
          toast.error(verifyError.message);
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsSuccess(true);
      toast.success("Password updated successfully!");

      // Sign out and redirect to login (prevents auto-entering the app via the recovery session)
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/?auth=signin");
      }, 1200);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md">
                <Target className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Reset link expired</CardTitle>
            <CardDescription>
              Request a fresh password reset link, then open it on this device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="hero" onClick={() => navigate("/auth/forgot")}
            >
              Request new reset link
            </Button>
            <Button className="w-full" variant="outline" onClick={() => navigate("/?auth=signin")}
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </div>
            <CardTitle className="text-2xl">Password Updated!</CardTitle>
            <CardDescription>
              Your password has been successfully reset. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md">
              <Target className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
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
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-secondary border-border focus:border-primary h-12"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!password || !confirmPassword || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
