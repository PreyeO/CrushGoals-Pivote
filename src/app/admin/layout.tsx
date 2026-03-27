import { isSuperAdmin } from "@/lib/services/admin";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Top-level server-side check
  const superAdmin = await isSuperAdmin();
  if (!superAdmin) {
    redirect("/dashboard");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
