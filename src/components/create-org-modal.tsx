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
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Sparkles, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  emoji: z.string().emoji("Must be a valid emoji").or(z.string().min(1)),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateOrgModalProps {
  children?: React.ReactNode;
  disabled?: boolean;
}

export function CreateOrgModal({ children, disabled }: CreateOrgModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const addOrganization = useStore((state) => state.addOrganization);
  const members = useStore((state) => state.members);
  const user = useStore((state) => state.user);

  // Enforce creation limits: only count orgs where the user is an owner
  const ownedOrgs = members.filter(m => m.userId === user?.id && m.role === 'owner');
  const isFreeTier = user?.subscriptionTier === 'free' || !user?.subscriptionTier;
  const isLimitReached = isFreeTier && ownedOrgs.length >= 1;

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
      emoji: "🚀",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const newOrgId = await addOrganization(data);
      reset();
      setOpen(false);
      toast.success("Organization created successfully!");
      if (newOrgId && typeof newOrgId === "string") {
        router.push(`/org/${newOrgId}`);
      }
    } catch (error: any) {
      console.error("Failed to create organization:", error);
      toast.error(error.message || "Failed to create organization");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gradient-primary text-white border-0 h-10 px-6 font-bold tracking-tight">
            Create Organization
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card border-border/40 backdrop-blur-2xl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-primary-sm">
            <Users className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Create Organization
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-[13px] leading-relaxed">
            Set up a new space for your organization to track goals and OKRs.
          </DialogDescription>
        </DialogHeader>

        {!isLimitReached ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
            <div className="space-y-1.5 px-1">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 ml-1">Organization Name</Label>
              <div className="relative group">
                <Input
                  id="name"
                  placeholder="e.g. Marketing, Engineering, or Acme Corp"
                  className="h-12 bg-accent/30 border-border/40 focus:border-primary/50 rounded-xl px-4 transition-all"
                  {...register("name")}
                />
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
              </div>
              {errors.name && (
                <p className="text-[10px] text-destructive font-bold ml-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5 px-1">
              <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 ml-1">What is this organization about?</Label>
              <Textarea
                id="description"
                placeholder="What does your organization do?"
                className="bg-accent/30 border-border/40 focus:border-primary/50 min-h-[100px] rounded-xl px-4 py-3 transition-all resize-none"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-[10px] text-destructive font-bold ml-1">{errors.description.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 gradient-primary text-white font-bold tracking-tight rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Organization"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <div className="space-y-2 px-4">
              <h3 className="font-bold text-lg">Creation Limit Reached</h3>
              <p className="text-sm text-muted-foreground text-balance">
                You currently own {ownedOrgs.length} organization on the Free plan. 
                Upgrade to PRO to create multiple organizations while keeping your invited memberships free.
              </p>
            </div>
            <Link href="/billing" onClick={() => setOpen(false)} className="block pt-2">
              <Button className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-tight rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                Upgrade to PRO
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
