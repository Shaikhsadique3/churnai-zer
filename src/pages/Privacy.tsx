import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="md" />
            <h1 className="text-2xl font-bold text-foreground">Churnaizer</h1>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">For Churnaizer.com</p>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6">
              <p>
                We respect SaaS founders' data privacy and are committed to protecting your personal information. 
                This policy explains how we collect, use, and safeguard your data.
              </p>

              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <p>We store the following information:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your name and email address</li>
                  <li>CRM data (if you choose to integrate)</li>
                  <li>Usage statistics and analytics</li>
                  <li>Account preferences and settings</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
                <p>
                  Data is encrypted and used solely to improve our AI recommendations and provide you with 
                  better churn prevention insights for your business.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Cookies and Analytics</h2>
                <p>
                  We use cookies for analytics purposes through services like Google Analytics and Plausible. 
                  These help us understand how our platform is being used to improve the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
                <p>
                  No user data is sold or shared with third parties without your explicit consent. 
                  We maintain strict confidentiality of all customer information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
                <p>
                  All data is encrypted both in transit and at rest. We implement industry-standard 
                  security measures to protect your information from unauthorized access.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                <p>
                  You may request deletion of your account and associated data at any time by contacting 
                  our support team. We will process deletion requests within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Any material changes will be 
                  communicated to you via email or through our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at help@churnaizer.com
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground">© 2024 Churnaizer. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
              <Link to="/refund-policy" className="text-muted-foreground hover:text-foreground">Refund Policy</Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;