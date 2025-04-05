
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import PlayersPage from "./pages/players/PlayersPage";
import TeamBalancerPage from "./pages/team-balancer/TeamBalancerPage";
import MatchLoggerPage from "./pages/match-logger/MatchLoggerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
          <Route path="/players" element={<MainLayout><PlayersPage /></MainLayout>} />
          <Route path="/team-balancer" element={<MainLayout><TeamBalancerPage /></MainLayout>} />
          <Route path="/match-logger" element={<MainLayout><MatchLoggerPage /></MainLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
