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
import { Sparkles, Building2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    emoji: z.string().emoji("Must be a valid emoji").or(z.string().min(1)),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateOrgModalProps {
    children?: React.ReactNode;
}

export function CreateOrgModal({ children }: CreateOrgModalProps) {
    const [open, setOpen] = useState(false);
    const addOrganization = useStore((state) => state.addOrganization);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            emoji: "🚀",
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            addOrganization(data);
            reset();
            setOpen(false);
        } catch (error) {
            console.error("Failed to create organization:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="gradient-primary text-white border-0">
                        Create Organization
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-border/40 backdrop-blur-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary-sm">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold">New Organization</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Set up a new space for your team to track goals and OKRs.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider">Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Acme Studio"
                            className="bg-accent/30 border-border/40 focus:border-primary/50 transition-colors"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="text-[10px] text-destructive font-medium">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="emoji" className="text-xs font-semibold uppercase tracking-wider">Emoji</Label>
                        <Input
                            id="emoji"
                            placeholder="🚀"
                            className="bg-accent/30 border-border/40 text-center text-xl focus:border-primary/50 transition-colors"
                            {...register("emoji")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What does your team do?"
                            className="bg-accent/30 border-border/40 min-h-[80px] focus:border-primary/50 transition-colors"
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
                            className="w-full gradient-primary text-white border-0 glow-primary-sm hover:opacity-90"
                        >
                            {isSubmitting ? "Creating..." : "Create Organization"}
                            <Sparkles className="w-4 h-4 ml-2" />
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
