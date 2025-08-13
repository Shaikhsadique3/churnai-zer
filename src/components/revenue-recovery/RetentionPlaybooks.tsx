
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, TrendingUp, Users, Target, Zap } from 'lucide-react';
import { CalculationData } from '@/pages/RevenueRecoveryDashboard';

interface Playbook {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  description: string;
  steps: string[];
  expectedOutcome: string;
  timeToImplement: string;
  icon: React.ReactNode;
}

interface RetentionPlaybooksProps {
  calculationData: CalculationData | null;
}

export const RetentionPlaybooks: React.FC<RetentionPlaybooksProps> = ({ calculationData }) => {
  const playbooks: Playbook[] = [
    {
      id: '1',
      title: 'Onboarding Optimization Playbook',
      difficulty: 'Easy',
      description: 'Improve user activation and reduce early churn through better onboarding.',
      steps: [
        'Audit current onboarding flow and identify drop-off points',
        'Create interactive product tours for key features', 
        'Set up welcome email sequence with quick wins',
        'Add progress indicators and achievement badges',
        'Implement in-app help tooltips and guidance'
      ],
      expectedOutcome: '15-25% reduction in first-month churn',
      timeToImplement: '2-3 weeks',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: '2', 
      title: 'Usage-Based Retention Campaign',
      difficulty: 'Medium',
      description: 'Target low-usage customers with personalized engagement campaigns.',
      steps: [
        'Define usage metrics that correlate with retention',
        'Segment users by activity levels and feature adoption',
        'Create automated email campaigns for low-usage segments',
        'Offer personalized training sessions or demos',
        'Set up in-app notifications for unused features',
        'Track engagement improvements and iterate'
      ],
      expectedOutcome: '20-30% improvement in feature adoption',
      timeToImplement: '3-4 weeks',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: '3',
      title: 'Customer Success Intervention Program', 
      difficulty: 'Medium',
      description: 'Proactive outreach program for at-risk customers based on behavior signals.',
      steps: [
        'Identify early warning signals of churn risk',
        'Create customer health scoring system',
        'Build automated alert system for CS team',
        'Develop intervention playbooks by risk level',
        'Implement regular check-in cadences',
        'Measure success rates and refine approach'
      ],
      expectedOutcome: '25-40% reduction in preventable churn',
      timeToImplement: '4-6 weeks',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: '4',
      title: 'Value Realization Framework',
      difficulty: 'Advanced', 
      description: 'Help customers achieve measurable ROI faster through structured success milestones.',
      steps: [
        'Map customer journey to value milestones',
        'Create ROI tracking dashboard for customers',
        'Develop success milestone communication plan',
        'Build case study template and collection process',
        'Implement quarterly business review program',
        'Create expansion opportunity identification system'
      ],
      expectedOutcome: '30-50% increase in customer lifetime value',
      timeToImplement: '6-8 weeks', 
      icon: <Target className="h-5 w-5" />
    },
    {
      id: '5',
      title: 'Predictive Churn Prevention System',
      difficulty: 'Advanced',
      description: 'Machine learning-powered system to predict and prevent churn before it happens.',
      steps: [
        'Collect and clean historical customer data',
        'Build predictive model using engagement patterns',
        'Create automated intervention workflows',
        'Set up real-time monitoring dashboard',
        'Develop personalized retention offers system',
        'Implement A/B testing for intervention strategies'
      ],
      expectedOutcome: '40-60% improvement in churn prediction accuracy',
      timeToImplement: '8-12 weeks',
      icon: <Zap className="h-5 w-5" />
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendedPlaybooks = () => {
    if (!calculationData) return playbooks;
    
    // Recommend based on churn rate and company size
    if (calculationData.churnRate > 10) {
      // High churn - recommend immediate action
      return playbooks.filter(p => ['1', '2', '3'].includes(p.id));
    } else if (calculationData.churnRate > 5) {
      // Medium churn - balanced approach  
      return playbooks.filter(p => ['2', '3', '4'].includes(p.id));
    } else {
      // Low churn - focus on optimization
      return playbooks.filter(p => ['4', '5'].includes(p.id));
    }
  };

  const recommendedPlaybooks = getRecommendedPlaybooks();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Retention Playbooks Library
          </CardTitle>
          <CardDescription>
            {calculationData 
              ? `Based on your ${calculationData.churnRate}% churn rate, here are our recommended strategies:`
              : 'Proven strategies to reduce churn and increase customer lifetime value.'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {recommendedPlaybooks.map((playbook) => (
          <Card key={playbook.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {playbook.icon}
                  <div>
                    <CardTitle className="text-lg">{playbook.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {playbook.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getDifficultyColor(playbook.difficulty)}>
                  {playbook.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Expected Outcome:</span>
                  <p>{playbook.expectedOutcome}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Implementation Time:</span>
                  <p>{playbook.timeToImplement}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Implementation Steps:</h4>
                <ol className="space-y-1 text-sm">
                  {playbook.steps.map((step, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-muted-foreground font-mono">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <Button variant="outline" className="w-full">
                Download Detailed Guide
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
