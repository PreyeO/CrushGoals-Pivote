import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { adminService } from "@/lib/services/admin";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
    return (
        <Suspense fallback={
            <div className="flex w-full h-full min-h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <AdminDataFetcher />
        </Suspense>
    );
}

async function AdminDataFetcher() {
    const [stats, payments, growth] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getRecentPayments(),
        adminService.getGrowthData()
    ]);
    return <AdminDashboard stats={stats} payments={payments} growth={growth} />;
}
