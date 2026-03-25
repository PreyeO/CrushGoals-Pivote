import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Copy, Check, Link as LinkIcon } from "lucide-react";

interface InviteMemberSuccessProps {
    inviteLink: string;
    copied: boolean;
    copyToClipboard: () => void;
    handleOpenChange: (open: boolean) => void;
}

export function InviteMemberSuccess({
    inviteLink,
    copied,
    copyToClipboard,
    handleOpenChange
}: InviteMemberSuccessProps) {
    return (
        <div className="py-6 space-y-4 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Invitation Link</Label>
                <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-accent/30 border border-border/40 rounded-xl px-3 py-2.5 text-[11px] font-mono text-muted-foreground flex items-center gap-2 overflow-hidden">
                        <LinkIcon className="w-3.5 h-3.5 shrink-0 text-primary/60" />
                        <span className="break-all line-clamp-2 select-all cursor-text">{inviteLink}</span>
                    </div>
                    <Button size="icon" onClick={copyToClipboard} className="gradient-primary text-white border-0 rounded-xl h-10 w-10 glow-primary-sm shrink-0">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
            <p className="text-[11px] text-muted-foreground italic text-center px-4">
                The recipient can use this link to join the team directly.
            </p>
            <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full border-border/60 hover:bg-accent/60">
                    Done
                </Button>
            </DialogFooter>
        </div>
    );
}
