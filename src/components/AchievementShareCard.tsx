import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Download, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementShareCardProps {
  badgeName: string;
  badgeEmoji: string;
  badgeRarity: string;
  earnedAt: Date;
  userName: string;
  userLevel: number;
  totalXP: number;
  className?: string;
}

export const AchievementShareCard = ({
  badgeName,
  badgeEmoji,
  badgeRarity,
  earnedAt,
  userName,
  userLevel,
  totalXP,
  className,
}: AchievementShareCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareImage = useCallback(async () => {
    if (!canvasRef.current) return null;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set canvas size for high quality
    canvas.width = 800;
    canvas.height = 600;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1e293b");
    gradient.addColorStop(1, "#0f172a");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle pattern
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let i = 0; i < canvas.width; i += 50) {
      for (let j = 0; j < canvas.height; j += 50) {
        ctx.fillRect(i, j, 1, 1);
      }
    }

    // Draw border
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Draw title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏆 Achievement Unlocked!", canvas.width / 2, 80);

    // Draw badge emoji
    ctx.font = "120px serif";
    ctx.fillText(badgeEmoji, canvas.width / 2, 220);

    // Draw badge name
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 32px Inter, sans-serif";
    ctx.fillText(badgeName, canvas.width / 2, 280);

    // Draw rarity
    const rarityColors: Record<string, string> = {
      common: "#6b7280",
      rare: "#3b82f6",
      epic: "#8b5cf6",
      legendary: "#f59e0b",
    };

    ctx.fillStyle = rarityColors[badgeRarity.toLowerCase()] || "#6b7280";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.fillText(badgeRarity.toUpperCase(), canvas.width / 2, 320);

    // Draw user info
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.fillText(`Earned by ${userName}`, canvas.width / 2, 380);

    // Draw stats
    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px Inter, sans-serif";
    ctx.fillText(
      `Level ${userLevel} • ${totalXP.toLocaleString()} XP`,
      canvas.width / 2,
      410
    );

    // Draw date
    ctx.fillStyle = "#64748b";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText(
      earnedAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      canvas.width / 2,
      440
    );

    // Draw app branding
    ctx.fillStyle = "#3b82f6";
    ctx.font = "bold 18px Inter, sans-serif";
    ctx.fillText("CrushGoals", canvas.width / 2, 520);

    ctx.fillStyle = "#64748b";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText("Turn Goals into Daily Wins", canvas.width / 2, 545);

    setIsGenerating(false);
    return canvas.toDataURL("image/png");
  }, [
    badgeName,
    badgeEmoji,
    badgeRarity,
    earnedAt,
    userName,
    userLevel,
    totalXP,
  ]);

  const handleShare = async () => {
    const imageData = await generateShareImage();
    if (!imageData) return;

    try {
      // Try native share API first
      if (navigator.share && navigator.canShare) {
        const blob = await fetch(imageData).then((r) => r.blob());
        const file = new File([blob], "achievement.png", { type: "image/png" });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Achievement Unlocked: ${badgeName}`,
            text: `I just unlocked the ${badgeName} achievement in CrushGoals!`,
            files: [file],
          });
          return;
        }
      }

      // Fallback to clipboard
      await navigator.clipboard.writeText(imageData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Share failed:", error);
      // Fallback to download
      handleDownload();
    }
  };

  const handleDownload = async () => {
    const imageData = await generateShareImage();
    if (!imageData) return;

    const link = document.createElement("a");
    link.download = `achievement-${badgeName
      .toLowerCase()
      .replace(/\s+/g, "-")}.png`;
    link.href = imageData;
    link.click();
  };

  const handleCopy = async () => {
    const imageData = await generateShareImage();
    if (!imageData) return;

    try {
      await navigator.clipboard.writeText(imageData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview Card */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <div className="text-center space-y-4">
          <div className="text-6xl">{badgeEmoji}</div>
          <div>
            <h3 className="text-xl font-bold text-yellow-400">{badgeName}</h3>
            <p className="text-sm text-slate-400 uppercase tracking-wide">
              {badgeRarity}
            </p>
          </div>
          <div className="text-sm text-slate-300">
            Earned by {userName} • Level {userLevel}
          </div>
          <div className="text-xs text-slate-500">
            {earnedAt.toLocaleDateString()}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleShare}
          className="flex-1"
          disabled={isGenerating}
        >
          <Share2 className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating..." : "Share"}
        </Button>
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={isGenerating}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" onClick={handleCopy} disabled={isGenerating}>
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  );
};
