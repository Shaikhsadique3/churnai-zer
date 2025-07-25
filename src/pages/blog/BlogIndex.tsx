import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { DynamicHead } from '@/components/common/DynamicHead';
import { Logo } from '@/components/ui/logo';
import { Calendar, Clock, Tag, Search, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  tags: string[];
  reading_time: number;
  published_at: string;
  created_at: string;
}

const BlogIndex = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, slug, excerpt, cover_image_url, tags, reading_time, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      setBlogs((data || []) as BlogPost[]);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || blog.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <DynamicHead 
        title="Churnaizer Blog – SaaS Churn Prevention Insights"
        description="Expert insights on churn prediction, customer retention, and AI-powered analytics for SaaS teams. Learn how to reduce churn and improve customer lifetime value."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <Logo className="w-8 h-8" />
                <span className="text-xl font-bold">Churnaizer</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                <Link to="/integration" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              </nav>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Churn Prevention Insights
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Expert strategies, AI insights, and proven tactics to reduce churn and grow your SaaS business.
            </p>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === null ? "default" : "outline"}
                  onClick={() => setSelectedTag(null)}
                  size="sm"
                >
                  All Topics
                </Button>
                {allTags.slice(0, 5).map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    size="sm"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 pb-16">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading blog posts...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No blog posts found.</p>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Card key={blog.id} className="group hover:shadow-lg transition-all duration-300">
                  {blog.cover_image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={blog.cover_image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(blog.published_at)}
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      {blog.reading_time} min read
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-3 mb-4">
                      {blog.excerpt}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild variant="ghost" className="w-full justify-between p-0 h-auto">
                      <Link to={`/blog/${blog.slug}`}>
                        Read Article
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Logo className="w-8 h-8" />
                  <span className="text-xl font-bold">Churnaizer</span>
                </div>
                <p className="text-gray-400">AI-powered churn prediction for SaaS teams.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/integration" className="hover:text-white">Dashboard</Link></li>
                  <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                  <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                  <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                  <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                  <li><Link to="/integration" className="hover:text-white">Documentation</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Churnaizer. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BlogIndex;