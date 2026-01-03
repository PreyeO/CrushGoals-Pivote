import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Shield, ArrowLeft, AlertTriangle, Loader2, Mail, KeyRound } from 'lucide-react';
import { z } from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginStep = 'email' | 'otp';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, isAdminLoaded } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<LoginStep>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to admin dashboard if already logged in as admin
  useEffect(() => {
    if (user && isAdminLoaded && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, isAdminLoaded, navigate]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('admin-otp-login', {
        body: {
          email: email.toLowerCase(),
          action: 'request_otp',
        },
      });

      if (functionError) {
        console.error('Admin login error:', functionError);
        setError('Failed to send verification code. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data?.success) {
        setError(data?.error || 'Access denied. This login is for administrators only.');
        setIsLoading(false);
        return;
      }

      toast.success('Verification code sent to your email');
      setStep('otp');
    } catch (error) {
      console.error('Admin login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('admin-otp-login', {
        body: {
          email: email.toLowerCase(),
          action: 'verify_otp',
          otp,
        },
      });

      if (functionError) {
        console.error('OTP verification error:', functionError);
        setError('Failed to verify code. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data?.success) {
        setError(data?.error || 'Invalid or expired verification code');
        setIsLoading(false);
        return;
      }

      // Use the token to create a session
      if (data.token) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: data.email,
          token: data.token,
          type: 'magiclink',
        });

        if (verifyError) {
          console.error('Session creation error:', verifyError);
          setError('Failed to create session. Please try again.');
          setIsLoading(false);
          return;
        }

        toast.success('Welcome back, Admin!');
        navigate('/admin', { replace: true });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
    setError(null);
  };

  // If already an admin
  if (user && isAdminLoaded && isAdmin) {
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
          onClick={() => step === 'otp' ? handleBack() : navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 'otp' ? 'Back to email' : 'Back to Home'}
        </Button>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              {step === 'email' 
                ? 'Enter your admin email to receive a verification code'
                : `Enter the 6-digit code sent to ${email}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      required
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        setError(null);
                      }}
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
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Code expires in 10 minutes
                  </p>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive justify-center">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Verify & Login
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                >
                  Resend code
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