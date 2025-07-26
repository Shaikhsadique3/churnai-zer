import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { APP_CONFIG } from '@/lib/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, FileText, Eye, EyeOff, Plus, Edit, Trash2, Calendar, Tag, Save, X, Mail } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string | null;
  meta_description: string;
  tags: string[];
  status: 'draft' | 'published';
  reading_time: number;
  published_at: string | null;
  created_at: string;
}

const AdminPanel = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('announcements');
  
  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    is_active: true,
    expires_at: ''
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);
  
  // Blogs state
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image_url: '',
    meta_description: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published'
  });
  const [editingBlog, setEditingBlog] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const predefinedTags = ['Churn', 'Retention', 'AI', 'SaaS', 'Analytics', 'Customer Success', 'SDK'];

  // Check if user is admin - only allow specific email addresses
  const allowedAdminEmails = [
    'shaikhsadique730@gmail.com',
    'shaikhsadique2222@gmail.com', 
    'shaikhumairthisside@gmail.com'
  ];
  const isAdmin = user?.email && allowedAdminEmails.includes(user.email);

  useEffect(() => {
    if (isAdmin) {
      fetchAnnouncements();
      fetchBlogs();
    }
  }, [isAdmin]);

  // This component should only be rendered when wrapped in AdminRoute
  // AdminRoute handles all authentication and authorization logic

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

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBlogs((data || []) as Blog[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive"
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
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

  const saveBlog = async () => {
    try {
      const slug = generateSlug(blogForm.title);
      const readingTime = calculateReadingTime(blogForm.content);
      
      const blogData = {
        ...blogForm,
        slug,
        reading_time: readingTime,
        user_id: user?.id,
        published_at: blogForm.status === 'published' ? new Date().toISOString() : null
      };

      let result;
      if (editingBlog) {
        result = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', editingBlog);
      } else {
        result = await supabase
          .from('blogs')
          .insert([blogData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Blog ${editingBlog ? 'updated' : 'created'} successfully`
      });

      setBlogForm({
        title: '',
        content: '',
        excerpt: '',
        cover_image_url: '',
        meta_description: '',
        tags: [],
        status: 'draft'
      });
      setEditingBlog(null);
      fetchBlogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save blog",
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

  const deleteBlog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog deleted successfully"
      });
      
      fetchBlogs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
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

  const editBlog = (blog: Blog) => {
    setBlogForm({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      cover_image_url: blog.cover_image_url || '',
      meta_description: blog.meta_description,
      tags: blog.tags,
      status: blog.status
    });
    setEditingBlog(blog.id);
  };

  const addTag = () => {
    if (newTag && !blogForm.tags.includes(newTag)) {
      setBlogForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setBlogForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Churnaizer Admin Panel</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/integration'}
              className="mr-2"
            >
              View Main Dashboard
            </Button>
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Blog Manager
            </TabsTrigger>
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Inbox
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
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
                          <p className="text-gray-600 text-sm mt-1">{announcement.content}</p>
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
                    <p className="text-gray-500 text-center py-8">No announcements yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blogs Tab */}
          <TabsContent value="blogs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingBlog ? 'Edit Blog Post' : 'Create Blog Post'}
                </CardTitle>
                <CardDescription>
                  Create and manage blog posts for churnaizer.com/blog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="blog-title">Title</Label>
                  <Input
                    id="blog-title"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Blog post title..."
                  />
                </div>
                <div>
                  <Label htmlFor="blog-excerpt">Excerpt</Label>
                  <Textarea
                    id="blog-excerpt"
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Short description of the blog post..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="blog-cover">Cover Image URL</Label>
                  <Input
                    id="blog-cover"
                    value={blogForm.cover_image_url}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, cover_image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="blog-meta">SEO Meta Description</Label>
                  <Textarea
                    id="blog-meta"
                    value={blogForm.meta_description}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO-friendly description for search engines..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {blogForm.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} variant="outline" size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {predefinedTags.map((tag) => (
                      <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!blogForm.tags.includes(tag)) {
                            setBlogForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                          }
                        }}
                        className="text-xs"
                      >
                        + {tag}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="blog-content">Content (Markdown/HTML)</Label>
                  <Textarea
                    id="blog-content"
                    value={blogForm.content}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Blog post content in Markdown or HTML..."
                    rows={12}
                  />
                </div>
                <div>
                  <Label htmlFor="blog-status">Status</Label>
                  <Select value={blogForm.status} onValueChange={(value: 'draft' | 'published') => setBlogForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveBlog} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingBlog ? 'Update' : 'Create'} Blog Post
                  </Button>
                  {editingBlog && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingBlog(null);
                        setBlogForm({
                          title: '',
                          content: '',
                          excerpt: '',
                          cover_image_url: '',
                          meta_description: '',
                          tags: [],
                          status: 'draft'
                        });
                      }}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Blogs List */}
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{blog.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{blog.excerpt}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={blog.status === 'published' ? "default" : "secondary"}>
                              {blog.status === 'published' ? 'Published' : 'Draft'}
                            </Badge>
                            <Badge variant="outline">
                              {blog.reading_time} min read
                            </Badge>
                            {blog.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Slug: /blog/{blog.slug}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editBlog(blog)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteBlog(blog.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {blogs.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No blog posts yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Inbox Management
                </CardTitle>
                <CardDescription>
                  Access the full email inbox interface to manage incoming emails to nexa@churnaizer.com
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Admin Email Inbox</h3>
                  <p className="text-muted-foreground mb-4">
                    Manage all incoming emails sent to nexa@churnaizer.com with advanced filtering and organization tools.
                  </p>
                  <Button onClick={() => window.location.href = '/admin/inbox'}>
                    Open Full Inbox Interface
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;