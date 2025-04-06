
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { ClipboardList, Trophy } from 'lucide-react';
import { Player } from '../players/PlayersPage';
import MatchForm from './MatchForm';
import RecentMatches from './RecentMatches';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Match = {
  id: string;
  date: Date;
  team_a: {
    players: Player[];
    score: number;
  };
  team_b: {
    players: Player[];
    score: number;
  };
  winner_team: 'A' | 'B';
};

const MatchLoggerPage: React.FC = () => {
  const queryClient = useQueryClient();

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

  // Fetch recent matches
  const { data: recentMatches, isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      // First get the matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id, 
          created_at,
          team1_score, 
          team2_score, 
          winner,
          team1_player1_id, 
          team1_player2_id,
          team2_player1_id, 
          team2_player2_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        toast.error('Failed to load recent matches');
        throw matchesError;
      }
      
      // If no players data yet, return empty array
      if (!players || players.length === 0) {
        return [];
      }
      
      // Convert matches to the format expected by RecentMatches component
      const formattedMatches: Match[] = matchesData.map(match => {
        // Find players for team A
        const teamAPlayers = [
          players.find(p => p.id === match.team1_player1_id),
          match.team1_player2_id ? players.find(p => p.id === match.team1_player2_id) : undefined
        ].filter(Boolean) as Player[];
        
        // Find players for team B
        const teamBPlayers = [
          players.find(p => p.id === match.team2_player1_id),
          match.team2_player2_id ? players.find(p => p.id === match.team2_player2_id) : undefined
        ].filter(Boolean) as Player[];
        
        return {
          id: match.id,
          date: new Date(match.created_at),
          team_a: {
            players: teamAPlayers,
            score: match.team1_score
          },
          team_b: {
            players: teamBPlayers,
            score: match.team2_score
          },
          winner_team: match.winner === 'team1' ? 'A' : 'B'
        };
      });
      
      return formattedMatches;
    },
    enabled: !!players && players.length > 0 // Only run this query when players are loaded
  });

  // Mutation for logging matches
  const logMatchMutation = useMutation({
    mutationFn: async (match: Omit<Match, 'id' | 'date'>) => {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to log matches');
        throw new Error('Authentication required');
      }
      
      // Map team A and B to team 1 and 2
      const team1PlayerIds = match.team_a.players.map(p => p.id);
      const team2PlayerIds = match.team_b.players.map(p => p.id);
      
      console.log('Logging match with data:', {
        team1_player1_id: team1PlayerIds[0],
        team1_player2_id: team1PlayerIds.length > 1 ? team1PlayerIds[1] : null,
        team2_player1_id: team2PlayerIds[0],
        team2_player2_id: team2PlayerIds.length > 1 ? team2PlayerIds[1] : null,
        team1_score: match.team_a.score,
        team2_score: match.team_b.score,
        winner: match.winner_team === 'A' ? 'team1' : 'team2',
        user_id: session.user.id
      });
      
      // Insert match into database
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert({
          team1_player1_id: team1PlayerIds[0],
          team1_player2_id: team1PlayerIds.length > 1 ? team1PlayerIds[1] : null,
          team2_player1_id: team2PlayerIds[0],
          team2_player2_id: team2PlayerIds.length > 1 ? team2PlayerIds[1] : null,
          team1_score: match.team_a.score,
          team2_score: match.team_b.score,
          winner: match.winner_team === 'A' ? 'team1' : 'team2',
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (matchError) {
        console.error('Error creating match:', matchError);
        throw matchError;
      }
      
      // Call the rating update edge function
      const { error: ratingError } = await supabase.functions.invoke('update-ratings', {
        body: {
          team1_player1_id: team1PlayerIds[0],
          team1_player2_id: team1PlayerIds.length > 1 ? team1PlayerIds[1] : null,
          team2_player1_id: team2PlayerIds[0],
          team2_player2_id: team2PlayerIds.length > 1 ? team2PlayerIds[1] : null,
          team1_score: match.team_a.score,
          team2_score: match.team_b.score,
          winner: match.winner_team === 'A' ? 'team1' : 'team2',
          match_id: newMatch.id
        }
      });
      
      if (ratingError) {
        console.error('Error updating ratings:', ratingError);
        throw ratingError;
      }
      
      return newMatch;
    },
    onSuccess: () => {
      toast.success('Match logged successfully and ratings updated!', {
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match_history'] });
    },
    onError: (error) => {
      console.error('Error logging match:', error);
      toast.error('Failed to log match. Please try again.');
    }
  });

  const handleLogMatch = (match: Omit<Match, 'id' | 'date'>) => {
    logMatchMutation.mutate(match);
  };

  const isLoading = playersLoading || matchesLoading;
  const error = playersError || matchesError;

  return (
    <div className="page-container">
      <PageHeader 
        title="Match Logger" 
        description="Record match results and update player ratings"
        icon={<ClipboardList size={32} />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="match-card">
            <h2 className="text-xl font-semibold mb-4">Log New Match</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading players...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error loading data. Please refresh the page.
              </div>
            ) : (
              <MatchForm 
                players={players || []} 
                onLogMatch={handleLogMatch} 
                isLoading={logMatchMutation.isPending}
              />
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="match-card">
            <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
            {matchesLoading ? (
              <div className="text-center py-8">Loading recent matches...</div>
            ) : matchesError ? (
              <div className="text-center text-red-500 py-8">
                Error loading matches. Please refresh the page.
              </div>
            ) : (
              <RecentMatches matches={recentMatches || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchLoggerPage;
