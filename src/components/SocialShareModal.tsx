import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Link2, Check, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SocialShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareData: {
    type: 'achievement' | 'streak' | 'goal' | 'milestone';
    title: string;
    description: string;
    emoji?: string;
    stat?: string;
  };
}

export function SocialShareModal({ open, onOpenChange, shareData }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    switch (shareData.type) {
      case 'achievement':
        return `${shareData.emoji || '🏆'} I just unlocked "${shareData.title}" on Goal Crusher! ${shareData.description}`;
      case 'streak':
        return `🔥 ${shareData.stat} day streak on Goal Crusher! ${shareData.description}`;
      case 'goal':
        return `🎯 ${shareData.title}! ${shareData.description}`;
      case 'milestone':
        return `🏅 Milestone reached: ${shareData.title}! ${shareData.description}`;
      default:
        return `${shareData.title} - ${shareData.description}`;
    }
  };

  const shareText = getShareText();
  const shareUrl = window.location.origin;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
        onOpenChange(false);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const socialLinks = [
    {
      name: 'Twitter/X',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2]',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      color: 'bg-[#4267B2]/20 hover:bg-[#4267B2]/30 text-[#4267B2]',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366]',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Achievement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{shareData.emoji || '🏆'}</span>
              <div>
                <h3 className="font-bold">{shareData.title}</h3>
                {shareData.stat && (
                  <p className="text-sm text-primary font-medium">{shareData.stat}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{shareData.description}</p>
          </div>

          {/* Native Share Button (Mobile) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button onClick={handleNativeShare} className="w-full gap-2" variant="hero">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}

          {/* Social Links */}
          <div className="grid grid-cols-3 gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${link.color}`}
              >
                <link.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{link.name}</span>
              </a>
            ))}
          </div>

          {/* Copy Link */}
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-success" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
