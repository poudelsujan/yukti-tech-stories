
-- Add stock_quantity column to products table
ALTER TABLE public.products 
ADD COLUMN stock_quantity integer DEFAULT NULL;
