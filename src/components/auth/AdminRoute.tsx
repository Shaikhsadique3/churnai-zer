
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  const allowedAdminEmails = [
    'shaikhsadique730@gmail.com',
    'shaikhsadique2222@gmail.com', 
    'shaikhumairthisside@gmail.com'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!allowedAdminEmails.includes(user.email || '')) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
