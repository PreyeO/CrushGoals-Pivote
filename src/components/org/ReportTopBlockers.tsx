import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { XCircle, CheckCircle2 } from "lucide-react";

interface ReportTopBlockersProps {
  topBlockers: [string, number][];
  totalBlocked: number;
}

export function ReportTopBlockers({
  topBlockers,
  totalBlocked,
}: ReportTopBlockersProps) {
  return (
    <Card className="glass-card border-border/40">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <XCircle className="w-4 h-4 text-destructive" /> Top Blocker Reasons
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topBlockers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              No Active Blockers
            </p>
          </div>
        ) : (
          topBlockers.map(([reason, count], i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                <span className="truncate pr-4">{reason}</span>
                <span className="text-primary">{count}x</span>
              </div>
              <Progress
                value={(count / totalBlocked) * 100}
                className="h-1.5 bg-destructive/10"
              />
            </div>
          ))
        )}
        <div className="pt-6 mt-6 border-t border-border/20">
          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
            {`"This shows systemic problems, not just individual ones. Monitor these reasons to improve team throughput."`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
