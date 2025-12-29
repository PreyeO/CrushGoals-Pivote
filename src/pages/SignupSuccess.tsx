import { Mail } from "lucide-react";

export default function SignupSuccess() {
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
          
          <p className="text-xs text-muted-foreground mt-6">
            Didn't receive it? Check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
}
