import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Layers
} from 'lucide-react';
import { useEnhancedHeatmapSimulation } from './EnhancedHeatmapSimulation';
import type { PollutionZone } from '../pages/Index';

// Extend leaflet for heatmap
declare global {
  namespace L {
    interface Map {
      addLayer(layer: any): this;
      removeLayer(layer: any): this;
    }
  }
}

interface SuperEnhancedPollutionMapProps {
  pollutionZones: PollutionZone[];
  setPollutionZones: (zones: PollutionZone[]) => void;
  userLocation: [number, number];
}

// Heatmap Layer Component
const HeatmapLayer = ({ heatmapData }: { heatmapData: any[] }) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !heatmapData.length) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Convert heatmap data to leaflet heat format
    const heatPoints = heatmapData.map(point => [
      point.coordinates[0],
      point.coordinates[1],
      point.intensity
    ]);

    // Create heat layer with enhanced options
    heatLayerRef.current = (L as any).heatLayer(heatPoints, {
      radius: 50,
      blur: 35,
      maxZoom: 18,
      gradient: {
        0.0: '#00ff00',  // Green - Clean air
        0.2: '#80ff00',  // Light green
        0.4: '#ffff00',  // Yellow - Moderate
        0.6: '#ff8000',  // Orange - Unhealthy
        0.8: '#ff0000',  // Red - Very unhealthy
        1.0: '#800080'   // Purple - Hazardous
      }
    });

    map.addLayer(heatLayerRef.current);

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, heatmapData]);

  return null;
};

// Real-time Weather Display
const WeatherOverlay = ({ weather }: { weather: any }) => (
  <Card className="absolute top-4 right-4 z-[1000] bg-card/90 backdrop-blur-sm">
    <CardContent className="p-3">
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <Wind className="h-3 w-3" />
          <span>{weather.windSpeed} m/s {weather.windDirection}°</span>
        </div>
        <div className="flex items-center space-x-2">
          <Thermometer className="h-3 w-3" />
          <span>{weather.temperature}°C</span>
        </div>
        <div className="flex items-center space-x-2">
          <Droplets className="h-3 w-3" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="h-3 w-3" />
          <span>{(weather.visibility / 1000).toFixed(1)} km</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Map Controls
const MapControls = ({ 
  onRefresh, 
  showHeatmap, 
  setShowHeatmap, 
  isLoading 
}: {
  onRefresh: () => void;
  showHeatmap: boolean;
  setShowHeatmap: (show: boolean) => void;
  isLoading: boolean;
}) => (
  <div className="absolute top-4 left-4 z-[1000] space-y-2">
    <Button
      size="sm"
      variant="outline"
      onClick={onRefresh}
      disabled={isLoading}
      className="bg-card/90 backdrop-blur-sm hover-scale"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
    
    <Button
      size="sm"
      variant={showHeatmap ? "default" : "outline"}
      onClick={() => setShowHeatmap(!showHeatmap)}
      className="bg-card/90 backdrop-blur-sm hover-scale"
    >
      <Layers className="h-4 w-4" />
    </Button>
  </div>
);

const SuperEnhancedPollutionMap = ({ 
  pollutionZones, 
  setPollutionZones, 
  userLocation 
}: SuperEnhancedPollutionMapProps) => {
  const { heatmapData, simulator } = useEnhancedHeatmapSimulation();
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated weather data - in real app, fetch from weather API
  const [weatherData, setWeatherData] = useState({
    temperature: 28,
    humidity: 65,
    windSpeed: 2.5,
    windDirection: 225,
    visibility: 8000
  });

  const getAqiColor = useCallback((aqi: number) => {
    if (aqi <= 50) return '#22c55e';      // Green - Good
    if (aqi <= 100) return '#84cc16';     // Light Green - Satisfactory
    if (aqi <= 150) return '#eab308';     // Yellow - Moderate
    if (aqi <= 200) return '#f97316';     // Orange - Poor
    if (aqi <= 300) return '#ef4444';     // Red - Very Poor
    return '#a855f7';                     // Purple - Severe
  }, []);

  const getAqiLevel = useCallback((aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory';
    if (aqi <= 150) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    if (aqi <= 300) return 'Very Poor';
    return 'Severe';
  }, []);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    
    // Simulate data refresh
    setTimeout(() => {
      simulator.updateSimulation();
      
      // Update weather data with some variation
      setWeatherData(prev => ({
        ...prev,
        windSpeed: Math.max(0.5, prev.windSpeed + (Math.random() - 0.5) * 1),
        humidity: Math.max(30, Math.min(95, prev.humidity + (Math.random() - 0.5) * 10)),
        temperature: Math.max(15, Math.min(45, prev.temperature + (Math.random() - 0.5) * 3))
      }));
      
      // Update pollution zones with new data
      setPollutionZones(zones => zones.map((zone: PollutionZone) => ({
        ...zone,
        aqi: Math.max(10, zone.aqi + (Math.random() - 0.5) * 20),
        lastUpdated: new Date().toISOString()
      })));
      
      setIsLoading(false);
    }, 1500);
  }, [simulator, setPollutionZones]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 120000);
    
    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <Card className="overflow-hidden hover-scale smooth-transition">
      <div className="relative h-[400px] md:h-[500px]">
        <MapContainer
          center={userLocation}
          zoom={13}
          className="h-full w-full z-10"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Enhanced Heatmap Layer */}
          {showHeatmap && heatmapData.length > 0 && (
            <HeatmapLayer heatmapData={heatmapData} />
          )}
          
          {/* User Location */}
          <Marker
            position={userLocation}
            icon={divIcon({
              className: 'user-location-marker',
              html: `
                <div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse">
                  <div class="w-8 h-8 bg-primary/20 rounded-full absolute -top-2 -left-2 animate-ping"></div>
                </div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold">Your Location</div>
                <div className="text-sm text-muted-foreground">Current position</div>
              </div>
            </Popup>
          </Marker>

          {/* Enhanced Pollution Zone Markers */}
          {pollutionZones.map((zone) => (
            <div key={zone.id}>
              <Marker
                position={zone.coordinates}
                icon={divIcon({
                  className: 'pollution-marker-enhanced',
                  html: `
                    <div class="pollution-marker ${zone.level} animate-bounce-in" 
                         style="background-color: ${getAqiColor(zone.aqi)}; 
                                width: ${Math.max(30, Math.min(60, zone.aqi / 5))}px; 
                                height: ${Math.max(30, Math.min(60, zone.aqi / 5))}px;">
                      <div class="text-white font-bold text-xs">${Math.round(zone.aqi)}</div>
                    </div>
                  `,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                })}
              >
                <Popup maxWidth={300}>
                  <div className="space-y-3 p-2">
                    <div className="text-center">
                      <h3 className="font-semibold">{zone.name}</h3>
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: getAqiColor(zone.aqi), color: 'white' }}
                      >
                        AQI {Math.round(zone.aqi)} - {getAqiLevel(zone.aqi)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Reports:</span>
                        <span>{zone.reports.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trend:</span>
                        <div className="flex items-center space-x-1">
                          {zone.forecast.trend === 'improving' ? (
                            <CheckCircle className="h-3 w-3 text-success" />
                          ) : zone.forecast.trend === 'worsening' ? (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          ) : (
                            <Zap className="h-3 w-3 text-warning" />
                          )}
                          <span className="capitalize">{zone.forecast.trend}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Next 6h:</span>
                        <span>AQI {Math.round(zone.forecast.next6h)}</span>
                      </div>
                    </div>
                    
                    {zone.forecast.factors.length > 0 && (
                      <div>
                        <div className="text-xs font-medium mb-1">Factors:</div>
                        <div className="flex flex-wrap gap-1">
                          {zone.forecast.factors.map((factor, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground text-center">
                      Last updated: {new Date(zone.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Enhanced Pollution Spread Circle */}
              <Circle
                center={zone.coordinates}
                radius={zone.spreadRadius}
                pathOptions={{
                  fillColor: getAqiColor(zone.aqi),
                  fillOpacity: 0.1,
                  color: getAqiColor(zone.aqi),
                  weight: 2,
                  opacity: 0.4
                }}
              />
            </div>
          ))}
        </MapContainer>

        {/* Map Overlays */}
        <WeatherOverlay weather={weatherData} />
        <MapControls 
          onRefresh={handleRefresh}
          showHeatmap={showHeatmap}
          setShowHeatmap={setShowHeatmap}
          isLoading={isLoading}
        />
        
        {/* Legend */}
        <Card className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="text-xs font-semibold mb-2">Air Quality Index</div>
            <div className="space-y-1">
              {[
                { range: '0-50', level: 'Good', color: '#22c55e' },
                { range: '51-100', level: 'Satisfactory', color: '#84cc16' },
                { range: '101-150', level: 'Moderate', color: '#eab308' },
                { range: '151-200', level: 'Poor', color: '#f97316' },
                { range: '201-300', level: 'Very Poor', color: '#ef4444' },
                { range: '300+', level: 'Severe', color: '#a855f7' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="w-12">{item.range}</span>
                  <span>{item.level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <Badge variant="default" className="bg-success animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
            Live Data
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default SuperEnhancedPollutionMap;