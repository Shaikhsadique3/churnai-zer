-- Enable realtime for notifications table
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Add the notifications table to realtime publication
-- This enables real-time updates for the notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;