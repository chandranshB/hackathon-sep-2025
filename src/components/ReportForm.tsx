import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  CheckCircle,
  Loader2,
  AlertTriangle,
  Factory,
  Car,
  Hammer,
  Flame,
  Video
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  isEnforcementMode?: boolean;
}

const pollutionTypes = [
  { id: 'vehicle', name: 'Vehicle Emissions', icon: Car, color: 'bg-blue-500' },
  { id: 'industrial', name: 'Industrial Pollution', icon: Factory, color: 'bg-red-500' },
  { id: 'construction', name: 'Construction Dust', icon: Hammer, color: 'bg-yellow-500' },
  { id: 'burning', name: 'Waste/Open Burning', icon: Flame, color: 'bg-orange-500' }
];

// Convert image to WebP format for efficient storage
const convertToWebP = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = Math.min(img.width, 1920); // Max width for efficiency
      canvas.height = (canvas.width / img.width) * img.height;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        'image/webp',
        0.8 // Good quality with compression
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const ReportForm = ({ isOpen, onClose, isEnforcementMode = false }: ReportFormProps) => {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    severity: 'moderate' as 'low' | 'moderate' | 'high' | 'severe'
  });
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding to get address (using OpenStreetMap Nominatim)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        
        setLocation({
          latitude,
          longitude,
          address: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
      } catch {
        setLocation({
          latitude,
          longitude,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
      }

      toast({
        title: "Location captured",
        description: "Your current location has been recorded for this report."
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Unable to get your location. Please enable location services.",
        variant: "destructive"
      });
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    if (images.length + files.length > 3) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 3 images per report.",
        variant: "destructive"
      });
      return;
    }

    try {
      const convertedImages = await Promise.all(
        files.map(file => convertToWebP(file))
      );
      
      setImages(prev => [...prev, ...convertedImages]);
      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) added and optimized for storage.`
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to process images. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location Required",
        description: "Please capture your location for this report.",
        variant: "destructive"
      });
      return;
    }

    // Cross-check location for enforcement mode
    if (isEnforcementMode) {
      const enforcementZones = [
        { name: "Rishav ka ghar", lat: 30.344681, lng: 78.045251, radius: 1 },
        { name: "Dehradun City Center", lat: 30.3165, lng: 78.0322, radius: 2 },
        { name: "Industrial Area", lat: 30.3500, lng: 78.0500, radius: 3 }
      ];

      const isInEnforcementZone = enforcementZones.some(zone => {
        const distance = Math.sqrt(
          Math.pow(location.latitude - zone.lat, 2) + 
          Math.pow(location.longitude - zone.lng, 2)
        ) * 111; // Rough conversion to km
        return distance <= zone.radius;
      });

      if (!isInEnforcementZone) {
        toast({
          title: "Outside Enforcement Zone",
          description: "You must be within an active enforcement zone to file an enforcement action.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API submission
      const reportData = {
        ...formData,
        location,
        images,
        videos,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
        status: 'submitted'
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Report submitted:', reportData);
      
      toast({
        title: isEnforcementMode ? "Enforcement Action Initiated!" : "Report Submitted Successfully!",
        description: isEnforcementMode 
          ? "Enforcement action has been logged and immediate action will be taken." 
          : "Your pollution report has been recorded and will be reviewed by authorities.",
      });

      // Reset form
      setFormData({ type: '', description: '', severity: 'moderate' });
      setImages([]);
      setVideos([]);
      setLocation(null);
      onClose();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    if (videos.length + files.length > 2) {
      toast({
        title: "Too many videos",
        description: "You can upload maximum 2 videos per report.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 50MB per video)
    const oversizedFiles = files.filter(file => file.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Video files must be smaller than 50MB each.",
        variant: "destructive"
      });
      return;
    }

    try {
      const videoUrls = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );
      
      setVideos(prev => [...prev, ...videoUrls]);
      toast({
        title: "Videos uploaded",
        description: `${files.length} video(s) added successfully.`
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to process videos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-air-good',
      moderate: 'bg-air-moderate', 
      high: 'bg-air-poor',
      severe: 'bg-air-severe'
    };
    return colors[severity as keyof typeof colors] || colors.moderate;
  };

  useEffect(() => {
    if (isOpen) {
      // Auto-capture location when form opens
      getCurrentLocation();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>{isEnforcementMode ? "Take Enforcement Action" : "Report Pollution"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pollution Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type of Pollution *</Label>
            <div className="grid grid-cols-2 gap-2">
              {pollutionTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Button
                    key={type.id}
                    variant={formData.type === type.id ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-center space-y-2"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="text-xs text-center">{type.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Severity Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Severity Level</Label>
            <div className="flex space-x-2">
              {['low', 'moderate', 'high', 'severe'].map((level) => (
                <Button
                  key={level}
                  variant={formData.severity === level ? "default" : "outline"}
                  size="sm"
                  className="flex-1 capitalize"
                  onClick={() => setFormData(prev => ({ ...prev, severity: level as any }))}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${getSeverityColor(level)}`} />
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the pollution source, its impact, and any other relevant details..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location *</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isLocationLoading}
                className="flex items-center space-x-2"
              >
                {isLocationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>{isLocationLoading ? 'Getting Location...' : 'Get Current Location'}</span>
              </Button>
            </div>
            {location && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-success mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Location Captured</p>
                    <p className="text-xs text-muted-foreground">{location.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Evidence Photos (Optional)</Label>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center space-x-2"
                disabled={images.length >= 3}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Photos ({images.length}/3)</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Evidence Videos (Optional)</Label>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => videoInputRef.current?.click()}
                className="w-full flex items-center space-x-2"
                disabled={videos.length >= 2}
              >
                <Video className="h-4 w-4" />
                <span>Upload Videos ({videos.length}/2)</span>
              </Button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
              />
              
              {videos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((video, index) => (
                    <div key={index} className="relative">
                      <video
                        src={video}
                        className="w-full h-20 object-cover rounded-lg"
                        controls={false}
                        muted
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeVideo(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;