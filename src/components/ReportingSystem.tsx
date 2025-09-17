import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera, Upload, Zap, MapPin, CheckCircle, AlertTriangle,
  Eye, Clock, Target, Loader2, X, Image
} from "lucide-react";
import { PollutionReport, WeatherData, TrafficData } from "@/pages/Index";

interface ReportingSystemProps {
  onNewReport: (report: PollutionReport) => void;
  userLocation: [number, number];
}

// Simulated AI Analysis Function - Replace with actual AI service
const analyzeImageForPollution = async (imageBase64: string, description: string): Promise<PollutionReport['aiAnalysis']> => {
  return new Promise((resolve) => {
    // Simulate AI processing delay
    setTimeout(() => {
      // Enhanced mock AI analysis with more realistic results
      const pollutionKeywords = description.toLowerCase();
      let basePollutionLevel = Math.random() * 6 + 2; // 2-8 base level
      
      // Adjust based on description keywords
      if (pollutionKeywords.includes('smoke') || pollutionKeywords.includes('fire')) {
        basePollutionLevel += 2;
      }
      if (pollutionKeywords.includes('traffic') || pollutionKeywords.includes('vehicle')) {
        basePollutionLevel += 1;
      }
      if (pollutionKeywords.includes('industrial') || pollutionKeywords.includes('factory')) {
        basePollutionLevel += 3;
      }
      if (pollutionKeywords.includes('dust') || pollutionKeywords.includes('construction')) {
        basePollutionLevel += 1.5;
      }
      
      // Determine pollution types based on analysis
      const pollutionTypes: ('smoke' | 'dust' | 'smog' | 'industrial' | 'vehicle' | 'burning')[] = [];
      if (pollutionKeywords.includes('smoke') || basePollutionLevel > 7) pollutionTypes.push('smoke');
      if (pollutionKeywords.includes('dust') || pollutionKeywords.includes('construction')) pollutionTypes.push('dust');
      if (pollutionKeywords.includes('traffic') || pollutionKeywords.includes('vehicle')) pollutionTypes.push('vehicle');
      if (pollutionKeywords.includes('industrial') || pollutionKeywords.includes('factory')) pollutionTypes.push('industrial');
      if (pollutionKeywords.includes('fire') || pollutionKeywords.includes('burning')) pollutionTypes.push('burning');
      if (basePollutionLevel > 6 && pollutionTypes.length === 0) pollutionTypes.push('smog');
      if (pollutionTypes.length === 0) pollutionTypes.push('dust'); // Default
      
      // Determine severity
      let severity: 'low' | 'medium' | 'high' | 'critical';
      if (basePollutionLevel <= 3) severity = 'low';
      else if (basePollutionLevel <= 5) severity = 'medium';
      else if (basePollutionLevel <= 8) severity = 'high';
      else severity = 'critical';
      
      const mockAnalysis: PollutionReport['aiAnalysis'] = {
        pollutionLevel: Math.min(10, basePollutionLevel),
        pollutionTypes: pollutionTypes.slice(0, 3), // Max 3 types
        visibility: Math.max(2, 10 - basePollutionLevel + Math.random() * 2),
        severity,
        spreadRadius: Math.random() * 400 + 200 + (basePollutionLevel * 50), // 200-800 meters
        confidence: Math.random() * 0.25 + 0.7, // 0.7-0.95 confidence
        duration: Math.random() * 4 + 2 + (basePollutionLevel * 0.5) // 2-8 hours
      };
      
      console.log('AI Analysis completed:', mockAnalysis);
      resolve(mockAnalysis);
    }, 2000 + Math.random() * 1000); // 2-3 second processing
  });
};

// Mock weather data fetch - replace with actual API
const fetchWeatherData = async (coordinates: [number, number]): Promise<WeatherData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    temperature: 25 + Math.random() * 10,
    humidity: 40 + Math.random() * 40,
    windSpeed: Math.random() * 20,
    windDirection: Math.random() * 360,
    precipitation: Math.random() * 3,
    condition: ['sunny', 'cloudy', 'rainy', 'windy'][Math.floor(Math.random() * 4)] as any,
    pressureMb: 1000 + Math.random() * 30
  };
};

// Mock traffic data fetch - replace with actual API
const fetchTrafficData = async (coordinates: [number, number]): Promise<TrafficData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const hour = new Date().getHours();
  const isRushHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
  
  return {
    vehicleCount: Math.floor(Math.random() * 150) + (isRushHour ? 200 : 50),
    averageSpeed: Math.random() * 30 + (isRushHour ? 15 : 35),
    congestionLevel: Math.random() * (isRushHour ? 8 : 4) + (isRushHour ? 4 : 2),
    heavyVehiclePercentage: Math.random() * 25 + 10,
    idleTime: Math.random() * (isRushHour ? 180 : 60) + 30
  };
};

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const ReportingSystem: React.FC<ReportingSystemProps> = ({ onNewReport, userLocation }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [reportForm, setReportForm] = useState({
    description: '',
    coordinates: userLocation,
    images: [] as File[]
  });
  const [lastAnalysis, setLastAnalysis] = useState<PollutionReport['aiAnalysis'] | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - reportForm.images.length); // Max 5 images
      setReportForm(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setReportForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitReport = async () => {
    if (reportForm.images.length === 0) {
      alert('Please upload at least one image for AI analysis.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Convert first image to base64 for analysis
      const imageBase64 = await fileToBase64(reportForm.images[0]);
      
      // AI Analysis
      const aiAnalysis = await analyzeImageForPollution(imageBase64, reportForm.description);
      setLastAnalysis(aiAnalysis);
      
      // Fetch contextual data
      const [weather, traffic] = await Promise.all([
        fetchWeatherData(reportForm.coordinates),
        fetchTrafficData(reportForm.coordinates)
      ]);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Create pollution report
      const newReport: PollutionReport = {
        id: Date.now().toString(),
        userId: 'user123', // Replace with actual user ID
        coordinates: reportForm.coordinates,
        timestamp: new Date().toISOString(),
        images: [imageBase64], // In production, store URLs
        description: reportForm.description,
        aiAnalysis,
        weatherContext: weather,
        trafficContext: traffic,
        verified: false
      };
      
      // Submit report
      onNewReport(newReport);
      
      // Reset form
      setReportForm({ 
        description: '', 
        coordinates: userLocation, 
        images: [] 
      });
      
      // Success notification
      setTimeout(() => {
        setIsReporting(false);
        alert(`Report submitted successfully! AI detected ${aiAnalysis.severity} pollution with ${(aiAnalysis.confidence * 100).toFixed(0)}% confidence.`);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error analyzing report. Please try again.');
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 1500);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setReportForm(prev => ({ ...prev, coordinates: coords }));
        },
        (error) => {
          console.error('Location error:', error);
          alert('Could not get your location. Using default coordinates.');
        }
      );
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>AI Pollution Reporter</span>
          </div>
          {lastAnalysis && (
            <Badge className={`text-xs ${getSeverityColor(lastAnalysis.severity)}`}>
              Last: {lastAnalysis.severity}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isReporting ? (
          <div className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => setIsReporting(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Report Pollution with AI
            </Button>
            
            {lastAnalysis && (
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="text-sm font-medium mb-2 flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Last Analysis Results</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Severity:</span>
                    <Badge className={getSeverityColor(lastAnalysis.severity)}>
                      {lastAnalysis.severity}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="font-medium">{(lastAnalysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pollution Level:</span>
                    <span className="font-medium">{lastAnalysis.pollutionLevel.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Spread:</span>
                    <span className="font-medium">{Math.round(lastAnalysis.spreadRadius)}m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Types detected:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lastAnalysis.pollutionTypes.map((type, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Upload Images/Videos</span>
                <Badge variant="outline" className="text-xs">
                  {reportForm.images.length}/5
                </Badge>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="w-full mt-2 p-2 border rounded text-sm"
                disabled={isAnalyzing || reportForm.images.length >= 5}
              />
              <div className="text-xs text-muted-foreground mt-1">
                AI will analyze pollution levels, types, and spread automatically
              </div>
              
              {/* Image Preview */}
              {reportForm.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {reportForm.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-16 bg-muted rounded border flex items-center justify-center text-xs">
                        {file.name.substring(0, 15)}...
                      </div>
                      {!isAnalyzing && (
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={getCurrentLocation}
                  disabled={isAnalyzing}
                >
                  Use Current
                </Button>
              </label>
              <div className="text-xs text-muted-foreground mt-1">
                Lat: {reportForm.coordinates[0].toFixed(6)}, 
                Lng: {reportForm.coordinates[1].toFixed(6)}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                value={reportForm.description}
                onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you're seeing (smoke, dust, traffic, etc.)..."
                className="mt-1 text-sm"
                rows={3}
                disabled={isAnalyzing}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Keywords like "smoke", "traffic", "dust" help improve AI accuracy
              </div>
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    AI Analysis in Progress...
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  {analysisProgress < 30 && "Processing images..."}
                  {analysisProgress >= 30 && analysisProgress < 60 && "Analyzing pollution patterns..."}
                  {analysisProgress >= 60 && analysisProgress < 90 && "Calculating spread and severity..."}
                  {analysisProgress >= 90 && "Finalizing report..."}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmitReport}
                disabled={reportForm.images.length === 0 || isAnalyzing}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Submit for AI Analysis
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsReporting(false);
                  setReportForm({ description: '', coordinates: userLocation, images: [] });
                }}
                disabled={isAnalyzing}
              >
                Cancel
              </Button>
            </div>

            {/* File Info */}
            {reportForm.images.length > 0 && !isAnalyzing && (
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <div className="text-xs text-green-700 flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>{reportForm.images.length} file(s) ready for AI analysis</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportingSystem;