import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  User, Bell, Shield, CreditCard, 
  HelpCircle, Info, Camera, Lock, Crown, Check,
  Download, Loader2, LogOut, AtSign, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { usePaystack } from "@/hooks/usePaystack";
import { useNotifications } from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useMainLayout } from "@/hooks/useMainLayout";
import { supabase } from "@/integrations/supabase/client";

const settingsSections = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "help", label: "Help & Support", icon: HelpCircle },
  { id: "about", label: "About", icon: Info },
];

export default function Settings() {
  const { mainPaddingClass } = useMainLayout();
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { subscription, isLoading: subscriptionLoading, isPremium, getTrialDaysLeft } = useSubscription();
  const { getPricing } = useCurrency();
  const { initializePayment, isLoading: paystackLoading } = usePaystack();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings, requestPermission, permissionStatus } = useNotifications();
  const { isSupported: pushSupported, permission: pushPermission, requestPermission: requestPushPermission, settings: pushSettings, updateSettings: updatePushSettings } = usePushNotifications();
  const pricing = getPricing();
  
  const [activeSection, setActiveSection] = useState("account");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
  const [privacy, setPrivacy] = useState({
    shareProgress: false,
    analytics: true,
  });

  // Initialize form values from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || "");
      setUsername(profile.username || "");
      setShowOnLeaderboard(profile.show_on_leaderboard || false);
    }
  }, [profile]);


  const isLoading = profileLoading || subscriptionLoading;

  const checkUsernameAvailability = async (value: string) => {
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }
    
    // If same as current username, no need to check
    if (value.toLowerCase() === profile?.username?.toLowerCase()) {
      setUsernameError("");
      return;
    }
    
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', value.toLowerCase())
        .maybeSingle();

      if (data) {
        setUsernameError("Username is already taken");
      } else {
        setUsernameError("");
      }
    } catch (error) {
      // Ignore errors during availability check
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (displayName.trim()) {
      await updateProfile({ full_name: displayName });
    }
  };

  const handleUpdateUsername = async () => {
    if (username.trim() && !usernameError && username !== profile?.username) {
      await updateProfile({ username: username.toLowerCase().trim() });
    }
  };

  const handleToggleLeaderboard = async (checked: boolean) => {
    setShowOnLeaderboard(checked);
    await updateProfile({ show_on_leaderboard: checked });
  };

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    if (pricing.isNigeria) {
      await initializePayment(plan);
    } else {
      // For international payments, will integrate Stripe later
      toast.info("International payments coming soon!");
    }
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
        <main className={cn("min-h-screen flex items-center justify-center transition-all duration-300", mainPaddingClass)}>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const trialDaysLeft = getTrialDaysLeft();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className={cn("min-h-screen transition-all duration-300", mainPaddingClass)}>
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
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          onBlur={handleUpdateProfile}
                          className="bg-white/5 border-white/10 text-sm sm:text-base" 
                        />
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Your full name (private)</p>
                      </div>
                      
                      {/* Username Field */}
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2">Username</label>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            value={username}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                              setUsername(value);
                              if (value.length >= 3) {
                                checkUsernameAvailability(value);
                              }
                            }}
                            onBlur={handleUpdateUsername}
                            placeholder="FitWarrior23"
                            className="bg-white/5 border-white/10 text-sm sm:text-base pl-10" 
                          />
                          {checkingUsername && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        {usernameError ? (
                          <p className="text-[10px] sm:text-xs text-destructive mt-1">{usernameError}</p>
                        ) : (
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">This is your public name on leaderboards</p>
                        )}
                      </div>

                      {/* Leaderboard Toggle */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-premium/20 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-5 h-5 text-premium" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-sm font-medium cursor-pointer">
                                Show on Global Leaderboard
                              </label>
                              <Switch
                                checked={showOnLeaderboard}
                                onCheckedChange={handleToggleLeaderboard}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {showOnLeaderboard 
                                ? "Your username is visible to other users on leaderboards"
                                : "You're hidden from leaderboards - only you can see your progress"
                              }
                            </p>
                          </div>
                        </div>
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
                  
                  {/* Push Notification Setup */}
                  {pushSupported && (
                    <div className={cn(
                      "p-4 rounded-xl border",
                      pushPermission === 'granted' 
                        ? "bg-success/10 border-success/30" 
                        : "bg-primary/10 border-primary/30"
                    )}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-sm sm:text-base">
                            {pushPermission === 'granted' ? 'Push Notifications Enabled' : 'Enable Push Notifications'}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {pushPermission === 'granted' 
                              ? "You'll receive reminders even when the app is closed" 
                              : "Get reminders about your goals and streaks"}
                          </p>
                        </div>
                        {pushPermission !== 'granted' && (
                          <Button onClick={requestPushPermission} size="sm">
                            Enable
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {!pushSupported && (
                    <div className="p-4 rounded-xl bg-muted border border-border">
                      <p className="text-sm text-muted-foreground">
                        Push notifications are not supported in this browser. Try using Chrome, Firefox, or Safari on a mobile device.
                      </p>
                    </div>
                  )}

                  {/* Daily Reminder Time Picker */}
                  <div className={cn(
                    "p-4 rounded-xl border",
                    pushPermission === 'granted' && notificationSettings.dailyReminder
                      ? "bg-primary/10 border-primary/30"
                      : "bg-white/5 border-white/10"
                  )}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm sm:text-base">Daily Reminder Time</h4>
                        <p className="text-xs text-muted-foreground">
                          {pushPermission === 'granted' 
                            ? "You'll receive a push notification at this time" 
                            : "Enable push notifications above to receive reminders"}
                        </p>
                      </div>
                    </div>
                    <select 
                      className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-background border border-border text-sm font-medium"
                      value={notificationSettings.reminderTime || "06:00"}
                      onChange={(e) => updateNotificationSettings({ reminderTime: e.target.value })}
                      disabled={pushPermission !== 'granted'}
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        const label = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`;
                        return <option key={hour} value={`${hour}:00`}>{label}</option>;
                      })}
                    </select>
                    {pushPermission === 'granted' && notificationSettings.dailyReminder && (
                      <p className="text-xs text-success mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Reminder scheduled for {notificationSettings.reminderTime || "6:00 AM"}
                      </p>
                    )}
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
                      {isPremium() && (
                        <Button variant="outline" className="text-sm w-full sm:w-auto" onClick={() => toast.info("Subscription management coming soon!")}>
                          Manage
                        </Button>
                      )}
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
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleUpgrade('monthly')}
                          disabled={paystackLoading}
                        >
                          {paystackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Choose Monthly'}
                        </Button>
                      </div>
                      <div className="p-4 sm:p-6 rounded-2xl border-2 border-premium/50 bg-premium/10 relative">
                        <span className="absolute -top-3 left-4 px-2 py-1 bg-premium text-xs font-bold rounded-full">1 MONTH FREE</span>
                        <h4 className="font-semibold mb-2">Annual</h4>
                        <p className="text-2xl sm:text-3xl font-bold mb-1">{pricing.annual.formatted}<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
                        <p className="text-xs text-success mb-4">Save {pricing.annual.savings}</p>
                        <Button 
                          variant="hero" 
                          className="w-full"
                          onClick={() => handleUpgrade('annual')}
                          disabled={paystackLoading}
                        >
                          {paystackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Choose Annual'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}


              {activeSection === "privacy" && (
                <div className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Privacy & Security</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { key: "shareProgress", label: "Share Progress Publicly", desc: "Allow others to view your goal progress" },
                      { key: "analytics", label: "Usage Analytics", desc: "Help us improve CrushGoals" },
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
                    {/* Restart Tour Button */}
                    <button 
                      onClick={() => {
                        localStorage.removeItem('tourCompleted');
                        toast.success("Tour reset! Navigate to Dashboard to restart the tour.");
                      }}
                      className="w-full text-left p-4 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                          <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm sm:text-base">Restart Product Tour</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">Take the guided tour again</p>
                        </div>
                      </div>
                    </button>

                    {[
                      { title: "Getting Started Guide", desc: "Learn how to use CrushGoals" },
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
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">About CrushGoals</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Version</p>
                      <p className="font-medium text-sm sm:text-base">1.0.0</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm sm:text-base">CrushGoals helps you achieve your goals with gamification, streaks, and accountability.</p>
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
