import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface LeaderboardPodiumProps {
    top3: {
        memberId: string;
        name: string;
        totalPoints: number;
    }[];
}

export function LeaderboardPodium({ top3 }: LeaderboardPodiumProps) {
    if (top3.length < 3) return null;

    return (
        <div className="flex items-end justify-center gap-4 sm:gap-6 mb-12">
            {/* 2nd */}
            <div className="glass-card p-5 text-center w-32 sm:w-40 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <div className="text-3xl mb-3">🥈</div>
                <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-border/40">
                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-lg">{top3[1].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-[13px] truncate">{top3[1].name}</p>
                <p className="text-xl font-extrabold text-primary mt-1">{top3[1].totalPoints}</p>
                <p className="text-[9px] text-muted-foreground">points</p>
            </div>

            {/* 1st */}
            <div className="glass-card p-6 text-center w-36 sm:w-44 border-primary/30 glow-primary animate-fade-in-up relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 gradient-primary rounded-full text-[9px] font-bold text-white uppercase tracking-wider">
                    Champion
                </div>
                <div className="text-4xl mb-3 mt-1">🥇</div>
                <Avatar className="w-14 h-14 mx-auto mb-2 border-2 border-primary/40 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">{top3[0].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-[14px]">{top3[0].name}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-[oklch(0.85_0.16_80)] text-[oklch(0.85_0.16_80)]" />
                    <span className="text-2xl font-extrabold text-gradient-primary">{top3[0].totalPoints}</span>
                </div>
                <p className="text-[9px] text-muted-foreground">points</p>
            </div>

            {/* 3rd */}
            <div className="glass-card p-5 text-center w-32 sm:w-40 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <div className="text-3xl mb-3">🥉</div>
                <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-border/40">
                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-lg">{top3[2].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-[13px] truncate">{top3[2].name}</p>
                <p className="text-xl font-extrabold text-primary mt-1">{top3[2].totalPoints}</p>
                <p className="text-[9px] text-muted-foreground">points</p>
            </div>
        </div>
    );
}
