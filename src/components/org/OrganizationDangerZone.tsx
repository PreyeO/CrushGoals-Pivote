import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function OrganizationDangerZone({ org, orgId }: { org: any, orgId: string }) {
    const router = useRouter();
    const deleteOrganization = useStore((state) => state.deleteOrganization);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmName, setDeleteConfirmName] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteOrg = async () => {
        if (deleteConfirmName !== org.name) {
            toast.error("Organization name doesn't match. Please type it exactly.");
            return;
        }
        setIsDeleting(true);
        try {
            await deleteOrganization(orgId);
            toast.success("Organization deleted successfully.");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete organization.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className="glass-card border-destructive/20 p-6 space-y-4">
            <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-destructive">Danger Zone</h2>
            </div>
            <Separator className="bg-destructive/10" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-[13px] font-semibold">Delete Organization</p>
                    <p className="text-[11px] text-muted-foreground">Once you delete an organization, there is no going back. Please be certain.</p>
                </div>
                <Button 
                    variant="destructive" 
                    className="h-10 px-6 text-sm font-bold hover:bg-destructive/90 transition-colors gap-2 cursor-pointer"
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    <Trash2 className="w-4 h-4" /> Delete Org
                </Button>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
                <div className="mt-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-destructive font-semibold">
                        Type <span className="font-black">{org.name}</span> to confirm deletion:
                    </p>
                    <Input
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        placeholder={org.name}
                        className="bg-background border-destructive/30 focus:border-destructive h-10"
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteOrg}
                            disabled={isDeleting || deleteConfirmName !== org.name}
                            className="font-bold cursor-pointer"
                        >
                            {isDeleting ? "Deleting..." : "Permanently Delete"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeleteConfirmName("");
                            }}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}
