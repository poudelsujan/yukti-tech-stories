
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sampleProducts } from '@/utils/sampleProducts';
import { Package, Plus } from 'lucide-react';

const SampleDataLoader = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const loadSampleProducts = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert(sampleProducts);

      if (error) throw error;

      toast({
        title: "Sample Products Added",
        description: `${sampleProducts.length} sample products have been added successfully.`
      });
    } catch (error: any) {
      console.error('Error loading sample products:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load sample products"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Sample Data
        </CardTitle>
        <CardDescription>
          Add sample products to test the application functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={loadSampleProducts} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {loading ? 'Adding Products...' : 'Add Sample Products'}
        </Button>
        <p className="text-sm text-gray-600 mt-2">
          This will add {sampleProducts.length} sample products to your database.
        </p>
      </CardContent>
    </Card>
  );
};

export default SampleDataLoader;
