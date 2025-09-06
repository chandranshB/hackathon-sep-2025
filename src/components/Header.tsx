import { Shield, Eye, AlertTriangle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentView: 'public' | 'government';
  onViewChange: (view: 'public' | 'government') => void;
}

const Header = ({ currentView, onViewChange }: HeaderProps) => {
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

          {/* Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* View Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={currentView === 'public' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('public')}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Public</span>
                <span className="text-xs sm:hidden">Pub</span>
              </Button>
              <Button
                variant={currentView === 'government' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('government')}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Government</span>
                <span className="text-xs sm:hidden">Gov</span>
              </Button>
            </div>

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