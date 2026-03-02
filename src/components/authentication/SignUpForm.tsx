"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function SignUpForm() {
  const searchParams = useSearchParams();
  const invitedEmail = searchParams.get("email");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(invitedEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Sync email if invitedEmail changes (rare but good for robustness)
  useEffect(() => {
    if (invitedEmail) {
      setEmail(invitedEmail);
    }
  }, [invitedEmail]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const returnUrl = searchParams.get("returnUrl");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback${returnUrl ? `?next=${encodeURIComponent(returnUrl)}` : ""}`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      // Auto-logged in
      const returnUrl = searchParams.get("returnUrl");
      router.push(returnUrl || "/dashboard");
    } else {
      setError("Check your email for the confirmation link!");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full Name</Label>
        <Input
          id="signup-name"
          placeholder="John Doe"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-accent/20 border-border/40 h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email address</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="name@company.com"
          required
          disabled={!!invitedEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`bg-accent/20 border-border/40 h-11 ${invitedEmail ? "opacity-60 cursor-not-allowed" : ""}`}
        />
        {invitedEmail && (
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-70">
            Invited Email (Locked)
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-accent/20 border-border/40 h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          className={cn(
            "p-3 rounded-lg border text-xs font-medium animate-shake",
            error.includes("confirmation link")
              ? "bg-primary/10 border-primary/20 text-primary"
              : "bg-destructive/10 border-destructive/20 text-destructive",
          )}
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="outline"
        className="w-full cursor-pointer  h-11 border-border/60 hover:bg-accent/60 font-semibold"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Create an Account"
        )}
      </Button>
    </form>
  );
}

// Helper to use cn in this file if needed, or import it
import { cn } from "@/lib/utils";
