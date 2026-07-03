/**
 * Cálculos geográficos para AgroConecta
 */

export interface LatLng {
    lat: number;
    lng: number;
}

/**
 * Calcula la distancia en kilómetros entre dos puntos usando la fórmula de Haversine
 */
export const calculateDistance = (p1: LatLng, p2: LatLng): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Formatea una distancia para mostrarla al usuario
 */
export const formatDistance = (distance: number): string => {
    if (distance < 1) {
        return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
};

/**
 * Filtra y ordena una lista por distancia a un punto de referencia
 */
export const sortByDistance = <T extends { location_ref_lat?: number, location_ref_lng?: number }>(
    items: T[], 
    ref: LatLng
): T[] => {
    return [...items].sort((a, b) => {
        if (!a.location_ref_lat || !b.location_ref_lat) return 0;
        const distA = calculateDistance(ref, { lat: a.location_ref_lat!, lng: a.location_ref_lng! });
        const distB = calculateDistance(ref, { lat: b.location_ref_lat!, lng: b.location_ref_lng! });
        return distA - distB;
    });
};
