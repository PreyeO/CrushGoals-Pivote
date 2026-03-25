import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Search } from "lucide-react";
import { adminService } from "@/lib/services/admin";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { OrganizationTable } from "@/components/admin/organizations/OrganizationTable";

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function AdminOrganizationsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const searchTerm = params.q || "";
    const orgs = await adminService.getPlatformOrgs(searchTerm);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <AdminPageHeader 
                title="Platform Organizations"
                description="Monitor and manage all teams and organizations on the platform."
                icon={Building2}
                iconColor="text-amber-500"
                iconBg="bg-amber-500/10"
            >
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <form action="/admin/organizations" method="GET">
                        <Input 
                            name="q"
                            placeholder="Search organizations..." 
                            defaultValue={searchTerm}
                            className="pl-10 h-11 bg-accent/20 border-border/10 rounded-xl focus-visible:ring-amber-500/20 transition-all font-medium"
                        />
                    </form>
                </div>
            </AdminPageHeader>

            <Card className="glass-card shadow-sm border-border/40 overflow-hidden">
                <CardHeader className="border-b border-border/10 bg-accent/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-amber-500/90">Organization Directory</CardTitle>
                            <CardDescription>
                                {searchTerm ? `Found ${orgs.length} matching organizations for "${searchTerm}"` : "A complete list of active organizations and their resource usage."}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20 font-bold px-3 py-1">
                            {orgs.length} Total Organizations
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <OrganizationTable organizations={orgs} searchTerm={searchTerm} />
                </CardContent>
            </Card>
        </div>
    );
}
