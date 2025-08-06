import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface FounderProfile {
  company_name: string;
  company_website: string;
  industry: string;
  company_size: string;
  founded_year: number;
  location: string;
  product_description: string;
  target_market: string;
  revenue_model: string;
  monthly_revenue: number;
  pricing_model: string;
  main_competitors: string;
  current_churn_rate?: number;
  biggest_retention_challenge?: string;
  existing_retention_tools?: string;
  success_metrics?: string;
}

const OnboardingForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<FounderProfile | null>(null);

  const [formData, setFormData] = useState<FounderProfile>({
    company_name: '',
    company_website: '',
    industry: '',
    company_size: '',
    founded_year: new Date().getFullYear(),
    location: '',
    product_description: '',
    target_market: '',
    revenue_model: '',
    monthly_revenue: 0,
    pricing_model: '',
    main_competitors: '',
    current_churn_rate: undefined,
    biggest_retention_challenge: '',
    existing_retention_tools: '',
    success_metrics: ''
  });

  useEffect(() => {
    if (user) {
      loadExistingProfile();
    }
  }, [user]);

  const loadExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('founder_profile')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setExistingProfile(data);
        setFormData({
          company_name: data.company_name || '',
          company_website: data.company_website || '',
          industry: data.industry || '',
          company_size: data.company_size || '',
          founded_year: data.founded_year || new Date().getFullYear(),
          location: data.location || '',
          product_description: data.product_description || '',
          target_market: data.target_market || '',
          revenue_model: data.revenue_model || '',
          monthly_revenue: data.monthly_revenue || 0,
          pricing_model: data.pricing_model || '',
          main_competitors: data.main_competitors || '',
          current_churn_rate: data.current_churn_rate || undefined,
          biggest_retention_challenge: data.biggest_retention_challenge || '',
          existing_retention_tools: data.existing_retention_tools || '',
          success_metrics: data.success_metrics || ''
        });
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    }
  };

  const updateFormData = (field: keyof FounderProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.company_name && formData.industry && formData.company_size && formData.location);
      case 2:
        return !!(formData.product_description && formData.target_market && formData.revenue_model && formData.pricing_model);
      case 3:
        return true; // Optional fields
      default:
        return false;
    }
  };

  const saveProgress = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        ...formData,
        onboarding_completed: currentStep === 3,
        completed_at: currentStep === 3 ? new Date().toISOString() : null
      };

      if (existingProfile) {
        const { error } = await supabase
          .from('founder_profile')
          .update(profileData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('founder_profile')
          .insert([profileData]);

        if (error) throw error;
        setExistingProfile(formData);
      }

      toast({
        title: "Progress saved",
        description: "Your information has been saved successfully."
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving progress",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    await saveProgress();

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      navigate('/integration');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / 3) * 100;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => updateFormData('company_name', e.target.value)}
            placeholder="Enter your company name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_website">Company Website</Label>
          <Input
            id="company_website"
            value={formData.company_website}
            onChange={(e) => updateFormData('company_website', e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saas">SaaS</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="fintech">Fintech</SelectItem>
              <SelectItem value="healthtech">Healthtech</SelectItem>
              <SelectItem value="edtech">Edtech</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_size">Company Size *</Label>
          <Select value={formData.company_size} onValueChange={(value) => updateFormData('company_size', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="founded_year">Founded Year</Label>
          <Input
            id="founded_year"
            type="number"
            value={formData.founded_year}
            onChange={(e) => updateFormData('founded_year', parseInt(e.target.value))}
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            placeholder="City, Country"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="product_description">Product Description *</Label>
        <Textarea
          id="product_description"
          value={formData.product_description}
          onChange={(e) => updateFormData('product_description', e.target.value)}
          placeholder="Describe your product or service in 2-3 sentences"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_market">Target Market *</Label>
        <Input
          id="target_market"
          value={formData.target_market}
          onChange={(e) => updateFormData('target_market', e.target.value)}
          placeholder="e.g., Small business owners, Enterprise teams"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="revenue_model">Revenue Model *</Label>
          <Select value={formData.revenue_model} onValueChange={(value) => updateFormData('revenue_model', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select revenue model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="one-time">One-time payment</SelectItem>
              <SelectItem value="freemium">Freemium</SelectItem>
              <SelectItem value="usage-based">Usage-based</SelectItem>
              <SelectItem value="marketplace">Marketplace commission</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly_revenue">Monthly Revenue (USD)</Label>
          <Input
            id="monthly_revenue"
            type="number"
            value={formData.monthly_revenue}
            onChange={(e) => updateFormData('monthly_revenue', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricing_model">Pricing Model *</Label>
        <Input
          id="pricing_model"
          value={formData.pricing_model}
          onChange={(e) => updateFormData('pricing_model', e.target.value)}
          placeholder="e.g., $29/month, $99/year, Usage-based"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="main_competitors">Main Competitors</Label>
        <Input
          id="main_competitors"
          value={formData.main_competitors}
          onChange={(e) => updateFormData('main_competitors', e.target.value)}
          placeholder="List your top 2-3 competitors"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="current_churn_rate">Current Churn Rate (%)</Label>
        <Input
          id="current_churn_rate"
          type="number"
          value={formData.current_churn_rate || ''}
          onChange={(e) => updateFormData('current_churn_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="e.g., 5.2"
          min="0"
          max="100"
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="biggest_retention_challenge">Biggest Retention Challenge</Label>
        <Textarea
          id="biggest_retention_challenge"
          value={formData.biggest_retention_challenge}
          onChange={(e) => updateFormData('biggest_retention_challenge', e.target.value)}
          placeholder="What's your biggest challenge in keeping customers?"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="existing_retention_tools">Existing Retention Tools</Label>
        <Input
          id="existing_retention_tools"
          value={formData.existing_retention_tools}
          onChange={(e) => updateFormData('existing_retention_tools', e.target.value)}
          placeholder="e.g., Intercom, HubSpot, Custom solution"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="success_metrics">Success Metrics</Label>
        <Textarea
          id="success_metrics"
          value={formData.success_metrics}
          onChange={(e) => updateFormData('success_metrics', e.target.value)}
          placeholder="How do you measure customer success?"
          rows={3}
        />
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Basic Company Details";
      case 2: return "Product & Revenue Model";
      case 3: return "Retention & Churn Insights";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Tell us about your company";
      case 2: return "Help us understand your business model";
      case 3: return "Share your retention insights (optional)";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Welcome to Churnaizer</h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of 3
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 3 && <CheckCircle className="h-5 w-5 text-green-500" />}
              {getStepTitle()}
            </CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {currentStep === 3 ? 'Complete Setup' : 'Save & Continue'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingForm;