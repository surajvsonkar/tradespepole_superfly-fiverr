// Geocoding service using OpenStreetMap Nominatim API (free, no API key required)
// For production with higher volume, consider using Google Maps Geocoding API

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  city?: string;
  country?: string;
}

export interface DistanceResult {
  distance: number; // in kilometers
  distanceMiles: number;
}

// Cache geocoding results to reduce API calls
const geocodeCache: Map<string, GeocodingResult> = new Map();

export const geocodingService = {
  // Geocode an address to coordinates
  geocodeAddress: async (address: string): Promise<GeocodingResult | null> => {
    // Check cache first
    const cacheKey = address.toLowerCase().trim();
    if (geocodeCache.has(cacheKey)) {
      return geocodeCache.get(cacheKey)!;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'User-Agent': 'TradespeopleApp/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result: GeocodingResult = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
          city: data[0].address?.city || data[0].address?.town || data[0].address?.village,
          country: data[0].address?.country
        };

        // Cache the result
        geocodeCache.set(cacheKey, result);
        return result;
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (lat: number, lng: number): Promise<GeocodingResult | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'TradespeopleApp/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.lat && data.lon) {
        return {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon),
          displayName: data.display_name,
          city: data.address?.city || data.address?.town || data.address?.village,
          country: data.address?.country
        };
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  },

  // Calculate distance between two points using Haversine formula
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number): DistanceResult => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const distanceMiles = distanceKm * 0.621371;

    return {
      distance: distanceKm,
      distanceMiles
    };
  },

  // Check if a point is within a radius from another point
  isWithinRadius: (
    centerLat: number,
    centerLng: number,
    pointLat: number,
    pointLng: number,
    radiusMiles: number
  ): boolean => {
    const { distanceMiles } = geocodingService.calculateDistance(
      centerLat,
      centerLng,
      pointLat,
      pointLng
    );
    return distanceMiles <= radiusMiles;
  },

  // Get user's current location
  getCurrentPosition: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  },

  // Generate UK mock coordinates for a location string (fallback when geocoding fails)
  getMockCoordinates: (location: string): { lat: number; lng: number } => {
    // UK city coordinates for common locations
    const ukCities: { [key: string]: { lat: number; lng: number } } = {
      'london': { lat: 51.5074, lng: -0.1278 },
      'manchester': { lat: 53.4808, lng: -2.2426 },
      'birmingham': { lat: 52.4862, lng: -1.8904 },
      'leeds': { lat: 53.8008, lng: -1.5491 },
      'liverpool': { lat: 53.4084, lng: -2.9916 },
      'bristol': { lat: 51.4545, lng: -2.5879 },
      'sheffield': { lat: 53.3811, lng: -1.4701 },
      'edinburgh': { lat: 55.9533, lng: -3.1883 },
      'glasgow': { lat: 55.8642, lng: -4.2518 },
      'cardiff': { lat: 51.4816, lng: -3.1791 },
      'belfast': { lat: 54.5973, lng: -5.9301 },
      'newcastle': { lat: 54.9783, lng: -1.6178 },
      'nottingham': { lat: 52.9548, lng: -1.1581 },
      'southampton': { lat: 50.9097, lng: -1.4044 },
      'brighton': { lat: 50.8225, lng: -0.1372 },
      'oxford': { lat: 51.7520, lng: -1.2577 },
      'cambridge': { lat: 52.2053, lng: 0.1218 },
      'york': { lat: 53.9591, lng: -1.0815 },
      'bath': { lat: 51.3811, lng: -2.3590 },
      'reading': { lat: 51.4543, lng: -0.9781 }
    };

    const locationLower = location.toLowerCase();
    
    // Check if location contains any known city
    for (const [city, coords] of Object.entries(ukCities)) {
      if (locationLower.includes(city)) {
        // Add small random offset for variety
        return {
          lat: coords.lat + (Math.random() - 0.5) * 0.05,
          lng: coords.lng + (Math.random() - 0.5) * 0.05
        };
      }
    }

    // Default to London with random offset if no match
    return {
      lat: 51.5074 + (Math.random() - 0.5) * 0.2,
      lng: -0.1278 + (Math.random() - 0.5) * 0.2
    };
  }
};

// Helper function to convert degrees to radians
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default geocodingService;

