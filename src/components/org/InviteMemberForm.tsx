import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { OrgRole } from "@/types";

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["admin", "member"]),
});

export type InviteFormValues = z.infer<typeof formSchema>;

interface InviteMemberFormProps {
    onSubmit: (data: InviteFormValues) => Promise<void>;
}

export function InviteMemberForm({ onSubmit }: InviteMemberFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<InviteFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            role: "member",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 animate-in fade-in duration-300">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    className="bg-accent/30 border-border/40 focus:border-primary/50 transition-colors"
                    {...register("email")}
                />
                {errors.email && (
                    <p className="text-[10px] text-destructive font-medium">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider">Role</Label>
                <Select defaultValue="member" onValueChange={(v) => setValue("role", v as "admin" | "member")}>
                    <SelectTrigger className="bg-accent/30 border-border/40">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/40">
                        <SelectItem value="member">Member (Can track goals)</SelectItem>
                        <SelectItem value="admin">Admin (Can manage organization)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <DialogFooter className="pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gradient-primary text-white border-0 glow-primary-sm"
                >
                    {isSubmitting ? "Generating..." : "Generate Invitation"}
                    <Sparkles className="w-4 h-4 ml-2" />
                </Button>
            </DialogFooter>
        </form>
    );
}
