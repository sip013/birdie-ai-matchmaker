
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { 
  BarChart3, 
  GitCompare, 
  Users, 
  Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Player } from '../players/PlayersPage';
import PlayerRatingChart from '../dashboard/RatingChart';
import FierceRivalry from './components/FierceRivalry';
import TeamSynergy from './components/TeamSynergy';

const StatisticsPage: React.FC = () => {
  // Fetch players data
  const { data: players, isLoading: playersLoading } = useQuery({
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

  // Fetch match history data for rating trends
  const { data: matchHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['match_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_history')
        .select(`
          id,
          date,
          player_id,
          rating_after,
          is_winner,
          players(name)
        `)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching match history:', error);
        toast.error('Failed to load match history');
        throw error;
      }
      
      return data;
    }
  });

  // Fetch matches for rivalries and synergies
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1_player1:team1_player1_id(id, name),
          team1_player2:team1_player2_id(id, name),
          team2_player1:team2_player1_id(id, name),
          team2_player2:team2_player2_id(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching matches:', error);
        toast.error('Failed to load matches');
        throw error;
      }
      
      return data;
    }
  });

  // Process match history data to format required by the chart
  const formatRatingChartData = () => {
    if (!matchHistory) return [];

    // Group by date and player
    const groupedData = matchHistory.reduce((acc: any, entry: any) => {
      const date = new Date(entry.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {};
      }
      
      // Use player name from the joined players table
      const playerName = entry.players?.name || 'Unknown';
      acc[date][playerName] = entry.rating_after;
      
      return acc;
    }, {});

    // Convert to array format needed by RatingChart
    return Object.entries(groupedData).map(([date, ratings]: [string, any]) => {
      return {
        name: date,
        ...ratings
      };
    });
  };

  const isLoading = playersLoading || historyLoading || matchesLoading;

  if (isLoading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Statistics" 
          description="Player and match statistics"
          icon={<BarChart3 size={32} />}
        />
        <div className="text-center py-8">Loading statistics data...</div>
      </div>
    );
  }

  const ratingChartData = formatRatingChartData();

  return (
    <div className="page-container">
      <PageHeader 
        title="Statistics" 
        description="Player and match statistics"
        icon={<BarChart3 size={32} />}
      />
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Player Rating Trends</CardTitle>
            <CardDescription>
              Rating progression over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ratingChartData.length > 0 ? (
              <PlayerRatingChart data={ratingChartData} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No match history data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Fierce Rivalries</CardTitle>
              <CardDescription>
                Players with the closest score differences
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FierceRivalry matches={matches || []} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Team Synergy</CardTitle>
              <CardDescription>
                Most successful player combinations
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <TeamSynergy matches={matches || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;
