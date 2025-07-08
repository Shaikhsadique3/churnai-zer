import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Mail, X } from "lucide-react";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailTemplate: string;
  targetUserData?: any;
}

const EMAIL_TEMPLATES: Record<string, { subject: string; content: string }> = {
  "discount_20_pro": {
    subject: "🎉 Exclusive 20% Discount on Pro Plan - Limited Time!",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Special Offer Just for You!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Save 20% on Your Pro Plan Upgrade</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi {{user_name}},</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            We noticed you've been exploring our features, and we want to help you get the most out of our platform! 
            For a limited time, we're offering you an exclusive <strong>20% discount</strong> on our Pro Plan.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Pro Plan Benefits:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Advanced churn prediction analytics</li>
              <li>Custom automation playbooks</li>
              <li>Priority customer support</li>
              <li>Unlimited user tracking</li>
              <li>Advanced reporting dashboard</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Claim Your 20% Discount
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            This offer expires in 7 days. Terms and conditions apply.
          </p>
        </div>
      </div>
    `
  },
  "feature_guide": {
    subject: "🚀 Unlock the Full Potential of Your Account",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4f46e5; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 26px;">Your Success Guide</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tips to maximize your results</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hello {{user_name}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            We want to help you get the most value from our platform. Here are some powerful features you might not know about:
          </p>
          
          <div style="margin: 25px 0;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #10b981;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">📊 Advanced Analytics</h3>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Dive deeper into your churn data with custom filters and segmentation options.
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">⚡ Automation Playbooks</h3>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Create automated workflows to engage at-risk customers before they churn.
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">📈 Predictive Insights</h3>
              <p style="color: #666; margin: 0; line-height: 1.5;">
                Get AI-powered recommendations for reducing churn in your customer base.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Explore Features
            </a>
          </div>
        </div>
      </div>
    `
  },
  "retention_call": {
    subject: "📞 Let's Chat - We're Here to Help!",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 26px;">We'd Love to Hear From You</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Book a quick call with our team</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi {{user_name}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            We've noticed you haven't been as active lately, and we want to make sure you're getting the value you need from our platform.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Our customer success team would love to jump on a quick 15-minute call to:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Understand your current goals and challenges</li>
              <li>Show you features that can help your workflow</li>
              <li>Answer any questions you might have</li>
              <li>Discuss how we can better support your success</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Schedule a Call
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            No sales pitch, just genuine help. We're here to ensure your success!
          </p>
        </div>
      </div>
    `
  },
  "win_back_offer": {
    subject: "💝 We Miss You - Special Win-Back Offer Inside",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">We Want You Back!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Exclusive offer to welcome you home</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">We miss you, {{user_name}}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            We noticed you haven't been using our platform recently, and we'd love to have you back. 
            We've made some exciting improvements that we think you'll love!
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 2px solid #f093fb;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">🎁 Welcome Back Offer</h3>
            <p style="color: #f5576c; font-size: 32px; font-weight: bold; margin: 0;">30% OFF</p>
            <p style="color: #666; margin: 5px 0 0 0;">Your next 3 months</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's New Since You Left:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Enhanced AI-powered churn predictions</li>
              <li>New automation playbooks builder</li>
              <li>Improved dashboard with real-time insights</li>
              <li>Better integrations with popular tools</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Claim Your 30% Discount
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            This special offer is valid for 10 days only. We can't wait to welcome you back!
          </p>
        </div>
      </div>
    `
  }
};

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  emailTemplate,
  targetUserData
}) => {
  const template = EMAIL_TEMPLATES[emailTemplate];

  if (!template) {
    return null;
  }

  // Replace placeholders with actual data
  const personalizedContent = template.content.replace(/\{\{user_name\}\}/g, targetUserData?.user_id || 'Customer');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <DialogTitle>Email Preview</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Preview of "{template.subject}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">From:</span>
                  <span>your-app@yourdomain.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">To:</span>
                  <span>{targetUserData?.user_id || 'customer@example.com'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Subject:</span>
                  <span className="font-medium">{template.subject}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                className="w-full"
                dangerouslySetInnerHTML={{ __html: personalizedContent }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};