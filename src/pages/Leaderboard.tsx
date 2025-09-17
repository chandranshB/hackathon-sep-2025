import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Leaderboard from "@/components/Leaderboard";
import EnhancedBottomNavigation from "@/components/EnhancedBottomNavigation";

const LeaderboardPage = () => {
  const navigate = useNavigate();

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

        <Leaderboard />
      </div>

      <EnhancedBottomNavigation
        onStartReport={() => {}}
        onPlanRoute={() => {}}
        onShowLeaderboard={() => {}}
        onShowStats={() => {}}
        activeTab="leaderboard"
      />
    </div>
  );
};

export default LeaderboardPage;