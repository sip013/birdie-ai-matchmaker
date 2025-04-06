import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import PlayersPage from '@/pages/players/PlayersPage';
import TeamBalancerPage from '@/pages/team-balancer/TeamBalancerPage';
import MatchLoggerPage from '@/pages/match-logger/MatchLoggerPage';
import StatisticsPage from '@/pages/statistics/StatisticsPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';

function App() {
  // Create a client inside the component
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  });

  console.log('App rendered');
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DashboardPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/players"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <PlayersPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team-balancer"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TeamBalancerPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/match-logger"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MatchLoggerPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/statistics"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <StatisticsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
