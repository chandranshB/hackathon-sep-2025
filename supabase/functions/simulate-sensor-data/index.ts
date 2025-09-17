import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Define sensor locations (Delhi NCR area)
    const sensorLocations = [
      { id: 'sensor_001', lat: 28.6139, lng: 77.2090, name: 'Connaught Place' },
      { id: 'sensor_002', lat: 28.5355, lng: 77.3910, name: 'Noida Sector 62' },
      { id: 'sensor_003', lat: 28.4595, lng: 77.0266, name: 'Gurgaon Cyber City' },
      { id: 'sensor_004', lat: 28.6692, lng: 77.4538, name: 'Ghaziabad' },
      { id: 'sensor_005', lat: 28.7041, lng: 77.1025, name: 'Delhi University' },
      { id: 'sensor_006', lat: 28.5800, lng: 77.3200, name: 'Greater Noida' },
      { id: 'sensor_007', lat: 28.4089, lng: 76.9900, name: 'Faridabad' },
      { id: 'sensor_008', lat: 28.6850, lng: 77.2200, name: 'Red Fort Area' },
    ];

    const readings = [];
    const currentTime = new Date();

    for (const sensor of sensorLocations) {
      // Generate realistic pollution data based on location and time
      const hour = currentTime.getHours();
      let basePM25 = 45; // Base PM2.5 level
      
      // Adjust for rush hours and industrial activity
      if (hour >= 7 && hour <= 9) basePM25 += 25; // Morning rush
      if (hour >= 17 && hour <= 20) basePM25 += 30; // Evening rush
      if (hour >= 10 && hour <= 16) basePM25 += 15; // Industrial hours
      if (hour >= 22 || hour <= 5) basePM25 -= 20; // Night time
      
      // Add location-specific variations
      if (sensor.name.includes('Cyber City') || sensor.name.includes('Gurgaon')) basePM25 += 20;
      if (sensor.name.includes('Delhi University')) basePM25 -= 10;
      if (sensor.name.includes('Red Fort')) basePM25 += 15;
      
      // Add random variation
      const variation = (Math.random() - 0.5) * 30;
      const pm25 = Math.max(5, basePM25 + variation);
      const pm10 = pm25 * 1.8;
      
      // Generate other pollutants
      const o3 = Math.random() * 80 + 20;
      const no2 = Math.random() * 40 + 15;
      const so2 = Math.random() * 25 + 5;
      const co = Math.random() * 1500 + 800;
      
      // Calculate AQI using the database function (we'll approximate here)
      let aqi = Math.round(pm25 * 4.16); // Simplified calculation
      if (aqi > 500) aqi = 500;
      
      let aqi_level = 'good';
      if (aqi > 50) aqi_level = 'moderate';
      if (aqi > 100) aqi_level = 'poor';
      if (aqi > 150) aqi_level = 'severe';
      if (aqi > 200) aqi_level = 'very poor';
      if (aqi > 300) aqi_level = 'hazardous';
      
      // Environmental data
      const temperature = 25 + (Math.random() - 0.5) * 20;
      const humidity = 50 + (Math.random() - 0.5) * 40;
      const wind_speed = Math.random() * 15 + 2;
      const wind_direction = Math.round(Math.random() * 360);
      
      const reading = {
        sensor_id: sensor.id,
        latitude: sensor.lat,
        longitude: sensor.lng,
        pm25: Math.round(pm25 * 10) / 10,
        pm10: Math.round(pm10 * 10) / 10,
        o3: Math.round(o3 * 10) / 10,
        no2: Math.round(no2 * 10) / 10,
        so2: Math.round(so2 * 10) / 10,
        co: Math.round(co),
        aqi,
        aqi_level,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity),
        wind_speed: Math.round(wind_speed * 10) / 10,
        wind_direction,
        data_quality: Math.random() > 0.1 ? 'good' : 'moderate', // 90% good quality
        calibration_status: Math.random() > 0.05 ? 'calibrated' : 'needs_calibration', // 95% calibrated
        battery_level: Math.round(Math.random() * 30 + 70), // 70-100%
        timestamp: currentTime.toISOString(),
      };
      
      readings.push(reading);
    }

    // Insert all readings
    const { data, error } = await supabase
      .from('pollution_readings')
      .insert(readings);

    if (error) {
      console.error('Error inserting sensor data:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to insert sensor data', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully inserted ${readings.length} sensor readings`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Inserted ${readings.length} sensor readings`,
        readings: readings.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in simulate-sensor-data function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});