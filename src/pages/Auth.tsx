
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

import { Shield, AlertCircle, Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { APP_CONFIG } from "@/lib/config";
import { validateEmail } from "@/lib/utils";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const { signIn, signInWithGoogle, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect to dashboard subdomain
      window.location.href = 'https://dashboard.churnaizer.com/';
    }
  }, [user, navigate]);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePassword = async () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    setPassword(shuffled);
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shuffled);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
      toast({
        title: "Password copied!",
        description: "Strong password copied to clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Google sign in failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "❌ Invalid credentials",
        description: "Please check your email and password and try again.",
        variant: "destructive",
      });
    } else {
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      // Redirect to dashboard subdomain
      window.location.href = 'https://dashboard.churnaizer.com/';
    }
    
    setLoading(false);
  };


  const checkIfNewUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      // If no profile exists or this is their first time, they're new
      return !data || error;
    } catch {
      return true; // Assume new user if there's an error
    }
  };

  const handleSuccessfulAuth = async (user: any, isSignUp = false) => {
    const isNewUser = isSignUp || await checkIfNewUser(user.id);
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    }
    
    // Show appropriate welcome message
    if (isNewUser) {
      toast({
        title: `Welcome, ${user.user_metadata?.full_name || user.email}!`,
        description: "Let's get you set up with your account.",
      });
      window.location.href = 'https://dashboard.churnaizer.com/'; // Navigate to dashboard for new users
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      window.location.href = 'https://dashboard.churnaizer.com/';
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const { error } = await signUp(email, password);
    
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: { 
            email,
            name: email.split('@')[0] // Use email prefix as name
          }
        });
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError);
        // Don't fail signup if welcome email fails
      }

      toast({
        title: "🎉 Account created successfully!",
        description: "Welcome to ChurnGuard Lite! Check your email for a welcome message.",
      });
      
      // For new signups, we can assume they are new users
      // The user will be available in the auth context after successful signup
      const signInTab = document.querySelector('[value="signin"]') as HTMLElement;
      signInTab?.click();
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4 transition-all duration-300 hover:scale-105">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-xl sm:text-2xl font-bold text-foreground">ChurnGuard Lite</span>
          </Link>
          <p className="text-muted-foreground text-xs sm:text-sm">Predict and prevent customer churn with AI</p>
        </div>

        <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-semibold">Welcome</CardTitle>
            <CardDescription className="text-sm">
              Sign in to your account or create a new one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-11 font-medium transition-all duration-300 hover:scale-[1.02]"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? "Connecting..." : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="signin" className="transition-all duration-300 text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="transition-all duration-300 text-sm">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      className={`h-11 transition-all duration-300 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1 animate-in slide-in-from-left-1 duration-300">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        className={`h-11 pr-10 transition-all duration-300 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        required
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
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="h-auto p-0 text-xs text-primary hover:text-primary/80 transition-colors duration-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 font-medium transition-all duration-300 hover:scale-[1.02] bg-primary text-primary-foreground hover:bg-primary/90" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="bg-accent/50 p-4 rounded-lg border border-accent mb-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                    <div className="text-sm text-accent-foreground">
                      <p className="font-medium">Quick signup enabled</p>
                      <p className="text-muted-foreground">No email verification required - start using immediately!</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      className={`h-11 transition-all duration-300 ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1 animate-in slide-in-from-left-1 duration-300">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generatePassword}
                        className="h-auto p-1 text-xs text-primary hover:text-primary/80 transition-all duration-300"
                      >
                        {passwordCopied ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
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
                            : password.length >= 6 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                        }`}>
                          {password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) 
                            ? 'Strong' 
                            : password.length >= 6 
                              ? 'Medium' 
                              : 'Weak'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 font-medium transition-all duration-300 hover:scale-[1.02] bg-primary text-primary-foreground hover:bg-primary/90" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            ← Back to home
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Auth;
