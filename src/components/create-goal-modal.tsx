"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Target, Sparkles, UserPlus, TrendingUp, Info, Check, Users } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OrgGoal, GoalStatus, GoalPriority, GoalFrequency } from "@/types";
import { useState, useMemo } from "react";
import { GOAL_TEMPLATES } from "@/lib/templates";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    emoji: z.string().min(1),
    category: z.string().min(2),
    priority: z.enum(["low", "medium", "high"]),
    frequency: z.enum(["one_time", "daily", "weekly", "monthly"]),
    startDate: z.string().min(1, "Start date is required"),
    deadline: z.string().min(1, "Deadline is required"),
    assigneeIds: z.array(z.string()).min(1, "Please assign this goal to at least one person"),
    goalType: z.enum(["metric", "milestone"]).optional(),
    targetNumber: z.number().min(0.01, "Target must be greater than 0").optional(),
    unit: z.string().optional(),
    targetValue: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateGoalModalProps {
    orgId: string;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateGoalModal({ orgId, children, open: controlledOpen, onOpenChange: setControlledOpen }: CreateGoalModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (val: boolean) => {
        if (isControlled) {
            setControlledOpen?.(val);
        } else {
            setInternalOpen(val);
        }
    };
    const addGoal = useStore((state) => state.addGoal);
    const allMembers = useStore((state) => state.members);
    const user = useStore((state) => state.user);

    const members = allMembers.filter(m => m.orgId === orgId);
    const organizations = useStore((state) => state.organizations);
    const currentOrg = organizations.find(o => o.id === orgId);
    const allGoals = useStore((state) => state.goals);
    
    const orgGoals = allGoals.filter(g => g.orgId === orgId);
    const activeGoals = orgGoals.filter(g => g.status !== 'completed');
    const plan = currentOrg?.plan || "free";
    const goalLimit = plan === "free" ? 15 : Infinity;
    const isLimitReached = activeGoals.length >= goalLimit;

    const myMember = members.find(m => m.userId === user?.id);
    const myMemberId = myMember?.id || "";
    const isMemberOnly = myMember?.role === "member";

    const [now] = useState(() => Date.now());
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            emoji: "🎯",
            category: "General",
            priority: "medium" as GoalPriority,
            frequency: undefined,
            startDate: new Date(now).toISOString().split('T')[0],
            deadline: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assigneeIds: myMemberId ? [myMemberId] : [],
            goalType: undefined,
            targetValue: "",
            targetNumber: 50,
            unit: "Tasks",
        },
    });

    const selectedAssignees = watch("assigneeIds") || [];
    const goalType = watch("goalType");
    const frequency = watch("frequency");
    const title = watch("title");

    const hasTitle = title && title.trim().length >= 3;
    const hasTracking = hasTitle && !!goalType && !!frequency;

    const toggleAssignee = (id: string) => {
        if (isMemberOnly) return; // Members can't change assignees
        const current = [...selectedAssignees];
        if (current.includes(id)) {
            setValue("assigneeIds", current.filter(i => i !== id));
        } else {
            setValue("assigneeIds", [...current, id]);
        }
    };

    const toggleEveryone = () => {
        if (isMemberOnly) return; // Members can't assign to everyone
        if (selectedAssignees.length === members.length) {
            setValue("assigneeIds", [myMemberId]); // Default back to self
        } else {
            setValue("assigneeIds", members.map(m => m.id));
        }
    };

    const onSubmit = async (data: FormValues) => {
        try {
            await addGoal({
                ...data,
                orgId,
                frequency: data.frequency,
                status: "not_started" as GoalStatus,
                assignedTo: isMemberOnly ? [myMemberId] : data.assigneeIds,
                createdBy: user?.id || "unknown",
                targetNumber: data.goalType === 'metric' ? data.targetNumber : undefined,
                unit: data.goalType === 'metric' ? data.unit : undefined,
            } as any);
            reset();
            setOpen(false);
            toast.success("Goal launched successfully! 🚀");
        } catch (error) {
            console.error("Failed to create goal:", error);
            toast.error("Failed to launch goal. Please try again.");
        }
    };

    const applyTemplate = (templateId: string) => {
        const template = GOAL_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        if (template.id === 'tpl-custom') {
            reset({
                title: "",
                description: "",
                emoji: "🎯",
                category: "General",
                priority: "medium",
                frequency: "one_time",
                startDate: new Date(now).toISOString().split('T')[0],
                deadline: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                assigneeIds: myMemberId ? [myMemberId] : [],
                goalType: "milestone",
                targetValue: "",
                targetNumber: 50,
                unit: "Tasks",
            });
            return;
        }

        const isMetric = template.targetNumber !== undefined;
        const unit = template.unit || "Items";
        const targetNumber = template.targetNumber || 10;

        reset({
            title: template.title,
            description: template.description,
            emoji: template.emoji,
            category: template.category,
            priority: template.priority,
            frequency: template.cadence || "one_time",
            startDate: new Date(now).toISOString().split('T')[0],
            deadline: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assigneeIds: myMemberId ? [myMemberId] : [],
            goalType: isMetric ? "metric" : "milestone",
            targetValue: isMetric ? `${targetNumber} ${unit}` : template.title,
            targetNumber: targetNumber,
            unit: unit,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild disabled={isLimitReached}>
                {children || (
                    <Button 
                        variant="outline" 
                        disabled={isLimitReached}
                        className="gap-2 border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" /> 
                        {isLimitReached ? "Goal Limit Reached" : "New Goal"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] glass-card border-border/40 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Set Your First Goal</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        {isMemberOnly ? "Set a personal goal to contribute to the organization's success." : "Welcome! Let's get everyone moving. What is the #1 priority right now?"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-3 p-4 rounded-xl bg-accent/20 border border-border/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                <Label className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground/80">Quick Start Templates</Label>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <TooltipProvider>
                                {GOAL_TEMPLATES.map((template) => (
                                    <Tooltip key={template.id}>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() => applyTemplate(template.id)}
                                                className={cn(
                                                    "group relative flex items-center gap-2 px-3 h-9 rounded-lg border text-[11px] font-semibold transition-all duration-300 cursor-pointer",
                                                    "bg-background/40 border-border/40 hover:border-primary/50 hover:bg-primary/5",
                                                    "hover:shadow-[0_0_15px_-5px_var(--primary)] hover:scale-[1.02] active:scale-[0.98]"
                                                )}
                                            >
                                                <span className="text-sm scale-110 group-hover:rotate-12 transition-transform">{template.emoji}</span>
                                                <span className="truncate max-w-[120px] text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {template.title}
                                                </span>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="glass-card border-border/40 p-3 max-w-[200px] shadow-2xl animate-in zoom-in-95">
                                            <p className="font-bold text-xs mb-1 text-primary">{template.title}</p>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                {template.description}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </div>
                    </div>

                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4">
                        <div className="space-y-2 sm:col-span-1 border-b border-border/10 pb-4 sm:border-0 sm:pb-0">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Emoji</Label>
                            <Input {...register("emoji")} className="bg-accent/30 border-border/40 text-center text-xl sm:text-2xl h-12 sm:h-auto" />
                        </div>
                        <div className="space-y-2 sm:col-span-3">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Goal Title</Label>
                            <Input {...register("title")} placeholder="e.g. 100 Daily Outreach Calls" className="bg-accent/30 border-border/40 text-sm h-12 sm:h-auto" />
                        </div>
                    </div>

                    {hasTitle && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Track by</Label>
                                    <Select value={goalType} onValueChange={(val: "milestone" | "metric") => setValue("goalType", val)}>
                                        <SelectTrigger className="bg-accent/30 border-border/40 h-11 sm:h-9">
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="milestone">Check-off</SelectItem>
                                            <SelectItem value="metric">Target Number</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frequency</Label>
                                    <Select value={frequency} onValueChange={(val: GoalFrequency) => setValue("frequency", val)}>
                                        <SelectTrigger className="bg-accent/30 border-border/40 h-11 sm:h-9">
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one_time">One-time</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {goalType === "metric" && frequency === "one_time" ? (
                                <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-200">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider">Target #</Label>
                                        <Input
                                            type="number"
                                            {...register("targetNumber", { valueAsNumber: true })}
                                            className="bg-background border-border/40 h-11 sm:h-9"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider">Unit</Label>
                                        <Input {...register("unit")} placeholder="Chapters" className="bg-background border-border/40 h-11 sm:h-9" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider">Display As</Label>
                                        <Input {...register("targetValue")} placeholder="e.g. 30 Chapters" className="bg-background border-border/40 h-11 sm:h-9" />
                                    </div>
                                </div>
                            ) : frequency !== "one_time" ? (
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in duration-200">
                                    <div className="mt-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider">Target Milestone</Label>
                                        <Input {...register("targetValue")} placeholder={`e.g. ${frequency === "daily" ? "Daily standup" : frequency === "weekly" ? "Weekly report" : "Monthly review"}`} className="bg-background border-border/40 mt-1" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 animate-in fade-in duration-200">
                                    <Label className="text-xs font-semibold uppercase tracking-wider">Target Milestone</Label>
                                    <Input {...register("targetValue")} placeholder="e.g. MVP Launch / Complete Goal" className="bg-accent/30 border-border/40" />
                                </div>
                            )}

                            {hasTracking && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-primary/80">Start Date</Label>
                                            <Input type="date" {...register("startDate")} className="bg-accent/30 border-border/40 h-11 sm:h-9" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-destructive/80">Deadline</Label>
                                            <Input type="date" {...register("deadline")} className="bg-accent/30 border-border/40 h-11 sm:h-9" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold uppercase tracking-wider">
                                                {isMemberOnly ? "Assigned To" : "Assign To"}
                                            </Label>
                                            {!isMemberOnly && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={toggleEveryone}
                                                    className={cn(
                                                        "h-7 text-[10px] px-2 gap-1.5 border border-border/20",
                                                        selectedAssignees.length === members.length && "bg-primary/10 text-primary border-primary/20"
                                                    )}
                                                >
                                                    <Users className="w-3 h-3" />
                                                    Everyone
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="flex items-center">
                                                {selectedAssignees.slice(0, 6).map((id, i) => {
                                                    const m = members.find(m => m.id === id);
                                                    if (!m) return null;
                                                    return (
                                                        <button
                                                            key={id}
                                                            type="button"
                                                            onClick={() => !isMemberOnly && toggleAssignee(id)}
                                                            title={m.name}
                                                            className={cn(
                                                                "relative w-8 h-8 rounded-full border-2 border-background transition-transform hover:scale-110 hover:z-10",
                                                                i > 0 && "-ml-2"
                                                            )}
                                                            style={{ zIndex: i }}
                                                        >
                                                            <Avatar className="w-full h-full">
                                                                <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold uppercase">
                                                                    {m.name.split(" ").map(n => n[0]).join("")}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {!isMemberOnly && (
                                                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive/80 text-white text-[7px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                                {selectedAssignees.length > 6 && (
                                                    <div className="relative -ml-2 w-8 h-8 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground z-10">
                                                        +{selectedAssignees.length - 6}
                                                    </div>
                                                )}
                                                {selectedAssignees.length === 0 && (
                                                    <span className="text-xs text-muted-foreground/60 italic">No one assigned yet</span>
                                                )}
                                            </div>

                                            {!isMemberOnly && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-[11px] border-dashed border-border/40 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <UserPlus className="w-3.5 h-3.5" />
                                                            Add Assignee
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="w-52 glass-card border-border/40">
                                                        <ScrollArea className="max-h-52">
                                                            {members.map((member) => {
                                                                const isSelf = member.id === myMemberId;
                                                                const isSelected = selectedAssignees.includes(member.id);
                                                                return (
                                                                    <DropdownMenuItem
                                                                        key={member.id}
                                                                        onSelect={(e) => { e.preventDefault(); toggleAssignee(member.id); }}
                                                                        className="flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        <Avatar className="w-6 h-6 shrink-0">
                                                                            <AvatarFallback className="text-[8px] bg-primary/10 text-primary uppercase">
                                                                                {member.name.split(" ").map(n => n[0]).join("")}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="flex-1 text-xs truncate">{isSelf ? `${member.name} (You)` : member.name}</span>
                                                                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                                                                    </DropdownMenuItem>
                                                                );
                                                            })}
                                                        </ScrollArea>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-semibold uppercase tracking-wider">Notes <span className="text-muted-foreground/60">(Optional)</span></Label>
                                        </div>
                                        <Textarea {...register("description")} placeholder="Add more context or links here..." className="bg-accent/30 border-border/40 min-h-[60px] sm:min-h-[80px] text-sm" />
                                    </div>

                                    <DialogFooter className="pt-4 mt-4 border-t border-border/10">
                                        <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-bold">
                                            {isSubmitting ? "Launching..." : "Launch Goal"}
                                        </Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
}
