import { useState, useEffect } from "react";
import { Trophy, Medal, Star, TrendingUp, Users, Crown, Award, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  reportsApproved: number;
  accuracyScore: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
  badges: string[];
}

interface LeaderboardStats {
  totalUsers: number;
  totalReports: number;
  avgAccuracy: number;
  topContributor: string;
}

const Leaderboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');
  
  // Mock data - In real app, this would come from Supabase
  const leaderboardData: LeaderboardEntry[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      avatar: '',
      points: 3247,
      level: 15,
      reportsApproved: 89,
      accuracyScore: 97.2,
      rank: 1,
      trend: 'up',
      badges: ['AccuracyMaster', 'CommunityHero', 'StreakWarrior']
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      avatar: '',
      points: 2891,
      level: 13,
      reportsApproved: 76,
      accuracyScore: 94.8,
      rank: 2,
      trend: 'same',
      badges: ['FirstReporter', 'WeeklyContributor']
    },
    {
      id: '3',
      name: 'Anita Singh',
      avatar: '',
      points: 2654,
      level: 12,
      reportsApproved: 71,
      accuracyScore: 96.1,
      rank: 3,
      trend: 'up',
      badges: ['AccuracyMaster', 'CommunitySupporter']
    },
    {
      id: '4',
      name: 'Current User',
      avatar: user?.user_metadata?.avatar_url,
      points: 1247,
      level: 8,
      reportsApproved: 19,
      accuracyScore: 94.2,
      rank: 8,
      trend: 'up',
      badges: ['FirstReport', 'AccurateReporter']
    }
  ];

  const stats: LeaderboardStats = {
    totalUsers: 1247,
    totalReports: 8934,
    avgAccuracy: 91.3,
    topContributor: 'Priya Sharma'
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-warning" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Award className="h-5 w-5 text-warning/80" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-destructive rotate-180" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-muted" />;
    }
  };

  const currentUserRank = leaderboardData.find(entry => entry.name === 'Current User')?.rank || 0;

  return (
    <div className="space-y-4">
      {/* Community Stats */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Community Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-primary">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-xl font-bold text-primary">{stats.totalReports.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Rank Card */}
      {isAuthenticated && (
        <Card className="border-primary/20 bg-primary/5 animate-fade-in">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getRankIcon(currentUserRank)}
                  <span className="font-semibold">Your Rank</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">#{currentUserRank}</div>
                <div className="text-xs text-muted-foreground">out of {stats.totalUsers}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Frame Selection */}
      <Tabs defaultValue="week" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Weekly Leaders
                </div>
                <Badge variant="secondary">{leaderboardData.length} active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboardData.slice(0, 10).map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all hover-scale ${
                    entry.name === 'Current User'
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    {getRankIcon(entry.rank)}
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback className="text-xs">
                        {entry.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm truncate">{entry.name}</span>
                      {getTrendIcon(entry.trend)}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Level {entry.level}</span>
                      <span>•</span>
                      <span>{entry.accuracyScore}% accuracy</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-sm">{entry.points}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-3">
          <Card>
            <CardContent className="py-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Monthly Rankings</h3>
              <p className="text-sm text-muted-foreground">
                Monthly leaderboard resets in 12 days
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-3">
          <Card>
            <CardContent className="py-8 text-center">
              <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Hall of Fame</h3>
              <p className="text-sm text-muted-foreground">
                All-time top contributors to air quality monitoring
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      {!isAuthenticated && (
        <Card className="border-primary/20">
          <CardContent className="py-6 text-center">
            <Target className="h-8 w-8 mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-2">Join the Leaderboard</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to start earning points and climb the ranks
            </p>
            <Button size="sm">Get Started</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Leaderboard;