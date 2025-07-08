
-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-screenshots', 'payment-screenshots', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);

-- Create storage policies for payment screenshots
CREATE POLICY "Anyone can upload payment screenshots" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Anyone can view payment screenshots" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Admins can delete payment screenshots" ON storage.objects
FOR DELETE USING (bucket_id = 'payment-screenshots' AND has_role(auth.uid(), 'admin'::app_role));

-- Add qr_screenshot_url column to orders table
ALTER TABLE public.orders 
ADD COLUMN qr_screenshot_url TEXT;

-- Create storage bucket for product images (multiple images support)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images-multi', 'product-images-multi', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);

-- Create storage policies for product images
CREATE POLICY "Anyone can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images-multi');

CREATE POLICY "Admins can manage product images" ON storage.objects
FOR ALL USING (bucket_id = 'product-images-multi' AND has_role(auth.uid(), 'admin'::app_role));

-- Add image_urls column to products table for multiple images
ALTER TABLE public.products 
ADD COLUMN image_urls TEXT[];

-- Create notifications table for admin notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  related_id UUID, -- Can reference order_id, product_id, etc.
  related_type TEXT -- 'order', 'product', 'user', etc.
);

-- Add RLS policies for admin notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all notifications" 
ON public.admin_notifications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for notifications
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.admin_notifications;
