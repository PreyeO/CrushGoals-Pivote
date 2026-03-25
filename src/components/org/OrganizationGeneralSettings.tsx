import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function OrganizationGeneralSettings({ org, orgId }: { org: any, orgId: string }) {
    const [name, setName] = useState(org?.name || "");
    const [emoji, setEmoji] = useState(org?.emoji || "");
    const [description, setDescription] = useState(org?.description || "");
    const [isSaving, setIsSaving] = useState(false);
    
    const updateOrganization = useStore((state) => state.updateOrganization);

    useEffect(() => {
        if (org) {
            setName(org.name || "");
            setEmoji(org.emoji || "");
            setDescription(org.description || "");
        }
    }, [org]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateOrganization(orgId, { name, emoji, description });
            toast.success("Settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="glass-card p-6 space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> General Information
            </h2>

            <div className="grid sm:grid-cols-4 gap-6">
                <div className="space-y-2 col-span-1">
                    <Label htmlFor="emoji" className="text-[11px] font-bold text-muted-foreground uppercase">Emoji</Label>
                    <Input
                        id="emoji"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="bg-accent/30 border-border/40 text-center text-2xl h-12"
                    />
                </div>
                <div className="space-y-2 col-span-3">
                    <Label htmlFor="name" className="text-[11px] font-bold text-muted-foreground uppercase">Organization Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-accent/30 border-border/40 h-12"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-[11px] font-bold text-muted-foreground uppercase">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-accent/30 border-border/40 min-h-[100px]"
                />
            </div>

            <div className="pt-2">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gradient-primary text-white border-0 px-8 h-11 glow-primary"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                    <Save className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </section>
    );
}
