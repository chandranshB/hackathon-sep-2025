import { AlertTriangle, MapPin } from "lucide-react";
import WeatherWidget from "./WeatherWidget";

const Header = () => {
  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container-mobile mx-auto py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">AirWatch</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Pollution Accountability System</p>
            </div>
          </div>

          {/* Weather & Location */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <WeatherWidget />
            
            {/* Location - Hidden on small screens */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Dehradun</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;