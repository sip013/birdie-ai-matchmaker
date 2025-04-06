
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Users } from 'lucide-react';
import PlayerForm from './PlayerForm';
import PlayersTable from './PlayersTable';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Player = {
  id: string;
  name: string;
  rating: number;
  matches_played: number;
  wins: number;
  win_rate: number;
  age?: number;
  position?: 'Singles' | 'Doubles' | 'Both';
  user_id?: string;
};

const PlayersPage: React.FC = () => {
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
      
      // Calculate win rate properly if not already set
      const playersWithWinRate = data.map(player => {
        // If matches_played is 0, win_rate should be 0
        const calculatedWinRate = player.matches_played > 0 
          ? player.wins / player.matches_played 
          : 0;
          
        return {
          ...player,
          win_rate: player.win_rate ?? calculatedWinRate
        };
      });
      
      return playersWithWinRate as Player[];
    }
  });

  // Mutation for adding a new player
  const addPlayerMutation = useMutation({
    mutationFn: async (newPlayer: Omit<Player, 'id' | 'win_rate' | 'matches_played' | 'rating' | 'wins'>) => {
      // Get current session to check authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to add players');
        throw new Error('Authentication required');
      }

      const playerToInsert = {
        name: newPlayer.name,
        age: newPlayer.age,
        position: newPlayer.position,
        wins: 0,
        matches_played: 0,
        rating: 1000, // Default starting rating
        win_rate: 0,
        user_id: session.user.id
      };

      const { data, error } = await supabase
        .from('players')
        .insert(playerToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error adding player:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch players query
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player added successfully');
    },
    onError: (error) => {
      console.error('Failed to add player:', error);
      
      // Check if error is due to authentication
      if (error.message === 'Authentication required') {
        toast.error('You must be logged in to add players');
      } else {
        toast.error('Failed to add player: ' + error.message);
      }
    }
  });

  const handleAddPlayer = (newPlayer: Omit<Player, 'id' | 'win_rate' | 'matches_played' | 'rating' | 'wins'>) => {
    addPlayerMutation.mutate(newPlayer);
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Player Management" 
        description="Add and manage badminton players"
        icon={<Users size={32} />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="badminton-card">
            <h2 className="text-xl font-semibold mb-4">Add New Player</h2>
            <PlayerForm onAddPlayer={handleAddPlayer} />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="badminton-card">
            <h2 className="text-xl font-semibold mb-4">Player Roster</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading players...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error loading players. Please refresh the page.
              </div>
            ) : (
              <PlayersTable players={players || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayersPage;
