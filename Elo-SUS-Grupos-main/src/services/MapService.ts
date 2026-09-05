
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface Coordinates {
    lat: number;
    lng: number;
}

interface TerritorialRisk {
    level: 'normal' | 'warning' | 'critical';
    tags: string[];
    distanceKm?: number;
}

export const MapService = {
    /**
     * Converts an address string into Latitude/Longitude.
     * Uses Google Geocoding API.
     */
    async getCoordinates(address: string): Promise<Coordinates | null> {
        if (!GOOGLE_MAPS_API_KEY) {
            console.warn('MapService: API Key is missing.');
            return null;
        }

        try {
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                return { lat, lng };
            }

            console.warn('MapService: No results for address', address);
            return null;
        } catch (error) {
            console.error('MapService: Geocoding error', error);
            return null;
        }
    },

    /**
     * Calculates driving distance between two addresses.
     * Uses Google Distance Matrix API.
     */
    async calculateDistance(origin: string, destination: string): Promise<number | null> {
        if (!GOOGLE_MAPS_API_KEY) return null;

        try {
            // Using a simple fetch wrapper. Note: Distance Matrix is strictly server-side by default 
            // due to CORS, but if client-side is enabled in GCP console, this works. 
            // Otherwise, we might need a proxy. For this demo, assuming client allowed.
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();

            if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
                const distanceMeters = data.rows[0].elements[0].distance.value;
                return Math.round(distanceMeters / 1000); // Return in km
            }
            return null;
        } catch (error) {
            console.error('MapService: Distance error', error);
            return null;
        }
    },

    /**
     * Analyzes distance to determine risk based on SUS logic (SAS/MS nº 55/1999).
     */
    analyzeTerritorialRisk(distanceKm: number): TerritorialRisk {
        const risk: TerritorialRisk = {
            level: 'normal',
            tags: [],
            distanceKm
        };

        if (distanceKm > 50) {
            risk.level = 'critical';
            risk.tags.push('TFD - Tratamento Fora de Domicílio');
        } else if (distanceKm > 15) {
            risk.level = 'warning';
            risk.tags.push('Risco de Evasão por Transporte');
        }

        return risk;
    }
};
