import { useState, useEffect } from 'react';

interface AQIData {
  aqi: number;
  level: string;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  recommendation: string;
  healthIndex: string;
  lastUpdated: string;
}

interface UseAQIProps {
  latitude?: number;
  longitude?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useAQI = ({ 
  latitude, 
  longitude, 
  autoRefresh = true, 
  refreshInterval = 300000 // 5 minutes
}: UseAQIProps) => {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAQILevel = (aqi: number): string => {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'poor';
    if (aqi <= 200) return 'severe';
    if (aqi <= 300) return 'very poor';
    return 'hazardous';
  };

  const getHealthRecommendation = (aqi: number, level: string): string => {
    const recommendations = {
      good: 'Air quality is ideal for outdoor activities.',
      moderate: 'Acceptable for most people. Sensitive individuals should consider limiting outdoor exertion.',
      poor: 'Sensitive groups should reduce outdoor activities. Others should limit prolonged outdoor exertion.',
      severe: 'Everyone should reduce outdoor activities. Sensitive groups should avoid outdoor activities.',
      'very poor': 'Everyone should avoid outdoor activities. Stay indoors and keep windows closed.',
      hazardous: 'Emergency conditions. Everyone should avoid all outdoor activities.'
    };
    return recommendations[level as keyof typeof recommendations] || 'Monitor air quality conditions.';
  };

  const getHealthIndex = (aqi: number): string => {
    if (aqi <= 50) return 'Excellent';
    if (aqi <= 100) return 'Good';
    if (aqi <= 150) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    if (aqi <= 300) return 'Very Poor';
    return 'Hazardous';
  };

  const simulateRealAQI = (lat: number, lng: number): AQIData => {
    // Real-world inspired AQI simulation based on location
    const cityData = [
      { name: "New Delhi", lat: 28.6139, lng: 77.2090, baseAQI: 160, pm25: 95 },
      { name: "Dehradun", lat: 30.3165, lng: 78.0322, baseAQI: 85, pm25: 45 },
      { name: "Mumbai", lat: 19.0760, lng: 72.8777, baseAQI: 120, pm25: 70 },
      { name: "Bangalore", lat: 12.9716, lng: 77.5946, baseAQI: 95, pm25: 55 },
      { name: "Chennai", lat: 13.0827, lng: 80.2707, baseAQI: 110, pm25: 65 },
    ];

    // Find closest city or use default
    const defaultCity = { baseAQI: 100, pm25: 60 };
    let closestCity = defaultCity;
    let minDistance = Infinity;

    for (const city of cityData) {
      const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    // Add realistic variation (±15 AQI units)
    const variation = Math.floor(Math.random() * 30) - 15;
    const currentAQI = Math.max(1, closestCity.baseAQI + variation);
    const level = getAQILevel(currentAQI);

    // Calculate realistic pollutant levels
    const pm25 = Math.max(1, closestCity.pm25 + (variation * 0.6));
    const pm10 = pm25 * 1.8;
    const o3 = Math.floor(Math.random() * 100) + 20;
    const no2 = Math.floor(Math.random() * 50) + 10;
    const so2 = Math.floor(Math.random() * 30) + 5;
    const co = Math.floor(Math.random() * 2000) + 500;

    return {
      aqi: Math.round(currentAQI),
      level,
      pollutants: {
        pm25: Math.round(pm25),
        pm10: Math.round(pm10),
        o3: Math.round(o3),
        no2: Math.round(no2),
        so2: Math.round(so2),
        co: Math.round(co)
      },
      recommendation: getHealthRecommendation(currentAQI, level),
      healthIndex: getHealthIndex(currentAQI),
      lastUpdated: new Date().toISOString()
    };
  };

  const fetchAQI = async () => {
    if (!latitude || !longitude) return;

    setLoading(true);
    setError(null);

    try {
      // In a real app, you would call actual AQI APIs here:
      // 1. OpenWeatherMap Air Pollution API
      // 2. WAQI (World Air Quality Index) API
      // 3. Government APIs (EPA, CPCB, etc.)
      
      // For now, simulate realistic data
      const data = simulateRealAQI(latitude, longitude);
      setAqiData(data);
    } catch (err) {
      setError('Failed to fetch air quality data');
      console.error('AQI fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchAQI();
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (autoRefresh && latitude && longitude) {
      const interval = setInterval(fetchAQI, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, latitude, longitude]);

  return {
    aqiData,
    loading,
    error,
    refetch: fetchAQI
  };
};