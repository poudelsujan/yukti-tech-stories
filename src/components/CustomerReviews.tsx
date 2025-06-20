
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import ReviewsHeader from '@/components/reviews/ReviewsHeader';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewsList from '@/components/reviews/ReviewsList';

interface CustomerReviewsProps {
  productId: string;
}

const CustomerReviews = ({ productId }: CustomerReviewsProps) => {
  const { user } = useAuth();
  const { reviews, loading, addReview } = useReviews(productId);
  const [showAddReview, setShowAddReview] = useState(false);

  const handleAddReview = async (formData: any) => {
    if (!user) return;
    
    await addReview(formData, user);
    setShowAddReview(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReviewsHeader 
        user={user}
        reviewCount={reviews.length}
        onAddReview={() => setShowAddReview(true)}
      />

      {showAddReview && user && (
        <ReviewForm
          user={user}
          onSubmit={handleAddReview}
          onCancel={() => setShowAddReview(false)}
        />
      )}

      <ReviewsList reviews={reviews} />
    </div>
  );
};

export default CustomerReviews;
