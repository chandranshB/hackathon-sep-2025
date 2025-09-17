-- Fix security warnings by setting search_path for functions
ALTER FUNCTION public.calculate_aqi(REAL, REAL, REAL, REAL, REAL, REAL) SET search_path = public;
ALTER FUNCTION public.get_aqi_level(INTEGER) SET search_path = public;
ALTER FUNCTION public.detect_pollution_spike() SET search_path = public;
ALTER FUNCTION public.update_alert_timestamp() SET search_path = public;