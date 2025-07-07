
-- Check current constraint and update it to include all necessary payment status values
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'pending_verification', 'completed', 'failed', 'refunded'));
