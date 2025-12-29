import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle2, RefreshCw, Target, ArrowRight, Inbox, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/logger";

export default function SignupSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_email_otp', {
        p_otp: otp,
        p_user_id: user.id,
      });

      if (error) throw error;

      if (data) {
        setIsVerified(true);
        toast.success("Email verified successfully! 🎉");
        await supabase.auth.refreshSession();
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        toast.error("Invalid or expired code. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !user) return;

    setIsResending(true);
    try {
      const { data, error } = await supabase.rpc('generate_email_otp', {
        p_email: user.email || '',
        p_user_id: user.id,
      });

      if (error) throw error;

      const { error: emailError } = await supabase.functions.invoke('send-email-resend', {
        body: {
          to: user.email,
          subject: "Verify your CrushGoals email",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;">
                  <span style="font-size: 28px;">🎯</span>
                </div>
              </div>
              <h1 style="font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 16px; color: #1f2937;">Verify Your Email</h1>
              <p style="font-size: 16px; color: #6b7280; text-align: center; margin-bottom: 30px;">Enter this code to verify your email and start crushing your goals:</p>
              <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 16px; text-align: center; margin-bottom: 30px;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: white;">${data}</span>
              </div>
              <p style="font-size: 14px; color: #9ca3af; text-align: center;">This code expires in 10 minutes.</p>
            </div>
          `,
        },
      });

      if (emailError) logError("Email error", emailError);

      toast.success("Verification code sent! Check your inbox.");
      setCountdown(60);
    } catch (error: any) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Email Verified! 🎉</h1>
          <p className="text-muted-foreground mb-4">Redirecting you to the dashboard...</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-6 sm:p-8 rounded-2xl">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md">
              <Target className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Account Created! 🎉</h1>
            <p className="text-muted-foreground text-sm">
              Welcome to CrushGoals! Let's verify your email to get started.
            </p>
          </div>

          {/* Email Check Instructions */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Inbox className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">Check your inbox</h3>
                <p className="text-xs text-muted-foreground">
                  We sent a 6-digit verification code to{" "}
                  <span className="text-foreground font-medium">
                    {user?.email || "your email"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* OTP Form - Only show if user is logged in */}
          {user ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm">Verification Code</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="pl-12 text-center text-xl tracking-[0.5em] font-mono h-12"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full gap-2"
                disabled={otp.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* Resend */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground mb-2">Didn't receive the code?</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={countdown > 0 || isResending}
                  className="gap-2 text-xs"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* User closed tab / not logged in */
            <div className="text-center space-y-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Session expired or tab was closed? Sign in to continue where you left off.
                </p>
              </div>
              <Button
                variant="hero"
                size="lg"
                className="w-full gap-2"
                onClick={() => navigate("/")}
              >
                <LogIn className="w-4 h-4" />
                Sign In to Continue
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground text-xs"
            >
              Back to home
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
}
