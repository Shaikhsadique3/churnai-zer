import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

const RefundPolicy = () => {
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
            <CardTitle className="text-3xl">Refund Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Refund Eligibility</h2>
                <p>
                  We offer a 30-day money-back guarantee for all our subscription plans. If you're not satisfied 
                  with Churnaizer for any reason, you can request a full refund within 30 days of your initial purchase.
                </p>
                <h3 className="text-lg font-semibold mt-4 mb-2">Eligible for Refund:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>First-time subscriptions within 30 days</li>
                  <li>Technical issues that prevent service usage</li>
                  <li>Service downtime exceeding our SLA commitments</li>
                  <li>Billing errors or duplicate charges</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Non-Refundable Items</h2>
                <p>The following are not eligible for refunds:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Subscription renewals after the initial 30-day period</li>
                  <li>Add-on services or premium features used beyond trial period</li>
                  <li>Accounts suspended for Terms of Service violations</li>
                  <li>Data export or migration fees</li>
                  <li>Third-party integrations or services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Refund Process</h2>
                <p>To request a refund, please follow these steps:</p>
                <ol className="list-decimal pl-6 mt-2 space-y-2">
                  <li>Contact our support team at support@churnaizer.com</li>
                  <li>Include your account email and reason for refund request</li>
                  <li>Provide any relevant details about issues experienced</li>
                  <li>Allow up to 5 business days for review and processing</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Processing Timeline</h2>
                <p>
                  Once your refund request is approved, processing times vary by payment method:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Credit Card:</strong> 3-5 business days</li>
                  <li><strong>PayPal:</strong> 1-2 business days</li>
                  <li><strong>Bank Transfer:</strong> 5-7 business days</li>
                  <li><strong>Digital Wallets:</strong> 1-3 business days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Partial Refunds</h2>
                <p>
                  In certain circumstances, we may offer partial refunds:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Service interruptions affecting a portion of your subscription period</li>
                  <li>Downgrade from higher-tier plans with unused features</li>
                  <li>Pro-rated refunds for mid-cycle cancellations (at our discretion)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Data Retention After Refund</h2>
                <p>
                  Upon refund processing:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your account will be immediately downgraded to free tier</li>
                  <li>Data will be retained for 90 days in case you want to resubscribe</li>
                  <li>You can request immediate data deletion if preferred</li>
                  <li>Export your data before requesting refund to avoid loss</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Chargeback Policy</h2>
                <p>
                  If you initiate a chargeback instead of contacting us directly:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your account will be immediately suspended pending resolution</li>
                  <li>We will provide transaction records to your financial institution</li>
                  <li>Account access will be restored upon chargeback resolution</li>
                  <li>We encourage direct contact to resolve issues faster</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                <p>
                  For refund requests or questions about this policy, contact us:
                </p>
                <ul className="mt-2 space-y-1">
                  <li><strong>Email:</strong> support@churnaizer.com</li>
                  <li><strong>Response Time:</strong> Within 24 hours</li>
                  <li><strong>Phone:</strong> Available upon request for urgent matters</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground">© 2024 Churnaizer. All rights reserved.</span>
            </div>
            <div className="flex space-x-4 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
              <Link to="/refund-policy" className="text-muted-foreground hover:text-foreground">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RefundPolicy;