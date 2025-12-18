import { useEffect, useState } from "react";
import { AlertTriangle, Mail, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEmailService } from "@/hooks/useEmailService";
import { logError } from "@/lib/logger";

interface EmailVerificationBannerProps {
  email: string;
  userId: string;
  name: string;
  onDismiss?: () => void;
}

export function EmailVerificationBanner({ email, userId, name, onDismiss }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { sendOtpEmail } = useEmailService();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (cooldown > 0) return;

    setIsResending(true);
    try {
      const { data: otpCode, error } = await supabase.rpc('generate_email_otp', {
        p_user_id: userId,
        p_email: email,
      });

      if (error) throw error;

      const sent = await sendOtpEmail(email, name, otpCode);
      if (!sent) {
        toast.error("Failed to send verification email. Please try again.");
        return;
      }

      toast.success("Verification code sent!", { description: `Check ${email}` });
      setCooldown(60);
    } catch (err) {
      logError('Failed to resend OTP:', err);
      toast.error("Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-warning">Email Verification Required</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please verify your email address to access all features. We&apos;ll send a 6-digit OTP to your inbox.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={isResending || cooldown > 0}
              className="border-warning/30 hover:bg-warning/10"
            >
              {isResending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </Button>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
