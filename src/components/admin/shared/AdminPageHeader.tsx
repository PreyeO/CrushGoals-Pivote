import { LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({ title, description, icon: Icon, iconColor = "text-primary", iconBg = "bg-primary/10", children }: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center glow-primary-sm`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
            </div>
            {children && <div className="flex items-center gap-3">{children}</div>}
        </div>
    );
}
