import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SignupSuccess() {
  const navigate = useNavigate();

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
              Welcome to CrushGoals! You're all set to start crushing your goals.
            </p>
          </div>

          {/* Email Confirmation Info */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">Check your inbox</h3>
                <p className="text-xs text-muted-foreground">
                  We've sent a confirmation link to your email. Click it to verify your account.
                </p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-sm text-center">What's next?</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm">Check your email for the confirmation link</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm">Click the link to verify your account</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm">Sign in and start crushing your goals!</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            variant="hero"
            size="lg"
            className="w-full gap-2"
            onClick={() => navigate("/")}
          >
            Go to Sign In
            <ArrowRight className="w-4 h-4" />
          </Button>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Check your spam folder if you don't see the email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
