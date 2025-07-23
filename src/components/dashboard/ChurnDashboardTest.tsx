import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';

interface User {
  id: string;
  user_id: string;
  plan: string;
  churn_score: number;
  risk_level: string;
  last_login: string;
  churn_reason: string;
}

export const ChurnDashboardTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ TEST 1: Load users from Supabase
  const testLoadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('owner_id', user?.id)
        .order('churn_score', { ascending: false });

      if (error) {
        console.error('Failed to fetch users:', error);
        setTestResults(prev => [...prev, `❌ Load Users FAILED: ${error.message}`]);
      } else {
        console.log('Users loaded:', data);
        setUsers(data || []);
        setTestResults(prev => [...prev, `✅ Load Users SUCCESS: ${data?.length} users loaded`]);
      }
    } catch (err) {
      setTestResults(prev => [...prev, `❌ Load Users ERROR: ${err}`]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ TEST 2: Delete user functionality
  const testDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('id', userId)
        .eq('owner_id', user?.id);

      if (error) {
        console.error('Delete failed:', error);
        setTestResults(prev => [...prev, `❌ Delete User FAILED: ${error.message}`]);
      } else {
        console.log(`User ${userId} deleted successfully`);
        setTestResults(prev => [...prev, `✅ Delete User SUCCESS: ${userId} deleted`]);
        // Reload users
        testLoadUsers();
      }
    } catch (err) {
      setTestResults(prev => [...prev, `❌ Delete User ERROR: ${err}`]);
    }
  };

  // ✅ TEST 3: CSV Download functionality
  const testDownloadCSV = async () => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('owner_id', user?.id);

      if (error) {
        console.error('Download failed:', error);
        setTestResults(prev => [...prev, `❌ CSV Download FAILED: ${error.message}`]);
        return;
      }

      if (!data || data.length === 0) {
        setTestResults(prev => [...prev, `⚠️ CSV Download: No data to download`]);
        return;
      }

      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'churnaizer-users-test.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTestResults(prev => [...prev, `✅ CSV Download SUCCESS: ${data.length} users exported`]);
    } catch (err) {
      setTestResults(prev => [...prev, `❌ CSV Download ERROR: ${err}`]);
    }
  };

  // ✅ TEST 4: Filter functionality
  const testFilterUsers = () => {
    const highRiskUsers = users.filter(user => user.risk_level === 'high');
    const mediumRiskUsers = users.filter(user => user.risk_level === 'medium');
    const lowRiskUsers = users.filter(user => user.risk_level === 'low');
    
    console.log('High Risk:', highRiskUsers);
    console.log('Medium Risk:', mediumRiskUsers);
    console.log('Low Risk:', lowRiskUsers);
    
    setTestResults(prev => [...prev, 
      `✅ Filter Test: High(${highRiskUsers.length}) Medium(${mediumRiskUsers.length}) Low(${lowRiskUsers.length})`
    ]);
  };

  // ✅ TEST 5: View user modal
  const testViewUser = (user: User) => {
    console.log('Viewing User:', user);
    toast({
      title: "User Details",
      description: `${user.user_id} - ${user.plan} - Risk: ${user.risk_level}`,
    });
    setTestResults(prev => [...prev, `✅ View User: ${user.user_id} details displayed`]);
  };

  // Initialize test utilities on window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testChurnaizer = {
        deleteUser: (id: string) => {
          const user = users.find(u => u.user_id === id);
          if (user) testDeleteUser(user.id);
        },
        viewUser: (id: string) => {
          const user = users.find(u => u.user_id === id);
          if (user) testViewUser(user);
        },
        download: () => testDownloadCSV(),
        filter: (risk: string) => users.filter(u => u.risk_level === risk),
        reload: () => testLoadUsers(),
        users: users
      };
    }
  }, [users]);

  // Clear test results
  const clearResults = () => setTestResults([]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🧪 Churn Dashboard Backend Tests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testLoadUsers} 
            disabled={loading}
            variant="outline"
          >
            1. Load Users from Supabase
          </Button>
          
          <Button 
            onClick={testDownloadCSV}
            variant="outline"
          >
            3. Test CSV Download
          </Button>
          
          <Button 
            onClick={testFilterUsers}
            variant="outline"
            disabled={users.length === 0}
          >
            4. Test Filter Functions
          </Button>
          
          <Button 
            onClick={clearResults}
            variant="destructive"
          >
            Clear Results
          </Button>
        </div>

        {/* Sample Users for Testing */}
        {users.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Sample Users (for testing):</h4>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {users.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{user.user_id}</span>
                    <Badge variant="outline">{user.plan}</Badge>
                    <Badge 
                      variant={user.risk_level === 'high' ? 'destructive' : 
                              user.risk_level === 'medium' ? 'secondary' : 'default'}
                    >
                      {user.risk_level}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => testViewUser(user)}
                    >
                      👁️ View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => testDeleteUser(user.id)}
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-2">
          <h4 className="font-semibold">Test Results:</h4>
          <div className="bg-muted p-3 rounded max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">No tests run yet. Click buttons above to test.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="font-mono text-sm mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Console Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
          <h4 className="font-semibold mb-2">🔧 Browser Console Testing:</h4>
          <code className="text-xs block space-y-1">
            <div>testChurnaizer.deleteUser('user_099');</div>
            <div>testChurnaizer.viewUser('user_098');</div>
            <div>testChurnaizer.download();</div>
            <div>console.log(testChurnaizer.filter('high'));</div>
            <div>testChurnaizer.reload();</div>
          </code>
        </div>

      </CardContent>
    </Card>
  );
};