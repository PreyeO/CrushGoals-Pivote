import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useResendEmail } from "@/hooks/useResendEmail";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const { sendPasswordResetEmail } = useResendEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      emailSchema.parse(email.trim());
    } catch {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: resetError } = await supabase.functions.invoke("generate-reset-link", {
        body: { email: email.trim() },
      });

      // Always return a generic success message (don’t reveal whether the email exists).
      if (resetError || !data?.resetLink) {
        setEmailSent(true);
        toast.success("If an account exists, a password reset email has been sent!");
        return;
      }

      // data.resetLink is our app-friendly reset link (token_hash + email) to prevent instant expiry.
      const sent = await sendPasswordResetEmail(email.trim(), data.resetLink);
      if (!sent) {
        toast.error("Failed to send email. Please try again.");
        return;
      }

      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md">
              {emailSent ? (
                <CheckCircle className="w-7 h-7 text-primary-foreground" />
              ) : (
                <Mail className="w-7 h-7 text-primary-foreground" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">{emailSent ? "Check Your Email" : "Reset Password"}</CardTitle>
          <CardDescription>
            {emailSent
              ? "We've sent you a password reset link. Please check your inbox (and spam)."
              : "Enter your email and we'll send you a reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                <p className="text-sm text-success">
                  If an account exists for <strong>{email}</strong>, a reset link has been sent.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate("/?auth=signin")}>
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-foreground-secondary">
                  Email Address
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border-border focus:border-primary h-12"
                  disabled={isLoading}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!email || isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
              </Button>

              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/?auth=signin")}> 
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>

              <div className="pt-2 text-center">
                <Button type="button" variant="link" onClick={() => navigate("/")}> 
                  <Target className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
