import { Camera, MapPin, Home, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  onStartReport: () => void;
  onPlanRoute: () => void;
  activeTab?: string;
}

const BottomNavigation = ({ onStartReport, onPlanRoute, activeTab = "home" }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-40 md:hidden">
      <div className="grid grid-cols-4 gap-1 p-2">
        <Button
          variant={activeTab === "home" ? "default" : "ghost"}
          size="sm"
          className="flex-col h-16 px-2"
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">Home</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-16 px-2"
          onClick={onStartReport}
        >
          <Camera className="h-5 w-5 mb-1" />
          <span className="text-xs">Report</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-16 px-2"
          onClick={onPlanRoute}
        >
          <MapPin className="h-5 w-5 mb-1" />
          <span className="text-xs">Route</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-col h-16 px-2"
        >
          <BarChart className="h-5 w-5 mb-1" />
          <span className="text-xs">Stats</span>
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;