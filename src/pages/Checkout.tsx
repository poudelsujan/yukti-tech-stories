
import { useState } from 'react';
import CheckoutForm from '@/components/CheckoutForm';
import { useNavigate } from 'react-router-dom';

// Mock cart data - in a real app, this would come from a cart context/state
const mockCartItems = [
  {
    id: '1',
    title: 'Sample Product 1',
    price: 2500,
    quantity: 1,
    image_url: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'Sample Product 2',
    price: 1800,
    quantity: 2,
    image_url: '/placeholder.svg'
  }
];

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems] = useState(mockCartItems);

  const handleOrderComplete = () => {
    // Redirect to a success page or back to home
    navigate('/', { replace: true });
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
