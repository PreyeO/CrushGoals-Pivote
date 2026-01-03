import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useResendEmail } from "@/hooks/useResendEmail";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
}

export function ForgotPasswordModal({ open, onOpenChange, onBack }: ForgotPasswordModalProps) {
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
      // Generate a password reset link using Supabase admin API via edge function
      const { data, error: resetError } = await supabase.functions.invoke("generate-reset-link", {
        body: { email: email.trim() },
      });

      if (resetError || !data?.resetLink) {
        // Don't reveal if email exists or not for security
        setEmailSent(true);
        toast.success("If an account exists, a password reset email has been sent!");
        setIsLoading(false);
        return;
      }

      // Send the email via Resend
      const emailSent = await sendPasswordResetEmail(email.trim(), data.resetLink);
      
      if (!emailSent) {
        toast.error("Failed to send email. Please try again.");
        setIsLoading(false);
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

  const handleClose = () => {
    setEmail("");
    setEmailSent(false);
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] w-[95vw] bg-card border-white/10 backdrop-blur-xl p-0">
        <div className="p-4 sm:p-6 md:p-8">
          <DialogHeader className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md">
                {emailSent ? (
                  <CheckCircle className="w-7 h-7 text-primary-foreground" />
                ) : (
                  <Mail className="w-7 h-7 text-primary-foreground" />
                )}
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold">
              {emailSent ? "Check Your Email" : "Reset Password"}
            </DialogTitle>
            <p className="text-muted-foreground mt-2">
              {emailSent
                ? "We've sent you a password reset link. Please check your inbox."
                : "Enter your email and we'll send you a reset link"}
            </p>
          </DialogHeader>

          {emailSent ? (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                <p className="text-sm text-success">
                  A password reset link has been sent to <strong>{email}</strong>
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-foreground-secondary">
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border-border focus:border-primary h-12"
                  disabled={isLoading}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={!email || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
