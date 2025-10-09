import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const scaleLabels = ["Never", "Rarely", "Sometimes", "Often", "Always"];

export default function AuditQuestion() {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadExistingAnswers();
  }, [auditId]);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        category:categories(id, title)
      `)
      .order('order_index');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
      return;
    }

    setQuestions(data || []);
    setIsLoading(false);
  };

  const loadExistingAnswers = async () => {
    const { data } = await supabase
      .from('answers')
      .select('question_id, value')
      .eq('audit_id', auditId);

    if (data) {
      const answerMap: Record<string, number> = {};
      data.forEach(a => {
        answerMap[a.question_id] = a.value;
      });
      setAnswers(answerMap);
    }
  };

  const saveAnswer = async (questionId: string, value: number) => {
    setIsSaving(true);
    
    const { error } = await supabase
      .from('answers')
      .upsert({
        audit_id: auditId,
        question_id: questionId,
        value
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save answer",
        variant: "destructive",
      });
    }
    
    setIsSaving(false);
  };

  const handleAnswerSelect = async (value: number) => {
    const currentQuestion = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    await saveAnswer(currentQuestion.id, value);
    
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        calculateAndNavigateToResults();
      }
    }, 300);
  };

  const calculateAndNavigateToResults = async () => {
    try {
      // Calculate category scores
      const categoryScores: Record<string, { total: number; count: number; weight: number }> = {};
      
      questions.forEach(q => {
        const answer = answers[q.id];
        if (answer) {
          const categoryId = q.category.id;
          if (!categoryScores[categoryId]) {
            categoryScores[categoryId] = { total: 0, count: 0, weight: 1.0 };
          }
          // Normalize to 0-1 scale: (answer - 1) / 4
          categoryScores[categoryId].total += (answer - 1) / 4;
          categoryScores[categoryId].count += 1;
        }
      });

      // Get category weights
      const { data: categories } = await supabase
        .from('categories')
        .select('*');

      let weightedSum = 0;
      let totalWeight = 0;

      // Calculate results and insert into database
      for (const [categoryId, scores] of Object.entries(categoryScores)) {
        const category = categories?.find(c => c.id === categoryId);
        const avgScore = (scores.total / scores.count) * 100;
        const weight = category?.weight || 1.0;
        
        weightedSum += avgScore * weight;
        totalWeight += weight;

        // Determine status
        let status = "Poor";
        if (avgScore >= 75) status = "Good";
        else if (avgScore >= 50) status = "Average";

        // Insert category result
        await supabase
          .from('category_results')
          .upsert({
            audit_id: auditId,
            category_id: categoryId,
            score: avgScore,
            status
          });
      }

      // Calculate overall score
      const overallScore = weightedSum / totalWeight;
      let overallStatus = "Critical Risk";
      if (overallScore > 80) overallStatus = "Strong Retention System";
      else if (overallScore > 60) overallStatus = "Stable but Untapped";
      else if (overallScore > 30) overallStatus = "Needs Attention";

      // Update audit
      await supabase
        .from('audits')
        .update({
          overall_score: overallScore,
          status: overallStatus,
          completed_at: new Date().toISOString()
        })
        .eq('id', auditId);

      navigate(`/results/${auditId}`);
    } catch (error) {
      console.error('Error calculating results:', error);
      toast({
        title: "Error",
        description: "Failed to calculate results",
        variant: "destructive",
      });
    }
  };

  if (isLoading || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="p-8 space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">
                {currentQuestion.category.title}
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* Answer Scale */}
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswerSelect(value)}
                  disabled={isSaving}
                  className={`
                    p-6 rounded-lg border-2 transition-all
                    ${currentAnswer === value 
                      ? 'border-primary bg-primary/10 scale-105' 
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="text-3xl font-bold mb-2">{value}</div>
                  <div className="text-xs text-muted-foreground">
                    {scaleLabels[value - 1]}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                } else if (Object.keys(answers).length === questions.length) {
                  calculateAndNavigateToResults();
                }
              }}
              disabled={!currentAnswer}
            >
              {currentIndex === questions.length - 1 ? "See Results" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}