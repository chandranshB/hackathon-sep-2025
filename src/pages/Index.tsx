import { useState, useEffect } from "react";
import Header from "@/components/Header";
import EnhancedPollutionMap from "@/components/EnhancedPollutionMap";
import ReportingSystem from "@/components/ReportingSystem";
import RouteGenerator from "@/components/RouteGenerator";
import NotificationCenter from "@/components/NotificationCenter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Users, Zap, MapPin } from "lucide-react";

// Types
export interface PollutionReport {
  id: string;
  userId: string;
  coordinates: [number, number];
  timestamp: string;
  images: string[];
  description: string;
  aiAnalysis: {
    pollutionLevel: number;
    pollutionTypes: ('smoke' | 'dust' | 'smog' | 'industrial' | 'vehicle' | 'burning')[];
    visibility: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    spreadRadius: number;
    confidence: number;
    duration: number;
  };
  weatherContext: WeatherData;
  trafficContext: TrafficData;
  verified: boolean;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  pressureMb: number;
}

export interface TrafficData {
  vehicleCount: number;
  averageSpeed: number;
  congestionLevel: number;
  heavyVehiclePercentage: number;
  idleTime: number;
}

export interface PollutionZone {
  id: string;
  name: string;
  coordinates: [number, number];
  aqi: number;
  level: 'excellent' | 'good' | 'moderate' | 'poor' | 'severe' | 'hazardous';
  reports: PollutionReport[];
  forecast: {
    next6h: number;
    next24h: number;
    trend: 'improving' | 'worsening' | 'stable';
    factors: string[];
  };
  heatmapIntensity: number;
  spreadRadius: number;
  lastUpdated: string;
}

const Index = () => {
  // Global state for the entire app
  const [pollutionZones, setPollutionZones] = useState<PollutionZone[]>([
    {
      id: "1",
      name: "Clock Tower, Dehradun",
      coordinates: [30.3165, 78.0322],
      aqi: 98,
      level: 'moderate',
      reports: [],
      forecast: { next6h: 92, next24h: 85, trend: 'improving', factors: ['reduced traffic', 'wind pickup'] },
      heatmapIntensity: 0.6,
      spreadRadius: 600,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "2",
      name: "ISBT Dehradun",
      coordinates: [30.3255, 78.0422],
      aqi: 156,
      level: 'poor',
      reports: [],
      forecast: { next6h: 165, next24h: 172, trend: 'worsening', factors: ['bus emissions', 'low wind'] },
      heatmapIntensity: 0.85,
      spreadRadius: 800,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "3",
      name: "Forest Research Institute",
      coordinates: [30.3346, 78.0669],
      aqi: 42,
      level: 'good',
      reports: [],
      forecast: { next6h: 45, next24h: 38, trend: 'improving', factors: ['forest buffer', 'clean air'] },
      heatmapIntensity: 0.3,
      spreadRadius: 400,
      lastUpdated: new Date().toISOString()
    },
    {
      id: "4",
      name: "Rajpur Road",
      coordinates: [30.3629, 78.0747],
      aqi: 124,
      level: 'poor',
      reports: [],
      forecast: { next6h: 135, next24h: 142, trend: 'worsening', factors: ['construction', 'traffic'] },
      heatmapIntensity: 0.75,
      spreadRadius: 700,
      lastUpdated: new Date().toISOString()
    }
  ]);

  const [notifications, setNotifications] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([30.3165, 78.0322]); // Default to Dehradun

  // Get user location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPollutionZones(zones => zones.map(zone => ({
        ...zone,
        aqi: Math.max(20, zone.aqi + (Math.random() - 0.5) * 5),
        lastUpdated: new Date().toISOString()
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Notification system
  useEffect(() => {
    const checkForAlerts = () => {
      pollutionZones.forEach(zone => {
        if (zone.aqi > 150 && !notifications.includes(zone.id)) {
          // Calculate distance to user
          const distance = calculateDistance(userLocation, zone.coordinates);
          if (distance < 5000) { // Within 5km
            setNotifications(prev => [...prev, zone.id]);
          }
        }
      });
    };

    checkForAlerts();
  }, [pollutionZones, userLocation, notifications]);

  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
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
  };

  const handleNewReport = (report: PollutionReport) => {
    // Add report to existing zone or create new zone
    const existingZoneIndex = pollutionZones.findIndex(zone => 
      calculateDistance(zone.coordinates, report.coordinates) < 1000 // Within 1km
    );

    if (existingZoneIndex >= 0) {
      // Add to existing zone
      setPollutionZones(zones => zones.map((zone, index) => 
        index === existingZoneIndex 
          ? { ...zone, reports: [...zone.reports, report], lastUpdated: new Date().toISOString() }
          : zone
      ));
    } else {
      // Create new zone
      const newZone: PollutionZone = {
        id: Date.now().toString(),
        name: `User Report ${pollutionZones.length + 1}`,
        coordinates: report.coordinates,
        aqi: report.aiAnalysis.pollutionLevel * 20,
        level: getAqiLevel(report.aiAnalysis.pollutionLevel * 20),
        reports: [report],
        forecast: {
          next6h: report.aiAnalysis.pollutionLevel * 20 * 1.1,
          next24h: report.aiAnalysis.pollutionLevel * 20 * 0.9,
          trend: report.aiAnalysis.severity === 'critical' ? 'worsening' : 'stable',
          factors: [`user report: ${report.aiAnalysis.pollutionTypes.join(', ')}`]
        },
        heatmapIntensity: report.aiAnalysis.pollutionLevel / 10,
        spreadRadius: report.aiAnalysis.spreadRadius,
        lastUpdated: new Date().toISOString()
      };
      
      setPollutionZones(zones => [...zones, newZone]);
    }
  };

  const getAqiLevel = (aqi: number): PollutionZone['level'] => {
    if (aqi <= 50) return 'excellent';
    if (aqi <= 100) return 'good';
    if (aqi <= 150) return 'moderate';
    if (aqi <= 200) return 'poor';
    if (aqi <= 300) return 'severe';
    return 'hazardous';
  };

  const cityAverageAQI = Math.round(
    pollutionZones.reduce((sum, zone) => sum + zone.aqi, 0) / pollutionZones.length
  );

  const totalReports = pollutionZones.reduce((sum, zone) => sum + zone.reports.length, 0);
  const liveZones = pollutionZones.filter(zone => 
    Date.now() - new Date(zone.lastUpdated).getTime() < 300000 // Updated in last 5 minutes
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* System Overview */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{totalReports}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Zap className="h-4 w-4 mr-1" />
                  AI Reports Processed
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{cityAverageAQI}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Average City AQI
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{pollutionZones.length}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Database className="h-4 w-4 mr-1" />
                  Monitored Zones
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{liveZones}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Users className="h-4 w-4 mr-1" />
                  Live Monitoring
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Map - Takes most space */}
          <div className="xl:col-span-3">
            <EnhancedPollutionMap 
              pollutionZones={pollutionZones}
              setPollutionZones={setPollutionZones}
              userLocation={userLocation}
            />
          </div>

          {/* Side Panel */}
          <div className="xl:col-span-1 space-y-6">
            <NotificationCenter 
              notifications={notifications}
              setNotifications={setNotifications}
              pollutionZones={pollutionZones}
            />
            
            <ReportingSystem 
              onNewReport={handleNewReport}
              userLocation={userLocation}
            />
          </div>
        </div>

        {/* Route Generator */}
        <RouteGenerator 
          pollutionZones={pollutionZones}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
};

export default Index;