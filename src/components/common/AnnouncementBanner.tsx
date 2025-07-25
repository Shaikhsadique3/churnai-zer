import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  expires_at: string | null;
}

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchActiveAnnouncement();
    
    // Check if banner was previously dismissed
    const dismissedIds = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
    if (announcement && dismissedIds.includes(announcement.id)) {
      setIsDismissed(true);
    }
  }, []);

  const fetchActiveAnnouncement = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }
      
      if (data) {
        setAnnouncement(data);
        
        // Check if this announcement was dismissed
        const dismissedIds = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
        if (dismissedIds.includes(data.id)) {
          setIsDismissed(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch announcement:', error);
    }
  };

  const dismissBanner = () => {
    if (!announcement) return;
    
    setIsDismissed(true);
    
    // Store dismissed announcement ID in localStorage
    const dismissedIds = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
    if (!dismissedIds.includes(announcement.id)) {
      dismissedIds.push(announcement.id);
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedIds));
    }
  };

  if (!announcement || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <span className="font-semibold">{announcement.title}</span>
              <span className="mx-2">•</span>
              <span dangerouslySetInnerHTML={{ __html: announcement.content }} />
            </div>
          </div>
          <button
            onClick={dismissBanner}
            className="ml-4 flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;