
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
}

const LocationSelector = ({ onLocationSelect, selectedLocation }: LocationSelectorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Default to Kathmandu, Nepal coordinates
  const defaultLocation = { lat: 27.7172, lng: 85.3240 };

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleMapsLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      toast({
        variant: "destructive",
        title: "Maps Error",
        description: "Failed to load Google Maps. Please try again later."
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [toast]);

  useEffect(() => {
    if (isGoogleMapsLoaded && mapRef.current && !map) {
      initializeMap();
    }
  }, [isGoogleMapsLoaded, map]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const initialLocation = selectedLocation || defaultLocation;
    
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: initialLocation,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const markerInstance = new google.maps.Marker({
      position: initialLocation,
      map: mapInstance,
      draggable: true,
      title: 'Delivery Location'
    });

    // Add click listener for map
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateMarkerPosition(lat, lng);
      }
    });

    // Add drag listener for marker
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        updateMarkerPosition(lat, lng);
      }
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    // Get current location if available
    getCurrentLocation();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateMarkerPosition(lat, lng);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not get your current location. Using default location."
          });
        }
      );
    }
  };

  const updateMarkerPosition = async (lat: number, lng: number) => {
    if (!marker || !map) return;

    marker.setPosition({ lat, lng });
    map.setCenter({ lat, lng });

    // Get address from coordinates
    try {
      const address = await reverseGeocode(lat, lng);
      onLocationSelect({ lat, lng, address });
    } catch (error) {
      console.error('Error getting address:', error);
      onLocationSelect({ lat, lng, address: 'Unknown location' });
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    if (!window.google) throw new Error('Google Maps not loaded');

    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });
  };

  const searchLocation = async () => {
    if (!searchQuery.trim() || !window.google) return;

    setLoading(true);
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setLoading(false);
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        updateMarkerPosition(lat, lng);
      } else {
        toast({
          variant: "destructive",
          title: "Search Failed",
          description: "Could not find the specified location."
        });
      }
    });
  };

  if (!isGoogleMapsLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Loading Map...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Delivery Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
          />
          <Button onClick={searchLocation} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>
        
        <div className="relative">
          <div ref={mapRef} className="h-64 w-full rounded-md border" />
          <Button
            onClick={getCurrentLocation}
            disabled={loading}
            className="absolute top-2 right-2 z-10"
            size="sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'My Location'}
          </Button>
        </div>

        {selectedLocation && (
          <div className="text-sm text-gray-600">
            <p><strong>Selected Location:</strong></p>
            <p>{selectedLocation.address}</p>
            <p>Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationSelector;
