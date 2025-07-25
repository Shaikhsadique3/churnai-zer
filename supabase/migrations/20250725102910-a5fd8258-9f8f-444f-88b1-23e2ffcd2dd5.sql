-- Insert sample announcement
INSERT INTO public.announcements (
  user_id,
  title,
  content,
  is_active,
  expires_at
) VALUES (
  '7eb54860-81c8-4b71-9590-42a6f60dbfe0',
  '🚀 New Feature Alert!',
  'Check out our new <strong>AI-powered churn prediction</strong> dashboard! <a href="/integration" style="color: white; text-decoration: underline;">Try it now →</a>',
  true,
  NOW() + INTERVAL '30 days'
);