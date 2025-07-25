import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { DynamicHead } from '@/components/common/DynamicHead';
import { Logo } from '@/components/ui/logo';
import { Calendar, Clock, Tag, ArrowLeft, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string | null;
  meta_description: string;
  tags: string[];
  reading_time: number;
  published_at: string;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
      } else {
        setBlog(data as BlogPost);
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareUrl = window.location.href;
  const shareTitle = blog?.title || '';

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "The blog post URL has been copied to your clipboard."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notFound || !blog) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <DynamicHead 
        title={`${blog.title} | Churnaizer Blog`}
        description={blog.meta_description || blog.excerpt}
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
                <Link to="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link>
                <Link to="/integration" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              </nav>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Back to Blog */}
        <div className="max-w-4xl mx-auto px-4 lg:px-6 pt-8">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 lg:px-6 pb-16">
          {/* Cover Image */}
          {blog.cover_image_url && (
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={blog.cover_image_url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(blog.published_at)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {blog.reading_time} min read
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2 py-4 border-y border-gray-200">
              <span className="text-sm font-medium text-gray-600 mr-2">Share:</span>
              <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={shareOnLinkedIn}>
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={shareOnFacebook}>
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Article Content */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Reduce Churn?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join 10+ SaaS teams using Churnaizer to predict and prevent customer churn with AI-powered insights.
            </p>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        </article>

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

export default BlogPost;