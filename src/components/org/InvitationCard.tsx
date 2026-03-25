import { UserPlus, Building2, ShieldCheck, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface InvitationCardProps {
    invitation: any;
    org: any;
    user: any;
    token: string;
    isAccepting: boolean;
    isDeclining: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export function InvitationCard({ 
    invitation, 
    org, 
    user, 
    token,
    isAccepting, 
    isDeclining, 
    onAccept, 
    onDecline 
}: InvitationCardProps) {
    return (
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
                        onClick={onAccept}
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
                            onClick={onDecline}
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
                        onClick={onAccept}
                        disabled={isAccepting}
                        className="w-full h-14 rounded-2xl gradient-primary text-white font-black tracking-tight text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 group"
                    >
                        {isAccepting ? "Joining..." : "Accept & Join"}
                        {!isAccepting && (
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        )}
                    </Button>
                    <Button
                        onClick={onDecline}
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
    );
}
