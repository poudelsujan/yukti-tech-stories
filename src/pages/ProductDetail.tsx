import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import CustomerReviews from '@/components/CustomerReviews';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  daraz_link: string | null;
  tags: string[] | null;
  trending: boolean | null;
  in_stock: boolean | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url,
        category: product.category
      });
    }
  };

  const handleBuyNow = () => {
    if (product) {
      // Add to cart first, then go to checkout
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url,
        category: product.category
      });
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">Sorry, we couldn't find the product you're looking for.</p>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <img 
                  src={product.image_url || '/placeholder.svg'} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.trending && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full ml-2">
                    Trending
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  Rs. {product.price.toLocaleString()}
                </span>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    className="flex-1" 
                    size="lg" 
                    disabled={!product.in_stock}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  <Button 
                    className="flex-1" 
                    size="lg" 
                    disabled={!product.in_stock}
                    onClick={handleBuyNow}
                    variant="outline"
                  >
                    Buy Now
                  </Button>
                </div>

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
                      size="lg"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Buy on Daraz
                    </Button>
                  </a>
                )}
              </div>

              {!product.in_stock && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    This product is currently out of stock. Please check back later or contact us for availability.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <CustomerReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetail;
