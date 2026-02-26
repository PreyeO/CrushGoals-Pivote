// This file previously contained mock data used during development.
// It has been emptied as the application now uses Supabase for all data persistence.
export const currentUser = {
    id: "",
    name: "Guest",
    email: "",
    avatarUrl: null,
};
export const organizations = [];
export const members = [];
export const goals = [];
export const activities = [];
export const invites = [];
export const getOrganizations = () => [];
export const getOrganization = () => undefined;
export const getOrgMembers = () => [];
export const getOrgGoals = () => [];
export const getGoal = () => undefined;
export const getOrgActivities = () => [];
export const getOrgInvites = () => [];
export const getOrgLeaderboard = () => [];
export const getTeamHealthScore = () => ({ overall: 0, goalProgress: 0, memberEngagement: 0, onTimeCompletion: 0, trend: "stable" });
export const getMemberById = () => undefined;
export const getGoalAssignees = () => [];
