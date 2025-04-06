
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Home, Trophy, Users, ArrowUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RatingChart from './RatingChart';
import PlayerStats from './PlayerStats';
import { Player } from '../players/PlayersPage';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Define the match history type
interface MatchHistoryEntry {
  id: string;
  date: string;
  player_id: string;
  rating_after: number;
  players?: {
    name: string;
  };
}

const DashboardPage: React.FC = () => {
  // Fetch players from Supabase
  const { data: players, isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('rating', { ascending: false });
      
      if (error) {
        console.error('Error fetching players:', error);
        toast.error('Failed to load players');
        throw error;
      }
      
      return data as Player[];
    }
  });

  // Fetch match history for rating chart
  const { data: matchHistory, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ['match_history'],
    queryFn: async () => {
      // Using a more generic approach to avoid TypeScript errors
      const { data, error } = await supabase
        .from('match_history')
        .select(`
          id,
          date,
          player_id,
          rating_after,
          players(name)
        `)
        .order('date', { ascending: true }) as { data: MatchHistoryEntry[] | null, error: any };
      
      if (error) {
        console.error('Error fetching match history:', error);
        toast.error('Failed to load match history');
        throw error;
      }
      
      return data || [];
    }
  });

  // Process match history data to format required by the chart
  const formatRatingChartData = () => {
    if (!matchHistory || matchHistory.length === 0) {
      // Return empty array or sample data if no match history
      return [];
    }

    // Group by date and player
    const groupedData = matchHistory.reduce((acc: Record<string, Record<string, number>>, entry: MatchHistoryEntry) => {
      // Format date to show month and day
      const date = new Date(entry.date);
      const formattedDate = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
      
      if (!acc[formattedDate]) {
        acc[formattedDate] = {};
      }
      
      // Use player name from the joined players table
      const playerName = entry.players?.name || 'Unknown';
      acc[formattedDate][playerName] = entry.rating_after;
      
      return acc;
    }, {});

    // Convert to array format needed by RatingChart
    return Object.entries(groupedData).map(([date, ratings]) => {
      return {
        name: date,
        ...ratings
      };
    });
  };

  // Calculate stats
  const totalPlayers = players?.length || 0;
  const totalMatches = players?.reduce((sum, p) => sum + p.matches_played, 0) / 2 || 0;
  const averageRating = totalPlayers > 0
    ? Math.round(players?.reduce((sum, p) => sum + p.rating, 0) / totalPlayers)
    : 0;
  
  // Top player by rating
  const topPlayer = players && players.length > 0
    ? players[0]
    : { name: 'No players', rating: 0 };

  const isLoading = playersLoading || historyLoading;
  const error = playersError || historyError;

  if (isLoading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Dashboard" 
          description="Club statistics and player performance"
          icon={<Home size={32} />}
        />
        <div className="text-center py-8">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Dashboard" 
          description="Club statistics and player performance"
          icon={<Home size={32} />}
        />
        <div className="text-center text-red-500 py-8">
          Error loading dashboard data. Please refresh the page.
        </div>
      </div>
    );
  }

  const ratingChartData = formatRatingChartData();

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
          value={Math.floor(totalMatches).toString()}
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
                Rating progression over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratingChartData.length > 0 ? (
                <RatingChart data={ratingChartData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No match history data available yet
                </div>
              )}
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
              <PlayerStats players={players || []} />
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
