import { UserPlus, Building2, ShieldCheck, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrgInvite, Organization } from "@/types";
import { AppState } from "@/lib/store";

interface InvitationCardProps {
  invitation: OrgInvite | null;
  org: (Organization & { emoji?: string }) | undefined;
  user: AppState["user"];
  token: string;
  isAccepting: boolean;
  onAccept: () => void;
}

export function InvitationCard({
  invitation,
  org,
  user,
  token,
  isAccepting,
  onAccept,
}: InvitationCardProps) {
  return (
    <div className="glass-card p-8 lg:p-10 border-primary/20 bg-primary/2 text-center shadow-2xl">
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
        Join <span className="text-foreground font-bold">{org?.name}</span> on
        CrushGoals. You&apos;ll be joining as a{" "}
        <span className="text-primary font-bold uppercase tracking-wider text-xs">
          {invitation?.role}
        </span>
        .
      </p>


      {!user ? (
        <div className="space-y-4">
          <Button
            onClick={onAccept}
            className="w-full h-14 rounded-2xl gradient-primary text-white font-black tracking-tight text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground mt-4">
            <Link
              href={`/auth/login?returnUrl=/invite/${token}`}
              className="text-primary hover:underline"
            >
              Log in here if you already have an account
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            onClick={onAccept}
            disabled={isAccepting}
            className="w-full h-14 rounded-2xl gradient-primary text-white font-black tracking-tight text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 group"
          >
            {isAccepting ? "Joining..." : "Accept & Join"}
            {!isAccepting && (
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
