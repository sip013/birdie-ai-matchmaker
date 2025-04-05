
import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { ClipboardList, Trophy } from 'lucide-react';
import { Player } from '../players/PlayersPage';
import MatchForm from './MatchForm';
import RecentMatches from './RecentMatches';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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

  const handleLogMatch = (match: Omit<Match, 'id' | 'date'>) => {
    // In a real app, this would be sent to a backend API to update ratings
    const newMatch: Match = {
      ...match,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date()
    };

    setMatches([newMatch, ...matches]);
    toast.success('Match logged successfully!', {
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
    });

    // TODO: In a future update, we would save this match to Supabase
    // and update player ratings based on the match result
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
              <MatchForm players={players || []} onLogMatch={handleLogMatch} />
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
