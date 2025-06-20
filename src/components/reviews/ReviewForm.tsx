
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface ReviewFormProps {
  user: User;
  onSubmit: (formData: ReviewFormData) => Promise<void>;
  onCancel: () => void;
}

export interface ReviewFormData {
  customer_name: string;
  rating: number;
  comment: string;
  location: string;
}

const ReviewForm = ({ user, onSubmit, onCancel }: ReviewFormProps) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    customer_name: user.user_metadata?.full_name || user.email || '',
    rating: 5,
    comment: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>Tell others about your experience with this product</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Your Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({...formData, rating: i + 1})}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      i < formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              placeholder="Share your experience with this product..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Submit Review</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
