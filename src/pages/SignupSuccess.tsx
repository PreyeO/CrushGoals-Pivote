import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SignupSuccess() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        setResent(true);
        toast.success("Confirmation email sent!");
      }
    } catch (error) {
      toast.error("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-3">Check your email</h1>
          
          <p className="text-muted-foreground">
            We've sent you a confirmation link. Click it to verify your account and start crushing your goals.
          </p>
          
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Didn't receive it? Enter your email to resend.
            </p>
            
            {resent ? (
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Email sent! Check your inbox.</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  disabled={isResending}
                />
                <Button
                  onClick={handleResend}
                  disabled={isResending || !email.trim()}
                  size="sm"
                >
                  {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Resend"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
