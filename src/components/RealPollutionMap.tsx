import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Factory, Car, Hammer, Flame, Layers, Maximize } from "lucide-react";
import L from 'leaflet';

interface PollutionZone {
  id: string;
  name: string;
  coordinates: [number, number];
  aqi: number;
  level: 'excellent' | 'good' | 'moderate' | 'poor' | 'severe' | 'hazardous';
  violators: Array<{
    type: 'vehicle' | 'industry' | 'construction' | 'burning';
    name: string;
    contribution: number;
  }>;
}

// Delhi coordinates with real pollution data simulation
const pollutionZones: PollutionZone[] = [
  {
    id: "1",
    name: "Connaught Place",
    coordinates: [28.6315, 77.2167],
    aqi: 156,
    level: 'poor',
    violators: [
      { type: 'vehicle', name: 'Heavy Traffic (450+ vehicles/hr)', contribution: 45 },
      { type: 'construction', name: 'Metro Line Construction', contribution: 35 },
      { type: 'industry', name: 'Commercial Generators', contribution: 20 }
    ]
  },
  {
    id: "2", 
    name: "Anand Vihar",
    coordinates: [28.6469, 77.3152],
    aqi: 287,
    level: 'severe',
    violators: [
      { type: 'industry', name: 'Industrial Cluster', contribution: 50 },
      { type: 'vehicle', name: 'Interstate Bus Terminal', contribution: 30 },
      { type: 'burning', name: 'Waste Burning Sites', contribution: 20 }
    ]
  },
  {
    id: "3",
    name: "India Gate", 
    coordinates: [28.6129, 77.2295],
    aqi: 89,
    level: 'moderate',
    violators: [
      { type: 'vehicle', name: 'Tourist Traffic', contribution: 60 },
      { type: 'construction', name: 'Road Maintenance', contribution: 40 }
    ]
  },
  {
    id: "4",
    name: "Rohini",
    coordinates: [28.7041, 77.1025],
    aqi: 198,
    level: 'poor',
    violators: [
      { type: 'industry', name: 'Manufacturing Units', contribution: 45 },
      { type: 'vehicle', name: 'Highway Traffic', contribution: 35 },
      { type: 'burning', name: 'Agricultural Burning', contribution: 20 }
    ]
  },
  {
    id: "5",
    name: "Lodhi Road",
    coordinates: [28.5918, 77.2273],
    aqi: 67,
    level: 'good',
    violators: [
      { type: 'vehicle', name: 'Light Traffic', contribution: 70 },
      { type: 'construction', name: 'Minor Construction', contribution: 30 }
    ]
  }
];

const getAqiColor = (level: string) => {
  const colors = {
    excellent: '#22c55e', // green-500
    good: '#84cc16',      // lime-500
    moderate: '#eab308',  // yellow-500
    poor: '#f97316',      // orange-500
    severe: '#ef4444',    // red-500
    hazardous: '#a855f7'  // purple-500
  };
  return colors[level as keyof typeof colors] || colors.moderate;
};

const getMarkerSize = (aqi: number) => {
  if (aqi < 50) return 20;
  if (aqi < 100) return 25;
  if (aqi < 150) return 30;
  if (aqi < 200) return 35;
  if (aqi < 300) return 40;
  return 45;
};

const getViolatorIcon = (type: string) => {
  const icons = {
    vehicle: Car,
    industry: Factory,
    construction: Hammer,
    burning: Flame
  };
  return icons[type as keyof typeof icons];
};

// Heatmap layer component (simplified version using circle overlays)
const HeatmapLayer = ({ zones }: { zones: PollutionZone[] }) => {
  const map = useMap();
  
  useEffect(() => {
    const circles: L.Circle[] = [];
    
    // Create heat circles for gradient effect
    zones.forEach(zone => {
      const intensity = zone.aqi / 300; // normalize to 0-1
      const radius = Math.max(1000, zone.aqi * 10); // radius based on AQI
      
      try {
        const heatCircle = L.circle([zone.coordinates[0], zone.coordinates[1]], {
          radius: radius,
          fillColor: getAqiColor(zone.level),
          color: 'transparent',
          fillOpacity: Math.min(0.4, intensity),
          weight: 0
        });
        
        heatCircle.addTo(map);
        circles.push(heatCircle);
      } catch (error) {
        console.warn('Error creating heat circle:', error);
      }
    });
    
    // Cleanup function
    return () => {
      circles.forEach(circle => {
        if (map && map.hasLayer(circle)) {
          map.removeLayer(circle);
        }
      });
    };
  }, [map, zones]);
  
  return null;
};

const RealPollutionMap = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selectedZoneData = pollutionZones.find(zone => zone.id === selectedZone);

  return (
    <div className={`grid gap-4 lg:gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
      {/* Map Container */}
      <Card className={`${isFullscreen ? 'col-span-1' : 'lg:col-span-2'} transition-all duration-300`}>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span className="text-base sm:text-lg">Live Pollution Map - New Delhi</span>
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
          <div className={`relative ${isFullscreen ? 'h-[70vh]' : 'h-64 sm:h-80 lg:h-96'} w-full`}>
            <MapContainer
              center={[28.6139, 77.2090]} // Delhi center
              zoom={11}
              className="h-full w-full rounded-b-lg"
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Heatmap overlay */}
              {showHeatmap && <HeatmapLayer zones={pollutionZones} />}
              
              {/* Pollution markers */}
              {pollutionZones.map((zone) => (
                <CircleMarker
                  key={zone.id}
                  center={zone.coordinates}
                  radius={getMarkerSize(zone.aqi) / 3}
                  pathOptions={{
                    fillColor: getAqiColor(zone.level),
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                  }}
                  eventHandlers={{
                    click: () => setSelectedZone(selectedZone === zone.id ? null : zone.id)
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px] p-2">
                      <h3 className="font-semibold text-lg mb-2">{zone.name}</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge 
                          className="text-white border-0"
                          style={{ backgroundColor: getAqiColor(zone.level) }}
                        >
                          AQI: {zone.aqi}
                        </Badge>
                        <span className="text-sm text-muted-foreground capitalize">
                          {zone.level}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-destructive">
                          Top Violators:
                        </h4>
                        {zone.violators.slice(0, 2).map((violator, idx) => {
                          const IconComponent = getViolatorIcon(violator.type);
                          return (
                            <div key={idx} className="flex items-center space-x-2 text-sm">
                              <IconComponent className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{violator.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-lg p-3 text-xs shadow-lg border">
              <div className="font-semibold mb-2">AQI Scale</div>
              <div className="space-y-1">
                {[
                  { level: 'good', range: '0-50', color: getAqiColor('good') },
                  { level: 'moderate', range: '51-100', color: getAqiColor('moderate') },
                  { level: 'poor', range: '101-200', color: getAqiColor('poor') },
                  { level: 'severe', range: '201-300', color: getAqiColor('severe') }
                ].map(({ level, range, color }) => (
                  <div key={level} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="capitalize">{range} {level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile tap instruction */}
            <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs sm:hidden animate-pulse">
              Tap markers for details
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Details - Hidden in fullscreen mode */}
      {!isFullscreen && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Zone Details</CardTitle>
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
                      AQI: {selectedZoneData.aqi}
                    </Badge>
                    <span className="text-sm text-muted-foreground capitalize">
                      {selectedZoneData.level}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3 text-destructive">
                    Identified Violators:
                  </h4>
                  <div className="space-y-2">
                    {selectedZoneData.violators.map((violator, idx) => {
                      const IconComponent = getViolatorIcon(violator.type);
                      return (
                        <div key={idx} className="flex items-center space-x-3 p-2 bg-muted/50 rounded hover-scale cursor-pointer">
                          <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {violator.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {violator.contribution}% contribution
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button 
                  className="w-full btn-mobile animate-scale-in"
                  onClick={() => console.log('Take action on violators')}
                >
                  Take Enforcement Action
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Click on any marker in the map to view responsible parties and violation details</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealPollutionMap;