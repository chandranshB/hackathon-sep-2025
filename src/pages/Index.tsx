import { useState } from "react";
import Header from "@/components/Header";
import PublicDashboard from "@/components/PublicDashboard";
import PollutionDetectionDashboard from "@/components/PollutionDetectionDashboard";
import BottomNavigation from "@/components/BottomNavigation";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import ReportForm from "@/components/ReportForm";
import RouteNavigator from "@/components/RouteNavigator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [isRouteNavigatorOpen, setIsRouteNavigatorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <PWAInstallPrompt />
      <Header />
      
      <main className="container-mobile mx-auto py-4 sm:py-8">
        <Tabs defaultValue="public" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public">Public Dashboard</TabsTrigger>
            <TabsTrigger value="detection">Pollution Detection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="public">
            <PublicDashboard 
              onStartReport={() => setIsReportFormOpen(true)}
              onPlanRoute={() => setIsRouteNavigatorOpen(true)}
            />
          </TabsContent>
          
          <TabsContent value="detection">
            <PollutionDetectionDashboard />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation 
        onStartReport={() => setIsReportFormOpen(true)}
        onPlanRoute={() => setIsRouteNavigatorOpen(true)}
      />

      <ReportForm 
        isOpen={isReportFormOpen} 
        onClose={() => setIsReportFormOpen(false)} 
      />

      <RouteNavigator
        isOpen={isRouteNavigatorOpen}
        onClose={() => setIsRouteNavigatorOpen(false)}
      />
    </div>
  );
};

export default Index;