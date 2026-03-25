"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { inviteService } from "@/lib/services/invites";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { toast } from "sonner";
import { InvitationCard } from "@/components/org/InvitationCard";

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
        <InvitationCard 
          invitation={invitation}
          org={org}
          user={user}
          token={token}
          isAccepting={isAccepting}
          isDeclining={isDeclining}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />

        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-40">
            Crush milestones together.
          </p>
        </div>
      </div>
    </div>
  );
}
