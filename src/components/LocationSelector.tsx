
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';

interface LocationSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string } | null;
}

const LocationSelector = ({ onLocationSelect, initialLocation }: LocationSelectorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    initialLocation || null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && window.google) {
      const defaultCenter = initialLocation || { lat: 27.7172, lng: 85.3240 }; // Kathmandu
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const markerInstance = new window.google.maps.Marker({
        position: defaultCenter,
        map: mapInstance,
        draggable: true,
        title: 'Delivery Location'
      });

      mapInstance.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        markerInstance.setPosition({ lat, lng });
        
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const location = {
              lat,
              lng,
              address: results[0].formatted_address
            };
            setSelectedLocation(location);
          }
        });
      });

      markerInstance.addListener('dragend', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const location = {
              lat,
              lng,
              address: results[0].formatted_address
            };
            setSelectedLocation(location);
          }
        });
      });

      setMap(mapInstance);
      setMarker(markerInstance);

      if (initialLocation) {
        setSelectedLocation(initialLocation);
      }
    }
  }, [isLoaded, initialLocation]);

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (map && marker && window.google) {
            map.setCenter({ lat, lng });
            marker.setPosition({ lat, lng });
            
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              if (status === 'OK' && results && results[0]) {
                const location = {
                  lat,
                  lng,
                  address: results[0].formatted_address
                };
                setSelectedLocation(location);
              }
            });
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <p>Loading map...</p>
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
          <Button onClick={getCurrentLocation} variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Use Current Location
          </Button>
        </div>
        
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-md border"
          style={{ minHeight: '256px' }}
        />
        
        {selectedLocation && (
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">Selected Location:</p>
              <p className="text-sm text-gray-600">{selectedLocation.address}</p>
              <p className="text-xs text-gray-500">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
            
            <Button onClick={handleConfirmLocation} className="w-full">
              Confirm Location
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationSelector;
