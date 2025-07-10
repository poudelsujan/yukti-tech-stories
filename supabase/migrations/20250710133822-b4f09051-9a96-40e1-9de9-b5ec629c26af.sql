
-- Add support for multiple images per product
ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT '{}';

-- Migrate existing single image_url to images array
UPDATE public.products 
SET images = CASE 
  WHEN image_url IS NOT NULL THEN ARRAY[image_url]
  ELSE '{}'
END;

-- Keep image_url for backward compatibility but make it computed from first image
-- We'll handle this in the application layer

-- Add index for better performance on images array queries
CREATE INDEX IF NOT EXISTS idx_products_images ON public.products USING GIN (images);

-- Update the updated_at trigger to fire on images column changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
