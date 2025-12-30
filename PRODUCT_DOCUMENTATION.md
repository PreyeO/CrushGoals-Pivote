# Goal Crusher - Product & Technical Documentation

## Table of Contents
1. [Product Overview](#product-overview)
2. [Features](#features)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [Authentication & Security](#authentication--security)
6. [Gamification System](#gamification-system)
7. [API Reference](#api-reference)
8. [Deployment](#deployment)

---

## Product Overview

### What is Goal Crusher?

Goal Crusher is a premium goal achievement and habit tracking platform designed for ambitious users worldwide (ages 18-45+). The product combines Apple-level polish with Duolingo-style gamification to create an addictive daily check-in experience that helps users achieve their long-term goals.

### Vision

Every interaction should feel designed by Apple, gamified by Duolingo, and personalized like a life coach. Goal Crusher replaces gym trainers, business coaches, and productivity courses combined.

### Target Audience

- Ambitious individuals serious about self-improvement
- Users tired of failed resolutions seeking structure and accountability
- Global audience (Nigeria, USA, UK, and beyond)
- Ages 18-45+

### Core Value Proposition

Goal Crusher transforms large, overwhelming goals into manageable daily tasks through intelligent breakdown algorithms. Users log in daily to complete their portion, and consistency leads to goal completion.

---

## Features

### 1. Smart Goal Breakdown (Core Mechanic)

The fundamental mechanism that enables goal achievement:

- **Automatic Task Generation**: When users enter a goal (e.g., "Write a 30-page book") with start and end dates, the system automatically calculates daily missions
- **Rule-Based Breakdown**: Divides targets by timeframe to generate achievable daily tasks
- **Category-Specific Logic**:
  - Fitness goals: Daily tasks
  - Learning goals: Content-based distribution
  - Business/Career: Milestone breakdowns
  - Other: Daily frequency default

### 2. Goal Management

- **Goal Templates**: Pre-built templates across categories (Fitness, Learning, Financial, Wellness, Career, Creative)
- **Custom Goals**: Full flexibility for unique objectives
- **Progress Tracking**: Real-time progress updates based on task completion
- **Status Indicators**: Behind, On-track, Ahead, Completed
- **Yearly Duration Standard**: All goals follow yearly planning horizon (365 days)

### 3. Task System

- **Daily Task Display**: Shows current day's scheduled tasks
- **Task Frequencies**: Daily, Weekly, Bi-weekly, Monthly options
- **Time Remaining Banner**: Real-time countdown to midnight
- **Missed Task Tracking**: Automatic marking after 24 hours with retroactive completion option
- **Priority Levels**: High, Medium, Low
- **Time Estimates**: Optional duration planning

### 4. Gamification System

#### XP & Leveling
- XP earned for task completion
- Level progression (1-25+)
- Real-time XP updates across all UI surfaces

#### Streaks
- Daily streak tracking
- Perfect Day bonus: All tasks completed = 100 bonus XP
- Fire emoji (🔥) indicators
- Streak notifications and warnings

#### Achievement Badges (47+ badges)

**Categories:**
- **Streak-Based**: Fire Starter (1 day), Week Warrior (7 days), Streak Champion (30 days), etc.
- **Task-Based**: First Step (1 task), Task Master (100 tasks), Task Legend (1000 tasks)
- **Time-Based**: Early Bird (before 6 AM), Night Owl (after 10 PM), Weekend Warrior
- **Speed-Based**: Speed Demon (5+ tasks in one day)
- **Multi-Goal**: Multi-Tasker, Serial Achiever
- **Comeback**: Comeback Kid (after absence)
- **Level Progression**: Various level milestones

**Rarity Levels**: Common, Rare, Epic, Legendary

### 5. Leaderboards

- **Global Leaderboard**: All users ranked by XP, streaks, level
- **Friends Leaderboard**: Compete with added friends
- **Privacy Protection**: Shows first letter of name only
- **Admin Exclusion**: Admin accounts excluded from rankings
- **Time Filters**: Weekly and all-time views

### 6. Social Features

- **Friends System**: Add friends by email/username
- **Friend Requests**: Send, accept, reject functionality
- **Friend Invites**: Invite non-users via email with invite links
- **Social Sharing**: Share achievements to WhatsApp, Instagram, Twitter
- **Achievement Cards**: Formatted images with badge, XP, rarity, date

### 7. Shared Goals (Group Challenges)

- **Create Shared Goals**: Turn any goal into a group challenge
- **Invite Friends**: Send invites via email or shareable links
- **Auto-Join on Signup**: Friends who sign up via invite link automatically join the shared goal
- **Goal Copying**: Each member gets their own copy of the goal with same settings
- **In-Goal Leaderboard**: See member rankings by progress, streak, and completion stats
- **Real-Time Activity Feed**: Live updates when members complete tasks
- **Comments & Encouragement**: Send messages and quick encouragement to teammates
- **Live Notifications**: Toast notifications when any member completes a task

### 8. Analytics Dashboard

- **Weekly Task Completion**: Bar charts
- **Monthly/Yearly XP Progression**: Line graphs
- **Streak History**: Calendar heatmap (perfect days vs missed)
- **Task Breakdown**: By frequency type
- **Goal Progress**: Across all active goals
- **Real-Time Updates**: Immediate reflection of actions

### 9. Habit Tracking Calendar

- **GoalHabitCalendar View**: Accessible from goal cards
- **Complete History**: From start_date to end_date
- **Visual Indicators**: Perfect days, missed days, partial completion, streaks

### 10. Notifications

- **Push Notifications**: Daily reminders at user-selected time
- **Streak Warnings**: Alerts before streak loss
- **Do Not Disturb**: Quiet hours support
- **In-App Notifications**: Real-time updates
- **Shared Goal Notifications**: Live updates when teammates complete tasks

### 11. Settings & Customization

- **Sound Effects**: Toggle on/off
- **Haptic Feedback**: Mobile vibration on actions
- **Currency Preference**: Location-aware pricing display
- **Notification Time**: Custom reminder scheduling
- **Theme**: Dark glassmorphism aesthetic
- **Leaderboard Visibility**: Opt-in/out of public leaderboard

---

## Technical Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19.x, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State Management | TanStack Query (React Query) |
| Routing | React Router DOM 6.x |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Real-time | Supabase Realtime |
| Charts | Recharts |
| Animations | Framer Motion concepts, CSS transitions |
| Audio | Web Audio API |

### Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── AchievementCard.tsx
│   ├── AddGoalModal.tsx
│   ├── AddTaskModal.tsx
│   ├── AuthModal.tsx
│   ├── ConfettiCelebration.tsx
│   ├── GoalCard.tsx
│   ├── GoalHabitCalendar.tsx
│   ├── InviteFriendModal.tsx
│   ├── ProgressRing.tsx
│   ├── SharedGoalDetailModal.tsx
│   ├── Sidebar.tsx
│   ├── StreakCounter.tsx
│   ├── TaskCalendar.tsx
│   ├── TaskItem.tsx
│   └── ...
├── contexts/
│   └── AuthContext.tsx  # Global auth state
├── hooks/
│   ├── useAchievements.ts
│   ├── useFriends.ts
│   ├── useGoals.ts
│   ├── useInviteHandler.ts
│   ├── useLeaderboard.ts
│   ├── useMissedTasks.ts
│   ├── useNotifications.ts
│   ├── useProfile.ts
│   ├── useRateLimiter.ts
│   ├── useSharedGoalActivities.ts
│   ├── useSharedGoals.ts
│   ├── useSoundEffects.ts
│   ├── useStreakNotifications.ts
│   ├── useSubscription.ts
│   ├── useTasks.ts
│   └── useUserStats.ts
├── integrations/
│   └── supabase/
│       ├── client.ts    # Auto-generated
│       └── types.ts     # Auto-generated
├── lib/
│   ├── logger.ts        # Secure logging utility
│   ├── utils.ts         # Utility functions
│   └── validations.ts   # Zod schemas
├── pages/
│   ├── Achievements.tsx
│   ├── Admin.tsx
│   ├── AdminLogin.tsx
│   ├── Analytics.tsx
│   ├── Dashboard.tsx
│   ├── Goals.tsx
│   ├── Index.tsx
│   ├── Landing.tsx
│   ├── Leaderboard.tsx
│   ├── ResetPassword.tsx
│   ├── Settings.tsx
│   ├── Tasks.tsx
│   └── VerifyEmail.tsx
└── index.css            # Design system tokens
```

### Design System

**Color Palette (HSL):**
- Primary Background: `#0F172A` (deep midnight blue)
- Elevated Surfaces: `#1E293B` (slate gray)
- Accent Gradients:
  - Electric purple to bright blue
  - Emerald green to teal
  - Amber to orange
  - Rose to red
  - Gold to yellow

**Typography:**
- Font Family: Inter, SF Pro system fonts
- Responsive sizing with Tailwind

**Animations:**
- Micro-interactions: 200ms
- Page transitions: 400ms
- Easing: cubic-bezier curves
- 60fps performance (transform/opacity only)

**Glass Morphism:**
- Background: `rgba(255,255,255,0.05)`
- Backdrop blur: 20px

---

## Database Schema

### Tables

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References auth.users |
| full_name | text | User's display name |
| email | text | User's email |
| preferred_currency | text | Currency preference (default: USD) |
| avatar_url | text | Profile image URL |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### `goals`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| name | text | Goal title |
| category | text | Goal category |
| emoji | text | Display emoji |
| target_value | text | Target to achieve |
| current_value | text | Current progress value |
| progress | integer | Percentage complete |
| status | text | on-track, behind, ahead, completed |
| start_date | date | Goal start date |
| deadline | date | Goal end date |
| task_frequency | text | daily, weekly, bi-weekly, monthly |
| completed_at | timestamptz | Completion timestamp |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### `tasks`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| goal_id | uuid | Associated goal (FK) |
| title | text | Task description |
| priority | text | high, medium, low |
| time_estimate | text | Duration estimate |
| due_date | date | Scheduled date |
| completed | boolean | Completion status |
| completed_at | timestamptz | When completed |
| created_at | timestamptz | Creation timestamp |

#### `user_stats`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| total_xp | integer | Accumulated XP |
| level | integer | Current level |
| current_streak | integer | Active streak days |
| longest_streak | integer | Best streak achieved |
| tasks_completed | integer | Total tasks done |
| perfect_days | integer | Days with all tasks done |
| last_activity_date | date | Most recent activity |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### `achievements`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| badge_id | text | Achievement identifier |
| badge_name | text | Display name |
| badge_emoji | text | Display emoji |
| earned_at | timestamptz | When earned |

#### `subscriptions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner reference |
| plan | text | free, monthly, annual |
| status | text | trial, active, cancelled |
| trial_ends_at | timestamptz | Trial expiration |
| current_period_start | timestamptz | Billing period start |
| current_period_end | timestamptz | Billing period end |
| amount_paid | numeric | Payment amount |
| currency | text | Payment currency |
| payment_provider | text | Payment processor |
| payment_id | text | Transaction ID |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### `friendships`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Request sender |
| friend_id | uuid | Request recipient |
| status | text | pending, accepted, rejected |
| created_at | timestamptz | Request timestamp |
| updated_at | timestamptz | Status update timestamp |

#### `friend_invites`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| inviter_id | uuid | User sending invite |
| invitee_email | text | Email to invite |
| goal_id | uuid | Optional goal to share |
| invite_token | text | Unique invite token |
| status | text | pending, accepted |
| created_at | timestamptz | Invite timestamp |
| accepted_at | timestamptz | When accepted |

#### `shared_goals`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| goal_id | uuid | Original goal reference |
| owner_id | uuid | Creator of shared goal |
| name | text | Challenge name |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### `shared_goal_members`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| shared_goal_id | uuid | Shared goal reference |
| user_id | uuid | Member user ID |
| goal_id | uuid | Member's copy of goal |
| joined_at | timestamptz | Join timestamp |

#### `shared_goal_comments`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| shared_goal_id | uuid | Shared goal reference |
| user_id | uuid | Comment author |
| content | text | Comment text |
| comment_type | text | comment, encouragement, celebration |
| created_at | timestamptz | Comment timestamp |

#### `shared_goal_activities`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| shared_goal_id | uuid | Shared goal reference |
| user_id | uuid | Activity user |
| activity_type | text | task_completed, goal_joined, streak_milestone |
| message | text | Activity description |
| metadata | jsonb | Additional data |
| created_at | timestamptz | Activity timestamp |

#### `shared_goal_invites`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| shared_goal_id | uuid | Shared goal reference |
| inviter_id | uuid | User sending invite |
| invitee_email | text | Invited email |
| invitee_user_id | uuid | If user exists |
| invite_token | uuid | Unique token |
| status | text | pending, accepted, declined |
| expires_at | timestamptz | Invite expiration |
| created_at | timestamptz | Invite timestamp |

#### `user_roles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User reference |
| role | app_role | admin or user |
| created_at | timestamptz | Assignment timestamp |

#### `login_attempts`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | Attempted email |
| success | boolean | Attempt result |
| attempt_time | timestamptz | When attempted |

#### `admin_audit_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| admin_id | uuid | Admin who acted |
| action | text | Action performed |
| target_table | text | Affected table |
| target_id | uuid | Affected record |
| old_values | jsonb | Previous state |
| new_values | jsonb | New state |
| ip_address | text | Request IP |
| user_agent | text | Browser info |
| created_at | timestamptz | Action timestamp |

### Database Functions

#### `handle_new_user()`
Trigger function that runs on new user signup:
- Creates profile record with username and leaderboard visibility preference
- Initializes user_stats
- Assigns default 'user' role
- Creates 3-day trial subscription

#### `get_leaderboard_data(limit_count)`
Secure RPC function for leaderboard:
- Returns user_id, display_name, stats
- Excludes admin users
- Only shows users who opted in (`show_on_leaderboard = true`)
- Orders by total_xp DESC

#### `get_leaderboard_data_filtered(limit_count, time_filter)`
Filtered leaderboard with time-based options:
- Supports 'week' (last 7 days activity) and 'alltime' filters
- Same exclusions and ordering as base function

#### `check_login_rate_limit(check_email)`
Rate limiting for regular users:
- 5 attempts per 15 minutes
- Returns remaining attempts

#### `check_admin_login_rate_limit(check_email)`
Stricter rate limiting for admin:
- 3 attempts per 30 minutes
- Returns remaining attempts

#### `record_login_attempt(email, success)`
Logs authentication attempts:
- Records email and success status
- Auto-cleans entries older than 24 hours

#### `has_role(_user_id, _role)`
Role verification helper:
- Returns boolean for role check
- Used in RLS policies

#### `get_shared_goal_progress(p_shared_goal_id)`
Returns member progress for shared goals:
- user_id, username, tasks_completed_today/week
- current_streak, goal_progress percentage
- Only accessible by members/owners

#### `generate_email_otp(p_user_id, p_email)`
Secure OTP generation for email verification:
- Generates 6-digit cryptographically secure code
- Rate limited: 1 minute between requests, max 5 per 10 minutes
- Auto-deletes previous OTPs for user

#### `verify_email_otp(p_user_id, p_otp)`
OTP verification function:
- Max 5 verification attempts per OTP
- Marks OTP as verified on success
- Returns boolean result

---

## Authentication & Security

### Authentication Flow

1. **Signup**: Email/password with full name, username, and leaderboard visibility preference
2. **Email Verification**: 6-digit OTP-based verification sent via Resend from verified domain (hello.crushgoals.app)
3. **Login**: Email/password with rate limiting
4. **Session Management**: 30-minute inactivity timeout with 5-minute warning
5. **Password Reset**: Secure token-based flow via email
6. **Invite Flow**: Process pending invites on login (friend invites, shared goals)

### Email Service

- **Provider**: Resend API
- **Verified Domain**: hello.crushgoals.app
- **Sender**: CrushGoals <no-reply@hello.crushgoals.app>
- **Edge Functions**:
  - `send-email-resend`: Primary email function for OTP codes, invitations, and transactional emails (verify_jwt: false)
  - `send-email`: Legacy Brevo-based function (deprecated)

### Security Features

#### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Users can only access their own data
- Profile emails restricted to owner and accepted friends only
- Admins have elevated read access
- Public data (leaderboard) accessed via secure RPC functions
- email_verification_otps table protected by default-deny

#### Payment Security
- **Paystack Integration**: Open redirect prevention via URL whitelisting
- **Allowed Callback Paths**: `/settings`, `/dashboard`, `/subscription` only
- **Hardcoded Domain**: Production domain (crushgoals.app) enforced server-side
- **Webhook Verification**: Paystack signature validation for payment events

#### Rate Limiting
- **Regular Login**: 5 attempts / 15 minutes
- **Admin Login**: 3 attempts / 30 minutes
- **OTP Generation**: 1 minute cooldown, max 5 per 10 minutes
- **OTP Verification**: Max 5 attempts per code
- Server-side enforcement via SQL functions

#### Secure Logging
Production logging utility (`src/lib/logger.ts`):
- Development: Full error details
- Production: Generic messages only
- Prevents information leakage

#### Input Validation
Zod schemas for all user inputs:
- Authentication forms
- Goal creation
- Task management
- Friend requests

#### Session Security
- Automatic logout after 30 min inactivity
- Warning notification at 25 minutes
- Secure token handling

### Admin Access

- Separate `/admin-login` page
- Dedicated admin account with 'admin' role
- Stricter rate limiting (3 attempts / 30 minutes)
- Full audit logging with IP address and user agent tracking
- Excluded from user-facing features (leaderboards)

### Edge Functions

| Function | JWT Required | Purpose |
|----------|--------------|---------|
| `paystack-payment` | No | Payment initialization and webhook handling |
| `send-email` | Yes | Legacy email function (deprecated) |
| `send-email-resend` | No | Primary email service via Resend API |

---

## Gamification System

### XP System

| Action | XP Reward |
|--------|-----------|
| Complete Task | 10-50 XP (based on priority) |
| Perfect Day | 100 bonus XP |
| Achievement Unlock | 25-500 XP (based on rarity) |
| Complete Goal | 500 XP |

### Level Progression

```
Level 1: 0 XP
Level 2: 100 XP
Level 3: 300 XP
Level 4: 600 XP
Level 5: 1000 XP
...continues exponentially
```

### Streak Mechanics

- **Daily Check**: Completing at least one task maintains streak
- **Perfect Day**: All scheduled tasks completed
- **Streak Reset**: Missing a day resets to 0
- **Longest Streak**: Tracked separately for achievements

### Achievement Unlock Conditions

| Badge | Condition |
|-------|-----------|
| Fire Starter | 1-day streak (Perfect Day) |
| Week Warrior | 7-day streak |
| Month Master | 30-day streak |
| First Step | Complete 1 task |
| Task Master | Complete 100 tasks |
| Early Bird | Task before 6 AM |
| Night Owl | Task after 10 PM |
| Speed Demon | 5+ tasks in one day |
| Comeback Kid | Return after 7+ day absence |

### Celebration Animations

- **Task Completion**: Checkmark, +XP float, strikethrough
- **Perfect Day**: Full-screen modal, confetti explosion, +100 XP banner
- **Achievement Unlock**: Animated badge with glow effect
- **Level Up**: Flying badge animation
- **Goal Completion**: Trophy, confetti storm (500+ particles), victory sound

---

## API Reference

### Supabase Client Usage

```typescript
import { supabase } from "@/integrations/supabase/client";

// Fetch user goals
const { data, error } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', userId);

// Create new task
const { data, error } = await supabase
  .from('tasks')
  .insert({ title, goal_id, user_id, due_date });

// Update user stats
const { error } = await supabase
  .from('user_stats')
  .update({ total_xp: newXp, level: newLevel })
  .eq('user_id', userId);

// Call RPC function
const { data, error } = await supabase
  .rpc('get_leaderboard_data', { limit_count: 50 });
```

### Key Hooks

```typescript
// Goals management
const { goals, createGoal, updateGoal, deleteGoal } = useGoals();

// Tasks management
const { tasks, createTask, toggleTask, deleteTask } = useTasks();

// User statistics
const { stats, updateStats, addXP } = useUserStats();

// Achievements
const { achievements, checkAndUnlockAchievements } = useAchievements();

// Leaderboard
const { leaderboardData, userRank } = useLeaderboard();

// Friends
const { friends, sendRequest, acceptRequest } = useFriends();
```

---

## Deployment

### Environment Variables

```env
VITE_SUPABASE_URL=<supabase_project_url>
VITE_SUPABASE_PUBLISHABLE_KEY=<supabase_anon_key>
VITE_SUPABASE_PROJECT_ID=<project_id>
```

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

### Deployment via Lovable

1. Click "Publish" button (top right on desktop)
2. Frontend changes require clicking "Update"
3. Backend changes (edge functions, migrations) deploy automatically

### Custom Domain

1. Navigate to Project > Settings > Domains
2. Click "Connect Domain"
3. Follow DNS configuration instructions
4. Requires paid Lovable plan

---

## Subscription Model

### Free Trial
- 3 days, no credit card required
- Full feature access
- Auto-created on signup via `handle_new_user()` trigger

### Free Tier (Post-Trial)
- 1 goal limit
- Basic features only
- No leaderboard access
- Limited analytics

### Premium Tier

**Monthly**: ₦3,000 / $9.99 / £7.99
**Annual**: ₦25,000 / $79.99 / £64.99 (save 31%)

**Includes:**
- Unlimited goals
- Shared goals (group challenges)
- Advanced analytics
- All 47+ achievement badges
- Leaderboard access
- Real-time activity feeds
- Comments & encouragement
- Data export
- Priority support

### Currency Support
- NGN (Nigeria)
- USD (United States)
- GBP (United Kingdom)
- Auto-detected or manual selection

---

## Real-Time Features

### Shared Goal Activities
- **Real-time subscriptions**: Using Supabase Realtime
- **Activity types**: task_completed, goal_joined, streak_milestone
- **Toast notifications**: Live updates when teammates complete tasks
- **Activity feed**: Chronological list of member activities

### Implementation
```typescript
// Subscribe to shared goal activities
const channel = supabase
  .channel(`shared-goal-activities-${sharedGoalId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'shared_goal_activities',
    filter: `shared_goal_id=eq.${sharedGoalId}`,
  }, (payload) => {
    // Show toast notification for teammate activity
  })
  .subscribe();
```

---

## Support & Resources

- **Documentation**: https://docs.lovable.dev
- **Community**: Discord channel
- **Email**: Support contact via app settings

---

## Known Security Considerations

### Addressed Issues
- ✅ Open redirect in Paystack payment callback (whitelisted paths + hardcoded domain)
- ✅ Rate limiting on login and OTP generation
- ✅ Secure RPC functions for leaderboard data
- ✅ Admin exclusion from public leaderboards

### Monitoring Required
- Profile email exposure policies (restrict to owner + accepted friends)
- email_verification_otps table access policies
- Regular security scans via Lovable Cloud

---

*Last Updated: December 2024*
*Version: 1.3.0*
