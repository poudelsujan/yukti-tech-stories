
-- Fix RLS policy for order_status_history to allow admin insertions
DROP POLICY IF EXISTS "Admins can manage all order history" ON public.order_status_history;

CREATE POLICY "Admins can manage all order history" 
ON public.order_status_history 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Also add a policy to allow system insertions when creating orders
CREATE POLICY "Allow system insertions for order history" 
ON public.order_status_history 
FOR INSERT 
WITH CHECK (true);

-- Fix the orders table constraint to include 'paid' as valid payment status if needed
-- But based on the migration, 'completed' should be used instead of 'paid'
-- The constraint already allows: 'pending', 'pending_verification', 'completed', 'failed', 'refunded'
