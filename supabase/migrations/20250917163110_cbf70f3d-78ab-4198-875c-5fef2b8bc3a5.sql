-- Create enhanced pollution reports table
CREATE TABLE IF NOT EXISTS pollution_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coordinates POINT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  images TEXT[] DEFAULT '{}',
  description TEXT,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  weather_context JSONB DEFAULT '{}'::jsonb,
  traffic_context JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced pollution zones table
CREATE TABLE IF NOT EXISTS enhanced_pollution_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  coordinates POINT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  current_aqi DECIMAL(5,2),
  level VARCHAR(50),
  reports_count INTEGER DEFAULT 0,
  heatmap_intensity DECIMAL(3,2),
  spread_radius INTEGER,
  forecast JSONB DEFAULT '{}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  location POINT,
  latitude REAL,
  longitude REAL,
  notification_radius INTEGER DEFAULT 5000,
  max_aqi_tolerance INTEGER DEFAULT 100,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create route cache table
CREATE TABLE IF NOT EXISTS route_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  start_location POINT NOT NULL,
  start_latitude REAL NOT NULL,
  start_longitude REAL NOT NULL,
  distance INTEGER NOT NULL,
  activity_type VARCHAR(20) NOT NULL,
  route_points JSONB NOT NULL,
  clean_air_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pollution_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_pollution_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for pollution_reports
CREATE POLICY "Users can insert their own reports" ON pollution_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" ON pollution_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view verified reports" ON pollution_reports
  FOR SELECT USING (verified = true);

-- Create policies for enhanced_pollution_zones
CREATE POLICY "Anyone can read pollution zones" ON enhanced_pollution_zones
  FOR SELECT USING (true);

-- Create policies for user_preferences
CREATE POLICY "Users can manage their preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for route_cache
CREATE POLICY "Users can access routes" ON route_cache
  FOR SELECT USING (true);

CREATE POLICY "Users can create routes" ON route_cache
  FOR INSERT WITH CHECK (true);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pollution_reports_updated_at
  BEFORE UPDATE ON pollution_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_pollution_zones_updated_at
  BEFORE UPDATE ON enhanced_pollution_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_cache_updated_at
  BEFORE UPDATE ON route_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for enhanced zones
INSERT INTO enhanced_pollution_zones (name, coordinates, latitude, longitude, current_aqi, level, heatmap_intensity, spread_radius, forecast) VALUES
('Clock Tower, Dehradun', POINT(78.0322, 30.3165), 30.3165, 78.0322, 98, 'moderate', 0.6, 600, '{"next6h": 92, "next24h": 85, "trend": "improving", "factors": ["reduced traffic", "wind pickup"]}'),
('ISBT Dehradun', POINT(78.0422, 30.3255), 30.3255, 78.0422, 156, 'poor', 0.85, 800, '{"next6h": 165, "next24h": 172, "trend": "worsening", "factors": ["bus emissions", "low wind"]}'),
('Forest Research Institute', POINT(78.0669, 30.3346), 30.3346, 78.0669, 42, 'good', 0.3, 400, '{"next6h": 45, "next24h": 38, "trend": "improving", "factors": ["forest buffer", "clean air"]}'),
('Rajpur Road', POINT(78.0747, 30.3629), 30.3629, 78.0747, 124, 'poor', 0.75, 700, '{"next6h": 135, "next24h": 142, "trend": "worsening", "factors": ["construction", "traffic"]}'),
('Rishav ka ghar', POINT(78.045251, 30.344681), 30.344681, 78.045251, 75, 'moderate', 0.5, 500, '{"next6h": 80, "next24h": 70, "trend": "stable", "factors": ["residential area", "moderate traffic"]}');