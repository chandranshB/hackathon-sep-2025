import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Settings, 
  Trophy, 
  BarChart, 
  MapPin, 
  Calendar,
  Award,
  Target,
  ArrowLeft,
  Edit,
  Share,
  Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import RewardSystem from "@/components/RewardSystem";
import EnhancedBottomNavigation from "@/components/EnhancedBottomNavigation";

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Mock user stats - In real app, fetch from Supabase
  const userStats = {
    reportsSubmitted: 23,
    reportsApproved: 19,
    accuracyScore: 94.2,
    totalPoints: 1247,
    level: 8,
    streakDays: 12,
    joinDate: '2024-01-15',
    totalDistance: 45.6, // km covered while reporting
    areasHelped: 8,
    communityRank: 42
  };

  const recentActivity = [
    {
      id: '1',
      type: 'report_approved',
      description: 'Air quality report approved by authorities',
      location: 'Clock Tower Area',
      points: 50,
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'achievement',
      description: 'Unlocked "Week Warrior" badge',
      points: 100,
      timestamp: '1 day ago'
    },
    {
      id: '3',
      type: 'level_up',
      description: 'Reached Level 8!',
      points: 200,
      timestamp: '3 days ago'
    }
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4" />
          <div className="w-32 h-4 bg-primary/20 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <div className="container-mobile mx-auto py-6 space-y-6 pb-20 md:pb-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-4 hover-scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 animate-fade-in">
          <CardContent className="py-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {user?.user_metadata?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold">
                    {user?.user_metadata?.display_name || user?.email}
                  </h1>
                  <Button variant="outline" size="sm" className="hover-scale">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(userStats.joinDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="font-semibold">
                    Level {userStats.level}
                  </Badge>
                  <Badge variant="outline" className="text-primary">
                    #{userStats.communityRank} in community
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="hover-scale smooth-transition">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{userStats.reportsApproved}</div>
              <div className="text-xs text-muted-foreground">Reports Approved</div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale smooth-transition">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-success mb-1">{userStats.accuracyScore}%</div>
              <div className="text-xs text-muted-foreground">Accuracy Score</div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale smooth-transition">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-warning mb-1">{userStats.streakDays}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale smooth-transition">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-accent-foreground mb-1">{userStats.areasHelped}</div>
              <div className="text-xs text-muted-foreground">Areas Helped</div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{userStats.totalDistance} km</div>
                <div className="text-sm text-muted-foreground">Distance Covered</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{userStats.reportsSubmitted}</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{userStats.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  {activity.type === 'report_approved' && <Target className="h-4 w-4 text-primary" />}
                  {activity.type === 'achievement' && <Award className="h-4 w-4 text-success" />}
                  {activity.type === 'level_up' && <Trophy className="h-4 w-4 text-warning" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{activity.description}</div>
                  {activity.location && (
                    <div className="text-xs text-muted-foreground">{activity.location}</div>
                  )}
                  <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{activity.points}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rewards System */}
        <RewardSystem />

        {/* Quick Actions */}
        <Card>
          <CardContent className="py-6">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex-col h-20 hover-scale">
                <Settings className="h-6 w-6 mb-2" />
                <span className="text-sm">Settings</span>
              </Button>
              <Button variant="outline" className="flex-col h-20 hover-scale">
                <Share className="h-6 w-6 mb-2" />
                <span className="text-sm">Share Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <EnhancedBottomNavigation
        onStartReport={() => {}}
        onPlanRoute={() => {}}
        onShowLeaderboard={() => navigate('/leaderboard')}
        onShowStats={() => {}}
        activeTab="profile"
      />
    </div>
  );
};

export default Profile;