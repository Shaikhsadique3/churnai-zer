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
            <CardTitle className="text-3xl">Return / Refund / Cancellation Policy</CardTitle>
            <p className="text-muted-foreground">For Churnaizer.com</p>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. SaaS Subscription Model</h2>
                <p>
                  No refunds for already billed months (SaaS model). Once a billing cycle has been processed, 
                  charges for that period are final and non-refundable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Subscription Cancellation</h2>
                <p>
                  You can cancel your subscription anytime from the dashboard. Cancellation will take effect 
                  at the end of your current billing period, and you'll retain access until then.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Pro-rated Refunds</h2>
                <p>
                  Pro-rated refunds are not applicable on early cancellations. When you cancel, 
                  your subscription remains active until the end of the paid period.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Lifetime Deals and Special Offers</h2>
                <p>
                  Lifetime deals or special promotional offers are non-refundable once purchased. 
                  These are considered final sale items with no return policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Billing Issues</h2>
                <p>
                  In case of billing issues, contact us at support@churnaizer.com. We will investigate 
                  and resolve legitimate billing errors or duplicate charges promptly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Account Access After Cancellation</h2>
                <p>
                  After cancellation, your account will be downgraded to the free tier. 
                  Your data will be retained for 90 days in case you decide to resubscribe.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
                <p>
                  For any billing-related questions or issues, please contact us:
                </p>
                <ul className="mt-2 space-y-1">
                  <li><strong>Email:</strong> support@churnaizer.com</li>
                  <li><strong>Response Time:</strong> Within 24 hours</li>
                </ul>
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

export default RefundPolicy;