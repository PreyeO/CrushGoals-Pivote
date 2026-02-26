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
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Target, Sparkles, Plus, Info, UserPlus } from "lucide-react";
import { GoalPriority, GoalStatus } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GOAL_TEMPLATES } from "@/lib/templates";

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    emoji: z.string().min(1),
    category: z.string().min(2),
    priority: z.enum(["low", "medium", "high"]),
    deadline: z.string().min(1, "Deadline is required"),
    assigneeIds: z.array(z.string()).min(1, "Please assign this goal to at least one person"),
    targetValue: z.string().min(1, "Target is required (e.g. 100 sign-ups)"),
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
    const myMemberId = members.find(m => m.userId === user?.id)?.id || "";

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
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assigneeIds: [myMemberId],
            targetValue: "",
        },
    });

    const selectedAssignees = watch("assigneeIds") || [];

    const toggleAssignee = (id: string) => {
        const current = [...selectedAssignees];
        if (current.includes(id)) {
            setValue("assigneeIds", current.filter(i => i !== id));
        } else {
            setValue("assigneeIds", [...current, id]);
        }
    };

    const toggleWholeTeam = () => {
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
                status: "not_started" as GoalStatus,
                assignedTo: data.assigneeIds,
                createdBy: user?.id || "unknown",
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

        reset({
            title: template.title,
            description: template.description,
            emoji: template.emoji,
            category: template.category,
            priority: template.priority,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assigneeIds: myMemberId ? [myMemberId] : [],
            targetValue: template.title.includes("sales") ? "$10,000" : template.title.includes("product") ? "MVP Launch" : "100 sign-ups",
        });
    };

    const onError = (errors: any) => {
        console.log("Form validation errors:", errors);
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
                        Welcome! Let's get your team moving. What is the #1 priority right now?
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 py-4">
                    <div className="space-y-3 p-4 rounded-xl bg-accent/20 border border-border/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                <Label className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground/80">Quick Start Templates</Label>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Click to apply</span>
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

                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2 col-span-1">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Emoji</Label>
                            <Input {...register("emoji")} className="bg-accent/30 border-border/40 text-center text-xl" />
                        </div>
                        <div className="space-y-2 col-span-3">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Category</Label>
                            <Input {...register("category")} placeholder="e.g. Sales, Product, Marketing" className="bg-accent/30 border-border/40" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider">Goal Title</Label>
                        <Input {...register("title")} placeholder="e.g. Hit 100 sign-ups" className="bg-accent/30 border-border/40" />
                        {errors.title && <p className="text-[10px] text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Target Goal</Label>
                            <Input {...register("targetValue")} placeholder="e.g. 100 users, $10k revenue" className="bg-accent/30 border-border/40" />
                            {errors.targetValue && <p className="text-[10px] text-destructive">{errors.targetValue.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Deadline</Label>
                            <Input type="date" {...register("deadline")} className="bg-accent/30 border-border/40" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider">Assign To</Label>
                                <UserPlus className="w-3 h-3 text-muted-foreground" />
                            </div>
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
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {members.map((member) => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => toggleAssignee(member.id)}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer",
                                        selectedAssignees.includes(member.id)
                                            ? "bg-primary/10 border-primary/30 ring-1 ring-primary/30"
                                            : "bg-accent/20 border-border/20 hover:bg-accent/40"
                                    )}
                                >
                                    <Avatar className="w-6 h-6 border-2 border-background">
                                        <AvatarFallback className="text-[8px] bg-primary/10 text-primary uppercase">
                                            {member.name.split(" ").map(n => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold truncate leading-none mb-0.5">
                                            {member.name.split(" ")[0]}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {errors.assigneeIds && <p className="text-[10px] text-destructive">{errors.assigneeIds.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider">Description</Label>
                        <Textarea {...register("description")} placeholder="Add more context here..." className="bg-accent/30 border-border/40 min-h-[80px]" />
                        {errors.description && <p className="text-[10px] text-destructive">{errors.description.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-bold">
                            {isSubmitting ? "Creating..." : "Launch Goal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
