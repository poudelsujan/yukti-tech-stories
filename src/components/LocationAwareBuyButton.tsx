
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, ExternalLink, AlertCircle } from 'lucide-react';
import { useLocationService } from '@/hooks/useLocationService';

interface LocationAwareBuyButtonProps {
  onBuyNow: () => void;
  darazLink?: string;
  className?: string;
  children?: React.ReactNode;
}

const LocationAwareBuyButton = ({ 
  onBuyNow, 
  darazLink, 
  className = '',
  children = 'Buy Now'
}: LocationAwareBuyButtonProps) => {
  const { location, isInKathmanduValley, loading, requestLocation } = useLocationService();
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const handleBuyClick = () => {
    if (!location) {
      setShowLocationDialog(true);
    } else if (isInKathmanduValley) {
      onBuyNow();
    } else {
      // Outside Kathmandu Valley - show Daraz option
      if (darazLink) {
        window.open(darazLink, '_blank');
      } else {
        setShowLocationDialog(true);
      }
    }
  };

  const handleLocationPermission = () => {
    requestLocation();
    setShowLocationDialog(false);
  };

  return (
    <>
      <Button 
        onClick={handleBuyClick}
        className={className}
        disabled={loading}
      >
        {loading ? (
          <>
            <MapPin className="h-4 w-4 mr-2 animate-pulse" />
            Detecting Location...
          </>
        ) : (
          children
        )}
      </Button>

      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Required
            </DialogTitle>
            <DialogDescription>
              We need your location to check if you're in our delivery area (Kathmandu Valley)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Why do we need location?</p>
                <p className="text-blue-700">
                  • Direct purchase: Available only in Kathmandu Valley<br/>
                  • Outside Valley: We'll redirect you to our Daraz store
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleLocationPermission} className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Allow Location Access
              </Button>
              
              {darazLink && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(darazLink, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Buy on Daraz Instead
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationAwareBuyButton;
