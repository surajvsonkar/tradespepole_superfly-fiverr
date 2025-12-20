/**
 * Geocoding utility for converting postcodes to coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  city?: string;
  country?: string;
}

/**
 * Validate UK Postcode using regex
 */
export const isValidUKPostcode = (postcode: string): boolean => {
  const ukPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$/i;
  return ukPostcodeRegex.test(postcode.trim());
};

// Cache for geocoding results to reduce API calls
const geocodeCache: Map<string, GeocodingResult> = new Map();

// UK Postcode coordinates mapping for common areas (fallback)
const UK_POSTCODE_AREAS: { [key: string]: { lat: number; lng: number } } = {
  'W1': { lat: 51.5142, lng: -0.1494 }, // West End
  'W1K': { lat: 51.5128, lng: -0.1492 }, // Mayfair
  'SW1': { lat: 51.4975, lng: -0.1357 }, // Westminster
  'EC1': { lat: 51.5246, lng: -0.0992 }, // City
  'EC2': { lat: 51.5155, lng: -0.0868 }, // City
  'N1': { lat: 51.5465, lng: -0.1058 }, // Islington
  'NW1': { lat: 51.5343, lng: -0.1427 }, // Camden
  'SE1': { lat: 51.5045, lng: -0.0865 }, // Southwark
  'E1': { lat: 51.5187, lng: -0.0595 }, // East End
  'E14': { lat: 51.5077, lng: -0.0221 }, // Canary Wharf
  'WC1': { lat: 51.5235, lng: -0.1189 }, // Bloomsbury
  'WC2': { lat: 51.5115, lng: -0.1228 }, // Covent Garden
};

/**
 * Geocode a UK postcode to coordinates
 */
export const geocodePostcode = async (postcode: string): Promise<GeocodingResult | null> => {
  const normalizedPostcode = postcode.toUpperCase().trim();
  
  // Check cache first
  if (geocodeCache.has(normalizedPostcode)) {
    return geocodeCache.get(normalizedPostcode)!;
  }

  try {
    // Use OpenStreetMap Nominatim API
    const encodedPostcode = encodeURIComponent(normalizedPostcode + ', UK');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedPostcode}&limit=1&countrycodes=gb`,
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
      };

      // Cache the result
      geocodeCache.set(normalizedPostcode, result);
      return result;
    }

    // Fallback to postcode area lookup
    const postcodePrefix = normalizedPostcode.split(' ')[0];
    for (const [prefix, coords] of Object.entries(UK_POSTCODE_AREAS)) {
      if (postcodePrefix.startsWith(prefix) || prefix.startsWith(postcodePrefix)) {
        const result: GeocodingResult = {
          lat: coords.lat,
          lng: coords.lng,
          displayName: `${normalizedPostcode}, UK`,
        };
        geocodeCache.set(normalizedPostcode, result);
        return result;
      }
    }

    console.log(`Could not geocode postcode: ${postcode}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Try fallback on error
    const postcodePrefix = normalizedPostcode.split(' ')[0];
    for (const [prefix, coords] of Object.entries(UK_POSTCODE_AREAS)) {
      if (postcodePrefix.startsWith(prefix) || prefix.startsWith(postcodePrefix)) {
        return {
          lat: coords.lat,
          lng: coords.lng,
          displayName: `${normalizedPostcode}, UK`,
        };
      }
    }
    
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in miles
 */
export const calculateDistanceMiles = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if a point is within a radius from another point
 */
export const isWithinRadius = (
  centerLat: number,
  centerLng: number,
  pointLat: number,
  pointLng: number,
  radiusMiles: number
): boolean => {
  const distance = calculateDistanceMiles(centerLat, centerLng, pointLat, pointLng);
  return distance <= radiusMiles;
};

// Helper function to convert degrees to radians
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Default coordinates for W1K 3DE (Mayfair, London)
export const DEFAULT_POSTCODE = 'W1K 3DE';
export const DEFAULT_COORDS = { lat: 51.5128, lng: -0.1492 };
export const DEFAULT_JOB_RADIUS_MILES = 15;
