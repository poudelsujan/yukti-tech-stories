
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ExternalLink, Zap } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import LocationAwareBuyButton from './LocationAwareBuyButton';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;
  trending?: boolean;
  daraz_link?: string;
  in_stock?: boolean;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to add items to cart."
      });
      navigate('/auth');
      return;
    }
    
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image,
      category: product.category
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to purchase items."
      });
      navigate('/auth');
      return;
    }
    
    // Create a temporary checkout item
    const checkoutItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image,
      category: product.category,
      quantity: 1
    };
    
    // Store in session storage for checkout
    sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
    
    // Navigate to checkout
    navigate('/checkout');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.trending && (
            <Badge className="absolute top-2 left-2 bg-blue-500">
              Trending
            </Badge>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="pb-2 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
          <span className="text-lg font-bold text-primary">
            Rs. {product.price.toLocaleString()}
          </span>
        </div>
        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
          <Link to={`/product/${product.id}`}>
            {product.title}
          </Link>
        </CardTitle>
        {product.description && (
          <CardDescription className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0 mt-auto">
        <div className="space-y-2">
          {user && (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline"
                size="sm"
                disabled={!product.in_stock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
              
              <LocationAwareBuyButton
                onBuyNow={handleBuyNow}
                darazLink={product.daraz_link}
                className="text-sm px-2 py-1 h-8"
              >
                <Zap className="h-4 w-4 mr-1" />
                Buy Now
              </LocationAwareBuyButton>
            </div>
          )}
          
          {!user && (
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Sign in to Purchase
            </Button>
          )}
          
          {product.daraz_link && (
            <a 
              href={product.daraz_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Buy on Daraz
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
