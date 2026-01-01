import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRateLimiter } from '@/hooks/useAdminRateLimiter';
import { toast } from 'sonner';
import { Shield, ArrowLeft, AlertTriangle, Mail, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, isAdminLoaded } = useAuth();
  const { checkRateLimit, recordAttempt } = useAdminRateLimiter();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [adminVerifiedLocally, setAdminVerifiedLocally] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  // Redirect to admin dashboard if already logged in as admin OR after local verification
  useEffect(() => {
    if (user && isAdminLoaded && isAdmin) {
      navigate('/admin', { replace: true });
    }
    // Also navigate if we've verified admin locally and AuthContext now confirms
    if (adminVerifiedLocally && user && isAdminLoaded && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, isAdminLoaded, adminVerifiedLocally, navigate]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = emailSchema.safeParse({ email });
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
      // First, check if this email belongs to an admin user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (profileError || !profileData) {
        await recordAttempt(email, false);
        setRemainingAttempts(prev => Math.max(0, prev - 1));
        toast.error('No admin account found with this email');
        setIsLoading(false);
        return;
      }

      // Check if user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profileData.user_id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        await recordAttempt(email, false);
        setRemainingAttempts(prev => Math.max(0, prev - 1));
        toast.error('Access denied. This login is for administrators only.');
        setIsLoading(false);
        return;
      }

      // Generate OTP using the database function
      const { data: otpData, error: otpError } = await supabase.rpc('generate_email_otp', {
        p_email: email.toLowerCase(),
        p_user_id: profileData.user_id,
      });

      if (otpError || !otpData) {
        console.error('OTP generation error:', otpError);
        await recordAttempt(email, false);
        toast.error('Failed to generate login code');
        setIsLoading(false);
        return;
      }

      // Store user_id for verification step
      setTempUserId(profileData.user_id);

      // Send OTP via our custom Resend edge function
      const { error: emailError } = await supabase.functions.invoke('send-email-resend', {
        body: {
          to: email,
          subject: 'Your CrushGoals Admin Login Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #7C3AED; margin-bottom: 20px;">Admin Login Code</h1>
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                You requested to log in to the CrushGoals Admin Portal. Use the code below to complete your login:
              </p>
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7C3AED;">${otpData}</span>
              </div>
              <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
                This code expires in 10 minutes.
              </p>
              <p style="font-size: 14px; color: #666;">
                If you didn't request this code, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999;">
                This is an automated message from CrushGoals Admin Portal.
              </p>
            </div>
          `,
          email_type: 'otp',
        },
      });

      if (emailError) {
        console.error('Email send error:', emailError);
        await recordAttempt(email, false);
        toast.error('Failed to send login code. Please try again.');
        setIsLoading(false);
        return;
      }

      toast.success('Login code sent! Check your email.');
      setStep('otp');
    } catch (error) {
      console.error('Admin login error:', error);
      await recordAttempt(email, false);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      // Call our custom edge function that verifies OTP and creates a session
      const { data, error } = await supabase.functions.invoke('admin-otp-login', {
        body: {
          email: email.toLowerCase(),
          otp: otpCode,
        },
      });

      if (error) {
        console.error('Admin login error:', error);
        await recordAttempt(email, false);
        setRemainingAttempts(prev => Math.max(0, prev - 1));
        toast.error('Failed to verify login. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data?.success) {
        await recordAttempt(email, false);
        setRemainingAttempts(prev => Math.max(0, prev - 1));
        toast.error(data?.error || 'Invalid or expired code. Please try again.');
        setIsLoading(false);
        return;
      }

      // We have the verification URL - use verifyOtp with the token to create session
      if (data.token) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: data.email,
          token: data.token,
          type: 'magiclink',
        });

        if (verifyError) {
          console.error('Session creation error:', verifyError);
          await recordAttempt(email, false);
          toast.error('Failed to create session. Please try again.');
          setIsLoading(false);
          return;
        }

        // Session created successfully!
        await recordAttempt(email, true);
        toast.success('Welcome back, Admin!');
        setAdminVerifiedLocally(true);
      }
      
    } catch (error) {
      console.error('Verify error:', error);
      await recordAttempt(email, false);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // If already an admin or waiting for AuthContext to confirm after local verification
  if ((user && isAdminLoaded && isAdmin) || (adminVerifiedLocally && user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to admin dashboard...</p>
        </div>
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
              {step === 'email' 
                ? 'Enter your admin email to receive a login code'
                : 'Enter the 6-digit code sent to your email'
              }
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
            ) : step === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
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
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Login Code
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP 
                      maxLength={6} 
                      value={otpCode} 
                      onChange={setOtpCode}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Check your email for the 6-digit code
                  </p>
                </div>
                
                {remainingAttempts < 3 && remainingAttempts > 0 && (
                  <p className="text-sm text-amber-500 text-center">
                    Warning: {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout
                  </p>
                )}
                
                <Button 
                  onClick={handleVerifyOTP}
                  className="w-full" 
                  disabled={isLoading || otpCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('email');
                    setOtpCode('');
                  }}
                  disabled={isLoading}
                >
                  Use a different email
                </Button>
              </div>
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
