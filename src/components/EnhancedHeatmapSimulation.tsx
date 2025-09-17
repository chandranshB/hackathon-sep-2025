import { useEffect, useState } from 'react';

interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
}

interface TrafficConditions {
  vehicleCount: number;
  averageSpeed: number;
  congestionLevel: number;
  heavyVehiclePercentage: number;
  idlingTime: number;
}

interface PollutionSource {
  id: string;
  coordinates: [number, number];
  type: 'industrial' | 'traffic' | 'construction' | 'burning' | 'dust';
  intensity: number;
  radius: number;
}

interface HeatmapPoint {
  coordinates: [number, number];
  intensity: number;
  pollutionLevel: number;
  dominantSources: string[];
}

class PollutionSimulator {
  private weatherConditions: WeatherConditions;
  private trafficConditions: TrafficConditions;
  private pollutionSources: PollutionSource[];
  
  constructor() {
    // Initialize with realistic conditions for Dehradun
    this.weatherConditions = {
      temperature: 28, // °C
      humidity: 65, // %
      windSpeed: 2.5, // m/s
      windDirection: 225, // degrees (SW wind)
      pressure: 1013, // hPa
      visibility: 8000 // meters
    };
    
    this.trafficConditions = {
      vehicleCount: 1200,
      averageSpeed: 25, // km/h
      congestionLevel: 0.7, // 0-1 scale
      heavyVehiclePercentage: 0.15,
      idlingTime: 180 // seconds average
    };
    
    this.pollutionSources = [
      {
        id: 'clock_tower_traffic',
        coordinates: [30.3165, 78.0322],
        type: 'traffic',
        intensity: 0.8,
        radius: 600
      },
      {
        id: 'isbt_buses',
        coordinates: [30.3255, 78.0422],
        type: 'traffic',
        intensity: 0.9,
        radius: 800
      },
      {
        id: 'rajpur_road_construction',
        coordinates: [30.3629, 78.0747],
        type: 'construction',
        intensity: 0.75,
        radius: 500
      },
      {
        id: 'industrial_area',
        coordinates: [30.3100, 78.0200],
        type: 'industrial',
        intensity: 0.85,
        radius: 1200
      }
    ];
  }

  updateWeatherConditions(weather: Partial<WeatherConditions>) {
    this.weatherConditions = { ...this.weatherConditions, ...weather };
  }

  updateTrafficConditions(traffic: Partial<TrafficConditions>) {
    this.trafficConditions = { ...this.trafficConditions, ...traffic };
  }

  // Simulate pollution dispersion based on wind
  private calculateWindDispersion(
    sourceCoords: [number, number],
    targetCoords: [number, number],
    intensity: number
  ): number {
    const distance = this.calculateDistance(sourceCoords, targetCoords);
    const windEffect = this.getWindEffect(sourceCoords, targetCoords);
    
    // Pollution decreases with distance and is affected by wind
    const baseDispersion = Math.exp(-distance / 1000) * intensity;
    return baseDispersion * windEffect;
  }

  private getWindEffect(source: [number, number], target: [number, number]): number {
    // Calculate if target is downwind from source
    const bearing = this.calculateBearing(source, target);
    const windDirection = this.weatherConditions.windDirection;
    
    // Normalize angle difference
    let angleDiff = Math.abs(bearing - windDirection);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    
    // Pollution is higher downwind (within ±45 degrees)
    if (angleDiff < 45) {
      return 1.0 + (this.weatherConditions.windSpeed / 10); // Stronger wind = more spread
    } else if (angleDiff < 90) {
      return 0.8; // Partial wind effect
    } else {
      return 0.5; // Upwind areas have less pollution
    }
  }

  private calculateBearing(from: [number, number], to: [number, number]): number {
    const lat1 = (from[0] * Math.PI) / 180;
    const lat2 = (to[0] * Math.PI) / 180;
    const deltaLng = ((to[1] - from[1]) * Math.PI) / 180;
    
    const x = Math.sin(deltaLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    let bearing = Math.atan2(x, y) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = point1[0] * Math.PI / 180;
    const lat2 = point2[0] * Math.PI / 180;
    const deltaLat = (point2[0] - point1[0]) * Math.PI / 180;
    const deltaLng = (point2[1] - point1[1]) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }

  // Generate realistic pollution hotspots
  generateHeatmapData(bounds: [[number, number], [number, number]], resolution: number = 50): HeatmapPoint[] {
    const points: HeatmapPoint[] = [];
    const [[minLat, minLng], [maxLat, maxLng]] = bounds;
    
    const latStep = (maxLat - minLat) / resolution;
    const lngStep = (maxLng - minLng) / resolution;
    
    for (let lat = minLat; lat <= maxLat; lat += latStep) {
      for (let lng = minLng; lng <= maxLng; lng += lngStep) {
        const point: [number, number] = [lat, lng];
        let totalIntensity = 0;
        let pollutionLevel = 0;
        const dominantSources: string[] = [];
        
        // Calculate pollution from each source
        this.pollutionSources.forEach(source => {
          const distance = this.calculateDistance(source.coordinates, point);
          
          if (distance <= source.radius) {
            const dispersion = this.calculateWindDispersion(source.coordinates, point, source.intensity);
            
            // Apply weather modifiers
            let weatherModifier = 1;
            
            // High humidity traps pollution
            if (this.weatherConditions.humidity > 70) {
              weatherModifier *= 1.3;
            }
            
            // Low wind speed means less dispersion
            if (this.weatherConditions.windSpeed < 2) {
              weatherModifier *= 1.4;
            }
            
            // Temperature inversion effects
            if (this.weatherConditions.temperature < 15) {
              weatherModifier *= 1.2; // Cool air traps pollution
            }
            
            // Apply traffic conditions for traffic sources
            if (source.type === 'traffic') {
              const trafficMultiplier = 
                (this.trafficConditions.congestionLevel * 1.5) +
                (this.trafficConditions.heavyVehiclePercentage * 2) +
                (this.trafficConditions.idlingTime / 300);
              weatherModifier *= Math.min(trafficMultiplier, 2.5);
            }
            
            const finalIntensity = dispersion * weatherModifier;
            
            if (finalIntensity > 0.1) {
              totalIntensity += finalIntensity;
              dominantSources.push(source.type);
            }
          }
        });
        
        // Add some random variation for realism
        const randomFactor = 0.8 + (Math.random() * 0.4); // ±20% variation
        totalIntensity *= randomFactor;
        
        // Convert to AQI-like scale (0-500)
        pollutionLevel = Math.min(totalIntensity * 300, 500);
        
        if (pollutionLevel > 10) { // Only include significant pollution areas
          points.push({
            coordinates: point,
            intensity: Math.min(totalIntensity, 1.0),
            pollutionLevel,
            dominantSources: [...new Set(dominantSources)] // Remove duplicates
          });
        }
      }
    }
    
    return points;
  }

  // Simulate real-time changes
  updateSimulation() {
    const hour = new Date().getHours();
    
    // Adjust traffic based on time of day
    if (hour >= 7 && hour <= 10) { // Morning rush
      this.trafficConditions.congestionLevel = 0.9;
      this.trafficConditions.vehicleCount = 2000;
    } else if (hour >= 17 && hour <= 20) { // Evening rush
      this.trafficConditions.congestionLevel = 0.85;
      this.trafficConditions.vehicleCount = 1800;
    } else if (hour >= 22 || hour <= 6) { // Night
      this.trafficConditions.congestionLevel = 0.2;
      this.trafficConditions.vehicleCount = 300;
    } else { // Regular hours
      this.trafficConditions.congestionLevel = 0.6;
      this.trafficConditions.vehicleCount = 1200;
    }

    // Simulate wind changes
    this.weatherConditions.windDirection += (Math.random() - 0.5) * 10;
    this.weatherConditions.windSpeed += (Math.random() - 0.5) * 0.5;
    this.weatherConditions.windSpeed = Math.max(0.5, Math.min(15, this.weatherConditions.windSpeed));
    
    // Humidity changes
    this.weatherConditions.humidity += (Math.random() - 0.5) * 5;
    this.weatherConditions.humidity = Math.max(30, Math.min(95, this.weatherConditions.humidity));
  }
}

export const useEnhancedHeatmapSimulation = () => {
  const [simulator] = useState(() => new PollutionSimulator());
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  
  useEffect(() => {
    // Generate initial data for Dehradun area
    const dehradunBounds: [[number, number], [number, number]] = [
      [30.30, 78.00], // Southwest corner
      [30.37, 78.08]  // Northeast corner
    ];
    
    const generateData = () => {
      simulator.updateSimulation();
      const newData = simulator.generateHeatmapData(dehradunBounds, 30);
      setHeatmapData(newData);
    };
    
    // Generate initial data
    generateData();
    
    // Update every 30 seconds
    const interval = setInterval(generateData, 30000);
    
    return () => clearInterval(interval);
  }, [simulator]);
  
  return {
    heatmapData,
    simulator
  };
};