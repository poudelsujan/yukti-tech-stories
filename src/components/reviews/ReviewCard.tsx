
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, MapPin } from 'lucide-react';

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  location: string | null;
  verified_purchase: boolean;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{review.customer_name}</h4>
              {review.verified_purchase && (
                <Badge variant="secondary" className="text-xs">
                  Verified Purchase
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(review.created_at)}
              </div>
              {review.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {review.location}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
