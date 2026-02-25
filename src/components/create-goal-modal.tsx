"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Target, Sparkles, Plus, Trash2, Milestone as MilestoneIcon, BarChart3 } from "lucide-react";
import { GoalFramework, GoalPriority } from "@/types";

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    emoji: z.string().min(1),
    category: z.string().min(2),
    framework: z.enum(["okr", "smart", "simple"]),
    priority: z.enum(["low", "medium", "high"]),
    deadline: z.string().min(1, "Deadline is required"),
    targetValue: z.string().optional(),
    keyResults: z.array(z.object({
        title: z.string().min(2),
        targetValue: z.number().min(1),
        unit: z.string().min(1),
    })).optional(),
    milestones: z.array(z.object({
        title: z.string().min(2),
        dueDate: z.string().min(1),
    })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateGoalModalProps {
    orgId: string;
    children?: React.ReactNode;
}

export function CreateGoalModal({ orgId, children }: CreateGoalModalProps) {
    const [open, setOpen] = useState(false);
    const addGoal = useStore((state) => state.addGoal);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            emoji: "🎯",
            category: "Product",
            framework: "okr" as GoalFramework,
            priority: "medium" as GoalPriority,
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            keyResults: [{ title: "", targetValue: 100, unit: "%" }],
            milestones: [{ title: "", dueDate: "" }],
        },
    });

    const framework = watch("framework");

    const { fields: krFields, append: appendKR, remove: removeKR } = useFieldArray({
        control,
        name: "keyResults",
    });

    const { fields: msFields, append: appendMS, remove: removeMS } = useFieldArray({
        control,
        name: "milestones",
    });

    const onSubmit = async (data: FormValues) => {
        try {
            // Transform data back to match store expectation
            const goalData = {
                ...data,
                orgId,
                framework: data.framework as GoalFramework,
                priority: data.priority as GoalPriority,
                currentValue: "0",
                assignedTo: [], // Will be handled by a separate assignment UI or default to creator
                createdBy: "user-1",
                keyResults: data.framework === 'okr' ? data.keyResults?.map(kr => ({ ...kr, currentValue: 0, id: `kr-${Date.now()}-${Math.random()}` })) : [],
                milestones: data.framework !== 'simple' ? data.milestones?.map(ms => ({ ...ms, completed: false, id: `ms-${Date.now()}-${Math.random()}` })) : [],
            };

            addGoal(goalData as any);
            reset();
            setOpen(false);
        } catch (error) {
            console.error("Failed to create goal:", error);
        }
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
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary-sm">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Set New Objective</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Define a goal, choose a framework, and start tracking progress.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                        <Input {...register("title")} placeholder="What do you want to achieve?" className="bg-accent/30 border-border/40" />
                        {errors.title && <p className="text-[10px] text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Framework</Label>
                            <Select defaultValue="okr" onValueChange={(v) => setValue("framework", v as any)}>
                                <SelectTrigger className="bg-accent/30 border-border/40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-border/40">
                                    <SelectItem value="okr">OKR (Objectives & Key Results)</SelectItem>
                                    <SelectItem value="smart">SMART (Milestones)</SelectItem>
                                    <SelectItem value="simple">Simple (Progress %)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider">Deadline</Label>
                            <Input type="date" {...register("deadline")} className="bg-accent/30 border-border/40" />
                        </div>
                    </div>

                    {framework === "okr" && (
                        <div className="space-y-4 p-4 rounded-xl bg-accent/20 border border-border/20">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs font-bold flex items-center gap-2">
                                    <BarChart3 className="w-3.5 h-3.5 text-primary" /> Key Results
                                </Label>
                                <Button type="button" variant="ghost" size="sm" onClick={() => appendKR({ title: "", targetValue: 100, unit: "%" })} className="h-7 text-[10px] gap-1">
                                    <Plus className="w-3 h-3" /> Add KR
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {krFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <Input {...register(`keyResults.${index}.title`)} placeholder="Measureable result" className="bg-background/40 flex-1 h-9 text-sm" />
                                        <Input {...register(`keyResults.${index}.targetValue`, { valueAsNumber: true })} type="number" className="bg-background/40 w-16 h-9 text-sm" />
                                        <Input {...register(`keyResults.${index}.unit`)} placeholder="%" className="bg-background/40 w-12 h-9 text-sm" />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeKR(index)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {framework === "smart" && (
                        <div className="space-y-4 p-4 rounded-xl bg-accent/20 border border-border/20">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs font-bold flex items-center gap-2">
                                    <MilestoneIcon className="w-3.5 h-3.5 text-primary" /> Milestones
                                </Label>
                                <Button type="button" variant="ghost" size="sm" onClick={() => appendMS({ title: "", dueDate: "" })} className="h-7 text-[10px] gap-1">
                                    <Plus className="w-3 h-3" /> Add Milestone
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {msFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <Input {...register(`milestones.${index}.title`)} placeholder="Checkpoint" className="bg-background/40 flex-1 h-9 text-sm" />
                                        <Input {...register(`milestones.${index}.dueDate`)} type="date" className="bg-background/40 w-32 h-9 text-sm" />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeMS(index)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider">Description</Label>
                        <Textarea {...register("description")} placeholder="Why is this important?" className="bg-accent/30 border-border/40 min-h-[80px]" />
                        {errors.description && <p className="text-[10px] text-destructive">{errors.description.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full gradient-primary text-white border-0 glow-primary">
                            {isSubmitting ? "Creating..." : "Set Objective"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
