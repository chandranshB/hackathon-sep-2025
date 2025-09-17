import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, AlertTriangle, MapPin, TrendingUp, TrendingDown, Minus, WifiOff, Battery, Thermometer, Wind } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PollutionReading {
  id: string;
  sensor_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  pm25: number;
  pm10: number;
  o3?: number;
  no2?: number;
  so2?: number;
  co?: number;
  aqi: number;
  aqi_level: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  wind_direction?: number;
  data_quality: string;
  calibration_status: string;
  battery_level: number;
}

interface PollutionAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  aqi_value?: number;
  status: string;
  created_at: string;
  latitude: number;
  longitude: number;
}

const PollutionDetectionDashboard = () => {
  const [readings, setReadings] = useState<PollutionReading[]>([]);
  const [alerts, setAlerts] = useState<PollutionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch latest readings (one per sensor)
      const { data: readingsData, error: readingsError } = await supabase
        .from('pollution_readings')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (readingsError) throw readingsError;

      // Fetch active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('pollution_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      setReadings(readingsData || []);
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateSensorData = async () => {
    setIsSimulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('simulate-sensor-data');
      
      if (error) throw error;
      
      console.log('Sensor simulation result:', data);
      await fetchData(); // Refresh data after simulation
    } catch (error) {
      console.error('Error simulating sensor data:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const getAQIColor = (level: string) => {
    switch (level) {
      case 'good': return 'bg-air-good text-white';
      case 'moderate': return 'bg-air-moderate text-white';
      case 'poor': return 'bg-air-poor text-white';
      case 'severe': return 'bg-air-severe text-white';
      case 'very poor': return 'bg-air-severe text-white';
      case 'hazardous': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-warning" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDataQualityIcon = (quality: string) => {
    switch (quality) {
      case 'good': return <Activity className="h-3 w-3 text-air-good" />;
      case 'moderate': return <Minus className="h-3 w-3 text-warning" />;
      case 'poor': return <WifiOff className="h-3 w-3 text-destructive" />;
      default: return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscriptions
    const readingsSubscription = supabase
      .channel('pollution_readings_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pollution_readings'
      }, (payload) => {
        console.log('New reading:', payload);
        fetchData();
      })
      .subscribe();

    const alertsSubscription = supabase
      .channel('pollution_alerts_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pollution_alerts'
      }, (payload) => {
        console.log('New alert:', payload);
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(readingsSubscription);
      supabase.removeChannel(alertsSubscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const activeAlerts = alerts.length;
  const avgAQI = readings.length > 0 ? Math.round(readings.reduce((sum, r) => sum + r.aqi, 0) / readings.length) : 0;
  const sensorsOnline = readings.length;
  const criticalReadings = readings.filter(r => r.aqi > 200).length;

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Pollution Detection System</span>
            </CardTitle>
            <Button 
              onClick={simulateSensorData} 
              disabled={isSimulating}
              variant="outline"
            >
              {isSimulating ? 'Simulating...' : 'Simulate Sensor Data'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{activeAlerts}</p>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{avgAQI}</p>
                <p className="text-xs text-muted-foreground">Average AQI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-air-good" />
              <div>
                <p className="text-2xl font-bold">{sensorsOnline}</p>
                <p className="text-xs text-muted-foreground">Sensors Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{criticalReadings}</p>
                <p className="text-xs text-muted-foreground">Critical Readings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Active Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id} className="border-l-4 border-l-warning">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>AQI: {alert.aqi_value}</span>
                          <span>Type: {alert.alert_type}</span>
                          <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
                        </div>
                      </AlertDescription>
                    </div>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sensor Readings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Live Sensor Readings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readings.map((reading) => (
              <Card key={reading.id} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-sm">{reading.sensor_id}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className={getAQIColor(reading.aqi_level)}>
                      {reading.aqi} AQI
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">PM2.5:</span>
                      <span className="ml-1 font-medium">{reading.pm25} μg/m³</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PM10:</span>
                      <span className="ml-1 font-medium">{reading.pm10} μg/m³</span>
                    </div>
                    {reading.temperature && (
                      <div className="flex items-center space-x-1">
                        <Thermometer className="h-3 w-3" />
                        <span className="font-medium">{reading.temperature}°C</span>
                      </div>
                    )}
                    {reading.wind_speed && (
                      <div className="flex items-center space-x-1">
                        <Wind className="h-3 w-3" />
                        <span className="font-medium">{reading.wind_speed} m/s</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      {getDataQualityIcon(reading.data_quality)}
                      <span className="text-xs">{reading.data_quality}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Battery className="h-3 w-3" />
                      <span className="text-xs">{reading.battery_level}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {readings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sensor readings available.</p>
              <p className="text-sm">Click "Simulate Sensor Data" to generate test data.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PollutionDetectionDashboard;