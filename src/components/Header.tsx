import { useState } from "react";
import { Wind, MapPin, Activity, Settings, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import WeatherWidget from "./WeatherWidget";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50 animate-fade-in">
      <div className="container-mobile mx-auto py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 hover-scale cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
              <Wind className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground animate-pulse-glow" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">AirWatch</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Pollution Accountability System</p>
            </div>
          </div>

          {/* Weather & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <WeatherWidget />
            
            {/* Location - Hidden on small screens */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Dehradun</span>
            </div>

            {/* User Auth Section */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover-scale smooth-transition">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user?.user_metadata?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">
                      {user?.user_metadata?.display_name || user?.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="hover-scale">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="hover-scale">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive hover-scale">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')} size="sm" className="hover-scale glow-effect">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;