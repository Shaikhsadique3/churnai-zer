
import React, { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>
      </div>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};
