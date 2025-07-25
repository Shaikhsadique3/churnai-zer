import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff, Plus, Edit, Trash2, Calendar, Save, X } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const AdminAnnouncements = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    is_active: true,
    expires_at: ''
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive"
      });
    }
  };

  const saveAnnouncement = async () => {
    try {
      const announcementData = {
        ...announcementForm,
        user_id: user?.id,
        expires_at: announcementForm.expires_at || null
      };

      let result;
      if (editingAnnouncement) {
        result = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement);
      } else {
        result = await supabase
          .from('announcements')
          .insert([announcementData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Announcement ${editingAnnouncement ? 'updated' : 'created'} successfully`
      });

      setAnnouncementForm({ title: '', content: '', is_active: true, expires_at: '' });
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive"
      });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      });
      
      fetchAnnouncements();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      });
    }
  };

  const editAnnouncement = (announcement: Announcement) => {
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      is_active: announcement.is_active,
      expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : ''
    });
    setEditingAnnouncement(announcement.id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/admin/dashboard'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Manage Announcements</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </CardTitle>
            <CardDescription>
              Manage site-wide announcements that appear on the landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title..."
              />
            </div>
            <div>
              <Label htmlFor="announcement-content">Content</Label>
              <Textarea
                id="announcement-content"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Announcement content (supports emojis, links, and bold text)..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="announcement-active"
                  checked={announcementForm.is_active}
                  onCheckedChange={(checked) => setAnnouncementForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="announcement-active">Active</Label>
              </div>
              <div>
                <Label htmlFor="announcement-expires">Expires At (Optional)</Label>
                <Input
                  id="announcement-expires"
                  type="date"
                  value={announcementForm.expires_at}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveAnnouncement} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingAnnouncement ? 'Update' : 'Create'} Announcement
              </Button>
              {editingAnnouncement && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementForm({ title: '', content: '', is_active: true, expires_at: '' });
                  }}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{announcement.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={announcement.is_active ? "default" : "secondary"}>
                          {announcement.is_active ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                          {announcement.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {announcement.expires_at && (
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            Expires: {new Date(announcement.expires_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editAnnouncement(announcement)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No announcements yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnnouncements;