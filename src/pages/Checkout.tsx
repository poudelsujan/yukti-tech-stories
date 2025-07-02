
import { useState, useEffect } from 'react';
import CheckoutForm from '@/components/CheckoutForm';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/types/checkout';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems: hookCartItems, clearCart } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Check for items in session storage (from product detail page) or use cart items
    const storedItems = sessionStorage.getItem('checkoutItems');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        setCartItems(items);
        // Clear the session storage after using it
        sessionStorage.removeItem('checkoutItems');
      } catch (error) {
        console.error('Error parsing stored checkout items:', error);
        setCartItems(hookCartItems);
      }
    } else {
      // Use items from cart hook
      setCartItems(hookCartItems);
    }
  }, [hookCartItems]);

  const handleOrderComplete = () => {
    // Clear the cart after successful order
    clearCart();
    // Redirect to orders page
    navigate('/orders', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <CheckoutForm 
          cartItems={cartItems} 
          onOrderComplete={handleOrderComplete}
        />
      </div>
    </div>
  );
};

export default Checkout;
