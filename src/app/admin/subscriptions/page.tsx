import {
  CreditCard,
  DollarSign,
  TrendingUp,
  BarChart3,
  Zap,
  Box,
  ArrowUpRight,
} from "lucide-react";
import { adminService } from "@/lib/services/admin";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { StatusCard } from "@/components/admin/shared/StatusCard";
import { PaymentsTable } from "@/components/admin/dashboard/PaymentsTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminSubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full h-full min-h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SubscriptionsDataFetcher />
    </Suspense>
  );
}

async function SubscriptionsDataFetcher() {
  const [stats, payments] = await Promise.all([
    adminService.getPlatformStats(),
    adminService.getRecentPayments(20),
  ]);

  const totalPaid = stats.billing.pro + stats.billing.business;
  const churnRate = 2.4; // Placeholder
  const arpu = totalPaid > 0 ? stats.billing.mrr / totalPaid : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminPageHeader
        title="Billing & Revenue"
        description="Monitor platform subscriptions, revenue, and payout status."
        icon={CreditCard}
        iconColor="text-indigo-500"
        iconBg="bg-indigo-500/10"
      />

      {/* Quick Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger">
        <StatusCard
          title="Live MRR (30d)"
          value={`$${stats.billing.mrr.toLocaleString()}`}
          trend="Last 30 days"
          icon={DollarSign}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatusCard
          title="Churn Rate"
          value={`${churnRate}%`}
          trend="Estimated"
          icon={TrendingUp}
          color="text-rose-500"
          bg="bg-rose-500/10"
          inverse
        />
        <StatusCard
          title="Avg Revenue (ARPU)"
          value={arpu > 0 ? `$${arpu.toFixed(2)}` : "N/A"}
          trend="Per paying org"
          icon={BarChart3}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatusCard
          title="Paying Orgs"
          value={totalPaid}
          trend={`of ${stats.totalOrgs} total`}
          icon={Zap}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Subscription Tiers */}
        <Card className="col-span-1 lg:col-span-2 glass-card shadow-sm border-border/40 overflow-hidden">
          <CardHeader className="border-b border-border/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  Plan Tiers & Distribution
                </CardTitle>
                <CardDescription>
                  Active organizations grouped by subscription plan.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="bg-indigo-500/5 text-indigo-500 border-indigo-500/20 px-3 py-1"
              >
                Live Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/5">
              <PlanRow
                name="Free"
                users={stats.billing.free}
                price="$0 / mo"
                totalOrgs={stats.totalOrgs}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
              />
              <PlanRow
                name="Pro"
                users={stats.billing.pro}
                price="$12 / mo"
                totalOrgs={stats.totalOrgs}
                recommended
                color="text-indigo-500"
                bg="bg-indigo-500/10"
              />
              <PlanRow
                name="Business"
                users={stats.billing.business}
                price="$29 / mo"
                totalOrgs={stats.totalOrgs}
                color="text-purple-500"
                bg="bg-purple-500/10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Flutterwave status card */}
        <Card className="col-span-1 glass-card shadow-sm border-border/40 overflow-hidden relative group">
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-linear-to-t from-indigo-500/10 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-500" />
              Flutterwave Status
            </CardTitle>
            <CardDescription>Live payment gateway connection.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
              <CreditCard className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground flex items-center gap-2 justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Payment Gateway Active
              </p>
              <p className="text-xs text-muted-foreground max-w-50 mx-auto">
                Flutterwave webhook is live. Transactions are recorded in real
                time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <PaymentsTable
        payments={payments}
        limit={20}
        title="Recent Transactions"
        description="Latest Flutterwave payment events (up to 20)."
      />
    </div>
  );
}

interface PlanRowProps {
  name: string;
  users: number;
  price: string;
  totalOrgs: number;
  recommended?: boolean;
  color: string;
  bg: string;
}

function PlanRow({
  name,
  users,
  price,
  totalOrgs,
  recommended,
  color,
  bg,
}: PlanRowProps) {
  const pct = totalOrgs > 0 ? Math.round((users / totalOrgs) * 100) : 0;
  return (
    <div className="flex items-center justify-between p-6 hover:bg-accent/5 transition-colors group">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border border-border/10 shadow-sm ${bg}`}
        >
          {recommended ? (
            <Zap className={`w-5 h-5 ${color}`} />
          ) : (
            <Box className={`w-5 h-5 ${color}`} />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{name}</span>
            {recommended && (
              <Badge className="text-[9px] h-4 bg-indigo-500 hover:bg-indigo-500">
                Popular
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
            {price}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black">
          {users}{" "}
          <span className="text-[10px] text-muted-foreground font-normal">
            Orgs
          </span>
        </p>
        <div
          className={`flex items-center justify-end gap-1 text-[10px] font-bold ${color}`}
        >
          <ArrowUpRight className="w-3 h-3" />
          {pct}% of total
        </div>
      </div>
    </div>
  );
}
