"use client";

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
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoalStatus, OrgGoal } from "@/types";
import { CreateGoalTemplates } from "./goals/CreateGoalTemplates";
import { CreateGoalAssignees } from "./goals/CreateGoalAssignees";
import { CreateGoalFormValues } from "@/lib/validations/goal";
import { useGoalForm } from "@/hooks/useGoalForm";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateGoalModalProps {
    orgId: string;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    goal?: OrgGoal;
}

export function CreateGoalModal({ orgId, children, open: controlledOpen, onOpenChange: setControlledOpen, goal }: CreateGoalModalProps) {
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
    const updateGoal = useStore((state) => state.updateGoal);
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

    const initialValues: Partial<CreateGoalFormValues> | undefined = goal ? {
        title: goal.title,
        description: goal.description || "",
        emoji: goal.emoji,
        category: goal.category,
        priority: goal.priority,
        frequency: goal.frequency,
        startDate: goal.startDate,
        deadline: goal.deadline,
        assigneeIds: goal.assignedTo,
        goalType: goal.targetNumber !== undefined ? "metric" : "milestone",
        targetNumber: goal.targetNumber || 50,
        targetValue: goal.targetValue || "",
        unit: goal.unit || "Tasks",
        isPrivate: goal.isPrivate || false,
    } : undefined;

    const { form, toggleAssignee, toggleEveryone, applyTemplate } = useGoalForm({
        myMemberId,
        isMemberOnly,
        membersCount: members.length,
        memberIds: members.map(m => m.id),
        initialValues
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = form;

    const selectedAssignees = watch("assigneeIds") || [];
    const goalType = watch("goalType");
    const frequency = watch("frequency");
    const title = watch("title");

    const hasTitle = title && title.trim().length >= 3;
    const hasTracking = hasTitle && !!goalType && !!frequency;

    const onSubmit = async (data: CreateGoalFormValues) => {
        try {
            if (goal) {
                // Edit existing goal
                await updateGoal(goal.id, {
                    ...data,
                    assignedTo: isMemberOnly ? [myMemberId] : data.assigneeIds,
                    targetNumber: data.goalType === 'metric' ? data.targetNumber : undefined,
                    unit: data.goalType === 'metric' ? data.unit : undefined,
                } as any);
                toast.success("Goal updated successfully! ✨");
            } else {
                // Create new goal
                await addGoal({
                    ...data,
                    orgId,
                    frequency: data.frequency,
                    status: "not_started" as GoalStatus,
                    assignedTo: isMemberOnly ? [myMemberId] : data.assigneeIds,
                    createdBy: user?.id || "unknown",
                    targetNumber: data.goalType === 'metric' ? data.targetNumber : undefined,
                    unit: data.goalType === 'metric' ? data.unit : undefined,
                    isPrivate: data.isPrivate || false,
                } as any);
                toast.success("Goal launched successfully! 🚀");
            }
            reset();
            setOpen(false);
        } catch (error) {
            console.error("Failed to save goal:", error);
            toast.error(`Failed to ${goal ? 'update' : 'launch'} goal. Please try again.`);
        }
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
                    <DialogTitle className="text-xl font-bold">
                        {goal ? 'Refine Your Goal' : 'Set Your First Goal'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        {goal 
                            ? "Adjust the details, assignees, or targets for this goal."
                            : (isMemberOnly ? "Set a personal goal to contribute to the organization's success." : "Welcome! Let's get everyone moving. What is the #1 priority right now?")
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <CreateGoalTemplates applyTemplate={applyTemplate} />

                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-4">
                        <div className="space-y-2 sm:col-span-1 border-b border-border/10 pb-4 sm:border-0 sm:pb-0">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Emoji</Label>
                            <Input {...register("emoji")} className="bg-accent/30 border-border/40 text-center text-xl sm:text-2xl h-12 sm:h-auto" />
                        </div>
                        <div className="space-y-2 sm:col-span-3 text-left">
                            <div className="flex justify-between items-center px-1">
                                <Label className="text-xs font-semibold uppercase tracking-wider">Goal Title</Label>
                                {errors.title && (
                                    <span className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-right-1">
                                        {errors.title.message}
                                    </span>
                                )}
                            </div>
                            <Input {...register("title")} placeholder="e.g. 10 Outreach Calls" className={cn("bg-accent/30 border-border/40 text-sm h-12 sm:h-auto", errors.title && "border-destructive/50 focus-visible:ring-destructive/20")} />
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
                                    <Select value={frequency} onValueChange={(val) => setValue("frequency", val as CreateGoalFormValues["frequency"])}>
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
                                        <Label className="text-xs font-semibold uppercase tracking-wider">
                                            {frequency === 'daily' ? 'Daily activity' : frequency === 'weekly' ? 'Weekly outcome' : 'Monthly target'}
                                        </Label>
                                        <Input 
                                            {...register("targetValue")} 
                                            placeholder={
                                                frequency === "daily" ? "e.g. 10 Outreach Calls" : 
                                                frequency === "weekly" ? "e.g. Weekly Sync Meeting" : 
                                                "e.g. Monthly Revenue Review"
                                            } 
                                            className="bg-background border-border/40 mt-1" 
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-2 italic">
                                            This is what you'll check off every {frequency.replace('_', ' ')}.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 animate-in fade-in duration-200">
                                    <Label className="text-xs font-semibold uppercase tracking-wider">Final Outcome / Milestone</Label>
                                    <Input {...register("targetValue")} placeholder="e.g. Launch MVP / Complete Project" className="bg-accent/30 border-border/40" />
                                </div>
                            )}

                            {hasTracking && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <Label className="text-xs font-semibold uppercase tracking-wider text-primary/80">Start Date</Label>
                                                {errors.startDate && <span className="text-[9px] text-destructive font-bold uppercase">{errors.startDate.message}</span>}
                                            </div>
                                            <Input type="date" {...register("startDate")} className={cn("bg-accent/30 border-border/40 h-11 sm:h-9", errors.startDate && "border-destructive/40")} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <Label className="text-xs font-semibold uppercase tracking-wider text-destructive/80">Deadline</Label>
                                                {errors.deadline && <span className="text-[9px] text-destructive font-bold uppercase">{errors.deadline.message}</span>}
                                            </div>
                                            <Input type="date" {...register("deadline")} className={cn("bg-accent/30 border-border/40 h-11 sm:h-9", errors.deadline && "border-destructive/40")} />
                                        </div>
                                    </div>


                                    <div className="space-y-3">
                                        <CreateGoalAssignees 
                                            members={members}
                                            selectedAssignees={selectedAssignees}
                                            isMemberOnly={isMemberOnly}
                                            myMemberId={myMemberId}
                                            toggleAssignee={toggleAssignee}
                                            toggleEveryone={toggleEveryone}
                                            error={errors.assigneeIds?.message}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-semibold uppercase tracking-wider">Notes <span className="text-muted-foreground/60">(Optional)</span></Label>
                                        </div>
                                        <Textarea {...register("description")} placeholder="Add more context or links here..." className="bg-accent/30 border-border/40 min-h-[60px] sm:min-h-[80px] text-sm" />
                                    </div>

                                    <DialogFooter className="pt-4 mt-4 border-t border-border/10">
                                        <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-sm font-bold">
                                            {isSubmitting ? (goal ? "Saving..." : "Launching...") : (goal ? "Save Changes" : "Launch Goal")}
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
