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
import { Plus, Target, Sparkles, UserPlus, TrendingUp, Info } from "lucide-react";
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
    goalType: z.enum(["metric", "milestone"]),
    targetNumber: z.number().min(0.01, "Target must be greater than 0").optional(),
    unit: z.string().optional(),
    targetValue: z.string().min(1, "Target label is required (e.g. 100 sign-ups)"),
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
            frequency: "one_time" as GoalFrequency,
            startDate: new Date(now).toISOString().split('T')[0],
            deadline: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assigneeIds: myMemberId ? [myMemberId] : [],
            goalType: "metric",
            targetValue: "",
            targetNumber: 50,
            unit: "Tasks",
        },
    });

    const selectedAssignees = watch("assigneeIds") || [];
    const goalType = watch("goalType");
    const frequency = watch("frequency");

    const toggleAssignee = (id: string) => {
        if (isMemberOnly) return; // Members can't change assignees
        const current = [...selectedAssignees];
        if (current.includes(id)) {
            setValue("assigneeIds", current.filter(i => i !== id));
        } else {
            setValue("assigneeIds", [...current, id]);
        }
    };

    const toggleWholeTeam = () => {
        if (isMemberOnly) return; // Members can't assign to whole team
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
        } catch (error) {
            console.error("Failed to create goal:", error);
        }
    };

    const applyTemplate = (templateId: string) => {
        const template = GOAL_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        const isMetric = template.targetNumber !== undefined;
        const unit = template.unit || (template.title.includes("Outreach") ? "Calls"
            : template.title.includes("Revenue") ? "USD"
                : template.title.includes("Support") ? "Rating"
                    : template.title.includes("Product") ? "Shipped"
                        : "Tasks");

        const targetNumber = template.targetNumber || (template.title.includes("Outreach") ? 100
            : template.title.includes("Revenue") ? 10000
                : template.title.includes("Support") ? 5
                    : 10);

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
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                        <Plus className="w-4 h-4" /> New Goal
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] glass-card border-border/40 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Set Your First Goal</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        {isMemberOnly ? "Set a personal goal to contribute to your team's success." : "Welcome! Let's get your team moving. What is the #1 priority right now?"}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Goal Type</Label>
                            <div className="flex p-1 bg-accent/20 rounded-lg border border-border/20">
                                <button
                                    type="button"
                                    onClick={() => setValue("goalType", "milestone")}
                                    className={cn(
                                        "flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all",
                                        goalType === "milestone" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Milestone
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValue("goalType", "metric")}
                                    className={cn(
                                        "flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all",
                                        goalType === "metric" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Metric
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Frequency</Label>
                            <div className="flex p-1 bg-accent/20 rounded-lg border border-border/20">
                                {(["one_time", "daily", "weekly", "monthly"] as const).map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => setValue("frequency", f)}
                                        className={cn(
                                            "flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all",
                                            frequency === f ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {f === "one_time" ? "One-time" : f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2 col-span-1">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Emoji</Label>
                            <Input {...register("emoji")} className="bg-accent/30 border-border/40 text-center text-xl" />
                        </div>
                        <div className="space-y-2 col-span-3">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Goal Title</Label>
                            <Input {...register("title")} placeholder="e.g. 100 Daily Outreach Calls" className="bg-accent/30 border-border/40" />
                        </div>
                    </div>

                    {goalType === "metric" && frequency === "one_time" ? (
                        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-200">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider">Target #</Label>
                                <Input
                                    type="number"
                                    {...register("targetNumber", { valueAsNumber: true })}
                                    className="bg-background border-border/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider">Unit</Label>
                                <Input {...register("unit")} placeholder="Chapters" className="bg-background border-border/40" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider">Display As</Label>
                                <Input {...register("targetValue")} placeholder="e.g. 30 Chapters" className="bg-background border-border/40" />
                            </div>
                        </div>
                    ) : frequency !== "one_time" ? (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in duration-200">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                🔥 <strong className="text-foreground">{frequency === "daily" ? "Daily" : frequency === "weekly" ? "Weekly" : "Monthly"}</strong> goals tracked via check-ins instead of percentages. Members mark completion each {frequency === "daily" ? "day" : frequency === "weekly" ? "week" : "month"}.
                            </p>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-primary/80">Start Date</Label>
                            <Input type="date" {...register("startDate")} className="bg-accent/30 border-border/40" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-destructive/80">Deadline</Label>
                            <Input type="date" {...register("deadline")} className="bg-accent/30 border-border/40" />
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
                                    onClick={toggleWholeTeam}
                                    className={cn(
                                        "h-7 text-[10px] px-2 gap-1.5 border border-border/20",
                                        selectedAssignees.length === members.length && "bg-primary/10 text-primary border-primary/20"
                                    )}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Whole Team
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {members.map((member) => {
                                const isSelf = member.id === myMemberId;
                                const isSelected = selectedAssignees.includes(member.id);

                                if (isMemberOnly && !isSelf) return null;

                                return (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => toggleAssignee(member.id)}
                                        disabled={isMemberOnly}
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded-lg border text-left transition-all",
                                            isSelected
                                                ? "bg-primary/10 border-primary/30 ring-1 ring-primary/30"
                                                : "bg-accent/20 border-border/20 hover:bg-accent/40",
                                            isMemberOnly ? "cursor-default" : "cursor-pointer"
                                        )}
                                    >
                                        <Avatar className="w-6 h-6 border-2 border-background">
                                            <AvatarFallback className="text-[8px] bg-primary/10 text-primary uppercase">
                                                {member.name.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold truncate leading-none mb-0.5">
                                                {isSelf ? "Myself" : member.name.split(" ")[0]}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider">Description</Label>
                        <Textarea {...register("description")} placeholder="Add more context here..." className="bg-accent/30 border-border/40 min-h-[80px]" />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-bold">
                            {isSubmitting ? "Launching..." : "Launch Goal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
