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
            <CardTitle className="text-3xl">Terms & Conditions</CardTitle>
            <p className="text-muted-foreground">Effective Date: January 12, 2025</p>
            <p className="text-muted-foreground">Website: https://churnaizer.com</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6">
              <p>
                By accessing or using Churnaizer (an AI-driven churn prevention tool), you agree to be bound by these Terms & Conditions. 
                Please read them carefully before using our service.
              </p>

              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Use of Service</h2>
                <p>You agree to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Use it legally and ethically for your business only</li>
                  <li>Respect our platform's intellectual property</li>
                  <li>Not reverse-engineer or resell our product</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Subscription and Billing</h2>
                <p>
                  Subscription plans are billed monthly or annually as selected during signup. 
                  All payments are processed securely through our payment providers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Account Termination</h2>
                <p>
                  Violation of these terms may result in account termination at our discretion. 
                  We reserve the right to suspend or terminate accounts that violate our terms of service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
                <p>
                  All content, features, and functionality of Churnaizer are owned by us and are protected by 
                  copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
                <p>
                  Churnaizer provides AI-driven predictions and analysis. These are estimates based on available data 
                  and should not be considered as guaranteed outcomes. We are not liable for business decisions made based on our predictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. Material changes will be communicated 
                  to users via email or through the service interface.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
                <p>
                  If you have any questions about these Terms & Conditions, please contact us at help@churnaizer.com
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