import { useState, useEffect } from "react";
import { Trophy, Star, Award, Zap, Target, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface UserRewards {
  totalPoints: number;
  level: number;
  badges: string[];
  streakDays: number;
  reportsSubmitted: number;
  reportsApproved: number;
  accuracyScore: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const RewardSystem = () => {
  const { isAuthenticated } = useAuth();
  const [userRewards, setUserRewards] = useState<UserRewards>({
    totalPoints: 1247,
    level: 8,
    badges: ['FirstReport', 'AccurateReporter', 'WeeklyStreak'],
    streakDays: 12,
    reportsSubmitted: 23,
    reportsApproved: 19,
    accuracyScore: 94.2
  });

  const achievements: Achievement[] = [
    {
      id: 'first_report',
      title: 'First Steps',
      description: 'Submit your first pollution report',
      icon: Target,
      points: 50,
      unlocked: true
    },
    {
      id: 'accuracy_master',
      title: 'Accuracy Master',
      description: 'Maintain 90%+ accuracy across 10 reports',
      icon: Award,
      points: 200,
      unlocked: true
    },
    {
      id: 'streak_warrior',
      title: 'Streak Warrior',
      description: 'Report daily for 7 consecutive days',
      icon: Zap,
      points: 300,
      unlocked: false,
      progress: 12,
      maxProgress: 7
    },
    {
      id: 'community_hero',
      title: 'Community Hero',
      description: 'Have 50 reports approved by authorities',
      icon: Crown,
      points: 500,
      unlocked: false,
      progress: 19,
      maxProgress: 50
    }
  ];

  const levelProgress = ((userRewards.totalPoints % 200) / 200) * 100;
  const nextLevelPoints = (userRewards.level + 1) * 200;

  if (!isAuthenticated) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="py-8 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Join the Community</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to earn points, unlock badges, and climb the leaderboard
          </p>
          <Button size="sm">Sign In to Start</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level & Points Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 animate-fade-in">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Level {userRewards.level}</CardTitle>
            <Badge variant="secondary" className="font-bold">
              {userRewards.totalPoints} pts
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Progress to Level {userRewards.level + 1}</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {nextLevelPoints - userRewards.totalPoints} points to next level
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="hover-scale smooth-transition">
          <CardContent className="py-3 text-center">
            <div className="text-lg font-bold text-primary">{userRewards.streakDays}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
        <Card className="hover-scale smooth-transition">
          <CardContent className="py-3 text-center">
            <div className="text-lg font-bold text-success">{userRewards.accuracyScore}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                achievement.unlocked
                  ? 'bg-success/10 border border-success/20'
                  : 'bg-muted/50'
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  achievement.unlocked
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <achievement.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{achievement.title}</div>
                <div className="text-xs text-muted-foreground">
                  {achievement.description}
                </div>
                {!achievement.unlocked && achievement.progress && achievement.maxProgress && (
                  <div className="mt-1">
                    <Progress
                      value={(achievement.progress / achievement.maxProgress) * 100}
                      className="h-1"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {achievement.progress}/{achievement.maxProgress}
                    </div>
                  </div>
                )}
              </div>
              <Badge variant={achievement.unlocked ? "default" : "secondary"} className="text-xs">
                {achievement.points} pts
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardSystem;