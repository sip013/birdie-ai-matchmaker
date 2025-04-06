
import React, { useState } from 'react';
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

// Initial empty matches array
const initialMatches: Match[] = [];

const MatchLoggerPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const queryClient = useQueryClient();

  // Fetch players from Supabase
  const { data: players, isLoading, error } = useQuery({
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

  // Mutation for logging matches
  const logMatchMutation = useMutation({
    mutationFn: async (match: Omit<Match, 'id' | 'date'>) => {
      // Map team A and B to team 1 and 2
      const team1PlayerIds = match.team_a.players.map(p => p.id);
      const team2PlayerIds = match.team_b.players.map(p => p.id);
      
      // Create the match in Supabase
      const matchData = {
        team1_player1_id: team1PlayerIds[0],
        team1_player2_id: team1PlayerIds.length > 1 ? team1PlayerIds[1] : null,
        team2_player1_id: team2PlayerIds[0],
        team2_player2_id: team2PlayerIds.length > 1 ? team2PlayerIds[1] : null,
        team1_score: match.team_a.score,
        team2_score: match.team_b.score,
        winner: match.winner_team === 'A' ? 'team1' : 'team2',
        user_id: (await supabase.auth.getUser()).data.user?.id
      };
      
      // Insert match into database
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single();
      
      if (matchError) {
        console.error('Error creating match:', matchError);
        throw matchError;
      }
      
      // Call the rating update edge function
      const { error: ratingError } = await supabase.functions.invoke('update-ratings', {
        body: matchData
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

  return (
    <div className="page-container">
      <PageHeader 
        title="Match Logger" 
        description="Record match results and update player ratings"
        icon={<ClipboardList size={32} />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="badminton-card">
            <h2 className="text-xl font-semibold mb-4">Log New Match</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading players...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error loading players. Please refresh the page.
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
          <div className="badminton-card">
            <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
            <RecentMatches matches={matches} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchLoggerPage;
