import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRateLimiter } from '@/hooks/useAdminRateLimiter';
import { toast } from 'sonner';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, isAdminLoaded } = useAuth();
  const { checkRateLimit, recordAttempt } = useAdminRateLimiter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  // Redirect to admin dashboard if already logged in as admin
  useEffect(() => {
    if (user && isAdminLoaded) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, isAdmin, isAdminLoaded, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    // Check rate limit first (stricter: 3 attempts, 30 min lockout)
    const { allowed, remainingAttempts: remaining } = await checkRateLimit(email);
    setRemainingAttempts(remaining);
    
    if (!allowed) {
      setIsLocked(true);
      toast.error('Too many failed attempts. Admin login locked for 30 minutes.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await recordAttempt(email, false);
        setRemainingAttempts(prev => Math.max(0, prev - 1));
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (!roleData) {
          // Not an admin - sign them out and show error
          await recordAttempt(email, false);
          await supabase.auth.signOut();
          toast.error('Access denied. This login is for administrators only.');
          setIsLoading(false);
          return;
        }

        // Record successful admin login
        await recordAttempt(email, true);
        toast.success('Welcome back, Admin!');
        
        // Navigate immediately - AuthContext will catch up
        navigate('/admin', { replace: true });
      }
    } catch (error) {
      await recordAttempt(email, false);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // If already an admin, show loading while redirecting
  if (user && isAdminLoaded && isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              Secure login for administrators only
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLocked ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-destructive mb-2">Account Locked</h3>
                <p className="text-muted-foreground">
                  Too many failed login attempts. Please try again in 30 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                {remainingAttempts < 3 && remainingAttempts > 0 && (
                  <p className="text-sm text-amber-500">
                    Warning: {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout
                  </p>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In as Admin'}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Not an administrator?{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate('/')}
              >
                Go to user login
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
