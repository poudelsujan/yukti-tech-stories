
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import type { Review } from '@/components/reviews/ReviewCard';
import type { ReviewFormData } from '@/components/reviews/ReviewForm';

export const useReviews = (productId: string) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (formData: ReviewFormData, user: User) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to add a review."
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('customer_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          customer_name: formData.customer_name,
          rating: formData.rating,
          comment: formData.comment,
          location: formData.location || null
        });

      if (error) throw error;

      toast({
        title: "Review Added",
        description: "Your review has been added successfully!"
      });

      loadReviews();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add review"
      });
    }
  };

  return {
    reviews,
    loading,
    addReview,
    loadReviews
  };
};
