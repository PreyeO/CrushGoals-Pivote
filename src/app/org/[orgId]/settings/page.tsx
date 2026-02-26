"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save, Trash2, AlertTriangle, Sparkles } from "lucide-react";
import { notFound, useRouter } from "next/navigation";

export default function OrgSettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const org = useStore((state) => state.organizations.find((o) => o.id === orgId));

    // In a real app, we'd have an updateOrganization action in the store
    // For this simulation, we'll just show the UI
    const [name, setName] = useState(org?.name || "");
    const [emoji, setEmoji] = useState(org?.emoji || "");
    const [description, setDescription] = useState(org?.description || "");
    const [isSaving, setIsSaving] = useState(false);

    if (!mounted) return null;
    if (!org) return notFound();

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        // In a real app, update store here
    };

    return (
        <div className="min-h-screen bg-background">
            <Sidebar currentOrgId={orgId} />
            <main className="lg:pl-[260px] transition-all duration-300">
                <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-3xl mx-auto">
                    <header className="mb-8 animate-fade-in">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5 text-primary" />
                            Organization Settings
                        </h1>
                        <p className="text-[13px] text-muted-foreground mt-1">
                            Manage your team's workspace and preferences.
                        </p>
                    </header>

                    <div className="space-y-8 animate-fade-in-up">
                        {/* Profile Section */}
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

                        {/* Danger Zone */}
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
                                <Button variant="destructive" className="h-10 px-6 text-sm font-bold hover:bg-destructive/90 transition-colors gap-2">
                                    <Trash2 className="w-4 h-4" /> Delete Org
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
