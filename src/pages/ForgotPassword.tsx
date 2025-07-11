import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail } from "@/lib/utils";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{email?: string}>({});
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    const { error } = await resetPassword(email);
    
    if (error) {
      // Handle specific error cases
      if (error.message?.includes('UNDEFINED_VALUE') || error.message?.includes('Error sending recovery email')) {
        toast({
          title: "Email service temporarily unavailable",
          description: "Please try again in a few minutes or contact support if the issue persists.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast({
          title: "Email not verified",
          description: "Please verify your email address first, then try resetting your password.",
          variant: "destructive",
        });
      } else if (error.message?.includes('User not found')) {
        toast({
          title: "Account not found",
          description: "No account found with this email address. Please check your email or sign up.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset failed",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setEmailSent(true);
      toast({
        title: "🔗 Reset link sent!",
        description: "Check your email inbox for the password reset link. It may take a few minutes to arrive.",
      });
    }
    
    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4 transition-all duration-300 hover:scale-105">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">ChurnGuard Lite</span>
            </Link>
          </div>

          <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-semibold">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/50 p-4 rounded-lg border border-accent">
                <p className="text-sm text-accent-foreground">
                  <strong>Next steps:</strong>
                </p>
                <ol className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li>1. Check your email inbox (and spam folder)</li>
                  <li>2. Click the password reset link in the email</li>
                  <li>3. Create your new password</li>
                  <li>4. Sign in with your new password</li>
                </ol>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link 
              to="/auth" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4 transition-all duration-300 hover:scale-105">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ChurnGuard Lite</span>
          </Link>
          <p className="text-muted-foreground text-sm">Reset your password</p>
        </div>

        <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
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
              
              <Button 
                type="submit" 
                className="w-full h-11 font-medium transition-all duration-300 hover:scale-[1.02] bg-primary text-primary-foreground hover:bg-primary/90" 
                disabled={loading}
              >
                {loading ? "Sending Reset Link..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            to="/auth" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;