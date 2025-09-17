import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Factory, Car, Hammer, Flame, Layers, Maximize, 
  TrendingUp, TrendingDown, Minus, Eye, Clock, Target,
  CheckCircle, Users, Zap, Wind, CloudRain, Sun
} from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PollutionZone, WeatherData, TrafficData } from "@/pages/Index";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface EnhancedPollutionMapProps {
  pollutionZones: PollutionZone[];
  setPollutionZones: React.Dispatch<React.SetStateAction<PollutionZone[]>>;
  userLocation: [number, number];
}

// Weather API integration (using free OpenWeatherMap-like service)
const fetchWeatherData = async (coordinates: [number, number]): Promise<WeatherData> => {
  try {
    // In production, replace with actual API call
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=YOUR_API_KEY`);
    // For now, return mock data with some realism
    return {
      temperature: 25 + Math.random() * 10,
      humidity: 40 + Math.random() * 30,
      windSpeed: Math.random() * 15,
      windDirection: Math.random() * 360,
      precipitation: Math.random() * 5,
      condition: ['sunny', 'cloudy', 'rainy', 'windy'][Math.floor(Math.random() * 4)] as any,
      pressureMb: 1010 + Math.random() * 20
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      temperature: 25, humidity: 50, windSpeed: 5, windDirection: 180,
      precipitation: 0, condition: 'sunny', pressureMb: 1013
    };
  }
};

// Traffic data integration
const fetchTrafficData = async (coordinates: [number, number]): Promise<TrafficData> => {
  try {
    // In production, replace with actual HERE Traffic API or similar
    // const response = await fetch(`https://traffic.ls.hereapi.com/traffic/6.3/flow.json?apikey=YOUR_API_KEY&bbox=${coordinates[0]},${coordinates[1]}`);
    return {
      vehicleCount: Math.floor(Math.random() * 200) + 50,
      averageSpeed: Math.random() * 40 + 20,
      congestionLevel: Math.random() * 8 + 2,
      heavyVehiclePercentage: Math.random() * 30 + 5,
      idleTime: Math.random() * 120 + 30
    };
  } catch (error) {
    console.error('Error fetching traffic data:', error);
    return {
      vehicleCount: 100, averageSpeed: 30, congestionLevel: 5,
      heavyVehiclePercentage: 15, idleTime: 60
    };
  }
};

// Enhanced pollution calculation considering multiple factors
const calculateDynamicAQI = async (zone: PollutionZone): Promise<number> => {
  const weather = await fetchWeatherData(zone.coordinates);
  const traffic = await fetchTrafficData(zone.coordinates);
  
  let baseAQI = zone.reports.length > 0 
    ? zone.reports.reduce((sum, report) => sum + report.aiAnalysis.pollutionLevel * 20, 0) / zone.reports.length
    : zone.aqi;
  
  // Weather impact factors
  const windFactor = weather.windSpeed > 10 ? 0.7 : weather.windSpeed < 3 ? 1.3 : 1.0;
  const rainFactor = weather.precipitation > 2 ? 0.6 : 1.0;
  const humidityFactor = weather.humidity > 70 ? 1.2 : weather.humidity < 30 ? 1.1 : 1.0;
  const pressureFactor = weather.pressureMb < 1000 ? 1.15 : 0.95;
  
  // Traffic impact
  const trafficFactor = 1 + (traffic.congestionLevel * 0.08) + (traffic.heavyVehiclePercentage * 0.015);
  
  // Time of day factor
  const hour = new Date().getHours();
  const timeOfDayFactor = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20) ? 1.2 : 0.9;
  
  const adjustedAQI = baseAQI * windFactor * rainFactor * humidityFactor * pressureFactor * trafficFactor * timeOfDayFactor;
  
  return Math.min(500, Math.max(0, adjustedAQI));
};

const getAqiColor = (level: string) => {
  const colors = {
    excellent: '#00e400',
    good: '#ffff00', 
    moderate: '#ff7e00',
    poor: '#ff0000',
    severe: '#8f3f97',
    hazardous: '#7e0023'
  };
  return colors[level as keyof typeof colors] || colors.moderate;
};

const getViolatorIcon = (type: string) => {
  const icons = {
    vehicle: Car,
    industry: Factory,
    construction: Hammer,
    burning: Flame
  };
  return icons[type as keyof typeof icons] || Car;
};

const getTrendIcon = (trend: string) => {
  const icons = {
    improving: TrendingDown,
    worsening: TrendingUp,
    stable: Minus
  };
  return icons[trend as keyof typeof icons] || Minus;
};

const getTrendColor = (trend: string) => {
  const colors = {
    improving: 'text-green-500',
    worsening: 'text-red-500',
    stable: 'text-gray-500'
  };
  return colors[trend as keyof typeof colors] || 'text-gray-500';
};

const EnhancedPollutionMap: React.FC<EnhancedPollutionMapProps> = ({ 
  pollutionZones, 
  setPollutionZones, 
  userLocation 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const selectedZoneData = pollutionZones.find(zone => zone.id === selectedZone);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: userLocation,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  // Fetch weather data for the area
  useEffect(() => {
    const loadWeatherData = async () => {
      const weather = await fetchWeatherData(userLocation);
      setWeatherData(weather);
    };
    
    loadWeatherData();
    const interval = setInterval(loadWeatherData, 600000); // Update every 10 minutes
    
    return () => clearInterval(interval);
  }, [userLocation]);

  // Update pollution zones with dynamic AQI
  useEffect(() => {
    const updateZones = async () => {
      const updatedZones = await Promise.all(
        pollutionZones.map(async (zone) => {
          const newAQI = await calculateDynamicAQI(zone);
          return {
            ...zone,
            aqi: newAQI,
            level: getAqiLevel(newAQI),
            lastUpdated: new Date().toISOString()
          };
        })
      );
      
      // Only update if there are significant changes
      const hasSignificantChanges = updatedZones.some((zone, index) => 
        Math.abs(zone.aqi - pollutionZones[index].aqi) > 5
      );
      
      if (hasSignificantChanges) {
        setPollutionZones(updatedZones);
      }
    };

    const interval = setInterval(updateZones, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [pollutionZones, setPollutionZones]);

  const getAqiLevel = (aqi: number): PollutionZone['level'] => {
    if (aqi <= 50) return 'excellent';
    if (aqi <= 100) return 'good';
    if (aqi <= 150) return 'moderate';
    if (aqi <= 200) return 'poor';
    if (aqi <= 300) return 'severe';
    return 'hazardous';
  };

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(layer => map.removeLayer(layer));
    markersRef.current = [];

    // Add user location marker
    const userMarker = L.marker(userLocation, {
      icon: L.divIcon({
        className: 'user-location-marker',
        html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    });
    userMarker.addTo(map);
    markersRef.current.push(userMarker);

    // Add pollution zone markers
    pollutionZones.forEach((zone) => {
      const markerSize = Math.max(20, Math.min(50, zone.aqi / 4));
      const heatmapRadius = Math.max(200, Math.min(800, zone.spreadRadius));
      
      // Main pollution marker
      const marker = L.circleMarker(zone.coordinates, {
        color: '#ffffff',
        weight: 2,
        fillColor: getAqiColor(zone.level),
        fillOpacity: 0.9,
        radius: markerSize / 2
      });

      // Heatmap layers
      if (showHeatmap) {
        // Outer fading circle
        const outerCircle = L.circle(zone.coordinates, {
          color: 'transparent',
          fillColor: getAqiColor(zone.level),
          fillOpacity: 0.1 * zone.heatmapIntensity,
          radius: heatmapRadius,
          weight: 0
        });
        
        // Inner stronger circle  
        const innerCircle = L.circle(zone.coordinates, {
          color: 'transparent',
          fillColor: getAqiColor(zone.level),
          fillOpacity: 0.2 * zone.heatmapIntensity,
          radius: heatmapRadius * 0.6,
          weight: 0
        });

        outerCircle.addTo(map);
        innerCircle.addTo(map);
        markersRef.current.push(outerCircle, innerCircle);
      }

      // Enhanced popup with weather and traffic context
      const isRecent = Date.now() - new Date(zone.lastUpdated).getTime() < 300000;
      const reportsHtml = zone.reports.length > 0 ? 
        zone.reports.slice(-2).map(r => 
          `<div class="text-xs bg-gray-100 p-1 rounded mt-1">
            AI: ${r.aiAnalysis.severity} (${(r.aiAnalysis.confidence * 100).toFixed(0)}% confident)
            <br/>Types: ${r.aiAnalysis.pollutionTypes.join(', ')}
          </div>`
        ).join('') : '<div class="text-xs text-gray-500">No community reports</div>';

      marker.bindPopup(`
        <div style="max-width: 300px; font-size: 13px;">
          <div class="flex items-center justify-between mb-2">
            <h3 style="font-weight: bold; color: #1f2937; margin: 0;">${zone.name}</h3>
            ${isRecent ? '<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live data"></div>' : ''}
          </div>
          
          <div style="margin-bottom: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; color: white; background-color: ${getAqiColor(zone.level)};">
              AQI: ${Math.round(zone.aqi)} (${zone.level.toUpperCase()})
            </span>
          </div>
          
          ${weatherData ? `
          <div style="margin-bottom: 8px; padding: 6px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #0ea5e9;">
            <div style="font-size: 11px; color: #0369a1;">
              🌡️ ${Math.round(weatherData.temperature)}°C • 💨 ${Math.round(weatherData.windSpeed)}km/h • 💧 ${Math.round(weatherData.humidity)}%
              <br/>Condition: ${weatherData.condition} • Pressure: ${Math.round(weatherData.pressureMb)}mb
            </div>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 8px; padding: 6px; background: #f9fafb; border-radius: 6px;">
            <div style="font-size: 11px; color: #6b7280;">
              📈 Forecast: ${Math.round(zone.forecast.next6h)} (6h) → ${Math.round(zone.forecast.next24h)} (24h)
              <br/>Trend: ${zone.forecast.trend} • Factors: ${zone.forecast.factors.slice(0, 2).join(', ')}
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <strong style="color: #dc2626; font-size: 11px;">Community Reports (${zone.reports.length}):</strong>
            ${reportsHtml}
          </div>
        </div>
      `, {
        maxWidth: 320,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        setSelectedZone(selectedZone === zone.id ? null : zone.id);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [pollutionZones, showHeatmap, selectedZone, userLocation, weatherData]);

  const getWeatherIcon = (condition: string) => {
    const icons = {
      sunny: Sun,
      cloudy: Wind,
      rainy: CloudRain,
      windy: Wind
    };
    return icons[condition as keyof typeof icons] || Sun;
  };

  return (
    <div className={`grid gap-4 lg:gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
      {/* Map Container */}
      <Card className={`${isFullscreen ? 'col-span-1' : 'lg:col-span-2'} transition-all duration-300`}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span className="text-base sm:text-lg">AI-Enhanced Pollution Map</span>
              {weatherData && (
                <div className="flex items-center text-sm text-muted-foreground">
                  {(() => {
                    const WeatherIcon = getWeatherIcon(weatherData.condition);
                    return <WeatherIcon className="h-4 w-4 ml-2" />;
                  })()}
                  <span className="ml-1">{Math.round(weatherData.temperature)}°C</span>
                </div>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className="flex items-center space-x-1"
              >
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">{showHeatmap ? 'Hide' : 'Show'} Heatmap</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center space-x-1"
              >
                <Maximize className="h-4 w-4" />
                <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className={`w-full ${isFullscreen ? 'h-[70vh]' : 'h-64 sm:h-80 lg:h-96'} rounded-b-lg`}
          />
        </CardContent>
      </Card>

      {/* Zone Details - Hidden in fullscreen mode */}
      {!isFullscreen && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Zone Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="card-mobile">
            {selectedZoneData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedZoneData.name}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge 
                      className="text-white border-0"
                      style={{ backgroundColor: getAqiColor(selectedZoneData.level) }}
                    >
                      AQI: {Math.round(selectedZoneData.aqi)}
                    </Badge>
                    <span className="text-sm text-muted-foreground capitalize">
                      {selectedZoneData.level}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(selectedZoneData.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* AI Forecast */}
                <div className="bg-muted/30 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 flex items-center space-x-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>AI Forecast</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Next 6h:</span>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: selectedZoneData.forecast.next6h > selectedZoneData.aqi ? '#fee2e2' : '#dcfce7',
                          borderColor: selectedZoneData.forecast.next6h > selectedZoneData.aqi ? '#fca5a5' : '#86efac'
                        }}
                      >
                        {Math.round(selectedZoneData.forecast.next6h)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Next 24h:</span>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: selectedZoneData.forecast.next24h > selectedZoneData.aqi ? '#fee2e2' : '#dcfce7',
                          borderColor: selectedZoneData.forecast.next24h > selectedZoneData.aqi ? '#fca5a5' : '#86efac'
                        }}
                      >
                        {Math.round(selectedZoneData.forecast.next24h)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Trend:</span>
                      <div className="flex items-center space-x-1">
                        {(() => {
                          const TrendIcon = getTrendIcon(selectedZoneData.forecast.trend);
                          return <TrendIcon className={`h-3 w-3 ${getTrendColor(selectedZoneData.forecast.trend)}`} />;
                        })()}
                        <span className="capitalize">{selectedZoneData.forecast.trend}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Factors:</strong> {selectedZoneData.forecast.factors.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Weather Context */}
                {weatherData && (
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                    <h4 className="font-medium text-sm mb-2 flex items-center space-x-1 text-blue-800">
                      {(() => {
                        const WeatherIcon = getWeatherIcon(weatherData.condition);
                        return <WeatherIcon className="h-4 w-4" />;
                      })()}
                      <span>Weather Impact</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-blue-600">Temp:</span> {Math.round(weatherData.temperature)}°C
                      </div>
                      <div>
                        <span className="text-blue-600">Wind:</span> {Math.round(weatherData.windSpeed)}km/h
                      </div>
                      <div>
                        <span className="text-blue-600">Humidity:</span> {Math.round(weatherData.humidity)}%
                      </div>
                      <div>
                        <span className="text-blue-600">Pressure:</span> {Math.round(weatherData.pressureMb)}mb
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 mt-2 capitalize">
                      <strong>Condition:</strong> {weatherData.condition}
                      {weatherData.precipitation > 0 && ` (${Math.round(weatherData.precipitation)}mm rain)`}
                    </div>
                  </div>
                )}

                {/* Community Reports */}
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Community Reports</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedZoneData.reports.length}
                    </Badge>
                  </h4>
                  {selectedZoneData.reports.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedZoneData.reports.slice(-3).map((report, idx) => (
                        <div key={idx} className="bg-muted/20 p-2 rounded text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: report.aiAnalysis.severity === 'critical' ? '#fee2e2' : 
                                                  report.aiAnalysis.severity === 'high' ? '#fef3c7' : '#dcfce7',
                                  borderColor: report.aiAnalysis.severity === 'critical' ? '#fca5a5' : 
                                              report.aiAnalysis.severity === 'high' ? '#fcd34d' : '#86efac'
                                }}
                              >
                                {report.aiAnalysis.severity}
                              </Badge>
                              <span className="font-medium">
                                {(report.aiAnalysis.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {report.verified && <CheckCircle className="h-3 w-3 text-green-500" />}
                              <span className="text-muted-foreground">
                                {new Date(report.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-muted-foreground mt-1">
                            <strong>Types:</strong> {report.aiAnalysis.pollutionTypes.join(', ')}
                          </div>
                          <div className="text-muted-foreground">
                            <strong>Spread:</strong> {Math.round(report.aiAnalysis.spreadRadius)}m • 
                            <strong> Duration:</strong> {Math.round(report.aiAnalysis.duration)}h
                          </div>
                          {report.description && (
                            <div className="text-muted-foreground mt-1 italic">
                              "{report.description.substring(0, 60)}..."
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-xs">
                      No community reports yet. Be the first to report!
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full btn-mobile animate-scale-in"
                  onClick={() => console.log('Take action on zone:', selectedZoneData.id)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Take Enforcement Action
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Click on any zone marker to view AI analysis and community reports</p>
                <p className="text-xs mt-2 text-primary">
                  🔵 Blue dot = Your location
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedPollutionMap;