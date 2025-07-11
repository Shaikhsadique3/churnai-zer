import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

const Terms = () => {
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
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Churnaizer ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p>
                  Churnaizer provides AI-powered customer churn prediction and analysis tools for SaaS businesses. Our service includes:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Customer data tracking and analysis</li>
                  <li>AI-powered churn risk predictions</li>
                  <li>Weekly automated reports</li>
                  <li>API integration capabilities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Provide accurate and lawful customer data</li>
                  <li>Comply with all applicable privacy laws and regulations</li>
                  <li>Obtain necessary consent from your customers for data processing</li>
                  <li>Not use the service for any illegal or unauthorized purpose</li>
                  <li>Maintain the security of your API keys and account credentials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Privacy and Security</h2>
                <p>
                  We take data privacy seriously. Customer data you provide is processed in accordance with our Privacy Policy. 
                  We implement industry-standard security measures to protect your data, but cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Service Availability</h2>
                <p>
                  While we strive for 99.9% uptime, we do not guarantee uninterrupted access to the service. 
                  We may temporarily suspend the service for maintenance or updates.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p>
                  Churnaizer provides predictions and analysis based on available data. These are estimates and should not be 
                  considered as guaranteed outcomes. We are not liable for business decisions made based on our predictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
                <p>
                  Either party may terminate this agreement at any time. Upon termination, your access to the service will be 
                  discontinued, and we will delete your data in accordance with our data retention policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material changes 
                  via email or through the service interface.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at legal@churnaizer.com
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

export default Terms;