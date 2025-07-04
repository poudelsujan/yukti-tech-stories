
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutForm from '@/components/CheckoutForm';
import SignInPrompt from '@/components/auth/SignInPrompt';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { CartItem } from '@/types/checkout';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems: hookCartItems, clearCart, isLoading } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!isLoading) {
      // Check for items in session storage (from Buy Now button) or use cart items
      const storedItems = sessionStorage.getItem('checkoutItems');
      if (storedItems) {
        try {
          const items = JSON.parse(storedItems);
          console.log('Using stored checkout items:', items);
          setCartItems(items);
          sessionStorage.removeItem('checkoutItems');
        } catch (error) {
          console.error('Error parsing stored checkout items:', error);
          console.log('Falling back to cart items:', hookCartItems);
          setCartItems(hookCartItems);
        }
      } else {
        console.log('Using cart items:', hookCartItems);
        setCartItems(hookCartItems);
      }
    }
  }, [hookCartItems, isLoading]);

  const handleOrderComplete = () => {
    clearCart();
    navigate('/orders', { replace: true });
  };

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <SignInPrompt 
        message="Sign In Required"
        description="Please sign in to continue with your purchase and track your orders."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to your cart to proceed with checkout.</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Shop Now
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your purchase ({cartItems.length} items)</p>
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
