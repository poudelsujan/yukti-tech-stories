
-- Create a function to insert admin notifications (workaround for type issues)
CREATE OR REPLACE FUNCTION create_admin_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_related_id UUID DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.admin_notifications (title, message, type, related_id, related_type)
  VALUES (p_title, p_message, p_type, p_related_id, p_related_type)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;
