import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, BookOpen, MessageSquare, Globe } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import AdminAnnouncements from './AdminAnnouncements';
import AdminBlogs from './AdminBlogs';
import AdminInbox from './AdminInbox';
import AdminIntegrations from './AdminIntegrations';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalAnnouncements: 0,
    unreadEmails: 0,
    totalIntegrations: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) {
          console.error('Error fetching user count:', usersError);
        }

        const { data: blogs, error: blogsError } = await supabase
          .from('blogs')
          .select('*', { count: 'exact', head: true });

        if (blogsError) {
          console.error('Error fetching blog count:', blogsError);
        }

        const { data: announcements, error: announcementsError } = await supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true });

        if (announcementsError) {
          console.error('Error fetching announcement count:', announcementsError);
        }

        // Mock unread emails
        const unreadEmails = Math.floor(Math.random() * 20);

        // Add integration stats
        const { count: integrationCount } = await supabase
          .from('integrations')
          .select('*', { count: 'exact', head: true });

        setStats(prev => ({
          ...prev,
          totalUsers: users?.length || 0,
          totalBlogs: blogs?.length || 0,
          totalAnnouncements: announcements?.length || 0,
          unreadEmails: unreadEmails,
          totalIntegrations: integrationCount || 0
        }));
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your application and monitor activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBlogs}</div>
            <p className="text-xs text-muted-foreground">
              Published articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              Active announcements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Inbox</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadEmails}</div>
            <p className="text-xs text-muted-foreground">
              New messages
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SDK Integrations</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              Total integration checks
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="announcements" className="space-y-4">
          <AdminAnnouncements />
        </TabsContent>
        
        <TabsContent value="blogs" className="space-y-4">
          <AdminBlogs />
        </TabsContent>
        
        <TabsContent value="inbox" className="space-y-4">
          <AdminInbox />
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <AdminIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
