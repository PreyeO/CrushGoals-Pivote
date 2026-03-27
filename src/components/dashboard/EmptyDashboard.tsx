"use client";

import { CreateOrgModal } from "@/components/create-org-modal";

export function EmptyDashboard() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full glass-card p-10 space-y-6 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2 text-3xl">
          👋
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Welcome to CrushGoals
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-balance">
            {`You don't belong to any organizations yet. Create your first`}
            workspace to start tracking goals and collaborating with your team.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-3">
          <CreateOrgModal>
            <button className="w-full h-12 gradient-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              Create Organization
            </button>
          </CreateOrgModal>
        </div>
      </div>
    </div>
  );
}
