import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Search } from "lucide-react";
import { adminService } from "@/lib/services/admin";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { UserTable } from "@/components/admin/users/UserTable";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchTerm = params.q || "";
  const users = await adminService.getPlatformUsers(searchTerm);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Platform Users"
        description="Manage users and platform access."
        icon={Users}
      >
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <form action="/admin/users" method="GET">
            <Input
              name="q"
              placeholder="Search users..."
              defaultValue={searchTerm}
              className="pl-10 h-11 bg-accent/20 border-border/10 rounded-xl focus-visible:ring-primary/20 transition-all font-medium"
            />
          </form>
        </div>
      </AdminPageHeader>

      <Card className="glass-card shadow-sm border-border/40 overflow-hidden">
        <CardHeader className="border-b border-border/10 bg-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                User Directory
              </CardTitle>
              <CardDescription>
                {searchTerm
                  ? `Found ${users.length} matching users for "${searchTerm}"`
                  : "A complete list of all registered platform users."}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1"
            >
              {users.length} Total Users
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable users={users} searchTerm={searchTerm} />
        </CardContent>
      </Card>
    </div>
  );
}
