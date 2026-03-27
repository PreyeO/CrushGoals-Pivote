import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string;
  bg: string;
  inverse?: boolean;
}

export function StatusCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  bg,
  inverse,
}: StatusCardProps) {
  // Actually simpler:
  const trendBg = inverse ? "bg-rose-500/10" : bg;
  const finalTrendColor = inverse ? "text-rose-500" : color;

  return (
    <Card className="glass-card shadow-sm hover:shadow-md transition-shadow duration-300 border-border/40 overflow-hidden relative group">
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} blur-2xl group-hover:blur-3xl transition-all opacity-50`}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div
          className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-black tracking-tight">{value}</div>
        {trend && (
          <p
            className={`text-[11px] mt-2 font-bold px-1.5 py-0.5 rounded-md inline-block ${trendBg} ${finalTrendColor}`}
          >
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
