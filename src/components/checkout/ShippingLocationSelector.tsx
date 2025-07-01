
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import LocationSelector from '@/components/LocationSelector';

interface ShippingLocationSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  selectedLocation?: { lat: number; lng: number; address: string };
}

const ShippingLocationSelector = ({ onLocationSelect, selectedLocation }: ShippingLocationSelectorProps) => {
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    onLocationSelect(location);
    setShowLocationSelector(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        <h3 className="font-medium">Delivery Location</h3>
      </div>

      {selectedLocation ? (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="font-medium">Selected Location:</div>
              <div className="text-sm text-gray-600">
                {selectedLocation.address}
              </div>
              <div className="text-xs text-gray-500">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLocationSelector(true)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Change Location
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button 
          onClick={() => setShowLocationSelector(true)}
          variant="outline"
          className="w-full"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Select Delivery Location
        </Button>
      )}

      {showLocationSelector && (
        <LocationSelector 
          onLocationSelect={handleLocationSelect}
          initialLocation={selectedLocation}
        />
      )}
    </div>
  );
};

export default ShippingLocationSelector;
