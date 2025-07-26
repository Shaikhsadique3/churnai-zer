import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{password?: string; confirmPassword?: string}>({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse tokens from URL hash fragment (Supabase sends them as #access_token=...)
    const parseHashParams = () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        type: params.get('type')
      };
    };

    const { access_token, refresh_token, type } = parseHashParams();
    
    console.log('Reset password tokens:', { access_token: access_token ? 'present' : 'missing', refresh_token: refresh_token ? 'present' : 'missing', type });
    
    if (!access_token || !refresh_token || type !== 'recovery') {
      console.error('Invalid reset link parameters');
      toast({
        title: "Invalid reset link",
        description: "This password reset link is invalid or has expired. Please request a new one.",
        variant: "destructive",
      });
      // Give user time to see the error before redirecting
      setTimeout(() => {
        navigate('/forgot-password');
      }, 3000);
    } else {
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token,
        refresh_token
      }).then(({ error }) => {
        if (error) {
          console.error('Error setting session:', error);
          toast({
            title: "Session error",
            description: "Unable to verify reset link. Please try again.",
            variant: "destructive",
          });
          navigate('/forgot-password');
        } else {
          console.log('Reset password session set successfully');
        }
      });
    }
  }, [navigate]);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors: {password?: string; confirmPassword?: string} = {};
    
    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        toast({
          title: "Reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Clear any existing auth state to ensure clean login
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-') || key === 'rememberMe') {
            localStorage.removeItem(key);
          }
        });
        
        toast({
          title: "🎉 Password updated successfully!",
          description: "You're now signed in with your new password. Redirecting to dashboard...",
        });
        
        // Wait a moment for the toast to show, then redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4 transition-all duration-300 hover:scale-105">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">churnaizer.com</span>
          </Link>
          <p className="text-muted-foreground text-sm">Reset your password</p>
        </div>

        <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold">Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below. Make sure it's at least 8 characters long.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={`h-11 pr-10 transition-all duration-300 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1 animate-in slide-in-from-left-1 duration-300">
                    {errors.password}
                  </p>
                )}
                {password && !errors.password && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Password strength: <span className={`font-medium ${
                      password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) 
                        ? 'text-green-600' 
                        : password.length >= 8 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                    }`}>
                      {password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) 
                        ? 'Strong' 
                        : password.length >= 8 
                          ? 'Good' 
                          : 'Weak'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }}
                    className={`h-11 pr-10 transition-all duration-300 ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1 animate-in slide-in-from-left-1 duration-300">
                    {errors.confirmPassword}
                  </p>
                )}
                {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              <div className="bg-accent/50 p-3 rounded-lg border border-accent">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-xs text-accent-foreground">
                    <p className="font-medium">Password Requirements:</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>• At least 8 characters long</li>
                      <li>• Mix of uppercase and lowercase letters</li>
                      <li>• At least one number and special character</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 font-medium transition-all duration-300 hover:scale-[1.02] bg-primary text-primary-foreground hover:bg-primary/90" 
                disabled={loading}
              >
                {loading ? "Updating password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            to="/auth" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;