import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Eye, Thermometer } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  location: string;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate weather data - in real app, you'd fetch from a weather API
    const mockWeatherData: WeatherData = {
      temperature: 28,
      condition: "partly-cloudy",
      humidity: 65,
      windSpeed: 12,
      visibility: 8.5,
      location: "Dehradun"
    };

    setTimeout(() => {
      setWeather(mockWeatherData);
      setLoading(false);
    }, 1000);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-4 w-4 text-warning" />;
      case "partly-cloudy":
        return <Cloud className="h-4 w-4 text-muted-foreground" />;
      case "rainy":
        return <CloudRain className="h-4 w-4 text-primary" />;
      case "snowy":
        return <CloudSnow className="h-4 w-4 text-primary" />;
      default:
        return <Sun className="h-4 w-4 text-warning" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-4 h-4 bg-muted rounded"></div>
        <div className="w-12 h-4 bg-muted rounded"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="flex items-center space-x-3 text-sm">
      <div className="flex items-center space-x-1">
        {getWeatherIcon(weather.condition)}
        <span className="font-medium">{weather.temperature}°C</span>
      </div>
      <div className="hidden md:flex items-center space-x-2 text-xs text-muted-foreground">
        <Wind className="h-3 w-3" />
        <span>{weather.windSpeed} km/h</span>
        <Eye className="h-3 w-3" />
        <span>{weather.visibility} km</span>
      </div>
    </div>
  );
};

export default WeatherWidget;