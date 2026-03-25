import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Users, Target, Calendar, Search, Filter } from "lucide-react";
import { adminService } from "@/lib/services/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function AdminOrganizationsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const searchTerm = params.q || "";
    const orgs = await adminService.getPlatformOrgs(searchTerm);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center glow-amber-sm">
                        <Building2 className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-amber">Platform Organizations</h1>
                        <p className="text-muted-foreground text-sm">Monitor and manage all teams and organizations on the platform.</p>
                    </div>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <form action="/admin/organizations" method="GET">
                        <Input 
                            name="q"
                            placeholder="Search organizations by name..." 
                            defaultValue={searchTerm}
                            className="pl-10 h-11 bg-accent/20 border-border/10 rounded-xl focus-visible:ring-amber-500/20 transition-all font-medium"
                        />
                    </form>
                </div>
            </div>

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
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-accent/10 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border/10">
                                    <th className="px-6 py-4">Organization</th>
                                    <th className="px-6 py-4">Owner</th>
                                    <th className="px-6 py-4 text-center">Resources</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/5">
                                {orgs.map((org) => (
                                    <tr key={org.id} className="group hover:bg-accent/5 transition-colors duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl shadow-sm border border-border/10 group-hover:scale-110 transition-transform duration-300">
                                                    {org.emoji || '🏢'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground group-hover:text-amber-500 transition-colors line-clamp-1">{org.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight truncate max-w-[150px]">
                                                        {org.description || 'No description'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {org.owner ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-7 h-7 border border-border/10 shadow-sm">
                                                        <AvatarImage src={org.owner.avatar_url || ''} />
                                                        <AvatarFallback className="text-[8px] font-bold bg-amber-500/10 text-amber-600">
                                                            {(org.owner.full_name || 'U').split(' ').map((n: string) => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-xs truncate max-w-[120px]">{org.owner.full_name}</span>
                                                        <span className="text-[10px] text-muted-foreground truncate max-w-[140px] leading-none mb-0.5">{org.owner.email}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">No owner</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="flex flex-col items-center gap-0.5" title="Members">
                                                    <div className="w-6 h-6 rounded-lg bg-blue-500/5 flex items-center justify-center">
                                                        <Users className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    <span className="font-bold text-[11px]">{org.memberCount}</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5" title="Goals">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/5 flex items-center justify-center">
                                                        <Target className="w-3.5 h-3.5 text-emerald-500" />
                                                    </div>
                                                    <span className="font-bold text-[11px]">{org.goalCount}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={org.plan === 'pro' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold" : "bg-accent/30 text-muted-foreground border-transparent uppercase text-[9px] font-bold"}>
                                                {org.plan}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-[11px] font-bold text-foreground/80">{new Date(org.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {orgs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                            <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
                                <Building2 className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-bold text-foreground">No organizations found</p>
                            <p className="text-sm max-w-[250px] mx-auto mt-1 leading-relaxed">
                                We couldn't find any organizations matching "{searchTerm}".
                            </p>
                            <Link href="/admin/organizations" className="mt-6 text-xs font-black uppercase tracking-widest text-amber-500 hover:underline">
                                Clear filters
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
