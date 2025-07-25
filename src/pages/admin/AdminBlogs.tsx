import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Tag, Save, X } from 'lucide-react';

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

const AdminBlogs = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
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

  useEffect(() => {
    fetchBlogs();
  }, []);

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
            <h1 className="text-2xl font-bold">Manage Blog Posts</h1>
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
              {editingBlog ? 'Edit Blog Post' : 'Create Blog Post'}
            </CardTitle>
            <CardDescription>
              Create and manage blog posts for your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div>
              <Label htmlFor="blog-excerpt">Excerpt</Label>
              <Textarea
                id="blog-excerpt"
                value={blogForm.excerpt}
                onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description of the blog post..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="blog-content">Content</Label>
              <Textarea
                id="blog-content"
                value={blogForm.content}
                onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Blog post content (supports Markdown)..."
                rows={8}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="blog-meta">Meta Description</Label>
                <Input
                  id="blog-meta"
                  value={blogForm.meta_description}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description..."
                />
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {blogForm.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 text-xs">×</button>
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
                <Button type="button" onClick={addTag} size="sm">Add</Button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {predefinedTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!blogForm.tags.includes(tag)) {
                        setBlogForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                      }
                    }}
                    disabled={blogForm.tags.includes(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
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
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{blog.title}</h3>
                        <Badge variant={blog.status === 'published' ? "default" : "secondary"}>
                          {blog.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{blog.excerpt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {blog.reading_time} min read
                        </span>
                        {blog.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
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
                <p className="text-muted-foreground text-center py-8">No blog posts yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBlogs;