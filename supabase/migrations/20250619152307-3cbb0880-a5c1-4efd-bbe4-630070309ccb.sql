
-- Create customer reviews table
CREATE TABLE public.customer_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  location TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for customer reviews
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view reviews (public access)
CREATE POLICY "Anyone can view reviews" 
  ON public.customer_reviews 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to create reviews
CREATE POLICY "Authenticated users can create reviews" 
  ON public.customer_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own reviews
CREATE POLICY "Users can update their own reviews" 
  ON public.customer_reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow admins to manage all reviews
CREATE POLICY "Admins can manage all reviews" 
  ON public.customer_reviews 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Add daraz_link column to products table for external purchase links
ALTER TABLE public.products ADD COLUMN daraz_link TEXT;

-- Create discount codes table for admin-managed custom discounts
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for discount codes
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active discount codes for validation
CREATE POLICY "Anyone can view active discount codes" 
  ON public.discount_codes 
  FOR SELECT 
  USING (active = true AND (valid_until IS NULL OR valid_until > now()));

-- Only admins can manage discount codes
CREATE POLICY "Admins can manage discount codes" 
  ON public.discount_codes 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create orders table for checkout functionality
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  order_items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  order_status TEXT DEFAULT 'processing' CHECK (order_status IN ('processing', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Anyone can create orders (for guest checkout)
CREATE POLICY "Anyone can create orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders" 
  ON public.orders 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));
