import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Factory, Car, Hammer, Flame, Layers, Maximize, TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  forecast: {
    next6h: number;
    next24h: number;
    trend: 'improving' | 'worsening' | 'stable';
  };
  historical: Array<{
    timestamp: string;
    aqi: number;
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
    ],
    forecast: {
      next6h: 142,
      next24h: 128,
      trend: 'improving'
    },
    historical: [
      { timestamp: '6h ago', aqi: 168 },
      { timestamp: '12h ago', aqi: 174 },
      { timestamp: '18h ago', aqi: 162 },
      { timestamp: '24h ago', aqi: 156 }
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
    ],
    forecast: {
      next6h: 295,
      next24h: 312,
      trend: 'worsening'
    },
    historical: [
      { timestamp: '6h ago', aqi: 278 },
      { timestamp: '12h ago', aqi: 271 },
      { timestamp: '18h ago', aqi: 289 },
      { timestamp: '24h ago', aqi: 294 }
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
    ],
    forecast: {
      next6h: 84,
      next24h: 78,
      trend: 'improving'
    },
    historical: [
      { timestamp: '6h ago', aqi: 92 },
      { timestamp: '12h ago', aqi: 95 },
      { timestamp: '18h ago', aqi: 88 },
      { timestamp: '24h ago', aqi: 91 }
    ]
  }
];

const getAqiColor = (level: string) => {
  const colors = {
    excellent: 'hsl(var(--air-excellent))',
    good: 'hsl(var(--air-good))',
    moderate: 'hsl(var(--air-moderate))',
    poor: 'hsl(var(--air-poor))',
    severe: 'hsl(var(--air-severe))',
    hazardous: 'hsl(var(--air-hazardous))'
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
  return icons[type as keyof typeof icons];
};

const getTrendIcon = (trend: string) => {
  const icons = {
    improving: TrendingDown,
    worsening: TrendingUp,
    stable: Minus
  };
  return icons[trend as keyof typeof icons];
};

const getTrendColor = (trend: string) => {
  const colors = {
    improving: 'text-air-excellent',
    worsening: 'text-air-severe',
    stable: 'text-muted-foreground'
  };
  return colors[trend as keyof typeof colors];
};

const getZoneSize = (aqi: number) => {
  // Better scaling based on AQI ranges
  if (aqi <= 50) return { marker: 24, heatmap: 40 };      // Good
  if (aqi <= 100) return { marker: 28, heatmap: 55 };     // Moderate  
  if (aqi <= 150) return { marker: 32, heatmap: 70 };     // Unhealthy for sensitive
  if (aqi <= 200) return { marker: 36, heatmap: 85 };     // Unhealthy
  if (aqi <= 300) return { marker: 42, heatmap: 105 };    // Very unhealthy
  return { marker: 48, heatmap: 120 };                    // Hazardous
};

const SimpleMap = () => {
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
          <div className={`relative ${isFullscreen ? 'h-[70vh]' : 'h-64 sm:h-80 lg:h-96'} w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-b-lg overflow-hidden`}>
            
            {/* Temporary Map Placeholder with Interactive Zones */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-yellow-100 to-red-100 opacity-50 rounded-lg"></div>
                
                {/* Pollution Zone Markers */}
                {pollutionZones.map((zone) => {
                  const zoneSize = getZoneSize(zone.aqi);
                  return (
                    <div
                      key={zone.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110"
                      style={{
                        left: `${30 + (zone.coordinates[1] - 77) * 800}%`,
                        top: `${50 - (zone.coordinates[0] - 28.6) * 1000}%`,
                      }}
                      onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                    >
                      {/* Pulsing outer ring for severe pollution */}
                      {zone.aqi > 200 && (
                        <div
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
                          style={{
                            width: `${zoneSize.heatmap + 20}px`,
                            height: `${zoneSize.heatmap + 20}px`,
                            backgroundColor: getAqiColor(zone.level),
                            opacity: 0.15,
                            zIndex: -2
                          }}
                        ></div>
                      )}
                      
                      {/* Main pollution marker */}
                      <div
                        className="rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold relative z-10"
                        style={{ 
                          backgroundColor: getAqiColor(zone.level),
                          width: `${zoneSize.marker}px`,
                          height: `${zoneSize.marker}px`,
                          fontSize: zone.aqi > 200 ? '10px' : '9px'
                        }}
                      >
                        {zone.aqi}
                      </div>
                      
                      {/* Zone Label */}
                      <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground bg-white/95 backdrop-blur px-2 py-1 rounded shadow whitespace-nowrap">
                        {zone.name}
                      </div>
                      
                      {/* Enhanced Heatmap effect with gradient */}
                      {showHeatmap && (
                        <div
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            width: `${zoneSize.heatmap}px`,
                            height: `${zoneSize.heatmap}px`,
                            background: `radial-gradient(circle, ${getAqiColor(zone.level)}40, ${getAqiColor(zone.level)}20, ${getAqiColor(zone.level)}10, transparent)`,
                            zIndex: -1
                          }}
                        ></div>
                      )}
                      
                      {/* Selection indicator */}
                      {selectedZone === zone.id && (
                        <div
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary animate-pulse"
                          style={{
                            width: `${zoneSize.marker + 8}px`,
                            height: `${zoneSize.marker + 8}px`,
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })}
                
                {/* Map Title Overlay */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3 text-sm shadow-lg">
                  <div className="font-semibold text-primary">New Delhi, India</div>
                  <div className="text-xs text-muted-foreground">Real-time Air Quality</div>
                </div>
                
                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-lg p-3 text-xs shadow-lg border">
                  <div className="font-semibold mb-2">AQI Scale</div>
                  <div className="space-y-1">
                    {[
                      { level: 'good', range: '0-50' },
                      { level: 'moderate', range: '51-100' },
                      { level: 'poor', range: '101-200' },
                      { level: 'severe', range: '201-300' }
                    ].map(({ level, range }) => (
                      <div key={level} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-white"
                          style={{ backgroundColor: getAqiColor(level) }}
                        ></div>
                        <span className="capitalize">{range} {level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile tap instruction */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs sm:hidden animate-pulse">
              Tap zones for details
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

                  {/* Forecasting Section */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
                      <span>Forecast & Trends</span>
                      {(() => {
                        const TrendIcon = getTrendIcon(selectedZoneData.forecast.trend);
                        return <TrendIcon className={`h-4 w-4 ${getTrendColor(selectedZoneData.forecast.trend)}`} />;
                      })()}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                        <span className="text-xs text-muted-foreground">Next 6 hours</span>
                        <Badge variant="outline" style={{ 
                          backgroundColor: selectedZoneData.forecast.next6h > selectedZoneData.aqi ? 'hsl(var(--air-severe))' : 'hsl(var(--air-good))',
                          color: 'white',
                          borderColor: 'transparent'
                        }}>
                          {selectedZoneData.forecast.next6h}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                        <span className="text-xs text-muted-foreground">Next 24 hours</span>
                        <Badge variant="outline" style={{ 
                          backgroundColor: selectedZoneData.forecast.next24h > selectedZoneData.aqi ? 'hsl(var(--air-severe))' : 'hsl(var(--air-good))',
                          color: 'white',
                          borderColor: 'transparent'
                        }}>
                          {selectedZoneData.forecast.next24h}
                        </Badge>
                      </div>
                      <div className="text-xs text-center py-1 capitalize">
                        <span className={getTrendColor(selectedZoneData.forecast.trend)}>
                          Trend: {selectedZoneData.forecast.trend}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Historical Data */}
                  <div>
                    <h4 className="font-medium text-sm mb-3">Recent History</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedZoneData.historical.map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-muted/20 rounded text-xs">
                          <span className="text-muted-foreground">{entry.timestamp}</span>
                          <span className="font-medium">{entry.aqi}</span>
                        </div>
                      ))}
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
                <p className="text-sm">Click on any zone marker to view responsible parties and violation details</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleMap;