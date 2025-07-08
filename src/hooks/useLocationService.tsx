
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationServiceResult {
  location: Location | null;
  isInKathmanduValley: boolean;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

export const useLocationService = (): LocationServiceResult => {
  const { toast } = useToast();
  const [location, setLocation] = useState<Location | null>(null);
  const [isInKathmanduValley, setIsInKathmanduValley] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kathmandu Valley approximate boundaries
  const kathmanduBounds = {
    north: 27.8000,
    south: 27.6000,
    east: 85.5000,
    west: 85.2000
  };

  const checkIfInKathmanduValley = (lat: number, lng: number): boolean => {
    return (
      lat >= kathmanduBounds.south &&
      lat <= kathmanduBounds.north &&
      lng >= kathmanduBounds.west &&
      lng <= kathmanduBounds.east
    );
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      toast({
        variant: "destructive",
        title: "Location Not Supported",
        description: "Your browser doesn't support location services. Buy Now feature is not available."
      });
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setLocation(newLocation);
        const inValley = checkIfInKathmanduValley(latitude, longitude);
        setIsInKathmanduValley(inValley);
        
        console.log('Location detected:', newLocation);
        console.log('In Kathmandu Valley:', inValley);
        
        if (!inValley) {
          toast({
            title: "Outside Delivery Area",
            description: "You're outside Kathmandu Valley. Please check our Daraz store for delivery options.",
            variant: "destructive"
          });
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(error.message);
        setLoading(false);
        
        toast({
          variant: "destructive",
          title: "Location Access Denied",
          description: "Please allow location access to use Buy Now feature, or check our Daraz store."
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return {
    location,
    isInKathmanduValley,
    loading,
    error,
    requestLocation
  };
};
