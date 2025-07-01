
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string };
}

const LocationSelector = ({ onLocationSelect, initialLocation }: LocationSelectorProps) => {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    // Get user's current location on component mount
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Initialize map when Google Maps loads
    if (window.google && mapRef.current && !map) {
      initializeMap();
    }
  }, [currentLocation, map]);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          reverseGeocode(location);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not get current location. Please enter address manually."
          });
          // Default to Karachi, Pakistan
          setCurrentLocation({ lat: 24.8607, lng: 67.0011 });
          setIsLoadingLocation(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation."
      });
      setCurrentLocation({ lat: 24.8607, lng: 67.0011 });
      setIsLoadingLocation(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !currentLocation) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: currentLocation,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const newMarker = new google.maps.Marker({
      position: currentLocation,
      map: newMap,
      draggable: true,
      title: 'Delivery Location'
    });

    newMarker.addListener('dragend', () => {
      const position = newMarker.getPosition();
      if (position) {
        const location = { lat: position.lat(), lng: position.lng() };
        reverseGeocode(location);
      }
    });

    newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const location = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        newMarker.setPosition(location);
        reverseGeocode(location);
      }
    });

    setMap(newMap);
    setMarker(newMarker);
  };

  const reverseGeocode = async (location: { lat: number; lng: number }) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({
        location: location
      });

      if (response.results && response.results[0]) {
        const formattedAddress = response.results[0].formatted_address;
        setAddress(formattedAddress);
        onLocationSelect({
          ...location,
          address: formattedAddress
        });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const searchAddress = async () => {
    if (!address.trim()) return;

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({
        address: address
      });

      if (response.results && response.results[0]) {
        const location = response.results[0].geometry.location;
        const newLocation = { lat: location.lat(), lng: location.lng() };
        
        setCurrentLocation(newLocation);
        
        if (map && marker) {
          map.setCenter(newLocation);
          marker.setPosition(newLocation);
        }
        
        onLocationSelect({
          ...newLocation,
          address: response.results[0].formatted_address
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: "Could not find the specified address."
      });
    }
  };

  // Simple fallback map (if Google Maps not available)
  const SimpleFallbackMap = () => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Map loading...</p>
        <p className="text-xs text-gray-500">Please enter your address manually below</p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Delivery Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="w-full h-64">
          {window.google && window.google.maps ? (
            <div ref={mapRef} className="w-full h-full rounded-lg" />
          ) : (
            <SimpleFallbackMap />
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              variant="outline"
              size="sm"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter delivery address"
                onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
              />
              <Button onClick={searchAddress} size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {currentLocation && (
            <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
              <strong>Selected Location:</strong><br />
              Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}<br />
              {address && <span>Address: {address}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSelector;
