import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface ReportMonthlyChartProps {
  monthlyData: { name: string; count: number }[];
}

export function ReportMonthlyChart({ monthlyData }: ReportMonthlyChartProps) {
  return (
    <Card className="lg:col-span-2 glass-card border-border/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" /> Completion Trend
        </CardTitle>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Last 6 Months</span>
        </div>
      </CardHeader>
      <CardContent className="h-75 flex flex-col justify-end gap-2 px-6 pb-6 pt-10">
        <div className="flex items-end gap-6 h-full px-4 border-b border-border/30 pb-2">
          {monthlyData.map((d, i) => {
            const max = Math.max(...monthlyData.map((md) => md.count), 1);
            const height = (d.count / max) * 100;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end"
              >
                <div
                  className="w-full bg-primary/20 rounded-t-xl group-hover:bg-primary/40 transition-all duration-500 relative min-h-1"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover border border-border/40 px-3 py-1.5 rounded-lg text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl z-20 scale-90 group-hover:scale-100">
                    {d.count} Crushed
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                  {d.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
