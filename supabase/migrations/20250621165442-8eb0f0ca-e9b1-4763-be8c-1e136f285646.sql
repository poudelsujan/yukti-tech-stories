
-- Create product_discounts table to link products with discount codes
CREATE TABLE public.product_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(product_id, discount_code_id)
);

-- Enable RLS for product_discounts
ALTER TABLE public.product_discounts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view product discounts (needed for checkout)
CREATE POLICY "Anyone can view product discounts" 
  ON public.product_discounts 
  FOR SELECT 
  USING (true);

-- Only admins can manage product discounts
CREATE POLICY "Admins can manage product discounts" 
  ON public.product_discounts 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Add indexes for better performance
CREATE INDEX idx_product_discounts_product_id ON public.product_discounts(product_id);
CREATE INDEX idx_product_discounts_discount_code_id ON public.product_discounts(discount_code_id);
