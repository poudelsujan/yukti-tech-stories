
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Package, Plus } from 'lucide-react';
import { sampleProducts } from '@/utils/sampleProducts';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  image_url: string | null;
  images: string[] | null;
  trending?: boolean;
  tags: string[] | null;
  in_stock: boolean | null;
  description?: string;
  daraz_link?: string;
}

const Products = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loadingSampleData, setLoadingSampleData] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    displayedItems: displayedProducts,
    hasMore,
    isLoadingMore,
    loadMore
  } = useInfiniteScroll({
    data: filteredProducts,
    itemsPerPage: 12,
    loading: loading
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const checkAdminRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data && !error);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true);

      if (error) throw error;
      
      const formattedProducts = data?.map(product => ({
        ...product,
        // Use first image from images array, fallback to image_url, then placeholder
        image: product.images && product.images.length > 0 
          ? product.images[0] 
          : product.image_url || '/placeholder.svg'
      })) || [];

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('name')
        .order('name');

      if (error) throw error;
      setCategories(data?.map(cat => cat.name) || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSampleProducts = async () => {
    setLoadingSampleData(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert(sampleProducts);

      if (error) throw error;

      toast({
        title: "Sample Products Added",
        description: `${sampleProducts.length} sample products have been added successfully.`
      });
      
      loadProducts();
    } catch (error: any) {
      console.error('Error loading sample products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load sample products"
      });
    } finally {
      setLoadingSampleData(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive range of high-quality products designed to meet your needs
          </p>
        </div>

        {/* Show sample data loader only to admin users if no products */}
        {products.length === 0 && isAdmin && (
          <div className="bg-white rounded-lg shadow p-6 mb-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-600 mb-4">Get started by adding some sample products to see how the store works.</p>
            <Button 
              onClick={loadSampleProducts} 
              disabled={loadingSampleData}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              {loadingSampleData ? 'Adding Sample Products...' : 'Add Sample Products'}
            </Button>
          </div>
        )}

        {/* Show message to non-admin users if no products */}
        {products.length === 0 && !isAdmin && (
          <div className="bg-white rounded-lg shadow p-6 mb-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-600">Products will be added soon. Please check back later.</p>
          </div>
        )}

        {/* Filters - only show if we have products */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results count */}
        {products.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {displayedProducts.length} of {filteredProducts.length} products
            </p>
          </div>
        )}

        {/* Products Grid */}
        {displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    image: product.images && product.images.length > 0 
                      ? product.images[0] 
                      : product.image_url || '/placeholder.svg',
                    images: product.images || []
                  }}
                />
              ))}
            </div>

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !isLoadingMore && (
              <div className="flex justify-center py-4">
                <Button onClick={loadMore} variant="outline">
                  Load More Products
                </Button>
              </div>
            )}

            {/* End of results */}
            {!hasMore && displayedProducts.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>You've reached the end of the products list</p>
              </div>
            )}
          </>
        ) : products.length > 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Products;
