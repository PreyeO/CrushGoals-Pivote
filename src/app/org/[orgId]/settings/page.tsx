"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save, Trash2, AlertTriangle, Sparkles, LogOut, RefreshCw } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { PricingPlans } from "@/components/PricingPlans";
import { CreditCard, Zap } from "lucide-react";

export default function OrgSettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const [mounted, setMounted] = useState(false);

    const fetchInitialData = useStore((state) => state.fetchInitialData);
    const org = useStore(useShallow((state) => state.organizations.find((o) => o.id === orgId)));

    useEffect(() => {
        setMounted(true);
        fetchInitialData(orgId);
    }, [orgId, fetchInitialData]);

    const [name, setName] = useState(org?.name || "");
    const [emoji, setEmoji] = useState(org?.emoji || "");
    const [description, setDescription] = useState(org?.description || "");
    
    const [isSaving, setIsSaving] = useState(false);

    const updateOrganization = useStore((state) => state.updateOrganization);

    // Sync state when org loads
    useEffect(() => {
        if (org) {
            setName(org.name || "");
            setEmoji(org.emoji || "");
            setDescription(org.description || "");
        }
    }, [org]);

    if (!mounted) return null;
    if (!org) return notFound();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateOrganization(orgId, {
                name,
                emoji,
                description,
            });
            toast.success("Settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto">
            <header className="mb-8 animate-fade-in">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                    Organization Settings
                </h1>
                <p className="text-[13px] text-muted-foreground mt-1">
                    Manage your organization's workspace and preferences.
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

                {/* Subscription & Billing Section */}
                <section className="glass-card p-6 space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Zap className="w-24 h-24 text-primary fill-primary" />
                    </div>
                    
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 mb-1">
                            <CreditCard className="w-4 h-4 text-primary" /> Subscription & Billing
                        </h2>
                        <p className="text-[11px] text-muted-foreground">Manage your plan and organization limits.</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-accent/20 border border-border/40">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">Organizations</p>
                            <p className="text-lg font-bold">
                                {useStore.getState().organizations.length} <span className="text-[11px] font-normal text-muted-foreground">/ {useStore.getState().user?.subscriptionTier === 'free' ? '1' : useStore.getState().user?.subscriptionTier === 'pro' ? '3' : '∞'}</span>
                            </p>
                            <div className="w-full h-1 bg-accent/30 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${Math.min(100, (useStore.getState().organizations.length / (useStore.getState().user?.subscriptionTier === 'free' ? 1 : useStore.getState().user?.subscriptionTier === 'pro' ? 3 : 100)) * 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-accent/20 border border-border/40">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">Members</p>
                            <p className="text-lg font-bold">
                                {org.memberCount} <span className="text-[11px] font-normal text-muted-foreground">/ {useStore.getState().user?.subscriptionTier === 'free' ? '10' : useStore.getState().user?.subscriptionTier === 'pro' ? '25' : '∞'}</span>
                            </p>
                            <div className="w-full h-1 bg-accent/30 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${Math.min(100, (org.memberCount / (useStore.getState().user?.subscriptionTier === 'free' ? 10 : useStore.getState().user?.subscriptionTier === 'pro' ? 25 : 100)) * 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-accent/20 border border-border/40">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 mb-1">Active Goals</p>
                            <p className="text-lg font-bold">
                                {org.goalCount} <span className="text-[11px] font-normal text-muted-foreground">/ {useStore.getState().user?.subscriptionTier === 'free' ? '15' : '∞'}</span>
                            </p>
                            <div className="w-full h-1 bg-accent/30 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${Math.min(100, (org.goalCount / (useStore.getState().user?.subscriptionTier === 'free' ? 15 : 100)) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/10">
                        <PricingPlans showHeader={false} />
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

                {/* Account & Session */}
                <section className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-muted-foreground" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">Account & Session</h2>
                    </div>
                    <Separator className="opacity-10" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[13px] font-semibold">Sign Out</p>
                            <p className="text-[11px] text-muted-foreground">Sign out of your current session. You will need to log in again to access your organizations.</p>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => useStore.getState().signOut()}
                            className="h-10 px-6 text-sm font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
