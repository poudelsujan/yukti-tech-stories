
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
  category?: string;
  type?: 'regular' | 'preorder';
  preorder_link?: string;
  estimated_delivery?: string;
}

export const useCart = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        console.log('Loading cart from localStorage:', parsed);
        setCartItems(parsed);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('shopping_cart'); // Clear corrupted data
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('Saving cart to localStorage:', cartItems);
    localStorage.setItem('shopping_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    console.log('Adding item to cart:', item);
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
        toast({
          title: "Cart Updated",
          description: `${item.title} quantity increased to ${existingItem.quantity + 1}`
        });
        return updatedItems;
      } else {
        // Add new item to cart
        const newItem = { ...item, quantity: 1 };
        toast({
          title: "Added to Cart",
          description: `${item.title} has been added to your cart`
        });
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === itemId);
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      
      if (itemToRemove) {
        toast({
          title: "Removed from Cart",
          description: `${itemToRemove.title} has been removed from your cart`
        });
      }
      
      return updatedItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('shopping_cart');
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart"
    });
  };

  const getTotalItems = () => {
    const total = cartItems.reduce((total, item) => total + item.quantity, 0);
    console.log('Total items in cart:', total);
    return total;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };
};
