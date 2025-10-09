import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminPanel() {
  const [audits, setAudits] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: auditsData } = await supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: questionsData } = await supabase
      .from('questions')
      .select(`
        *,
        category:categories(title)
      `)
      .order('order_index');

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*');

    setAudits(auditsData || []);
    setQuestions(questionsData || []);
    setCategories(categoriesData || []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Admin Panel</h1>
          </div>

          <Tabs defaultValue="audits">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="audits">Audits</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="audits" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Recent Audits</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-center py-3 px-4">Score</th>
                        <th className="text-center py-3 px-4">Status</th>
                        <th className="text-center py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audits.map((audit) => (
                        <tr key={audit.id} className="border-b">
                          <td className="py-3 px-4">{audit.email || 'Anonymous'}</td>
                          <td className="text-center py-3 px-4 font-bold">
                            {audit.overall_score ? Math.round(audit.overall_score) : '-'}
                          </td>
                          <td className="text-center py-3 px-4">{audit.status || 'In Progress'}</td>
                          <td className="text-center py-3 px-4 text-sm text-muted-foreground">
                            {new Date(audit.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Question Bank</h2>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div key={q.id} className="p-4 border rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-primary font-medium">{q.category.title}</p>
                        <p className="font-medium">{q.prompt}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Categories</h2>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 border rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{cat.title}</p>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                        <p className="text-sm mt-1">Weight: {cat.weight}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}