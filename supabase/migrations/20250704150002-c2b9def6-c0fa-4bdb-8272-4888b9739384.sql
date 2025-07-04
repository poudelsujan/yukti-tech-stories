
-- Update the orders table to allow 'pending_verification' as a valid payment status
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'pending_verification', 'completed', 'failed', 'refunded'));
