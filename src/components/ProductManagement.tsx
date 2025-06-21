import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Upload, Image, Package, ExternalLink } from 'lucide-react';
import SampleDataLoader from './SampleDataLoader';

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
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

const ProductManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discountCodes, setDiscountCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    daraz_link: '',
    tags: '',
    trending: false,
    in_stock: true
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadDiscountCodes();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products"
      });
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadDiscountCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('active', true)
        .order('code');

      if (error) throw error;
      setDiscountCodes(data || []);
    } catch (error) {
      console.error('Error loading discount codes:', error);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to upload image"
      });
      return null;
    }
  };

  const loadProductDiscounts = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_discounts')
        .select('discount_code_id')
        .eq('product_id', productId);

      if (error) throw error;
      setSelectedDiscounts(data?.map(pd => pd.discount_code_id) || []);
    } catch (error) {
      console.error('Error loading product discounts:', error);
    }
  };

  const saveProductDiscounts = async (productId: string) => {
    try {
      // First remove existing product discounts
      await supabase
        .from('product_discounts')
        .delete()
        .eq('product_id', productId);

      // Then add new ones
      if (selectedDiscounts.length > 0) {
        const discountData = selectedDiscounts.map(discountId => ({
          product_id: productId,
          discount_code_id: discountId
        }));

        const { error } = await supabase
          .from('product_discounts')
          .insert(discountData);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving product discounts:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = editingProduct?.image_url || null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: imageUrl,
        daraz_link: formData.daraz_link || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        trending: formData.trending,
        in_stock: formData.in_stock
      };

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;
        
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully"
        });
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
        
        toast({
          title: "Product Added",
          description: "Product has been added successfully"
        });
      }

      // Save product discounts
      await saveProductDiscounts(productId);

      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      daraz_link: product.daraz_link || '',
      tags: product.tags?.join(', ') || '',
      trending: product.trending || false,
      in_stock: product.in_stock !== false
    });
    await loadProductDiscounts(product.id);
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully"
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      daraz_link: '',
      tags: '',
      trending: false,
      in_stock: true
    });
    setEditingProduct(null);
    setShowAddForm(false);
    setImageFile(null);
    setSelectedDiscounts([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Sample Data Loader - Show only if no products exist */}
      {products.length === 0 && (
        <SampleDataLoader />
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
            <CardDescription>
              {editingProduct ? 'Update product information' : 'Fill in the details to add a new product'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rs.)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daraz_link">Daraz Link (Optional)</Label>
                <Input
                  id="daraz_link"
                  value={formData.daraz_link}
                  onChange={(e) => setFormData({...formData, daraz_link: e.target.value})}
                  placeholder="https://www.daraz.pk/products/..."
                />
                <p className="text-xs text-gray-500">
                  Add a Daraz link to redirect customers to purchase on Daraz
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="electronics, smartphone, android"
                />
              </div>

              {/* Discount Codes Selection */}
              {discountCodes.length > 0 && (
                <div className="space-y-2">
                  <Label>Apply Discount Codes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {discountCodes.map((discount) => (
                      <div key={discount.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`discount-${discount.id}`}
                          checked={selectedDiscounts.includes(discount.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDiscounts([...selectedDiscounts, discount.id]);
                            } else {
                              setSelectedDiscounts(selectedDiscounts.filter(id => id !== discount.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`discount-${discount.id}`} className="text-sm">
                          {discount.code} ({discount.discount_type === 'percentage' ? `${discount.discount_value}%` : `Rs.${discount.discount_value}`})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="trending"
                    checked={formData.trending}
                    onCheckedChange={(checked) => setFormData({...formData, trending: checked})}
                  />
                  <Label htmlFor="trending">Trending</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="in_stock"
                    checked={formData.in_stock}
                    onCheckedChange={(checked) => setFormData({...formData, in_stock: checked})}
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Add Product')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding some sample products or create your own.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>External Links</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>Rs. {product.price.toLocaleString()}</TableCell>
                    <TableCell>
                      {product.daraz_link && (
                        <a 
                          href={product.daraz_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Daraz
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.trending && <Badge variant="secondary">Trending</Badge>}
                        <Badge variant={product.in_stock ? "default" : "destructive"}>
                          {product.in_stock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;
