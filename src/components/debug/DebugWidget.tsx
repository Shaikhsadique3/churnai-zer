import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DebugWidgetProps {
  className?: string;
}

interface ApiRequestLog {
  status: 'SUCCESS' | 'FAILED';
  timestamp: string;
}

export function DebugWidget({ className = '' }: DebugWidgetProps) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [lastApiRequest, setLastApiRequest] = useState<ApiRequestLog | null>(null);

  // Check if user is admin
  const allowedAdminEmails = [
    'shaikhsadique730@gmail.com',
    'shaikhsadique2222@gmail.com', 
    'shaikhumairthisside@gmail.com'
  ];
  
  const isAdmin = user?.email && allowedAdminEmails.includes(user.email);

  useEffect(() => {
    // Listen for custom events from API calls
    const handleApiRequest = (event: CustomEvent<ApiRequestLog>) => {
      setLastApiRequest(event.detail);
    };

    // Add event listener for API requests
    window.addEventListener('api-request-log' as keyof WindowEventMap, handleApiRequest);

    return () => {
      // Clean up event listener
      window.removeEventListener('api-request-log' as keyof WindowEventMap, handleApiRequest);
    };
  }, []);

  // If user is not admin, don't render anything
  if (!isAdmin) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 ${className}`}
    >
      <div 
        className="bg-black/80 text-white p-3 rounded-lg shadow-lg text-xs w-64"
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Debug: API Requests</h3>
        </div>
        
        {lastApiRequest ? (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={lastApiRequest.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>
                {lastApiRequest.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Timestamp:</span>
              <span>{new Date(lastApiRequest.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 italic">No API requests logged yet</div>
        )}
      </div>
    </div>
  );
}