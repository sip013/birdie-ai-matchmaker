
import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlayerSelector from './PlayerSelector';
import TeamCard from './TeamCard';
import { Player } from '../players/PlayersPage';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const TeamBalancerPage: React.FC = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [isBalanced, setIsBalanced] = useState(false);

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

  const handleSelectPlayers = (playerIds: string[]) => {
    setSelectedPlayers(playerIds);
  };

  const balanceTeams = () => {
    if (!players) {
      toast.error('Players data not loaded yet.');
      return;
    }

    const selectedPlayersData = players.filter(player => selectedPlayers.includes(player.id));

    if (selectedPlayersData.length < 2) {
      toast.error('Please select at least two players.');
      return;
    }

    // Sort players by rating in descending order
    const sortedPlayers = [...selectedPlayersData].sort((a, b) => b.rating - a.rating);

    let teamA: Player[] = [];
    let teamB: Player[] = [];

    // Assign players to teams based on rating
    sortedPlayers.forEach((player, index) => {
      if (index % 2 === 0) {
        teamA.push(player);
      } else {
        teamB.push(player);
      }
    });

    setTeamA(teamA);
    setTeamB(teamB);
    setIsBalanced(true);

    toast.success('Teams balanced successfully!');
  };

  const calculateTeamRating = (team: Player[]): number => {
    return team.reduce((sum, player) => sum + player.rating, 0);
  };

  // Calculate win probability for each team
  const calculateWinProbability = (teamARating: number, teamBRating: number) => {
    const totalRating = teamARating + teamBRating;
    if (totalRating === 0) return 0.5;
    
    const teamAProbability = teamARating / totalRating;
    return teamAProbability;
  };

  // Prepare team data objects with all required properties
  const teamAData = {
    players: teamA,
    totalRating: calculateTeamRating(teamA),
    winProbability: calculateWinProbability(
      calculateTeamRating(teamA), 
      calculateTeamRating(teamB)
    )
  };

  const teamBData = {
    players: teamB,
    totalRating: calculateTeamRating(teamB),
    winProbability: calculateWinProbability(
      calculateTeamRating(teamB), 
      calculateTeamRating(teamA)
    )
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Team Balancer" 
        description="Balance teams based on player ratings"
        icon={<Scale size={32} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="badminton-card">
            <h2 className="text-xl font-semibold mb-4">Select Players</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading players...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error loading players. Please refresh the page.
              </div>
            ) : (
              <PlayerSelector
                players={players || []}
                selectedPlayerIds={selectedPlayers}
                onSelectPlayers={handleSelectPlayers}
              />
            )}
            <Button 
              onClick={balanceTeams}
              disabled={selectedPlayers.length < 2}
              className="w-full mt-4"
            >
              Balance Teams
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <TeamCard 
            team={teamAData}
            name="Team A"
            color="badminton-blue"
          />
          <TeamCard 
            team={teamBData}
            name="Team B"
            color="badminton-yellow"
          />
        </div>
      </div>
    </div>
  );
};

export default TeamBalancerPage;
