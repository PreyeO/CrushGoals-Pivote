import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEmailService } from "@/hooks/useEmailService";
import { logError } from "@/lib/logger";

interface OtpVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  name: string;
  userId: string;
  onVerified: () => void;
}

export function OtpVerificationModal({
  open,
  onOpenChange,
  email,
  name,
  userId,
  onVerified,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle");
  const { sendOtpEmail } = useEmailService();
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendCooldown]);

  useEffect(() => {
    if (open && userId) {
      generateAndSendOtp();
    }
  }, [open, userId]);

  const generateAndSendOtp = async () => {
    try {
      setIsResending(true);
      
      // Generate OTP via database function
      const { data: otpCode, error } = await supabase.rpc('generate_email_otp', {
        p_user_id: userId,
        p_email: email,
      });

      if (error) {
        logError('Error generating OTP:', error);
        toast.error('Failed to generate verification code');
        return;
      }

      // Send OTP email
      const sent = await sendOtpEmail(email, name, otpCode);
      if (sent) {
        toast.success('Verification code sent!', { description: `Check ${email}` });
        setResendCooldown(60); // 60 second cooldown
      } else {
        toast.error('Failed to send verification email');
      }
    } catch (error) {
      logError('OTP generation error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus("idle");

    try {
      const { data: isValid, error } = await supabase.rpc('verify_email_otp', {
        p_user_id: userId,
        p_otp: otp,
      });

      if (error) {
        logError('OTP verification error:', error);
        setVerificationStatus("error");
        toast.error('Verification failed');
        return;
      }

      if (isValid) {
        setVerificationStatus("success");
        toast.success('Email verified successfully! 🎉');
        
        // Short delay to show success state
        setTimeout(() => {
          onVerified();
          onOpenChange(false);
        }, 1500);
      } else {
        setVerificationStatus("error");
        toast.error('Invalid or expired code', { description: 'Please try again or request a new code' });
        setOtp("");
      }
    } catch (error) {
      logError('Verification error:', error);
      setVerificationStatus("error");
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setOtp("");
    setVerificationStatus("idle");
    generateAndSendOtp();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] w-[95vw] bg-card border-white/10 backdrop-blur-xl p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-glow-md transition-all duration-300 ${
                verificationStatus === "success" 
                  ? "bg-gradient-to-br from-emerald-500 to-green-600" 
                  : verificationStatus === "error"
                  ? "bg-gradient-to-br from-red-500 to-rose-600"
                  : "bg-gradient-primary"
              }`}>
                {verificationStatus === "success" ? (
                  <CheckCircle2 className="w-8 h-8 text-white animate-scale-in" />
                ) : verificationStatus === "error" ? (
                  <XCircle className="w-8 h-8 text-white animate-shake" />
                ) : (
                  <Mail className="w-8 h-8 text-primary-foreground" />
                )}
              </div>
            </div>
            <DialogTitle className="text-xl font-bold">
              {verificationStatus === "success" ? "Verified! 🎉" : "Check Your Email"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {verificationStatus === "success" 
                ? "Your email has been verified successfully"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </DialogHeader>

          {verificationStatus !== "success" && (
            <>
              <div className="flex justify-center mb-6">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isVerifying}
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className={`w-11 h-14 text-xl font-bold border-2 rounded-xl transition-all ${
                          verificationStatus === "error"
                            ? "border-destructive bg-destructive/10"
                            : "border-border bg-secondary focus:border-primary"
                        }`}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerify}
                disabled={otp.length !== 6 || isVerifying}
                variant="hero"
                className="w-full mb-4"
              >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="gap-2"
                >
                  {isResending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : "Resend Code"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Code expires in 10 minutes • Check spam folder
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
