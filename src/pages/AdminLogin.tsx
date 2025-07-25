import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { APP_CONFIG } from '@/lib/config';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signOut, user } = useAuth();

  // If already authenticated and is admin, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      const allowedAdminEmails = [
        'shaikhsadique730@gmail.com',
        'shaikhsadique2222@gmail.com', 
        'shaikhumairthisside@gmail.com'
      ];
      
      if (allowedAdminEmails.includes(user.email || '')) {
        window.location.href = '/admin/dashboard';
      } else {
        // Redirect non-admin users to not-authorized page
        window.location.href = '/not-authorized';
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: error.message
        });
        return;
      }

      // Check if user is admin - only allow specific email addresses
      const allowedAdminEmails = [
        'shaikhsadique730@gmail.com',
        'shaikhsadique2222@gmail.com', 
        'shaikhumairthisside@gmail.com'
      ];
      
      if (!allowedAdminEmails.includes(email)) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Your email address is not authorized for admin access."
        });
        // Sign out and redirect to not-authorized
        await signOut();
        window.location.href = '/not-authorized';
        return;
      }

      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel."
      });

      // Redirect to admin dashboard
      window.location.href = '/admin/dashboard';
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Sign in to access the Churnaizer admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@churnaizer.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In to Admin Panel'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => window.location.href = '/'}
              className="text-sm"
            >
              Back to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;