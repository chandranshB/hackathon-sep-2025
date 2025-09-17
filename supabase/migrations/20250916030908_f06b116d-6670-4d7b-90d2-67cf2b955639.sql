-- Create pollution sensor readings table
CREATE TABLE public.pollution_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  location POINT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Air Quality Measurements
  pm25 REAL NOT NULL,
  pm10 REAL NOT NULL,
  o3 REAL,
  no2 REAL,
  so2 REAL,
  co REAL,
  
  -- Calculated AQI
  aqi INTEGER NOT NULL,
  aqi_level TEXT NOT NULL CHECK (aqi_level IN ('good', 'moderate', 'poor', 'severe', 'very poor', 'hazardous')),
  
  -- Environmental data
  temperature REAL,
  humidity REAL,
  wind_speed REAL,
  wind_direction INTEGER,
  
  -- Metadata
  data_quality TEXT DEFAULT 'good' CHECK (data_quality IN ('good', 'moderate', 'poor')),
  calibration_status TEXT DEFAULT 'calibrated' CHECK (calibration_status IN ('calibrated', 'needs_calibration')),
  battery_level INTEGER DEFAULT 100,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pollution alerts table
CREATE TABLE public.pollution_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('spike', 'threshold', 'trend', 'system')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location POINT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  
  -- Alert details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  aqi_value INTEGER,
  threshold_exceeded TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Related data
  reading_id UUID REFERENCES public.pollution_readings(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pollution zones table for predefined monitoring areas
CREATE TABLE public.pollution_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('industrial', 'residential', 'commercial', 'traffic', 'sensitive')),
  geometry JSONB NOT NULL, -- GeoJSON polygon
  
  -- Thresholds for this zone
  aqi_warning_threshold INTEGER DEFAULT 100,
  aqi_critical_threshold INTEGER DEFAULT 150,
  
  -- Zone metadata
  population_density INTEGER,
  sensitive_receptors TEXT[], -- schools, hospitals, etc.
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_pollution_readings_timestamp ON public.pollution_readings(timestamp DESC);
CREATE INDEX idx_pollution_readings_location ON public.pollution_readings USING GIST(location);
CREATE INDEX idx_pollution_readings_sensor_timestamp ON public.pollution_readings(sensor_id, timestamp DESC);
CREATE INDEX idx_pollution_readings_aqi_level ON public.pollution_readings(aqi_level, timestamp DESC);

CREATE INDEX idx_pollution_alerts_status ON public.pollution_alerts(status, created_at DESC);
CREATE INDEX idx_pollution_alerts_location ON public.pollution_alerts USING GIST(location);
CREATE INDEX idx_pollution_alerts_severity ON public.pollution_alerts(severity, created_at DESC);

CREATE INDEX idx_pollution_zones_type ON public.pollution_zones(zone_type);
CREATE INDEX idx_pollution_zones_active ON public.pollution_zones(is_active);

-- Enable Row Level Security
ALTER TABLE public.pollution_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollution_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollution_zones ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (pollution data should be publicly accessible)
CREATE POLICY "Public can view pollution readings" 
ON public.pollution_readings FOR SELECT 
USING (true);

CREATE POLICY "Public can view pollution alerts" 
ON public.pollution_alerts FOR SELECT 
USING (true);

CREATE POLICY "Public can view pollution zones" 
ON public.pollution_zones FOR SELECT 
USING (true);

-- Function to calculate AQI from pollutant concentrations
CREATE OR REPLACE FUNCTION public.calculate_aqi(
  pm25_val REAL,
  pm10_val REAL,
  o3_val REAL DEFAULT NULL,
  no2_val REAL DEFAULT NULL,
  so2_val REAL DEFAULT NULL,
  co_val REAL DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  aqi_pm25 INTEGER := 0;
  aqi_pm10 INTEGER := 0;
  max_aqi INTEGER := 0;
BEGIN
  -- Calculate AQI for PM2.5 (most critical pollutant)
  IF pm25_val <= 12 THEN
    aqi_pm25 := ROUND((50.0 / 12.0) * pm25_val);
  ELSIF pm25_val <= 35.4 THEN
    aqi_pm25 := ROUND(50 + ((100 - 50) / (35.4 - 12.1)) * (pm25_val - 12.1));
  ELSIF pm25_val <= 55.4 THEN
    aqi_pm25 := ROUND(100 + ((150 - 100) / (55.4 - 35.5)) * (pm25_val - 35.5));
  ELSIF pm25_val <= 150.4 THEN
    aqi_pm25 := ROUND(150 + ((200 - 150) / (150.4 - 55.5)) * (pm25_val - 55.5));
  ELSIF pm25_val <= 250.4 THEN
    aqi_pm25 := ROUND(200 + ((300 - 200) / (250.4 - 150.5)) * (pm25_val - 150.5));
  ELSE
    aqi_pm25 := ROUND(300 + ((400 - 300) / (350.4 - 250.5)) * (pm25_val - 250.5));
  END IF;
  
  -- Calculate AQI for PM10
  IF pm10_val <= 54 THEN
    aqi_pm10 := ROUND((50.0 / 54.0) * pm10_val);
  ELSIF pm10_val <= 154 THEN
    aqi_pm10 := ROUND(50 + ((100 - 50) / (154 - 55)) * (pm10_val - 55));
  ELSIF pm10_val <= 254 THEN
    aqi_pm10 := ROUND(100 + ((150 - 100) / (254 - 155)) * (pm10_val - 155));
  ELSIF pm10_val <= 354 THEN
    aqi_pm10 := ROUND(150 + ((200 - 150) / (354 - 255)) * (pm10_val - 255));
  ELSIF pm10_val <= 424 THEN
    aqi_pm10 := ROUND(200 + ((300 - 200) / (424 - 355)) * (pm10_val - 355));
  ELSE
    aqi_pm10 := ROUND(300 + ((400 - 300) / (504 - 425)) * (pm10_val - 425));
  END IF;
  
  -- Return the highest AQI (most restrictive)
  max_aqi := GREATEST(aqi_pm25, aqi_pm10);
  
  RETURN LEAST(500, GREATEST(0, max_aqi));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get AQI level from numeric value
CREATE OR REPLACE FUNCTION public.get_aqi_level(aqi_value INTEGER) 
RETURNS TEXT AS $$
BEGIN
  IF aqi_value <= 50 THEN RETURN 'good';
  ELSIF aqi_value <= 100 THEN RETURN 'moderate';
  ELSIF aqi_value <= 150 THEN RETURN 'poor';
  ELSIF aqi_value <= 200 THEN RETURN 'severe';
  ELSIF aqi_value <= 300 THEN RETURN 'very poor';
  ELSE RETURN 'hazardous';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to detect pollution spikes and create alerts
CREATE OR REPLACE FUNCTION public.detect_pollution_spike()
RETURNS TRIGGER AS $$
DECLARE
  avg_aqi REAL;
  spike_threshold REAL := 1.5; -- 50% increase
  zone_threshold INTEGER;
BEGIN
  -- Calculate average AQI for the same sensor over the last hour
  SELECT AVG(aqi) INTO avg_aqi
  FROM public.pollution_readings
  WHERE sensor_id = NEW.sensor_id 
    AND timestamp >= NEW.timestamp - INTERVAL '1 hour'
    AND timestamp < NEW.timestamp;
  
  -- If we have enough historical data and detect a spike
  IF avg_aqi IS NOT NULL AND NEW.aqi > (avg_aqi * spike_threshold) AND NEW.aqi > 100 THEN
    INSERT INTO public.pollution_alerts (
      alert_type,
      severity,
      location,
      latitude,
      longitude,
      title,
      description,
      aqi_value,
      reading_id
    ) VALUES (
      'spike',
      CASE 
        WHEN NEW.aqi > 200 THEN 'critical'
        WHEN NEW.aqi > 150 THEN 'high'
        ELSE 'medium'
      END,
      NEW.location,
      NEW.latitude,
      NEW.longitude,
      'Pollution Spike Detected',
      FORMAT('AQI spiked to %s (%.1f%% increase from recent average of %.1f)', 
             NEW.aqi, 
             ((NEW.aqi - avg_aqi) / avg_aqi) * 100, 
             avg_aqi),
      NEW.aqi,
      NEW.id
    );
  END IF;
  
  -- Check zone-specific thresholds
  SELECT aqi_critical_threshold INTO zone_threshold
  FROM public.pollution_zones
  WHERE ST_Contains(
    ST_GeomFromGeoJSON(geometry),
    NEW.location
  ) AND is_active = true
  LIMIT 1;
  
  -- Create threshold alert if zone threshold is exceeded
  IF zone_threshold IS NOT NULL AND NEW.aqi > zone_threshold THEN
    INSERT INTO public.pollution_alerts (
      alert_type,
      severity,
      location,
      latitude,
      longitude,
      title,
      description,
      aqi_value,
      threshold_exceeded,
      reading_id
    ) VALUES (
      'threshold',
      'critical',
      NEW.location,
      NEW.latitude,
      NEW.longitude,
      'Zone Threshold Exceeded',
      FORMAT('AQI of %s exceeds zone critical threshold of %s', NEW.aqi, zone_threshold),
      NEW.aqi,
      FORMAT('Zone critical threshold: %s', zone_threshold),
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pollution spike detection
CREATE TRIGGER trigger_detect_pollution_spike
  AFTER INSERT ON public.pollution_readings
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_pollution_spike();

-- Function to update alert timestamps
CREATE OR REPLACE FUNCTION public.update_alert_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for alert timestamp updates
CREATE TRIGGER trigger_update_alert_timestamp
  BEFORE UPDATE ON public.pollution_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_alert_timestamp();

-- Insert sample pollution zones for testing
INSERT INTO public.pollution_zones (name, zone_type, geometry, aqi_warning_threshold, aqi_critical_threshold, population_density, sensitive_receptors) VALUES 
(
  'Industrial District', 
  'industrial', 
  '{"type": "Polygon", "coordinates": [[[77.2070, 28.6130], [77.2120, 28.6130], [77.2120, 28.6180], [77.2070, 28.6180], [77.2070, 28.6130]]]}',
  120, 
  180,
  1500,
  ARRAY['Factory Workers', 'Nearby Residential Areas']
),
(
  'School Zone', 
  'sensitive', 
  '{"type": "Polygon", "coordinates": [[[77.2000, 28.6100], [77.2050, 28.6100], [77.2050, 28.6150], [77.2000, 28.6150], [77.2000, 28.6100]]]}',
  80, 
  120,
  800,
  ARRAY['Delhi Public School', 'Children Playground', 'Senior Citizen Center']
);

-- Enable realtime for the tables
ALTER TABLE public.pollution_readings REPLICA IDENTITY FULL;
ALTER TABLE public.pollution_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.pollution_zones REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.pollution_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pollution_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pollution_zones;