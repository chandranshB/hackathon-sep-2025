import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Route, Navigation, MapPin, Zap, CheckCircle, AlertTriangle,
  Clock, Target, TrendingUp, Wind, Footprints, Bike
} from "lucide-react";
import { PollutionZone } from "@/pages/Index";

interface RouteGeneratorProps {
  pollutionZones: PollutionZone[];
  userLocation: [number, number];
}

interface RouteRequest {
  startLocation: [number, number];
  distance: number; // desired distance in km
  activityType: 'walking' | 'cycling';
  maxPollution: number; // maximum acceptable AQI
}

interface RoutePoint {
  coordinates: [number, number];
  aqi: number;
  distanceFromStart: number;
}

interface GeneratedRoute {
  points: RoutePoint[];
  totalDistance: number;
  averageAQI: number;
  maxAQI: number;
  cleanAirScore: number; // 0-100%
  estimatedDuration: number; // minutes
  warnings: string[];
  created: Date;
}

// Calculate distance between two points using Haversine formula
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

// Get pollution level at a specific point
const getPollutionAtPoint = (point: [number, number], zones: PollutionZone[]): number => {
  let totalPollution = 0;
  let weightSum = 0;
  let minDistance = Infinity;
  let closestZoneAQI = 50; // Default moderate AQI
  
  zones.forEach(zone => {
    const distance = calculateDistance(point, zone.coordinates);
    minDistance = Math.min(minDistance, distance);
    
    if (distance <= zone.spreadRadius) {
      // Within pollution radius - weighted by proximity
      const weight = Math.max(0.1, 1 - (distance / zone.spreadRadius));
      totalPollution += zone.aqi * weight;
      weightSum += weight;
    } else if (distance <= zone.spreadRadius * 2) {
      // In extended influence area with reduced impact
      const weight = Math.max(0.05, 0.3 * (1 - (distance - zone.spreadRadius) / zone.spreadRadius));
      totalPollution += zone.aqi * weight;
      weightSum += weight;
    }
    
    // Track closest zone for fallback
    if (distance < calculateDistance(point, zones.find(z => z.aqi === closestZoneAQI)?.coordinates || [0, 0])) {
      closestZoneAQI = zone.aqi;
    }
  });
  
  // If no zones influence this point, use interpolated value from closest zone
  if (weightSum === 0) {
    const fallbackFactor = Math.min(1, minDistance / 2000); // Reduce influence over 2km
    return Math.max(30, closestZoneAQI * (1 - fallbackFactor * 0.5)); // Minimum 30 AQI
  }
  
  return totalPollution / weightSum;
};

// Advanced route generation algorithm
const generateOptimizedRoute = (request: RouteRequest, zones: PollutionZone[]): GeneratedRoute => {
  const { startLocation, distance, maxPollution, activityType } = request;
  const targetDistance = distance * 1000; // Convert to meters
  const stepSize = Math.min(150, targetDistance / 20); // Dynamic step size, max 150m
  const maxSteps = Math.ceil(targetDistance / stepSize) * 2; // Allow for detours
  
  let currentLocation = startLocation;
  let totalDistance = 0;
  let points: RoutePoint[] = [{
    coordinates: startLocation,
    aqi: getPollutionAtPoint(startLocation, zones),
    distanceFromStart: 0
  }];
  
  // Phase 1: Outbound journey (60% of target distance)
  const outboundTarget = targetDistance * 0.6;
  let currentAngle = Math.random() * 360; // Random initial direction
  
  while (totalDistance < outboundTarget && points.length < maxSteps) {
    const bestDirection = findBestDirection(
      currentLocation, 
      currentAngle, 
      stepSize, 
      zones, 
      maxPollution,
      60 // Search angle range
    );
    
    const nextPoint = moveInDirection(currentLocation, bestDirection.angle, stepSize);
    const aqi = getPollutionAtPoint(nextPoint, zones);
    
    // Adaptive step size based on pollution levels
    const actualStepSize = aqi > maxPollution ? stepSize * 0.7 : stepSize;
    const adjustedNextPoint = moveInDirection(currentLocation, bestDirection.angle, actualStepSize);
    const adjustedDistance = calculateDistance(currentLocation, adjustedNextPoint);
    
    currentLocation = adjustedNextPoint;
    totalDistance += adjustedDistance;
    currentAngle = bestDirection.angle + (Math.random() - 0.5) * 30; // Add some randomness
    
    points.push({
      coordinates: currentLocation,
      aqi: getPollutionAtPoint(currentLocation, zones),
      distanceFromStart: totalDistance
    });
  }
  
  // Phase 2: Return journey with waypoints
  const returnPoints = generateReturnRoute(
    currentLocation, 
    startLocation, 
    zones, 
    maxPollution,
    targetDistance - totalDistance,
    stepSize
  );
  
  points.push(...returnPoints);
  
  // Calculate final metrics
  const finalDistance = points.reduce((sum, point, i) => 
    i === 0 ? 0 : sum + calculateDistance(points[i-1].coordinates, point.coordinates), 0
  );
  
  const averageAQI = points.reduce((sum, point) => sum + point.aqi, 0) / points.length;
  const maxAQI = Math.max(...points.map(point => point.aqi));
  const cleanAirScore = Math.max(0, Math.min(100, (1 - averageAQI / 200) * 100));
  
  // Calculate duration based on activity type
  const speedKmh = activityType === 'walking' ? 5 : 15; // walking: 5km/h, cycling: 15km/h
  const estimatedDuration = Math.round((finalDistance / 1000) / speedKmh * 60); // minutes
  
  // Generate warnings
  const warnings: string[] = [];
  if (maxAQI > maxPollution) {
    warnings.push(`Route passes through areas with AQI up to ${Math.round(maxAQI)}`);
  }
  if (averageAQI > maxPollution * 0.8) {
    warnings.push('Route has higher pollution than preferred');
  }
  if (Math.abs(finalDistance - targetDistance) > targetDistance * 0.2) {
    warnings.push(`Actual distance (${(finalDistance/1000).toFixed(1)}km) differs from target`);
  }
  if (cleanAirScore < 60) {
    warnings.push('Limited clean air options in this area');
  }
  
  return {
    points: points.map(point => ({
      ...point,
      aqi: Math.round(point.aqi * 10) / 10
    })),
    totalDistance: finalDistance,
    averageAQI: Math.round(averageAQI * 10) / 10,
    maxAQI: Math.round(maxAQI * 10) / 10,
    cleanAirScore: Math.round(cleanAirScore),
    estimatedDuration,
    warnings,
    created: new Date()
  };
};

// Find best direction considering pollution levels
const findBestDirection = (
  from: [number, number], 
  preferredAngle: number, 
  distance: number, 
  zones: PollutionZone[], 
  maxPollution: number,
  searchRange: number
): { angle: number; aqi: number } => {
  let bestAngle = preferredAngle;
  let bestAQI = Infinity;
  
  // Test multiple directions within search range
  for (let offset = -searchRange; offset <= searchRange; offset += 15) {
    const testAngle = preferredAngle + offset;
    const testPoint = moveInDirection(from, testAngle, distance);
    const testAQI = getPollutionAtPoint(testPoint, zones);
    
    // Prefer directions with lower pollution, but also consider preferred direction
    const directionPenalty = Math.abs(offset) / searchRange * 10; // 0-10 penalty
    const adjustedAQI = testAQI + directionPenalty;
    
    if (adjustedAQI < bestAQI && testAQI <= maxPollution * 1.2) { // Allow 20% tolerance
      bestAQI = testAQI;
      bestAngle = testAngle;
    }
  }
  
  return { angle: bestAngle, aqi: bestAQI };
};

// Move in a specific direction by distance
const moveInDirection = (from: [number, number], angle: number, distance: number): [number, number] => {
  const rad = (angle * Math.PI) / 180;
  const deltaLat = distance / 111000; // ~111km per degree latitude
  const deltaLng = distance / (111000 * Math.cos(from[0] * Math.PI / 180));
  
  const newLat = from[0] + deltaLat * Math.cos(rad);
  const newLng = from[1] + deltaLng * Math.sin(rad);
  
  return [newLat, newLng];
};

// Generate return route to starting point
const generateReturnRoute = (
  from: [number, number], 
  to: [number, number], 
  zones: PollutionZone[], 
  maxPollution: number,
  remainingDistance: number,
  stepSize: number
): RoutePoint[] => {
  const directDistance = calculateDistance(from, to);
  const returnPoints: RoutePoint[] = [];
  
  // If remaining distance is less than direct distance, go straight back
  if (remainingDistance <= directDistance * 1.2) {
    const steps = Math.max(3, Math.ceil(directDistance / stepSize));
    
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const lat = from[0] + (to[0] - from[0]) * progress;
      const lng = from[1] + (to[1] - from[1]) * progress;
      const coordinates: [number, number] = [lat, lng];
      
      // Try to avoid high pollution areas
      const adjustedCoordinates = adjustPointForPollution(coordinates, zones, maxPollution);
      const distanceFromStart = calculateDistance(to, adjustedCoordinates);
      
      returnPoints.push({
        coordinates: adjustedCoordinates,
        aqi: getPollutionAtPoint(adjustedCoordinates, zones),
        distanceFromStart
      });
    }
  } else {
    // Create a scenic return route
    const extraDistance = remainingDistance - directDistance;
    const detourSteps = Math.ceil(extraDistance / stepSize);
    const totalSteps = Math.ceil(directDistance / stepSize) + detourSteps;
    
    let currentPos = from;
    let accumulatedDistance = 0;
    
    for (let i = 1; i <= totalSteps; i++) {
      const progress = i / totalSteps;
      
      // Add some curvature for scenic route
      const baseAngle = Math.atan2(to[1] - from[1], to[0] - from[0]) * 180 / Math.PI;
      const curveOffset = Math.sin(progress * Math.PI) * 30; // 30-degree curve
      const targetAngle = baseAngle + curveOffset;
      
      const bestDirection = findBestDirection(currentPos, targetAngle, stepSize, zones, maxPollution, 45);
      const nextPos = moveInDirection(currentPos, bestDirection.angle, stepSize);
      
      accumulatedDistance += calculateDistance(currentPos, nextPos);
      currentPos = nextPos;
      
      returnPoints.push({
        coordinates: currentPos,
        aqi: getPollutionAtPoint(currentPos, zones),
        distanceFromStart: accumulatedDistance
      });
    }
    
    // Ensure we end at the starting point
    if (calculateDistance(currentPos, to) > 100) {
      returnPoints.push({
        coordinates: to,
        aqi: getPollutionAtPoint(to, zones),
        distanceFromStart: accumulatedDistance + calculateDistance(currentPos, to)
      });
    }
  }
  
  return returnPoints;
};

// Adjust point to avoid high pollution if possible
const adjustPointForPollution = (
  point: [number, number], 
  zones: PollutionZone[], 
  maxPollution: number
): [number, number] => {
  const currentAQI = getPollutionAtPoint(point, zones);
  if (currentAQI <= maxPollution) return point;
  
  // Try nearby points to find cleaner air
  const searchRadius = 300; // 300m search radius
  let bestPoint = point;
  let bestAQI = currentAQI;
  
  for (let angle = 0; angle < 360; angle += 45) {
    const testPoint = moveInDirection(point, angle, searchRadius);
    const testAQI = getPollutionAtPoint(testPoint, zones);
    
    if (testAQI < bestAQI) {
      bestAQI = testAQI;
      bestPoint = testPoint;
    }
  }
  
  return bestPoint;
};

const RouteGenerator: React.FC<RouteGeneratorProps> = ({ pollutionZones, userLocation }) => {
  const [routeRequest, setRouteRequest] = useState<RouteRequest>({
    startLocation: userLocation,
    distance: 5,
    activityType: 'walking',
    maxPollution: 100
  });
  
  const [generatedRoute, setGeneratedRoute] = useState<GeneratedRoute | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update start location when user location changes
  useEffect(() => {
    setRouteRequest(prev => ({ ...prev, startLocation: userLocation }));
  }, [userLocation]);

  const handleGenerateRoute = async () => {
    setIsGenerating(true);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      try {
        const route = generateOptimizedRoute(routeRequest, pollutionZones);
        setGeneratedRoute(route);
      } catch (error) {
        console.error('Error generating route:', error);
        alert('Error generating route. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  const getRouteQualityColor = (score: number): string => {
    if (score >= 80) return 'text-success bg-alert-success border-success/50';
    if (score >= 60) return 'text-warning bg-alert-warning border-warning/50';
    if (score >= 40) return 'text-alert-error-foreground bg-alert-warning border-warning/50';
    return 'text-alert-error-foreground bg-alert-error border-alert-error/50';
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setRouteRequest(prev => ({ ...prev, startLocation: coords }));
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Route className="h-5 w-5" />
          <span>Clean Air Route Planner</span>
          {generatedRoute && (
            <Badge className={`ml-auto ${getRouteQualityColor(generatedRoute.cleanAirScore)}`}>
              {generatedRoute.cleanAirScore}% Clean
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Distance (km)</label>
            <Input
              type="number"
              value={routeRequest.distance}
              onChange={(e) => setRouteRequest(prev => ({ 
                ...prev, 
                distance: Math.max(1, Math.min(20, parseFloat(e.target.value) || 5))
              }))}
              className="mt-1"
              min="1"
              max="20"
              step="0.5"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Activity Type</label>
            <select
              value={routeRequest.activityType}
              onChange={(e) => setRouteRequest(prev => ({ 
                ...prev, 
                activityType: e.target.value as 'walking' | 'cycling'
              }))}
              className="w-full mt-1 p-2 border rounded text-sm"
            >
              <option value="walking">🚶 Walking</option>
              <option value="cycling">🚴 Cycling</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Max AQI Tolerance</label>
            <Input
              type="number"
              value={routeRequest.maxPollution}
              onChange={(e) => setRouteRequest(prev => ({ 
                ...prev, 
                maxPollution: Math.max(50, Math.min(200, parseInt(e.target.value) || 100))
              }))}
              className="mt-1"
              min="50"
              max="200"
              step="10"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm font-medium">Start Location</label>
            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              className="mt-1 h-10"
            >
              <Navigation className="h-4 w-4 mr-1" />
              Use Current
            </Button>
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateRoute}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating Optimal Route...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Generate Clean Air Route
            </>
          )}
        </Button>

        {/* Route Results */}
        {generatedRoute && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Generated Route</h3>
              <Badge variant="outline" className="text-xs">
                {generatedRoute.points.length} waypoints
              </Badge>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg text-center">
                <div className="text-lg font-bold">{(generatedRoute.totalDistance / 1000).toFixed(1)}km</div>
                <div className="text-xs text-muted-foreground">Total Distance</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg text-center">
                <div className="text-lg font-bold flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {generatedRoute.estimatedDuration}min
                </div>
                <div className="text-xs text-muted-foreground">Estimated Time</div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg text-center">
                <div className="text-lg font-bold">{generatedRoute.averageAQI}</div>
                <div className="text-xs text-muted-foreground">Average AQI</div>
              </div>
              <div className={`p-3 rounded-lg text-center border ${getRouteQualityColor(generatedRoute.cleanAirScore)}`}>
                <div className="text-lg font-bold">{generatedRoute.cleanAirScore}%</div>
                <div className="text-xs">Clean Air Score</div>
              </div>
            </div>

            {/* Route Quality Details */}
            <div className="bg-muted/20 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Max AQI:</span>
                  <span className={`font-medium ${generatedRoute.maxAQI > routeRequest.maxPollution ? 'text-destructive' : 'text-success'}`}>
                    {generatedRoute.maxAQI}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Activity:</span>
                  <span className="font-medium flex items-center">
                    {routeRequest.activityType === 'walking' ? <Footprints className="h-3 w-3 mr-1" /> : <Bike className="h-3 w-3 mr-1" />}
                    {routeRequest.activityType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Waypoints:</span>
                  <span className="font-medium">{generatedRoute.points.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Generated:</span>
                  <span className="font-medium">{generatedRoute.created.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {generatedRoute.warnings.length > 0 && (
              <div className="bg-alert-warning border border-warning/50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-alert-warning-foreground" />
                  <span className="text-sm font-medium text-alert-warning-foreground">Route Advisories</span>
                </div>
                <div className="space-y-1">
                  {generatedRoute.warnings.map((warning, idx) => (
                    <div key={idx} className="text-xs text-alert-warning-foreground/80 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                Start Navigation
              </Button>
            </div>

            {/* Route Quality Summary */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                This route has been optimized to minimize exposure to air pollution while maintaining your desired distance and activity type.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteGenerator;