import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  AlertTriangle, 
  Car, 
  Factory, 
  Hammer, 
  Bell,
  Search,
  FileText,
  Camera,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";
import PollutionMap from "./PollutionMap";
import ReportForm from "./ReportForm";

const GovernmentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEnforcementFormOpen, setIsEnforcementFormOpen] = useState(false);

  const pendingViolations = [
    {
      id: "VIO-2024-001234",
      type: "VEHICLE_PUC_EXPIRED",
      vehicle: "DL-1CA-1234", 
      location: "Ring Road, CP",
      detectedAt: "10:30 AM",
      fine: "₹5,000",
      priority: "medium"
    },
    {
      id: "VIO-2024-001235",
      type: "INDUSTRY_EMISSION",
      violator: "ABC Steel Industries",
      location: "Industrial Area Phase-1",
      detectedAt: "09:45 AM", 
      fine: "₹2,50,000",
      priority: "high"
    },
    {
      id: "VIO-2024-001236",
      type: "CONSTRUCTION_DUST",
      violator: "Metro Line 3 Project",
      location: "Connaught Place",
      detectedAt: "11:15 AM",
      fine: "₹15,000", 
      priority: "medium"
    }
  ];

const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getViolationIcon = (type: string) => {
    switch(type) {
      case 'VEHICLE_PUC_EXPIRED': return Car;
      case 'INDUSTRY_EMISSION': return Factory;
      case 'CONSTRUCTION_DUST': return Hammer;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Alert Banner */}
      <Card className="border-destructive bg-destructive/5 animate-scale-in">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Bell className="h-5 w-5 text-destructive animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-destructive text-sm sm:text-base">High Priority Alert</div>
              <div className="text-xs sm:text-sm text-destructive/80">
                Industrial emission spike detected in Phase-1 area. Immediate investigation required.
              </div>
            </div>
            <Button 
              size="sm" 
              variant="destructive" 
              className="self-start sm:self-auto btn-mobile"
              onClick={() => setIsEnforcementFormOpen(true)}
            >
              Take Enforcement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enforcement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Pending Actions</p>
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Actions Today</p>
                <div className="flex items-center text-xs text-success">
                  <Clock className="h-3 w-3 mr-1" />
                  Avg: 8 min response
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹8.7L</p>
                <p className="text-sm text-muted-foreground">Fines Collected</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>89% collection rate</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Camera className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">42</p>
                <p className="text-sm text-muted-foreground">Citizen Reports</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Awaiting review</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Search & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by vehicle number, company name, or violation ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm">
              <Car className="h-4 w-4 mr-2" />
              Vehicle Lookup
            </Button>
            <Button variant="outline" size="sm">
              <Factory className="h-4 w-4 mr-2" />
              Industry Monitor
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Review Evidence
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Violations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Enforcement Actions</CardTitle>
            <Badge variant="destructive">{pendingViolations.length} Pending</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingViolations.map((violation) => {
              const IconComponent = getViolationIcon(violation.type);
              return (
                <div key={violation.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {violation.vehicle || violation.violator}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {violation.location} • {violation.detectedAt}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {violation.id}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <Badge variant={getPriorityColor(violation.priority)} className="text-xs">
                        {violation.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <div className="font-medium text-destructive">
                        {violation.fine}
                      </div>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm">
                          Issue Notice
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Monitoring */}
      <PollutionMap />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Camera Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Ring Road Junction", status: "Active", alerts: 2 },
                { name: "Industrial Gate 1", status: "Active", alerts: 0 },
                { name: "Metro Construction", status: "Offline", alerts: 0 },
                { name: "Main Market Area", status: "Active", alerts: 1 }
              ].map((camera, index) => (
                <div key={index} className="relative">
                  <div className="aspect-video bg-muted rounded border flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium">{camera.name}</div>
                    <div className="flex items-center justify-between text-xs">
                      <Badge 
                        variant={camera.status === 'Active' ? 'outline' : 'secondary'}
                        className="text-xs"
                      >
                        {camera.status}
                      </Badge>
                      {camera.alerts > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {camera.alerts} alerts
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sensor Network Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { location: "Connaught Place", aqi: 89, status: "Online", lastUpdate: "2 min ago" },
                { location: "Industrial Phase-1", aqi: 187, status: "Online", lastUpdate: "1 min ago" },
                { location: "Diplomatic Enclave", aqi: 34, status: "Online", lastUpdate: "3 min ago" },
                { location: "Old Delhi Market", aqi: 156, status: "Maintenance", lastUpdate: "45 min ago" }
              ].map((sensor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                  <div>
                    <div className="font-medium">{sensor.location}</div>
                    <div className="text-sm text-muted-foreground">
                      Last update: {sensor.lastUpdate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">AQI {sensor.aqi}</div>
                    <Badge 
                      variant={sensor.status === 'Online' ? 'outline' : 'secondary'}
                      className="text-xs"
                    >
                      {sensor.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enforcement Form Modal */}
      <ReportForm 
        isOpen={isEnforcementFormOpen} 
        onClose={() => setIsEnforcementFormOpen(false)}
        isEnforcementMode={true}
      />
    </div>
  );
};

export default GovernmentDashboard;