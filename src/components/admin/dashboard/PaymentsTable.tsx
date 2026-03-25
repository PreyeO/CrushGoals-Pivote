"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils";
import type { RecentPayment } from "@/lib/services/admin";

interface PaymentsTableProps {
  payments: RecentPayment[];
  limit?: number;
  title?: string;
  description?: string;
}

export function PaymentsTable({ payments, limit = 5, title = "Recent Payments", description = "Live feed of transactions." }: PaymentsTableProps) {
    const displayPayments = payments.slice(0, limit);
    
    return (
        <Card className="col-span-1 lg:col-span-2 glass-card shadow-sm border-border/40">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/10">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Payer</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Amount</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Plan</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayPayments.map((p) => (
                            <TableRow key={p.id} className="border-border/5 hover:bg-accent/5 transition-colors">
                                <TableCell className="py-3">
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-bold">{p.userName || 'Unknown'}</span>
                                        <span className="text-[10px] text-muted-foreground">{p.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center py-3">
                                    <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                                        {p.currency} {Number(p.amount).toLocaleString()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center py-3">
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${p.tier === 'business' ? 'text-purple-500' : 'text-blue-500'}`}>
                                        {p.tier}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right py-3 text-[10px] font-bold text-muted-foreground">
                                    {formatTimeAgo(p.created_at)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {displayPayments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-xs italic">
                                    No recent payments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
