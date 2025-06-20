
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LogIn } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface ReviewsHeaderProps {
  user: User | null;
  reviewCount: number;
  onAddReview: () => void;
}

const ReviewsHeader = ({ user, reviewCount, onAddReview }: ReviewsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Customer Stories</h3>
        <p className="text-gray-600">
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </p>
      </div>
      {user ? (
        <Button onClick={onAddReview} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Review
        </Button>
      ) : (
        <Button variant="outline" onClick={() => window.location.href = '/auth'} className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Sign In to Review
        </Button>
      )}
    </div>
  );
};

export default ReviewsHeader;
