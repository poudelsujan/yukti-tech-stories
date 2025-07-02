
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;
  trending?: boolean;
  specs?: Record<string, string>;
  daraz_link?: string;
  in_stock?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image,
      category: product.category
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
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

      <CardHeader className="pb-2">
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
      </CardHeader>

      <CardContent className="pt-0">
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="mb-4">
            <ul className="text-sm text-gray-600 space-y-1">
              {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            className="w-full" 
            disabled={!product.in_stock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          
          {product.daraz_link && (
            <a 
              href={product.daraz_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button 
                variant="outline" 
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
