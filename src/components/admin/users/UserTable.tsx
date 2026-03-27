"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Building2,
  Target,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react";
import Link from "next/link";

import { AdminUser } from "@/types";

interface UserTableProps {
  users: AdminUser[];
  searchTerm?: string;
}

export function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
          <UsersIcon className="w-8 h-8 opacity-20" />
        </div>
        <p className="font-bold text-foreground">No users found</p>
        <p className="text-sm max-w-62.5 mx-auto mt-1 leading-relaxed text-center">
          {`We couldn't find any users matching "{searchTerm}".`}
        </p>
        <Link
          href="/admin/users"
          className="mt-6 text-xs font-black uppercase tracking-widest text-primary hover:underline"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
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
          {users.map((user) => (
            <tr
              key={user.id}
              className="group hover:bg-accent/5 transition-colors duration-200"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border/10 shadow-sm group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback className="font-bold bg-primary/10 text-primary">
                      {(user.name || "U")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {user.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="w-fit text-[8px] h-4 bg-accent/30 text-muted-foreground border-transparent uppercase font-bold"
                    >
                      ID: {user.id.substring(0, 8)}
                    </Badge>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="font-medium truncate max-w-50">
                    {user.email}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-4">
                  <div
                    className="flex flex-col items-center gap-0.5"
                    title="Owned Organizations"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-500/5 flex items-center justify-center">
                      <Building2 className="w-3 h-3 text-amber-500" />
                    </div>
                    <span className="font-bold text-[11px]">
                      {user.orgCount || 0}
                    </span>
                  </div>
                  <div
                    className="flex flex-col items-center gap-0.5"
                    title="Created Goals"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/5 flex items-center justify-center">
                      <Target className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="font-bold text-[11px]">
                      {user.goalCount || 0}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                {/* Use NEXT_PUBLIC_SUPER_ADMIN_EMAIL from env or fallback to original */}
                {user.email ===
                  (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ||
                    "ayibakep@gmail.com") || user.role === "super_admin" ? (
                  <div className="flex justify-end">
                    <Badge className="bg-primary/20 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest gap-1 py-1">
                      <ShieldCheck className="w-3 h-3" />
                      Super Admin
                    </Badge>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-accent/50 text-muted-foreground border-transparent text-[9px] font-bold uppercase"
                  >
                    User
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
