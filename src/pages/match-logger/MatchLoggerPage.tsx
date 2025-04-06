import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { ClipboardList } from 'lucide-react';
import MatchForm from './MatchForm';
import RecentMatches from './RecentMatches';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

export type Match = {
  id: string;
  created_at: string;
  updated_at?: string;
  team1_player1_id: string;
  team1_player2_id: string | null;
  team2_player1_id: string;
  team2_player2_id: string | null;
  team1_score: number;
  team2_score: number;
  winner: string;
  duration_minutes: number;
  user_id: string;
  team_a?: {
    players: Array<{
      id: string;
      name: string;
    }>;
  };
  team_b?: {
    players: Array<{
      id: string;
      name: string;
    }>;
  };
};

const MatchLoggerPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch players
  const { data: players, refetch: refetchPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  // Fetch matches
  const { data: matches, refetch: refetchMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          team_a: team1_player1_id (id, name),
          team_b: team2_player1_id (id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (matchesError) throw matchesError;
      if (!matchesData) return [];

      return matchesData.map(match => ({
        id: match.id,
        team1_player1_id: match.team1_player1_id || '',
        team1_player2_id: match.team1_player2_id,
        team2_player1_id: match.team2_player1_id || '',
        team2_player2_id: match.team2_player2_id,
        team1_score: match.team1_score || 0,
        team2_score: match.team2_score || 0,
        winner: match.winner || '',
        duration_minutes: match.duration_minutes || 0,
        created_at: match.created_at || new Date().toISOString(),
        updated_at: match.updated_at,
        user_id: match.user_id || '',
        team_a: {
          players: [{
            id: match.team_a?.id || '',
            name: match.team_a?.name || 'Unknown'
          }]
        },
        team_b: {
          players: [{
            id: match.team_b?.id || '',
            name: match.team_b?.name || 'Unknown'
          }]
        }
      }));
    }
  });

  const handleLogMatch = async (match: Omit<Match, 'id'>) => {
    setLoading(true);
    try {
      // Validate match data
      if (!match.team1_player1_id || !match.team2_player1_id) {
        throw new Error('Both teams must have at least one player');
      }

      if (match.team1_score < 0 || match.team2_score < 0) {
        throw new Error('Scores cannot be negative');
      }

      if (match.team1_score === match.team2_score) {
        throw new Error('Match cannot end in a tie');
      }

      if (match.team1_score > 30 || match.team2_score > 30) {
        throw new Error('Scores cannot exceed 30 points');
      }

      // Get player data first
      const playerIds = [
        match.team1_player1_id,
        match.team1_player2_id,
        match.team2_player1_id,
        match.team2_player2_id
      ].filter(Boolean);

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .in('id', playerIds);

      if (playersError) throw playersError;
      if (!playersData || playersData.length === 0) {
        throw new Error('Could not find players in database');
      }

      const playersMap = new Map(playersData.map(p => [p.id, p]));

      // Create teams first
      const { data: team1Data, error: team1Error } = await supabase
        .from('teams')
        .insert([{
          player1_id: match.team1_player1_id,
          player2_id: match.team1_player2_id || match.team1_player1_id // Use same player if no second player
        }])
        .select()
        .single();

      if (team1Error) throw team1Error;

      const { data: team2Data, error: team2Error } = await supabase
        .from('teams')
        .insert([{
          player1_id: match.team2_player1_id,
          player2_id: match.team2_player2_id || match.team2_player1_id // Use same player if no second player
        }])
        .select()
        .single();

      if (team2Error) throw team2Error;

      // Create match with the correct schema
      const matchInsertData = {
        team1_id: team1Data.id,
        team2_id: team2Data.id,
        score: `${match.team1_score}-${match.team2_score}`,
        winner: match.winner === 'team1' ? team1Data.id : team2Data.id,
        match_date: new Date().toISOString()
      };

      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert([matchInsertData])
        .select()
        .single();

      if (matchError) throw matchError;

      // Update team references with match_id
      await Promise.all([
        supabase.from('teams')
          .update({ match_id: matchData.id })
          .eq('id', team1Data.id),
        supabase.from('teams')
          .update({ match_id: matchData.id })
          .eq('id', team2Data.id)
      ]);

      // Update player statistics
      const winningTeam = match.winner === 'team1' ? 
        { player1: match.team1_player1_id, player2: match.team1_player2_id } : 
        { player1: match.team2_player1_id, player2: match.team2_player2_id };

      const losingTeam = match.winner === 'team1' ? 
        { player1: match.team2_player1_id, player2: match.team2_player2_id } : 
        { player1: match.team1_player1_id, player2: match.team1_player2_id };

      // Calculate score difference for rating updates
      const scoreDiff = Math.abs(match.team1_score - match.team2_score);

      // Update winning players
      const winningPlayerPromises = [
        supabase.rpc('update_player_ratings', {
          winner_id: winningTeam.player1,
          loser_id: losingTeam.player1,
          score_diff: scoreDiff
        }),
        winningTeam.player2 && supabase.rpc('update_player_ratings', {
          winner_id: winningTeam.player2,
          loser_id: losingTeam.player2,
          score_diff: scoreDiff
        })
      ].filter(Boolean);

      // Update losing players
      const losingPlayerPromises = [
        supabase.rpc('update_player_ratings', {
          winner_id: winningTeam.player1,
          loser_id: losingTeam.player1,
          score_diff: scoreDiff
        }),
        losingTeam.player2 && supabase.rpc('update_player_ratings', {
          winner_id: winningTeam.player1,
          loser_id: losingTeam.player2,
          score_diff: scoreDiff
        })
      ].filter(Boolean);

      await Promise.all([...winningPlayerPromises, ...losingPlayerPromises]);

      // Refetch matches and players to update the list
      await Promise.all([refetchMatches(), refetchPlayers()]);
      
      toast({
        title: 'Match logged successfully',
        description: 'The match has been recorded in the database.',
      });
    } catch (error) {
      console.error('Error logging match:', error);
      toast({
        title: 'Error logging match',
        description: error instanceof Error ? error.message : 'There was an error saving the match. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Match Logger" 
        description="Log and track badminton matches"
        icon={<ClipboardList size={32} />}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Log New Match</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchForm 
              players={players || []} 
              onLogMatch={handleLogMatch} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentMatches matches={matches || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchLoggerPage;
