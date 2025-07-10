
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ExternalLink, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
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
  images?: string[];
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all available images
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const hasMultipleImages = allImages.length > 1;

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
      image_url: allImages[0],
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
    
    const checkoutItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: allImages[0],
      category: product.category,
      quantity: 1
    };
    
    sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
    navigate('/checkout');
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img 
            src={allImages[currentImageIndex]} 
            alt={product.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Image navigation for multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

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
                disabled={!product.in_stock}
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
