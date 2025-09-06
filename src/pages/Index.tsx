import { useState } from "react";
import Header from "@/components/Header";
import PublicDashboard from "@/components/PublicDashboard";
import GovernmentDashboard from "@/components/GovernmentDashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<'public' | 'government'>('public');

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="container-mobile mx-auto py-4 sm:py-8">
        {currentView === 'public' ? <PublicDashboard /> : <GovernmentDashboard />}
      </main>
    </div>
  );
};

export default Index;