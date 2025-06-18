
-- Create products table for admin to manage products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  trending BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create product categories table
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view products (public access)
CREATE POLICY "Anyone can view products" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- Only admins can insert, update, delete products
CREATE POLICY "Admins can manage products" 
  ON public.products 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS for categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view categories
CREATE POLICY "Anyone can view categories" 
  ON public.product_categories 
  FOR SELECT 
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories" 
  ON public.product_categories 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert some default categories
INSERT INTO public.product_categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Home & Garden', 'Home improvement and garden supplies'),
('Sports', 'Sports and fitness equipment'),
('Books', 'Books and educational materials');

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policy for product images
CREATE POLICY "Anyone can view product images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'product-images');

-- Only admins can upload product images
CREATE POLICY "Admins can upload product images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can update product images
CREATE POLICY "Admins can update product images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can delete product images
CREATE POLICY "Admins can delete product images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
