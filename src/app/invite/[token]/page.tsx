"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { inviteService } from "@/lib/services/invites";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  UserPlus,
  Building2,
  ShieldCheck,
  Mail,
  ArrowRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const user = useStore((state) => state.user);
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useStore((state) => state.fetchInitialData);
  const rejectInvitation = useStore((state) => state.rejectInvitation);

  useEffect(() => {
    // Fetch user session first to ensure UI reflects auth state
    fetchInitialData();

    const fetchInvite = async () => {
      try {
        const data = await inviteService.getInvitationByToken(token);
        setInvitation(data);
      } catch (err: any) {
        console.error("Fetch invite error:", err);
        setError(err.message || "Invalid or expired invitation.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      const emailParam = invitation?.email
        ? `&email=${encodeURIComponent(invitation.email)}`
        : "";
      router.push(`/auth/signup?returnUrl=/invite/${token}${emailParam}`);
      return;
    }

    setIsAccepting(true);
    try {
      const orgId = await inviteService.acceptInvitation(token);
      toast.success("Welcome aboard! You've successfully joined.");

      // Optimistically remove this invite from the store immediately
      // so sidebar doesn't show stale pending invite after redirect
      useStore.setState((state) => ({
        pendingInvitations: state.pendingInvitations.filter(
          (i) => i.token !== token
        ),
      }));

      // Refresh store with the new organization data before redirecting
      await fetchInitialData(orgId);

      // Go to the new org dashboard
      router.push(`/org/${orgId}`);
    } catch (err: any) {
      console.error("Accept invite error:", err);
      toast.error(err.message || "Failed to accept invitation.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await rejectInvitation(token);
      toast.success("Invitation declined.");
      router.push(user ? "/dashboard" : "/");
    } catch (err: any) {
      console.error("Decline invite error:", err);
      toast.error(err.message || "Failed to decline invitation.");
    } finally {
      setIsDeclining(false);
    }
  };

  if (isLoading) return <LoadingState message="Verifying invitation..." />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <ErrorState
          title="Invitation Not Found"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );

  const org = invitation?.organizations;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[oklch(0.70_0.18_155)]/5 blur-[120px] rounded-full -ml-32 -mb-32" />

      <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="glass-card p-8 lg:p-10 border-primary/20 bg-primary/[0.02] text-center shadow-2xl">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-accent/30 flex items-center justify-center text-4xl shadow-inner border border-border/40">
                {org?.emoji || "🏢"}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border-4 border-background shadow-lg animate-bounce">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-4">
            You&apos;re Invited!
          </h1>

          <p className="text-muted-foreground leading-relaxed mb-8">
            Join <span className="text-foreground font-bold">{org?.name}</span>{" "}
            on CrushGoals. You&apos;ll be joining as a{" "}
            <span className="text-primary font-bold uppercase tracking-wider text-xs">
              {invitation?.role}
            </span>
            .
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/30 border border-border/40 text-left">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Security
                </p>
                <p className="text-xs font-medium">
                  Safe & secure invitation link
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/30 border border-border/40 text-left">
              <Building2 className="w-5 h-5 text-[oklch(0.70_0.18_155)] shrink-0" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Team
                </p>
                <p className="text-xs font-medium">{org?.name} Workspace</p>
              </div>
            </div>
          </div>

          {!user ? (
            <div className="space-y-4">
              <Button
                onClick={handleAccept}
                className="w-full h-14 rounded-2xl gradient-primary text-white font-black tracking-tight text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                <Link
                  href={`/auth/login?returnUrl=/invite/${token}`}
                  className="text-primary hover:underline"
                >
                  Log in here
                </Link>
                <span>·</span>
                <button
                  onClick={handleDecline}
                  disabled={isDeclining}
                  className="text-destructive/70 hover:text-destructive hover:underline transition-colors cursor-pointer"
                >
                  {isDeclining ? "Declining..." : "Decline Invite"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full h-14 rounded-2xl gradient-primary text-white font-black tracking-tight text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 group"
              >
                {isAccepting ? "Joining..." : "Accept & Join"}
                {!isAccepting && (
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
              <Button
                onClick={handleDecline}
                disabled={isDeclining}
                variant="outline"
                className="w-full h-11 rounded-2xl text-sm font-semibold text-destructive/70 border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
              >
                {isDeclining ? "Declining..." : "Decline Invitation"}
                <X className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-40">
            Crush milestones together.
          </p>
        </div>
      </div>
    </div>
  );
}
