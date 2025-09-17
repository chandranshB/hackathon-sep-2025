import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, AlertTriangle, CheckCircle, X, MapPin, Clock,
  TrendingUp, Wind, Eye, Settings, BellRing
} from "lucide-react";
import { PollutionZone } from "@/pages/Index";

interface NotificationCenterProps {
  notifications: string[];
  setNotifications: React.Dispatch<React.SetStateAction<string[]>>;
  pollutionZones: PollutionZone[];
}

interface Alert {
  id: string;
  type: 'pollution_spike' | 'area_warning' | 'forecast_alert' | 'health_advisory';
  zoneId: string;
  zoneName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  aqi: number;
  dismissed: boolean;
  actionTaken: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  aqiThreshold: number;
  radiusKm: number;
  forecastAlerts: boolean;
  healthAdvisories: boolean;
  pushNotifications: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  setNotifications, 
  pollutionZones 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    aqiThreshold: 150,
    radiusKm: 5,
    forecastAlerts: true,
    healthAdvisories: true,
    pushNotifications: true
  });
  const [showSettings, setShowSettings] = useState(false);

  // Generate alerts based on pollution zones
  useEffect(() => {
    if (!settings.enabled) return;

    const newAlerts: Alert[] = [];
    const now = new Date();

    pollutionZones.forEach(zone => {
      const existingAlert = alerts.find(alert => 
        alert.zoneId === zone.id && 
        !alert.dismissed && 
        now.getTime() - alert.timestamp.getTime() < 3600000 // Within last hour
      );

      // Don't create duplicate alerts
      if (existingAlert) return;

      // High pollution alert
      if (zone.aqi > settings.aqiThreshold) {
        const severity = getSeverity(zone.aqi);
        newAlerts.push({
          id: `${zone.id}-${now.getTime()}`,
          type: 'pollution_spike',
          zoneId: zone.id,
          zoneName: zone.name,
          message: `High pollution detected: AQI ${Math.round(zone.aqi)} (${zone.level})`,
          severity,
          timestamp: now,
          aqi: zone.aqi,
          dismissed: false,
          actionTaken: false
        });
      }

      // Forecast alerts
      if (settings.forecastAlerts && zone.forecast.trend === 'worsening' && zone.forecast.next6h > settings.aqiThreshold) {
        newAlerts.push({
          id: `${zone.id}-forecast-${now.getTime()}`,
          type: 'forecast_alert',
          zoneId: zone.id,
          zoneName: zone.name,
          message: `Pollution expected to worsen: ${Math.round(zone.forecast.next6h)} AQI in 6 hours`,
          severity: getSeverity(zone.forecast.next6h),
          timestamp: now,
          aqi: zone.forecast.next6h,
          dismissed: false,
          actionTaken: false
        });
      }

      // Health advisories for sensitive groups
      if (settings.healthAdvisories && zone.aqi > 100 && zone.aqi <= settings.aqiThreshold) {
        newAlerts.push({
          id: `${zone.id}-health-${now.getTime()}`,
          type: 'health_advisory',
          zoneId: zone.id,
          zoneName: zone.name,
          message: `Unhealthy for sensitive groups: Consider limiting outdoor activities`,
          severity: 'medium',
          timestamp: now,
          aqi: zone.aqi,
          dismissed: false,
          actionTaken: false
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-20)); // Keep last 20 alerts
      
      // Send push notification if enabled
      if (settings.pushNotifications && 'Notification' in window) {
        newAlerts.forEach(alert => {
          if (alert.severity === 'high' || alert.severity === 'critical') {
            sendPushNotification(alert);
          }
        });
      }
    }
  }, [pollutionZones, settings, alerts]);

  const getSeverity = (aqi: number): Alert['severity'] => {
    if (aqi >= 300) return 'critical';
    if (aqi >= 200) return 'high';
    if (aqi >= 150) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    const colors = {
      low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      high: 'bg-red-100 text-red-800 border-red-200',
      critical: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[severity];
  };

  const getAlertIcon = (type: Alert['type']) => {
    const icons = {
      pollution_spike: AlertTriangle,
      area_warning: MapPin,
      forecast_alert: TrendingUp,
      health_advisory: Eye
    };
    return icons[type];
  };

  const sendPushNotification = async (alert: Alert) => {
    if (Notification.permission === 'granted') {
      new Notification(`AirWatch Alert: ${alert.zoneName}`, {
        body: alert.message,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: alert.id
      });
    } else if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        sendPushNotification(alert);
      }
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const takeAction = (alert: Alert) => {
    setAlerts(prev => prev.map(a => 
      a.id === alert.id ? { ...a, actionTaken: true } : a
    ));
    
    // In a real app, this would trigger enforcement actions
    console.log(`Taking action on alert: ${alert.message}`);
    alert(`Action taken for ${alert.zoneName}: Enforcement team notified`);
  };

  const clearAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, dismissed: true })));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setSettings(prev => ({ 
        ...prev, 
        pushNotifications: permission === 'granted' 
      }));
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alert Center</span>
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                {activeAlerts.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notification Settings */}
        {showSettings && (
          <div className="bg-muted/30 p-3 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable Notifications</span>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">AQI Threshold</label>
                <input
                  type="number"
                  value={settings.aqiThreshold}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    aqiThreshold: parseInt(e.target.value) || 150 
                  }))}
                  className="w-full mt-1 p-1 border rounded text-xs"
                  min="100"
                  max="300"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Alert Radius (km)</label>
                <input
                  type="number"
                  value={settings.radiusKm}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    radiusKm: parseInt(e.target.value) || 5 
                  }))}
                  className="w-full mt-1 p-1 border rounded text-xs"
                  min="1"
                  max="20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Forecast Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.forecastAlerts}
                  onChange={(e) => setSettings(prev => ({ ...prev, forecastAlerts: e.target.checked }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Health Advisories</span>
                <input
                  type="checkbox"
                  checked={settings.healthAdvisories}
                  onChange={(e) => setSettings(prev => ({ ...prev, healthAdvisories: e.target.checked }))}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Push Notifications</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    className="rounded"
                  />
                  {!settings.pushNotifications && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestNotificationPermission}
                      className="text-xs py-1 px-2"
                    >
                      Enable
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Critical Alerts Summary */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-red-700">
              Immediate attention required for high pollution levels
            </div>
          </div>
        )}

        {/* Alerts List */}
        {activeAlerts.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activeAlerts.slice().reverse().map((alert) => {
              const IconComponent = getAlertIcon(alert.type);
              return (
                <div 
                  key={alert.id} 
                  className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                      <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {alert.zoneName}
                        </div>
                        <div className="text-xs mt-1">
                          {alert.message}
                        </div>
                        <div className="flex items-center space-x-3 mt-2 text-xs opacity-75">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{alert.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Wind className="h-3 w-3" />
                            <span>AQI {Math.round(alert.aqi)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {alert.severity === 'high' || alert.severity === 'critical' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => takeAction(alert)}
                          disabled={alert.actionTaken}
                          className="text-xs py-1 px-2 h-auto"
                        >
                          {alert.actionTaken ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </>
                          ) : (
                            'Take Action'
                          )}
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="text-xs p-1 h-auto"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active alerts</p>
            <p className="text-xs mt-1">
              {settings.enabled 
                ? `Monitoring for AQI > ${settings.aqiThreshold}` 
                : 'Notifications disabled'
              }
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {activeAlerts.length > 0 && (
          <div className="flex space-x-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllAlerts}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // In real app, this would open notification preferences
                setShowSettings(true);
              }}
              className="flex-1"
            >
              <BellRing className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        )}

        {/* Notification Status */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground">
            {settings.enabled ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live monitoring active</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <span>Monitoring paused</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;