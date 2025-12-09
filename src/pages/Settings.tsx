import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  User, Bell, Palette, Shield, CreditCard, Database, 
  HelpCircle, Info, Camera, Mail, Lock, Crown, Check
} from "lucide-react";

const settingsSections = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "data", label: "Data & Export", icon: Database },
  { id: "help", label: "Help & Support", icon: HelpCircle },
  { id: "about", label: "About", icon: Info },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("account");
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReview: true,
    milestoneAlerts: true,
    streakReminders: true,
    achievements: true,
    email: true,
    push: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">Settings ⚙️</h1>

          <div className="flex gap-8">
            {/* Settings Navigation */}
            <div className="w-64 shrink-0">
              <nav className="glass-card rounded-2xl p-2 space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1 glass-card rounded-2xl p-8">
              {activeSection === "account" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold">
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
                          <span className="text-success text-xs flex items-center gap-1">
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
                    <h3 className="text-danger font-medium mb-4">Danger Zone</h3>
                    <Button variant="outline" className="text-danger border-danger/30 hover:bg-danger/10">
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="font-medium">Daily Task Reminder</h4>
                        <p className="text-sm text-muted-foreground">Get reminded to complete your daily tasks</p>
                      </div>
                      <Switch 
                        checked={notifications.dailyReminder} 
                        onCheckedChange={(checked) => setNotifications({...notifications, dailyReminder: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="font-medium">Weekly Review</h4>
                        <p className="text-sm text-muted-foreground">Receive a summary of your weekly progress</p>
                      </div>
                      <Switch 
                        checked={notifications.weeklyReview} 
                        onCheckedChange={(checked) => setNotifications({...notifications, weeklyReview: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="font-medium">Milestone Alerts</h4>
                        <p className="text-sm text-muted-foreground">Get notified when you reach milestones</p>
                      </div>
                      <Switch 
                        checked={notifications.milestoneAlerts} 
                        onCheckedChange={(checked) => setNotifications({...notifications, milestoneAlerts: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="font-medium">Streak Reminders</h4>
                        <p className="text-sm text-muted-foreground">Don't break your streak!</p>
                      </div>
                      <Switch 
                        checked={notifications.streakReminders} 
                        onCheckedChange={(checked) => setNotifications({...notifications, streakReminders: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h4 className="font-medium">Achievement Notifications</h4>
                        <p className="text-sm text-muted-foreground">Get notified when you unlock badges</p>
                      </div>
                      <Switch 
                        checked={notifications.achievements} 
                        onCheckedChange={(checked) => setNotifications({...notifications, achievements: checked})}
                      />
                    </div>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Crown className="w-10 h-10 text-premium" />
                        <div>
                          <h3 className="font-bold text-lg">Premium Annual</h3>
                          <p className="text-sm text-muted-foreground">₦25,000/year • Renews Jan 7, 2027</p>
                        </div>
                      </div>
                      <Button variant="outline">Manage Subscription</Button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span>Unlimited Goals</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span>All 47 Badges</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span>Advanced Analytics</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span>Leaderboard Access</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span>Data Export</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3">
                      <Check className="w-5 h-5 text-success" />
                      <span>Priority Support</span>
                    </div>
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
                      <div className="flex gap-4">
                        <button className="p-4 rounded-xl bg-slate-900 border-2 border-primary ring-2 ring-primary/30">
                          <div className="w-16 h-12 bg-slate-800 rounded mb-2" />
                          <span className="text-sm">Dark</span>
                        </button>
                        <button className="p-4 rounded-xl bg-white border-2 border-white/20">
                          <div className="w-16 h-12 bg-gray-100 rounded mb-2" />
                          <span className="text-sm text-gray-800">Light</span>
                        </button>
                        <button className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-white border-2 border-white/20">
                          <div className="w-16 h-12 bg-gradient-to-b from-slate-800 to-gray-200 rounded mb-2" />
                          <span className="text-sm">Auto</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeSection === "privacy" || activeSection === "data" || activeSection === "help" || activeSection === "about") && (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>Coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
