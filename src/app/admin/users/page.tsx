import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Mail, Building2, Calendar, ShieldCheck, Search, Target } from "lucide-react";
import { adminService } from "@/lib/services/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const searchTerm = params.q || "";
    const users = await adminService.getPlatformUsers(searchTerm);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center glow-primary-sm">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient">Platform Users</h1>
                        <p className="text-muted-foreground text-sm">Manage and view all registered users across the platform.</p>
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <form action="/admin/users" method="GET">
                        <Input 
                            name="q"
                            placeholder="Search users by name or email..." 
                            defaultValue={searchTerm}
                            className="pl-10 h-11 bg-accent/20 border-border/10 rounded-xl focus-visible:ring-primary/20 transition-all font-medium"
                        />
                    </form>
                </div>
            </div>

            <Card className="glass-card shadow-sm border-border/40 overflow-hidden">
                <CardHeader className="border-b border-border/10 bg-accent/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">User Management</CardTitle>
                            <CardDescription>
                                {searchTerm ? `Found ${users.length} matching users for "${searchTerm}"` : "Direct overview of all user accounts and their impact."}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1">
                            {users.length} Total Users
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-accent/10 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border/10">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4 text-center">Resources</th>
                                    <th className="px-6 py-4 text-right">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/5">
                                {users.map((user: any) => (
                                    <tr key={user.id} className="group hover:bg-accent/5 transition-colors duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-9 h-9 border border-border/20 shadow-sm group-hover:scale-105 transition-transform duration-200">
                                                    <AvatarImage src={user.avatar_url || ''} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                                                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{user.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">ID: {user.id.substring(0, 8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="font-medium truncate max-w-[200px]">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="flex flex-col items-center gap-0.5" title="Owned Organizations">
                                                    <div className="w-6 h-6 rounded-lg bg-amber-500/5 flex items-center justify-center">
                                                        <Building2 className="w-3 h-3 text-amber-500" />
                                                    </div>
                                                    <span className="font-bold text-[11px]">{user.orgCount || 0}</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5" title="Created Goals">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/5 flex items-center justify-center">
                                                        <Target className="w-3 h-3 text-emerald-500" />
                                                    </div>
                                                    <span className="font-bold text-[11px]">{user.goalCount || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.email === 'ayibakep@gmail.com' ? (
                                                <div className="flex justify-end">
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 flex items-center gap-1 w-fit">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Super Admin
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end">
                                                    <Badge variant="secondary" className="bg-accent/30 text-muted-foreground font-medium">
                                                        User
                                                    </Badge>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {users.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                            <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-bold text-foreground">No users match your search</p>
                            <p className="text-sm max-w-[250px] mx-auto mt-1 leading-relaxed">
                                We couldn't find any users named "{searchTerm}" in the database.
                            </p>
                            <Link href="/admin/users" className="mt-6 text-xs font-black uppercase tracking-widest text-primary hover:underline">
                                Clear search filter
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
