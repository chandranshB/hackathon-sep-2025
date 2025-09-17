import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  updated_at: string;
  latitude: number;
  longitude: number;
}

interface PollutionZone {
  id: string;
  name: string;
  zone_type: string;
  geometry: any;
  aqi_warning_threshold: number;
  aqi_critical_threshold: number;
  population_density?: number;
  sensitive_receptors?: string[];
  is_active: boolean;
}

export const usePollutionData = () => {
  const [readings, setReadings] = useState<PollutionReading[]>([]);
  const [alerts, setAlerts] = useState<PollutionAlert[]>([]);
  const [zones, setZones] = useState<PollutionZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('pollution_readings')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching readings:', err);
      throw err;
    }
  };

  const fetchAlerts = async (status?: string) => {
    try {
      let query = supabase
        .from('pollution_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching alerts:', err);
      throw err;
    }
  };

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('pollution_zones')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching zones:', err);
      throw err;
    }
  };

  const fetchLatestReadingsBySensor = async () => {
    try {
      // Get the latest reading for each sensor using a simple query
      const { data, error } = await supabase
        .from('pollution_readings')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching latest readings by sensor:', err);
      throw err;
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('pollution_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      
      // Refresh alerts
      const updatedAlerts = await fetchAlerts();
      setAlerts(updatedAlerts);
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      throw err;
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('pollution_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      
      // Refresh alerts
      const updatedAlerts = await fetchAlerts();
      setAlerts(updatedAlerts);
    } catch (err) {
      console.error('Error resolving alert:', err);
      throw err;
    }
  };

  const getReadingsInArea = async (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('pollution_readings')
        .select('*')
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching readings in area:', err);
      throw err;
    }
  };

  const getAQITrend = async (sensorId: string, hours = 24) => {
    try {
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('pollution_readings')
        .select('timestamp, aqi, pm25, pm10')
        .eq('sensor_id', sensorId)
        .gte('timestamp', hoursAgo.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching AQI trend:', err);
      throw err;
    }
  };

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [readingsData, alertsData, zonesData] = await Promise.all([
        fetchLatestReadingsBySensor(),
        fetchAlerts('active'),
        fetchZones()
      ]);

      setReadings(readingsData as PollutionReading[]);
      setAlerts(alertsData as PollutionAlert[]);
      setZones(zonesData as PollutionZone[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pollution data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();

    // Set up real-time subscriptions
    const readingsSubscription = supabase
      .channel('pollution_readings_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pollution_readings'
      }, () => {
        fetchLatestReadingsBySensor().then(data => setReadings(data as PollutionReading[]));
      })
      .subscribe();

    const alertsSubscription = supabase
      .channel('pollution_alerts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pollution_alerts'
      }, () => {
        fetchAlerts('active').then(data => setAlerts(data as PollutionAlert[]));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(readingsSubscription);
      supabase.removeChannel(alertsSubscription);
    };
  }, []);

  return {
    readings,
    alerts,
    zones,
    loading,
    error,
    // Methods
    fetchReadings,
    fetchAlerts,
    fetchZones,
    acknowledgeAlert,
    resolveAlert,
    getReadingsInArea,
    getAQITrend,
    refreshData: initializeData
  };
};