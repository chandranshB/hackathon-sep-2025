import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  AlertTriangle, 
  Camera, 
  TrendingUp, 
  Users, 
  FileText,
  Shield,
  MapPin,
  Clock
} from "lucide-react";
import PollutionMap from "./PollutionMap";
import ReportForm from "./ReportForm";
import RouteNavigator from "./RouteNavigator";
import AQITrendChart from "./AQITrendChart";

const PublicDashboard = () => {
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [isRouteNavigatorOpen, setIsRouteNavigatorOpen] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover-scale">
          <CardContent className="card-mobile">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-air-poor/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-air-poor" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">156</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Current AQI</p>
                <Badge variant="outline" className="bg-air-poor text-white border-air-poor text-xs">
                  Poor
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="card-mobile">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">847</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Violations Today</p>
                <div className="flex items-center text-xs text-destructive">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="truncate">+23% from yesterday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="card-mobile">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">₹24.5L</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Fines Issued</p>
                <div className="flex items-center text-xs text-success">
                  <Users className="h-3 w-3 mr-1" />
                  <span className="truncate">342 violators</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="card-mobile">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">1,247</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Citizen Reports</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="truncate">Last hour</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <PollutionMap />

      {/* AQI Trend Chart */}
      <AQITrendChart />

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Report a Polluter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="card-mobile space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              Spotted a violation? Help us maintain clean air by reporting polluters with photo evidence.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-success rounded-full flex-shrink-0"></div>
                <span>Automatic location tagging</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-success rounded-full flex-shrink-0"></div>
                <span>Real-time status tracking</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-success rounded-full flex-shrink-0"></div>
                <span>Reward points for verified reports</span>
              </div>
            </div>
            <Button 
              className="w-full btn-mobile animate-scale-in"
              onClick={() => setIsReportFormOpen(true)}
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Report
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Clean Route Navigator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="card-mobile space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              Plan your journey through cleaner air zones and avoid heavily polluted areas.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-air-good rounded-full flex-shrink-0"></div>
                <span>Real-time air quality routing</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-air-good rounded-full flex-shrink-0"></div>
                <span>Health impact calculator</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-air-good rounded-full flex-shrink-0"></div>
                <span>Alternative route suggestions</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full btn-mobile"
              onClick={() => setIsRouteNavigatorOpen(true)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Plan Clean Route
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Violations */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Recent Enforcement Actions</CardTitle>
        </CardHeader>
        <CardContent className="card-mobile">
          <div className="space-y-4">
            {[
              {
                time: "2 hours ago",
                violation: "Heavy diesel truck without valid PUC",
                location: "Ring Road, Lajpat Nagar",
                fine: "₹5,000",
                status: "Fine Issued"
              },
              {
                time: "3 hours ago", 
                violation: "Industrial emission exceeding limits",
                location: "ABC Steel Industries, Phase-1",
                fine: "₹2,50,000",
                status: "Notice Served"
              },
              {
                time: "5 hours ago",
                violation: "Construction site without dust covers",
                location: "Metro Line 3, Connaught Place",
                fine: "₹15,000", 
                status: "Compliance Required"
              }
            ].map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg hover-scale space-y-2 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate">{item.violation}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">{item.location}</div>
                  <div className="text-xs text-muted-foreground">{item.time}</div>
                </div>
                <div className="text-left sm:text-right flex sm:block justify-between items-center sm:items-end">
                  <div className="font-medium text-destructive text-sm sm:text-base">{item.fine}</div>
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Form Modal */}
      <ReportForm 
        isOpen={isReportFormOpen} 
        onClose={() => setIsReportFormOpen(false)} 
      />

      {/* Route Navigator Modal */}
      <RouteNavigator
        isOpen={isRouteNavigatorOpen}
        onClose={() => setIsRouteNavigatorOpen(false)}
      />
    </div>
  );
};

export default PublicDashboard;