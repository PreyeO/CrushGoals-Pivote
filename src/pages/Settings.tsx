import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Bell, Palette, Shield, CreditCard, 
  HelpCircle, Info, Camera, Mail, Lock, Crown, Check,
  Moon, Sun, Monitor, Eye, Download, FileText, 
  MessageCircle, ExternalLink, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "help", label: "Help & Support", icon: HelpCircle },
  { id: "about", label: "About", icon: Info },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("account");
  const [theme, setTheme] = useState<"dark" | "light" | "auto">("dark");
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReview: true,
    milestoneAlerts: true,
    streakReminders: true,
    achievements: true,
    email: true,
    push: false,
  });
  const [privacy, setPrivacy] = useState({
    showOnLeaderboard: true,
    shareProgress: false,
    analytics: true,
  });

  const handleManageSubscription = () => {
    toast({
      title: "Subscription Management",
      description: "Redirecting to payment portal...",
    });
    // In a real app, this would redirect to a payment portal like Stripe/Paystack
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export is being prepared. You'll receive an email shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 lg:mb-8">Settings ⚙️</h1>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Settings Navigation */}
            <div className="w-full lg:w-64 shrink-0">
              <nav className="glass-card rounded-2xl p-2 space-y-1 overflow-x-auto lg:overflow-visible">
                <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap",
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1 glass-card rounded-2xl p-4 sm:p-6 lg:p-8">
              {activeSection === "account" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-primary flex items-center justify-center text-2xl sm:text-3xl font-bold">
                          C
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold">Profile Photo</h3>
                        <p className="text-sm text-muted-foreground">Upload a new avatar</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium mb-2">Display Name</label>
                        <Input defaultValue="Champion" className="bg-white/5 border-white/10" />
                        <p className="text-xs text-muted-foreground mt-1">This name appears on leaderboards</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <div className="flex items-center gap-2">
                          <Input defaultValue="champion@example.com" disabled className="bg-white/5 border-white/10" />
                          <span className="text-success text-xs flex items-center gap-1 whitespace-nowrap">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <Button variant="outline" className="gap-2">
                          <Lock className="w-4 h-4" /> Change Password
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-8">
                    <h3 className="text-destructive font-medium mb-4">Danger Zone</h3>
                    <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {[
                      { key: "dailyReminder", label: "Daily Task Reminder", desc: "Get reminded to complete your daily tasks" },
                      { key: "weeklyReview", label: "Weekly Review", desc: "Receive a summary of your weekly progress" },
                      { key: "milestoneAlerts", label: "Milestone Alerts", desc: "Get notified when you reach milestones" },
                      { key: "streakReminders", label: "Streak Reminders", desc: "Don't break your streak!" },
                      { key: "achievements", label: "Achievement Notifications", desc: "Get notified when you unlock badges" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <h4 className="font-medium">{item.label}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch 
                          checked={notifications[item.key as keyof typeof notifications]} 
                          onCheckedChange={(checked) => setNotifications({...notifications, [item.key]: checked})}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-6 mt-6">
                    <h3 className="font-medium mb-4">Notification Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <span>Email Notifications</span>
                        </div>
                        <Switch 
                          checked={notifications.email} 
                          onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-muted-foreground" />
                          <span>Push Notifications</span>
                        </div>
                        <Switch 
                          checked={notifications.push} 
                          onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "subscription" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">Subscription & Billing</h2>
                  
                  {/* Current Plan */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-premium/20 to-transparent border border-premium/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Crown className="w-10 h-10 text-premium" />
                        <div>
                          <h3 className="font-bold text-lg">Premium Annual</h3>
                          <p className="text-sm text-muted-foreground">$25/year • Renews Jan 7, 2027</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleManageSubscription}>
                        Manage Subscription
                      </Button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["Unlimited Goals", "All 47 Badges", "Advanced Analytics", "Leaderboard Access", "Data Export", "Priority Support"].map((feature) => (
                      <div key={feature} className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                        <Check className="w-5 h-5 text-success" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Method */}
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Card ending in 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Update</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "appearance" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">Appearance</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <h4 className="font-medium mb-4">Theme</h4>
                      <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all",
                            theme === "dark" 
                              ? "bg-slate-900 border-primary ring-2 ring-primary/30" 
                              : "bg-slate-900 border-white/20 hover:border-white/40"
                          )}
                        >
                          <div className="w-16 h-12 bg-slate-800 rounded mb-2 flex items-center justify-center">
                            <Moon className="w-5 h-5 text-slate-400" />
                          </div>
                          <span className="text-sm">Dark</span>
                        </button>
                        <button 
                          onClick={() => setTheme("light")}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all",
                            theme === "light" 
                              ? "bg-white border-primary ring-2 ring-primary/30" 
                              : "bg-white border-gray-200 hover:border-gray-400"
                          )}
                        >
                          <div className="w-16 h-12 bg-gray-100 rounded mb-2 flex items-center justify-center">
                            <Sun className="w-5 h-5 text-yellow-500" />
                          </div>
                          <span className="text-sm text-gray-800">Light</span>
                        </button>
                        <button 
                          onClick={() => setTheme("auto")}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all",
                            theme === "auto" 
                              ? "bg-gradient-to-b from-slate-900 to-white border-primary ring-2 ring-primary/30" 
                              : "bg-gradient-to-b from-slate-900 to-white border-white/20 hover:border-white/40"
                          )}
                        >
                          <div className="w-16 h-12 bg-gradient-to-b from-slate-800 to-gray-200 rounded mb-2 flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-slate-500" />
                          </div>
                          <span className="text-sm">Auto</span>
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        {theme === "dark" && "Always use dark mode"}
                        {theme === "light" && "Always use light mode (coming soon)"}
                        {theme === "auto" && "Follow your system preference"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "privacy" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">Privacy & Security</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="font-medium">Show on Leaderboard</h4>
                        <p className="text-sm text-muted-foreground">Allow others to see your rank</p>
                      </div>
                      <Switch 
                        checked={privacy.showOnLeaderboard} 
                        onCheckedChange={(checked) => setPrivacy({...privacy, showOnLeaderboard: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="font-medium">Share Progress Publicly</h4>
                        <p className="text-sm text-muted-foreground">Allow others to view your goal progress</p>
                      </div>
                      <Switch 
                        checked={privacy.shareProgress} 
                        onCheckedChange={(checked) => setPrivacy({...privacy, shareProgress: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="font-medium">Usage Analytics</h4>
                        <p className="text-sm text-muted-foreground">Help us improve Goal Crusher</p>
                      </div>
                      <Switch 
                        checked={privacy.analytics} 
                        onCheckedChange={(checked) => setPrivacy({...privacy, analytics: checked})}
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="font-medium mb-4">Data Management</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleExportData}>
                        <Download className="w-4 h-4" /> Export My Data
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Download all your goals, tasks, and progress data as JSON
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="font-medium mb-4">Security</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Eye className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "help" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">Help & Support</h2>
                  
                  <div className="grid gap-4">
                    <a href="#" className="p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">User Guide</p>
                          <p className="text-sm text-muted-foreground">Learn how to use Goal Crusher</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>

                    <a href="#" className="p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Contact Support</p>
                          <p className="text-sm text-muted-foreground">Get help from our team</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>

                    <a href="#" className="p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">FAQs</p>
                          <p className="text-sm text-muted-foreground">Find answers to common questions</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </div>

                  <div className="p-6 rounded-xl bg-primary/10 border border-primary/30">
                    <h3 className="font-semibold mb-2">Need immediate help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our support team is available 24/7 to assist you with any issues.
                    </p>
                    <Button variant="hero" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                </div>
              )}

              {activeSection === "about" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">About Goal Crusher</h2>
                  
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Goal Crusher</h3>
                    <p className="text-muted-foreground mb-4">Version 1.0.0</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      The ultimate goal achievement platform. Transform your ambitions into daily actions and crush every goal you set.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <a href="#" className="p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                      <span>Terms of Service</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                    <a href="#" className="p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                      <span>Privacy Policy</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                    <a href="#" className="p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                      <span>Open Source Licenses</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </div>

                  <div className="text-center pt-6 border-t border-white/10">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      Made with <Heart className="w-4 h-4 text-destructive" /> by the Goal Crusher Team
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">© 2026 Goal Crusher. All rights reserved.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
