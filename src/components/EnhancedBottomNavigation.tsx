import { useState, useEffect } from "react";
import { 
  Home, 
  Camera, 
  MapPin, 
  Trophy, 
  BarChart, 
  User, 
  Plus,
  Navigation,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavigationProps {
  onStartReport: () => void;
  onPlanRoute: () => void;
  onShowLeaderboard: () => void;
  onShowStats: () => void;
  activeTab?: string;
  notifications?: number;
}

const EnhancedBottomNavigation = ({ 
  onStartReport, 
  onPlanRoute, 
  onShowLeaderboard,
  onShowStats,
  activeTab = "home",
  notifications = 0
}: BottomNavigationProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [showReportOptions, setShowReportOptions] = useState(false);

  useEffect(() => {
    // Update active tab based on current route
    const path = location.pathname;
    if (path === '/') setCurrentTab('home');
    else if (path === '/leaderboard') setCurrentTab('leaderboard');
    else if (path === '/stats') setCurrentTab('stats');
    else if (path === '/profile') setCurrentTab('profile');
  }, [location]);

  const handleTabPress = (tab: string, action?: () => void) => {
    setCurrentTab(tab);
    if (action) action();
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => navigate('/'),
      showBadge: false
    },
    {
      id: 'report',
      label: 'Report',
      icon: Camera,
      action: () => {
        setShowReportOptions(!showReportOptions);
        onStartReport();
      },
      showBadge: false,
      highlight: true
    },
    {
      id: 'route',
      label: 'Route',
      icon: Navigation,
      action: onPlanRoute,
      showBadge: false
    },
    {
      id: 'leaderboard',
      label: 'Rankings',
      icon: Trophy,
      action: onShowLeaderboard,
      showBadge: false
    },
    {
      id: 'profile',
      label: isAuthenticated ? 'Profile' : 'Login',
      icon: User,
      action: () => navigate(isAuthenticated ? '/profile' : '/auth'),
      showBadge: notifications > 0,
      badgeCount: notifications
    }
  ];

  return (
    <>
      {/* Quick Action Overlay */}
      {showReportOptions && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowReportOptions(false)}>
          <div className="absolute bottom-20 left-4 right-4 bg-card rounded-xl p-4 shadow-xl animate-slide-up">
            <h3 className="font-semibold mb-3 text-center">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex-col h-16 hover-scale"
                onClick={() => {
                  onStartReport();
                  setShowReportOptions(false);
                }}
              >
                <Camera className="h-5 w-5 mb-1" />
                <span className="text-xs">Photo Report</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col h-16 hover-scale"
                onClick={() => {
                  // Handle quick complaint
                  setShowReportOptions(false);
                }}
              >
                <AlertTriangle className="h-5 w-5 mb-1" />
                <span className="text-xs">Quick Alert</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t shadow-lg z-50 md:hidden safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isHighlight = item.highlight;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`flex-col h-14 px-1 relative smooth-transition ${
                  isHighlight 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 scale-110' 
                    : isActive
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted/50'
                } ${isActive || isHighlight ? 'animate-bounce-in' : ''}`}
                onClick={() => handleTabPress(item.id, item.action)}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 mb-1 ${isHighlight ? 'animate-pulse-glow' : ''}`} />
                  {item.showBadge && item.badgeCount && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center animate-bounce-in"
                    >
                      {item.badgeCount}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs leading-none ${isHighlight ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && !isHighlight && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </Button>
            );
          })}
        </div>
        
        {/* Gesture indicator */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-muted rounded-full" />
      </div>
      
      {/* Bottom padding to prevent content being hidden behind nav */}
      <div className="h-16 md:hidden" />
    </>
  );
};

export default EnhancedBottomNavigation;