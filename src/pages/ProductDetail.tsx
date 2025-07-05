import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Heart, Share2, Star, ExternalLink, User } from 'lucide-react';
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
  stock_quantity: number | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product details"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign In Required",
        description: "Please sign in to add items to your cart"
      });
      navigate('/auth');
      return;
    }

    if (!product) return;

    if (!product.in_stock || (product.stock_quantity !== null && product.stock_quantity <= 0)) {
      toast({
        variant: "destructive",  
        title: "Out of Stock",
        description: "This product is currently out of stock"
      });
      return;
    }

    if (product.stock_quantity !== null && quantity > product.stock_quantity) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${product.stock_quantity} units available`
      });
      return;
    }

    // Add to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image_url
      });
    }

    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart`
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign In Required",
        description: "Please sign in to make a purchase"
      });
      navigate('/auth');
      return;
    }

    if (!product) return;

    if (!product.in_stock || (product.stock_quantity !== null && product.stock_quantity <= 0)) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: "This product is currently out of stock"
      });
      return;
    }

    if (product.stock_quantity !== null && quantity > product.stock_quantity) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${product.stock_quantity} units available`
      });
      return;
    }

    // Store the item for checkout
    const checkoutItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity
    };

    sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
    navigate('/checkout');
  };

  const handleDarazRedirect = () => {
    if (product?.daraz_link) {
      window.open(product.daraz_link, '_blank');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isOutOfStock = !product.in_stock || (product.stock_quantity !== null && product.stock_quantity <= 0);
  const isLowStock = product.stock_quantity !== null && product.stock_quantity <= 10 && product.stock_quantity > 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-white rounded-lg overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  {product.trending && <Badge variant="default">Trending</Badge>}
                  {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
                  {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                <p className="text-2xl font-bold text-primary mt-2">
                  Rs. {product.price.toLocaleString()}
                </p>
                {product.stock_quantity !== null && (
                  <p className="text-sm text-gray-600 mt-1">
                    {product.stock_quantity} units available
                  </p>
                )}
              </div>

              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label className="font-semibold">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const maxQuantity = product.stock_quantity || 999;
                      setQuantity(Math.min(maxQuantity, quantity + 1));
                    }}
                    disabled={product.stock_quantity !== null && quantity >= product.stock_quantity}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {!user && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Please sign in to add items to cart or make a purchase
                      </span>
                    </div>
                    <Button
                      onClick={() => navigate('/auth')}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      Sign In / Sign Up
                    </Button>
                  </Card>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1"
                    disabled={isOutOfStock || !user}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    className="flex-1"
                    disabled={isOutOfStock || !user}
                  >
                    Buy Now
                  </Button>
                </div>

                {product.daraz_link && (
                  <Button
                    onClick={handleDarazRedirect}
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buy on Daraz
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Wishlist
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="mt-12">
            <CustomerReviews productId={product.id} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;
