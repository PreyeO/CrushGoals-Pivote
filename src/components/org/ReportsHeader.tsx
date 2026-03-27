import {
  BarChart3,
  FileText,
  Download,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Organization } from "@/types";

interface ReportsHeaderProps {
  org?: Organization;
  filterPeriod: "month" | "quarter" | "year" | "all";
  setFilterPeriod: (period: "month" | "quarter" | "year" | "all") => void;
  onExportCSV: () => void;
  isExporting: boolean;
}

export function ReportsHeader({
  filterPeriod,
  setFilterPeriod,
  onExportCSV,
  isExporting,
}: ReportsHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Reports & Insights
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Deep dive into your workspace performance and objective health.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={filterPeriod}
          onValueChange={(v: "month" | "quarter" | "year" | "all") =>
            setFilterPeriod(v)
          }
        >
          <SelectTrigger className="h-9 w-32.5 text-[11px] font-bold bg-accent/20 border-border/40">
            <CalendarIcon className="w-3.5 h-3.5 mr-2" />
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="year">Year to Date</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          onClick={onExportCSV}
          className="h-9 text-[11px] font-bold gap-2 bg-accent/20 border-border/40"
        >
          <FileText className="w-3.5 h-3.5" />{" "}
          {isExporting ? "Exporting..." : "CSV"}
        </Button>
        <Button className="gradient-primary text-white border-0 h-9 px-6 text-[11px] font-bold glow-primary-sm gap-2">
          <Download className="w-3.5 h-3.5" /> Export PDF
        </Button>
      </div>
    </header>
  );
}
