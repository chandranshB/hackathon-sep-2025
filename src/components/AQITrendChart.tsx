import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Calendar, TrendingUp, Clock } from "lucide-react";

interface AQIDataPoint {
  time: string;
  hour: number;
  current: number;
  forecast: number;
  isPeak: boolean;
  category: string;
}

const AQITrendChart = () => {
  const [chartData, setChartData] = useState<AQIDataPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("24h");

  useEffect(() => {
    generateRealisticData();
  }, [selectedPeriod]);

  const generateRealisticData = () => {
    const now = new Date();
    const data: AQIDataPoint[] = [];
    
    // Generate 24 hours of data
    for (let i = -12; i <= 12; i++) {
      const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hourNum = hour.getHours();
      
      // Realistic AQI patterns - higher during rush hours and industrial hours
      let baseAQI = 80;
      
      // Morning rush (7-9 AM)
      if (hourNum >= 7 && hourNum <= 9) baseAQI += 40;
      // Evening rush (5-8 PM) 
      if (hourNum >= 17 && hourNum <= 20) baseAQI += 50;
      // Industrial hours (10 AM - 4 PM)
      if (hourNum >= 10 && hourNum <= 16) baseAQI += 25;
      // Night time (lower pollution)
      if (hourNum >= 22 || hourNum <= 5) baseAQI -= 30;
      
      // Add some randomness
      const variation = Math.random() * 20 - 10;
      const currentAQI = Math.max(20, Math.min(300, baseAQI + variation));
      
      // Forecast is slightly different from current
      const forecastVariation = Math.random() * 15 - 7.5;
      const forecastAQI = Math.max(20, Math.min(300, currentAQI + forecastVariation));
      
      // Determine if it's a peak time
      const isPeak = (hourNum >= 7 && hourNum <= 9) || (hourNum >= 17 && hourNum <= 20);
      
      data.push({
        time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hour: hourNum,
        current: i <= 0 ? Math.round(currentAQI) : 0, // Only show current data for past/present
        forecast: i >= 0 ? Math.round(forecastAQI) : 0, // Only show forecast for present/future
        isPeak,
        category: getAQICategory(currentAQI)
      });
    }
    
    setChartData(data);
  };

  const getAQICategory = (aqi: number): string => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Poor";
    if (aqi <= 200) return "Severe";
    return "Hazardous";
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return "hsl(var(--air-good))";
    if (aqi <= 100) return "hsl(var(--air-moderate))";
    if (aqi <= 150) return "hsl(var(--air-poor))";
    if (aqi <= 200) return "hsl(var(--air-severe))";
    return "hsl(var(--air-hazardous))";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mt-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.dataKey === 'current' ? 'Current' : 'Forecast'}: 
                <span className="font-medium ml-1">{entry.value} AQI</span>
              </span>
            </div>
          ))}
          <Badge 
            className="mt-2 text-xs" 
            style={{ backgroundColor: getAQIColor(data.current || data.forecast) }}
          >
            {data.category}
          </Badge>
          {data.isPeak && (
            <div className="flex items-center mt-1 text-xs text-warning">
              <TrendingUp className="h-3 w-3 mr-1" />
              Peak Traffic Hour
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const currentHour = new Date().getHours();
  const peakHours = chartData.filter(d => d.isPeak).map(d => d.hour);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>AQI Trend & Forecast</span>
          </CardTitle>
          <div className="flex space-x-2">
            {["24h", "7d", "30d"].map((period) => (
              <Badge
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--chart-text))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--chart-text))"
                fontSize={12}
                label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Peak hour reference lines */}
              {peakHours.map((hour) => (
                <ReferenceLine 
                  key={hour}
                  x={chartData.find(d => d.hour === hour)?.time}
                  stroke="hsl(var(--warning))"
                  strokeDasharray="2 2"
                  strokeOpacity={0.3}
                />
              ))}
              
              {/* Current time reference line */}
              <ReferenceLine 
                x={chartData.find(d => d.hour === currentHour)?.time}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              
              {/* Current AQI line */}
              <Line
                type="monotone"
                dataKey="current"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                connectNulls={false}
              />
              
              {/* Forecast AQI line */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="hsl(var(--air-moderate))"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={{ fill: "hsl(var(--air-moderate))", strokeWidth: 1, r: 3 }}
                activeDot={{ r: 5, stroke: "hsl(var(--air-moderate))", strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend and Peak Times */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-primary rounded"></div>
              <span>Current AQI</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-air-moderate rounded border-dashed border border-air-moderate"></div>
              <span>Forecast</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-primary rounded border-dashed border"></div>
              <span>Current Time</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-warning">
            <Clock className="h-4 w-4" />
            <span>Peak pollution hours: 7-9 AM, 5-8 PM</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="text-center p-2 bg-air-good/10 rounded">
              <div className="font-medium">Good</div>
              <div className="text-muted-foreground">0-50 AQI</div>
            </div>
            <div className="text-center p-2 bg-air-moderate/10 rounded">
              <div className="font-medium">Moderate</div>
              <div className="text-muted-foreground">51-100 AQI</div>
            </div>
            <div className="text-center p-2 bg-air-poor/10 rounded">
              <div className="font-medium">Poor</div>
              <div className="text-muted-foreground">101-150 AQI</div>
            </div>
            <div className="text-center p-2 bg-air-severe/10 rounded">
              <div className="font-medium">Severe</div>
              <div className="text-muted-foreground">151+ AQI</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AQITrendChart;