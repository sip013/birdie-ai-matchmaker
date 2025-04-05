
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Home, Trophy, Users, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RatingChart from './RatingChart';
import PlayerStats from './PlayerStats';
import { Player } from '../players/PlayersPage';

// Mock data - would normally come from Supabase
const mockPlayers: Player[] = [
  { id: '1', name: 'John Smith', rating: 1240, matches_played: 24, win_rate: 0.58 },
  { id: '2', name: 'Sarah Johnson', rating: 1120, matches_played: 18, win_rate: 0.50 },
  { id: '3', name: 'David Lee', rating: 1350, matches_played: 32, win_rate: 0.63 },
  { id: '4', name: 'Emily Chen', rating: 1400, matches_played: 41, win_rate: 0.71 },
  { id: '5', name: 'Michael Wong', rating: 1280, matches_played: 28, win_rate: 0.60 },
];

// Sample rating history data - in a real app, this would come from the backend
const ratingHistoryData = [
  { name: 'Apr 1', 'John Smith': 1180, 'Sarah Johnson': 1050, 'David Lee': 1320 },
  { name: 'Apr 8', 'John Smith': 1210, 'Sarah Johnson': 1080, 'David Lee': 1310 },
  { name: 'Apr 15', 'John Smith': 1200, 'Sarah Johnson': 1100, 'David Lee': 1330 },
  { name: 'Apr 22', 'John Smith': 1230, 'Sarah Johnson': 1110, 'David Lee': 1340 },
  { name: 'Apr 29', 'John Smith': 1240, 'Sarah Johnson': 1120, 'David Lee': 1350 },
];

const DashboardPage: React.FC = () => {
  // Calculate stats
  const totalPlayers = mockPlayers.length;
  const totalMatches = mockPlayers.reduce((sum, p) => sum + p.matches_played, 0) / 2;
  const averageRating = Math.round(
    mockPlayers.reduce((sum, p) => sum + p.rating, 0) / totalPlayers
  );
  
  // Top player by rating
  const topPlayer = [...mockPlayers].sort((a, b) => b.rating - a.rating)[0];

  return (
    <div className="page-container">
      <PageHeader 
        title="Dashboard" 
        description="Club statistics and player performance"
        icon={<Home size={32} />}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Players"
          value={totalPlayers.toString()}
          description="Registered players"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        
        <StatCard 
          title="Total Matches"
          value={totalMatches.toString()}
          description="Recorded matches"
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
        />
        
        <StatCard 
          title="Average Rating"
          value={averageRating.toString()}
          description="Club average"
          icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
        />
        
        <StatCard 
          title="Top Player"
          value={topPlayer.name}
          description={`Rating: ${Math.round(topPlayer.rating)}`}
          icon={<ArrowUp className="h-5 w-5 text-green-500" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Player Rating Trends</CardTitle>
              <CardDescription>
                Rating progression over the last month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RatingChart data={ratingHistoryData} />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Top Players</CardTitle>
              <CardDescription>
                Highest rated players in the club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerStats players={mockPlayers} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;
