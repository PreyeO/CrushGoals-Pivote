import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  User, Bell, Palette, Shield, CreditCard, 
  HelpCircle, Info, Camera, Lock, Crown, Check,
  Moon, Sun, Monitor, Download, Loader2, LogOut, Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useNotifications } from "@/hooks/useNotifications";

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
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { subscription, isLoading: subscriptionLoading, isPremium, getTrialDaysLeft } = useSubscription();
  const { getPricing } = useCurrency();
  const { playSound, setEnabled: setSoundEnabled } = useSoundEffects();
  const { theme, setTheme } = useTheme();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings, requestPermission, permissionStatus } = useNotifications();
  const pricing = getPricing();
  
  const [activeSection, setActiveSection] = useState("account");
  const [soundEffects, setSoundEffects] = useState(() => {
    const saved = localStorage.getItem('soundEffects');
    return saved !== 'false';
  });
  const [displayName, setDisplayName] = useState("");
  const [privacy, setPrivacy] = useState({
    showOnLeaderboard: true,
    shareProgress: false,
    analytics: true,
  });

  useEffect(() => {
    setSoundEnabled(soundEffects);
    localStorage.setItem('soundEffects', String(soundEffects));
  }, [soundEffects, setSoundEnabled]);

  const isLoading = profileLoading || subscriptionLoading;

  const handleUpdateProfile = async () => {
    if (displayName.trim()) {
      await updateProfile({ full_name: displayName });
    }
  };

  const handleManageSubscription = () => {
    toast.info("Subscription management coming soon!");
  };

  const handleExportData = () => {
    toast.success("Export started! You'll receive an email shortly.");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-64 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const trialDaysLeft = getTrialDaysLeft();

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
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-sm sm:text-base",
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <section.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1 glass-card rounded-2xl p-4 sm:p-6 lg:p-8">
              {activeSection === "account" && (
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Profile Information</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div className="relative">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-primary flex items-center justify-center text-xl sm:text-3xl font-bold">
                          {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                          <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base">Profile Photo</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Upload a new avatar</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2">Display Name</label>
                        <Input 
                          defaultValue={profile?.full_name || ''} 
                          onChange={(e) => setDisplayName(e.target.value)}
                          onBlur={handleUpdateProfile}
                          className="bg-white/5 border-white/10 text-sm sm:text-base" 
                        />
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">This name appears on leaderboards</p>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2">Email</label>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={user?.email || profile?.email || ''} 
                            disabled 
                            className="bg-white/5 border-white/10 text-sm sm:text-base" 
                          />
                          <span className="text-success text-[10px] sm:text-xs flex items-center gap-1 whitespace-nowrap">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2">Password</label>
                        <Button variant="outline" className="gap-2 text-sm">
                          <Lock className="w-4 h-4" /> Change Password
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6 sm:pt-8">
                    <Button variant="outline" onClick={handleSignOut} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  </div>

                  <div className="border-t border-white/10 pt-6 sm:pt-8">
                    <h3 className="text-destructive font-medium mb-4 text-sm sm:text-base">Danger Zone</h3>
                    <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 text-sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Notification Preferences</h2>
                  
                  {/* Push Notification Permission */}
                  {permissionStatus !== 'granted' && (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                      <p className="text-sm mb-3">Enable push notifications to get reminders about your goals and streaks.</p>
                      <Button onClick={requestPermission} size="sm">
                        Enable Notifications
                      </Button>
                    </div>
                  )}

                  {/* Daily Reminder Time Picker */}
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="font-medium mb-3 text-sm sm:text-base">Daily Reminder Time</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">Choose when to receive your daily task reminder</p>
                    <select 
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-background border border-border text-sm"
                      value={notificationSettings.reminderTime || "09:00"}
                      onChange={(e) => updateNotificationSettings({ reminderTime: e.target.value })}
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        const label = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`;
                        return <option key={hour} value={`${hour}:00`}>{label}</option>;
                      })}
                    </select>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { key: "dailyReminder", label: "Daily Task Reminder", desc: "Get reminded to complete your daily tasks" },
                      { key: "weeklyReview", label: "Weekly Review", desc: "Receive a summary of your weekly progress" },
                      { key: "milestoneAlerts", label: "Milestone Alerts", desc: "Get notified when you reach milestones" },
                      { key: "streakReminders", label: "Streak Reminders", desc: "Don't break your streak!" },
                      { key: "achievements", label: "Achievement Notifications", desc: "Get notified when you unlock badges" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl gap-4">
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">{item.label}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.desc}</p>
                        </div>
                        <Switch 
                          checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean} 
                          onCheckedChange={(checked) => updateNotificationSettings({ [item.key]: checked })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "subscription" && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Subscription & Billing</h2>
                  
                  {/* Current Plan */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-premium/20 to-transparent border border-premium/30">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-premium" />
                        <div>
                          <h3 className="font-bold text-base sm:text-lg">
                            {subscription?.plan === 'free' ? 'Free Plan' : 
                             subscription?.status === 'trial' ? 'Free Trial' : 
                             'Premium Plan'}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {subscription?.status === 'trial' && trialDaysLeft > 0
                              ? `${trialDaysLeft} days left in trial`
                              : subscription?.current_period_end
                              ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                              : 'Upgrade to unlock all features'
                            }
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleManageSubscription} className="text-sm w-full sm:w-auto">
                        {isPremium() ? 'Manage' : 'Upgrade'}
                      </Button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {["Unlimited Goals", "All 16 Badges", "Advanced Analytics", "Leaderboard Access", "Data Export", "Priority Support"].map((feature) => (
                      <div key={feature} className="p-3 sm:p-4 bg-white/5 rounded-xl flex items-center gap-3">
                        <Check className={cn("w-4 h-4 sm:w-5 sm:h-5", isPremium() ? "text-success" : "text-muted-foreground")} />
                        <span className={cn("text-sm sm:text-base", !isPremium() && "text-muted-foreground")}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  {!isPremium() && (
                    <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/5">
                        <h4 className="font-semibold mb-2">Monthly</h4>
                        <p className="text-2xl sm:text-3xl font-bold mb-4">{pricing.monthly.formatted}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                        <Button variant="outline" className="w-full">Choose Monthly</Button>
                      </div>
                      <div className="p-4 sm:p-6 rounded-2xl border-2 border-premium/50 bg-premium/10 relative">
                        <span className="absolute -top-3 left-4 px-2 py-1 bg-premium text-xs font-bold rounded-full">BEST VALUE</span>
                        <h4 className="font-semibold mb-2">Annual</h4>
                        <p className="text-2xl sm:text-3xl font-bold mb-1">{pricing.annual.formatted}<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
                        <p className="text-xs text-success mb-4">Save 31%</p>
                        <Button variant="hero" className="w-full">Choose Annual</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "appearance" && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Appearance</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <h4 className="font-medium mb-4 text-sm sm:text-base">Theme</h4>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        {[
                          { id: "dark", icon: Moon, label: "Dark" },
                          { id: "light", icon: Sun, label: "Light" },
                          { id: "system", icon: Monitor, label: "Auto" },
                        ].map((t) => (
                          <button 
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                              "p-3 sm:p-4 rounded-xl border-2 transition-all flex-1 min-w-[80px]",
                              theme === t.id 
                                ? "border-primary ring-2 ring-primary/30 bg-primary/10" 
                                : "border-border/50 hover:border-border bg-card/50"
                            )}
                          >
                            <t.icon className="w-5 h-5 mx-auto mb-2" />
                            <span className="text-xs sm:text-sm">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sound Effects Toggle */}
                    <div className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium text-sm sm:text-base">Sound Effects</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Play sounds for celebrations and task completions</p>
                          </div>
                        </div>
                        <Switch 
                          checked={soundEffects} 
                          onCheckedChange={(checked) => {
                            setSoundEffects(checked);
                            if (checked) {
                              playSound('taskComplete');
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "privacy" && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Privacy & Security</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { key: "showOnLeaderboard", label: "Show on Leaderboard", desc: "Allow others to see your rank" },
                      { key: "shareProgress", label: "Share Progress Publicly", desc: "Allow others to view your goal progress" },
                      { key: "analytics", label: "Usage Analytics", desc: "Help us improve Goal Crusher" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl gap-4">
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">{item.label}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch 
                          checked={privacy[item.key as keyof typeof privacy]} 
                          onCheckedChange={(checked) => setPrivacy({...privacy, [item.key]: checked})}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="font-medium mb-4 text-sm sm:text-base">Data Management</h3>
                    <Button variant="outline" className="gap-2 text-sm" onClick={handleExportData}>
                      <Download className="w-4 h-4" /> Export My Data
                    </Button>
                  </div>
                </div>
              )}

              {activeSection === "help" && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Help & Support</h2>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { title: "Getting Started Guide", desc: "Learn how to use Goal Crusher" },
                      { title: "FAQ", desc: "Frequently asked questions" },
                      { title: "Contact Support", desc: "Get help from our team" },
                    ].map((item) => (
                      <button key={item.title} className="w-full text-left p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                        <h4 className="font-medium text-sm sm:text-base">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "about" && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">About Goal Crusher</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Version</p>
                      <p className="font-medium text-sm sm:text-base">1.0.0</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm sm:text-base">Goal Crusher helps you achieve your goals with gamification, streaks, and accountability.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Terms of Service</Button>
                      <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Privacy Policy</Button>
                    </div>
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
