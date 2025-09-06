import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Factory, Car, Hammer, Flame, Layers } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

// Dehradun coordinates with real pollution data simulation
const pollutionZones: PollutionZone[] = [
  {
    id: "1",
    name: "Clock Tower",
    coordinates: [30.3165, 78.0322],
    aqi: 98,
    level: 'moderate',
    violators: [
      { type: 'vehicle', name: 'Heavy Traffic (350+ vehicles/hr)', contribution: 55 },
      { type: 'construction', name: 'Smart City Development', contribution: 25 },
      { type: 'industry', name: 'Commercial Generators', contribution: 20 }
    ]
  },
  {
    id: "2", 
    name: "ISBT Dehradun",
    coordinates: [30.3255, 78.0422],
    aqi: 156,
    level: 'poor',
    violators: [
      { type: 'vehicle', name: 'Interstate Bus Terminal', contribution: 65 },
      { type: 'industry', name: 'Diesel Generators', contribution: 25 },
      { type: 'burning', name: 'Waste Burning', contribution: 10 }
    ]
  },
  {
    id: "3",
    name: "Forest Research Institute", 
    coordinates: [30.3346, 78.0669],
    aqi: 42,
    level: 'good',
    violators: [
      { type: 'vehicle', name: 'Light Traffic', contribution: 70 },
      { type: 'construction', name: 'Maintenance Work', contribution: 30 }
    ]
  },
  {
    id: "4",
    name: "Rishav ka ghar",
    coordinates: [30.344681, 78.045251],
    aqi: 65,
    level: 'moderate',
    violators: [
      { type: 'vehicle', name: 'Residential Traffic', contribution: 40 },
      { type: 'industry', name: 'Small Workshop', contribution: 35 },
      { type: 'burning', name: 'Occasional Waste Burning', contribution: 25 }
    ]
  },
  {
    id: "5",
    name: "Rajpur Road",
    coordinates: [30.3629, 78.0747],
    aqi: 124,
    level: 'poor', 
    violators: [
      { type: 'vehicle', name: 'Commercial Vehicles', contribution: 50 },
      { type: 'construction', name: 'Road Widening', contribution: 35 },
      { type: 'industry', name: 'Hotel Generators', contribution: 15 }
    ]
  },
  {
    id: "5",
    name: "ONGC Dehradun",
    coordinates: [30.2679, 78.0599], 
    aqi: 189,
    level: 'poor',
    violators: [
      { type: 'industry', name: 'Oil & Gas Operations', contribution: 60 },
      { type: 'vehicle', name: 'Industrial Traffic', contribution: 30 },
      { type: 'burning', name: 'Flare Emissions', contribution: 10 }
    ]
  },
  {
    id: "6",
    name: "Rishav ka ghar",
    coordinates: [30.344681, 78.045251],
    aqi: 65,
    level: 'moderate',
    violators: [
      { type: 'vehicle', name: 'Residential Traffic', contribution: 40 },
      { type: 'industry', name: 'Small Workshop', contribution: 35 },
      { type: 'burning', name: 'Occasional Waste Burning', contribution: 25 }
    ]
  }
];

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
  return icons[type as keyof typeof icons];
};

const PollutionMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const selectedZoneData = pollutionZones.find(zone => zone.id === selectedZone);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [30.3165, 78.0322],
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
  }, []);

  // Update markers when heatmap visibility changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(layer => map.removeLayer(layer));
    markersRef.current = [];

    // Add pollution zone markers
    pollutionZones.forEach((zone) => {
      const markerSize = Math.max(8, Math.min(20, zone.aqi / 10));
      const heatmapRadius = Math.max(50, Math.min(200, zone.aqi * 1.2)); // Realistic size
      
      // Main pollution marker
      const marker = L.circleMarker([zone.coordinates[0], zone.coordinates[1]], {
        color: '#ffffff',
        weight: 2,
        fillColor: getAqiColor(zone.level),
        fillOpacity: 0.9,
        radius: markerSize
      });

      // Realistic heatmap layers (only if enabled)
      if (showHeatmap) {
        // Outer fading circle
        const outerCircle = L.circle([zone.coordinates[0], zone.coordinates[1]], {
          color: 'transparent',
          fillColor: getAqiColor(zone.level),
          fillOpacity: 0.08,
          radius: heatmapRadius,
          weight: 0
        });
        
        // Inner stronger circle  
        const innerCircle = L.circle([zone.coordinates[0], zone.coordinates[1]], {
          color: 'transparent',
          fillColor: getAqiColor(zone.level),
          fillOpacity: 0.15,
          radius: heatmapRadius * 0.6,
          weight: 0
        });

        outerCircle.addTo(map);
        innerCircle.addTo(map);
        markersRef.current.push(outerCircle, innerCircle);
      }

      // Enhanced popup
      const violatorsList = zone.violators.map(v => 
        `<li style="display: flex; justify-content: space-between; margin: 2px 0;"><strong>${v.name}</strong><span>${v.contribution}%</span></li>`
      ).join('');

      const trend = zone.aqi > 100 ? 'increasing' : 'stable';
      const forecast = zone.aqi > 150 ? 'Poor for next 3 hours' : 'Moderate conditions expected';

      marker.bindPopup(`
        <div style="max-width: 280px; font-size: 13px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${zone.name}</h3>
          
          <div style="margin-bottom: 12px;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; color: white; background-color: ${getAqiColor(zone.level)};">
              AQI: ${zone.aqi} (${zone.level.toUpperCase()})
            </span>
          </div>
          
          <div style="margin-bottom: 12px; padding: 8px; background: #f9fafb; border-radius: 6px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">
              📈 Trend: ${trend} | 🔮 Forecast: ${forecast}
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <strong style="color: #dc2626; font-size: 11px;">Main Contributors:</strong>
            <ul style="margin: 4px 0 0 0; padding: 0; list-style: none; font-size: 11px;">${violatorsList}</ul>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        setSelectedZone(selectedZone === zone.id ? null : zone.id);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [showHeatmap, selectedZone]);

  return (
    <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-3">
      {/* Map Container */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span className="text-base sm:text-lg">Live Pollution Map - Dehradun</span>
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          <div 
            ref={mapRef} 
            className="w-full h-64 sm:h-80 lg:h-96 rounded-b-lg"
          />
        </CardContent>
      </Card>

      {/* Zone Details */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            {selectedZoneData ? 'Zone Analysis' : 'City Overview'}
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
                    AQI: {selectedZoneData.aqi}
                  </Badge>
                  <span className="text-sm text-muted-foreground capitalize">
                    {selectedZoneData.level}
                  </span>
                </div>
              </div>

              {/* Pollution Trends */}
              <div className="bg-muted/30 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">24h Trend</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-background rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, selectedZoneData.aqi / 3)}%`,
                        backgroundColor: getAqiColor(selectedZoneData.level)
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {selectedZoneData.aqi > 100 ? '+12%' : '-5%'}
                  </span>
                </div>
              </div>

              {/* Forecast */}
              <div className="bg-muted/30 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">3-Hour Forecast</h4>
                <p className="text-xs text-muted-foreground">
                  {selectedZoneData.aqi > 150 
                    ? 'Air quality expected to remain poor. Avoid outdoor activities.' 
                    : 'Moderate conditions expected. Take precautions for sensitive individuals.'}
                </p>
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
            <div className="space-y-4">
              {/* City Average */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">City Average AQI</h4>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold">112</div>
                  <div>
                    <Badge className="bg-air-poor text-white">Moderate</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Based on 5 monitoring stations</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-air-poor">3</div>
                  <div className="text-xs text-muted-foreground">High pollution zones</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-air-good">2</div>
                  <div className="text-xs text-muted-foreground">Clean zones</div>
                </div>
              </div>

              <div className="text-center py-4 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click on any zone marker to view detailed analysis</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PollutionMap;