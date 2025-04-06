
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import PlayersPage from "./pages/players/PlayersPage";
import TeamBalancerPage from "./pages/team-balancer/TeamBalancerPage";
import MatchLoggerPage from "./pages/match-logger/MatchLoggerPage";
import StatisticsPage from "./pages/statistics/StatisticsPage";
import AuthPage from "./pages/auth/AuthPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/players" element={
              <ProtectedRoute>
                <MainLayout>
                  <PlayersPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/team-balancer" element={
              <ProtectedRoute>
                <MainLayout>
                  <TeamBalancerPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/match-logger" element={
              <ProtectedRoute>
                <MainLayout>
                  <MatchLoggerPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/statistics" element={
              <ProtectedRoute>
                <MainLayout>
                  <StatisticsPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Root path now handles redirection logic */}
            <Route index element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
