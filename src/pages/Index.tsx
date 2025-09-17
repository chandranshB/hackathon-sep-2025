import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SuperEnhancedPollutionMap from "@/components/SuperEnhancedPollutionMap";
import ReportingSystem from "@/components/ReportingSystem";
import RouteGenerator from "@/components/RouteGenerator";
import NotificationCenter from "@/components/NotificationCenter";
import RewardSystem from "@/components/RewardSystem";
import Leaderboard from "@/components/Leaderboard";
import EnhancedBottomNavigation from "@/components/EnhancedBottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Users, 
  Zap, 
  MapPin, 
  LogIn,
  Trophy,
  BarChart,
  Camera,
  Navigation,
  Activity,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('map');
  
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading AirWatch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 transition-colors duration-300">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Authentication Banner */}
        {!isAuthenticated && (
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 animate-fade-in">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Join AirWatch Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign in to save locations, get personalized alerts, and contribute to air quality monitoring.
                  </p>
                </div>
                <Button onClick={() => navigate('/auth')} className="hover-scale">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Overview */}
        <Card className="hover-scale smooth-transition">
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

        {/* Main Content Tabs - Desktop Only */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Map</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span>Report</span>
              </TabsTrigger>
              <TabsTrigger value="route" className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                <span>Routes</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2 hidden lg:flex">
                <BarChart className="h-4 w-4" />
                <span>Stats</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2 hidden lg:flex">
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="rewards" className="flex items-center gap-2 hidden lg:flex">
                <TrendingUp className="h-4 w-4" />
                <span>Rewards</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Map - Takes most space */}
                <div className="xl:col-span-3">
                  <SuperEnhancedPollutionMap 
                    pollutionZones={pollutionZones}
                    setPollutionZones={setPollutionZones}
                    userLocation={userLocation}
                  />
                </div>

                {/* Side Panel */}
                <div className="xl:col-span-1 space-y-4">
                  <NotificationCenter 
                    notifications={notifications}
                    setNotifications={setNotifications}
                    pollutionZones={pollutionZones}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="report" className="space-y-6">
              <ReportingSystem 
                onNewReport={handleNewReport}
                userLocation={userLocation}
              />
            </TabsContent>

            <TabsContent value="route" className="space-y-6">
              <RouteGenerator 
                pollutionZones={pollutionZones}
                userLocation={userLocation}
              />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover-scale">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Pollution Trends</h3>
                    <div className="space-y-3">
                      {pollutionZones.map(zone => (
                        <div key={zone.id} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{zone.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={zone.level === 'good' ? 'default' : 'destructive'}>
                              {zone.aqi}
                            </Badge>
                            <div className={`text-xs ${zone.forecast.trend === 'improving' ? 'text-success' : 'text-destructive'}`}>
                              {zone.forecast.trend === 'improving' ? '↓' : zone.forecast.trend === 'worsening' ? '↑' : '→'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">System Health</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Sensors</span>
                        <Badge variant="default">{liveZones}/4</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reports Today</span>
                        <Badge variant="default">{totalReports}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Coverage Area</span>
                        <Badge variant="default">Dehradun</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Leaderboard />
            </TabsContent>

            <TabsContent value="rewards" className="space-y-6">
              <RewardSystem />
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile Bottom Navigation - Only visible on mobile */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden">
          <EnhancedBottomNavigation
            onStartReport={() => setActiveTab('report')}
            onPlanRoute={() => setActiveTab('route')}
            onShowLeaderboard={() => setActiveTab('leaderboard')}
            onShowStats={() => setActiveTab('stats')}
            activeTab={activeTab}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;