"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { inviteService } from "@/lib/services/invites";
import { useStore } from "@/lib/store";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { toast } from "sonner";
import { InvitationCard } from "@/components/org/InvitationCard";

import { OrgInvite, Organization } from "@/types";

interface InvitationWithOrg extends OrgInvite {
  organizations: Organization & { emoji?: string };
}

export default function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const user = useStore((state) => state.user);
  const organizations = useStore((state) => state.organizations);
  const [invitation, setInvitation] = useState<InvitationWithOrg | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guard so auto-accept only fires once
  const autoAccepted = useRef(false);

  const fetchInitialData = useStore((state) => state.fetchInitialData);

  useEffect(() => {
    // Fetch user session first to ensure UI reflects auth state
    fetchInitialData();

    const fetchInvite = async () => {
      try {
        const data = (await inviteService.getInvitationByToken(
          token,
        )) as InvitationWithOrg;
        setInvitation(data);
      } catch (err: unknown) {
        console.error("Fetch invite error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Invalid or expired invitation.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvite();
  }, [token, fetchInitialData]);

  /**
   * Auto-accept flow for new users:
   * After signup → email verify → login, the user is redirected back to this
   * page. At that point they are logged in (user != null), their email matches
   * the invite email, and they have no existing organisation yet.
   * In that case we silently accept and send them straight to the org dashboard
   * so they never see the invitation card a second time.
   */
  useEffect(() => {
    if (
      !isLoading &&
      !error &&
      invitation &&
      user &&
      !autoAccepted.current &&
      organizations.length === 0 &&
      user.email?.toLowerCase() === invitation.email?.toLowerCase()
    ) {
      autoAccepted.current = true;
      handleAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, invitation, user, organizations]);

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
          (i) => i.token !== token,
        ),
      }));

      // Refresh store with the new organization data before redirecting
      await fetchInitialData(orgId);

      // Go to the new org dashboard
      router.push(`/org/${orgId}`);
    } catch (err: unknown) {
      console.error("Accept invite error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to accept invitation.";
      toast.error(errorMessage);
      setIsAccepting(false);
    }
  };

  // Show full-screen loader while auto-accepting (new user path)
  if (isLoading || isAccepting)
    return <LoadingState message={isAccepting ? "Joining organisation…" : "Verifying invitation..."} />;

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
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-[oklch(0.70_0.18_155)]/5 blur-[120px] rounded-full -ml-32 -mb-32" />

      <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <InvitationCard
          invitation={invitation}
          org={org}
          user={user}
          token={token}
          isAccepting={isAccepting}
          onAccept={handleAccept}
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
