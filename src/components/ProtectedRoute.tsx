import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { EmailVerificationBanner } from './EmailVerificationBanner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireVerifiedEmail?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireVerifiedEmail = true 
}: ProtectedRouteProps) {
  const { user, isAdmin, isLoading, isAdminLoaded, isEmailVerified, profile } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Wait for admin status to be loaded before making admin-related decisions
  if (requireAdmin && !isAdminLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin users skip email verification requirement - they go straight to admin dashboard
  if (isAdmin && requireAdmin) {
    return <>{children}</>;
  }

  // Show email verification banner if email is not verified (for regular users)
  if (requireVerifiedEmail && !isEmailVerified) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto p-4 pt-8">
          <EmailVerificationBanner
            email={profile?.email || user?.email || ''}
            userId={user.id}
            name={profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User'}
          />
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
