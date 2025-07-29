import { DynamicHead } from "@/components/common/DynamicHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Blog = () => {
  return (
    <>
      <DynamicHead 
        title="Churnaizer - Blog"
        description="Stay updated with the latest news, articles, and insights from Churnaizer. Learn about churn prevention, AI in SaaS, and more."
      />
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-background">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-6xl">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-primary">Churnaizer</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-foreground/70 hover:text-foreground font-medium">
                Home
              </Link>
              <Link to="/features" className="text-foreground/70 hover:text-foreground font-medium">
                Features
              </Link>
              <Link to="/blog" className="text-foreground/70 hover:text-foreground font-medium">
                Blog
              </Link>
              <Link to="/dashboard">
                <Button className="bg-primary hover:bg-primary/90">Dashboard</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Blog Content */}
        <section className="container mx-auto px-6 py-20 max-w-4xl text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Blog - Coming Soon!
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            We're working hard to bring you insightful articles and updates on churn prevention, AI, and SaaS growth.
            Check back soon for new content!
          </p>
          <Link to="/">
            <Button 
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
              size="lg"
            >
              Back to Home
            </Button>
          </Link>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t py-8">
          <div className="container mx-auto px-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Churnaizer. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Blog;