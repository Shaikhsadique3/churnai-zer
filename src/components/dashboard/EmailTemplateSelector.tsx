import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
}

interface EmailTemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select email template"
}) => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates-list'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {templates?.length === 0 ? (
          <SelectItem value="" disabled>
            No email templates found
          </SelectItem>
        ) : (
          templates?.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex flex-col">
                <span>{template.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {template.subject}
                </span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};