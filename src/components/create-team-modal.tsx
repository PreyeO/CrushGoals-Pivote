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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Users, Plus, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(2, "Team name must be at least 2 characters"),
    description: z.string().max(200, "Description must be less than 200 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTeamModalProps {
    orgId: string;
    children?: React.ReactNode;
}

export function CreateTeamModal({ orgId, children }: CreateTeamModalProps) {
    const [open, setOpen] = useState(false);
    const addTeam = useStore((state) => state.addTeam);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            await addTeam(orgId, data.name, data.description || "");
            toast.success(`Team "${data.name}" created!`);
            reset();
            setOpen(false);
        } catch (error: any) {
            console.error("Failed to create team:", error);
            toast.error(error.message || "Failed to create team");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] glass-card border-border/40 backdrop-blur-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl font-bold">New Team</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Create a department or squad (e.g. "Marketing", "Core App").
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider">Team Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Marketing"
                            className="bg-accent/30 border-border/40 focus:border-primary/50 transition-colors"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-[10px] text-destructive font-medium">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="What does this team focus on?"
                            className="bg-accent/30 border-border/40 focus:border-primary/50 transition-colors min-h-[80px]"
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-[10px] text-destructive font-medium">{errors.description.message}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full gradient-primary text-white border-0 glow-primary-sm"
                        >
                            {isSubmitting ? "Creating..." : "Create Team"}
                            <Plus className="w-4 h-4 ml-2" />
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
