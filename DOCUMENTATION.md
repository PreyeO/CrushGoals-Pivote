# 🎯 CrushGoals: V1 Documentation & Project Status

CrushGoals V1 is focused on **radical simplicity** and **team accountability**. It removes academic goal frameworks in favor of direct, human-centric tracking that keeps teams aligned without the overhead.

---

## 🚀 Core V1 Features

### 🏢 Simple Team Management
- **Single-Tier Roles**: Just **Owner** and **Member**. No complex permission matrices.
- **Whole Team Sync**: Instantly assign organization-wide goals with one click.
- **Privacy by Design**: Secure organization spaces where team strategy stays within the team.

### 🎯 Straightforward Goal Tracking
- **Framework-Free**: No OKRs or SMART goals. Just "What do we need to achieve?"
- **Simple Templates**: Quick-start with "Launch a product," "Plan an event," or "Hit a sales target."
- **Human-Centric Updates**: Every progress update is accompanied by a short note (e.g., "Hit 80 sign-ups, waiting on landing page fix"), replacing sterile activity feeds with real context.

### 🏆 Accountability First
- **Leaderboard Default**: The main team view is the Standings table, highlighting completion percentages and streaks to foster healthy competition and visibility.
- **Visual Urgency**: Overdue goals are impossible to ignore, pulsing red with prominent alert badges.
- **Check-in Prompts**: Automatic weekly nudges — "How's your goal going?" — to combat tool abandonment and maintain momentum.

---

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

### Design Philosophy
- **High-Impact Status**: Visual cues (Red for overdue, Green for completion) are prioritized over decorative elements.
- **Glassmorphism**: A premium, "business-ready" aesthetic that feels modern and professional.

---

## 🛠️ Project Status

- [x] **Remove OKR/SMART**: Core types and UI streamlined for V1.
- [x] **Leaderboard Integration**: Moved to the default organizational view.
- [x] **Visual Urgency**: Overdue logic and styling implemented in `GoalCard`.
- [x] **Human Notes**: Progress updates now include contextual comments.
- [x] **Retention Prompts**: Weekly "How's it going?" nudge added to the dashboard.

---

*Last Updated: February 26, 2026*
