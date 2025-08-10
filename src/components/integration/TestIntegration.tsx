
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface IntegrationStatus {
  status: 'unknown' | 'success' | 'fail';
  lastCheck?: string;
  website?: string;
  loading: boolean;
}

export const TestIntegration = () => {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    status: 'unknown',
    loading: true
  });
  const { user } = useAuth();

  useEffect(() => {
    checkIntegrationStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkIntegrationStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const checkIntegrationStatus = async () => {
    if (!user) return;
    
    setIntegrationStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const { data } = await supabase
        .from('integrations')
        .select('*')
        .eq('founder_id', user.id)
        .eq('status', 'success')
        .order('checked_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setIntegrationStatus({
          status: 'success',
          lastCheck: data.checked_at,
          website: data.website,
          loading: false
        });
      } else {
        setIntegrationStatus({
          status: 'fail',
          loading: false
        });
      }
    } catch (error) {
      console.error('Error checking integration status:', error);
      setIntegrationStatus({
        status: 'unknown',
        loading: false
      });
    }
  };

  const getStatusDisplay = () => {
    if (integrationStatus.loading) {
      return {
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        title: 'Checking Integration Status...',
        description: 'Verifying SDK connection',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
      };
    }

    switch (integrationStatus.status) {
      case 'success':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          title: '✅ SDK Integration Active',
          description: `Last confirmed: ${integrationStatus.lastCheck ? new Date(integrationStatus.lastCheck).toLocaleString() : 'Unknown'}${integrationStatus.website ? ` on ${integrationStatus.website}` : ''}`,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'fail':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          title: '❌ SDK Not Detected',
          description: 'Add the embed code to your website to complete integration. Status updates automatically.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-600" />,
          title: 'Integration Status Unknown',
          description: 'Unable to verify integration status. Check your connection.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">Auto-Integration Status</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Integration status updates automatically when you add the SDK to your website.
      </p>

      <div className={`p-4 rounded-lg border ${statusDisplay.bgColor} ${statusDisplay.borderColor}`}>
        <div className="flex items-start space-x-3">
          {statusDisplay.icon}
          <div className="flex-1">
            <h4 className={`font-medium ${statusDisplay.textColor}`}>
              {statusDisplay.title}
            </h4>
            <p className={`mt-1 text-sm ${statusDisplay.textColor}`}>
              {statusDisplay.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          onClick={checkIntegrationStatus}
          disabled={integrationStatus.loading}
          variant="outline"
          size="sm"
        >
          {integrationStatus.loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">How Auto-Integration Works:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Add the SDK embed code to your website</li>
          <li>• SDK automatically sends integration check on page load</li>
          <li>• Dashboard status updates within 30 seconds</li>
          <li>• Console shows success/error messages</li>
          <li>• No manual testing required</li>
        </ul>
      </div>
    </div>
  );
};
