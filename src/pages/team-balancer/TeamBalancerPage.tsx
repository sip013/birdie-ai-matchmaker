
import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { GitCompare } from 'lucide-react';
import PlayerSelector from './PlayerSelector';
import TeamCard from './TeamCard';
import { Button } from '@/components/ui/button';
import { Player } from '../players/PlayersPage';
import { toast } from 'sonner';

// Mock data - would normally come from Supabase
const mockPlayers = [
  { id: '1', name: 'John Smith', rating: 1240, matches_played: 24, win_rate: 0.58 },
  { id: '2', name: 'Sarah Johnson', rating: 1120, matches_played: 18, win_rate: 0.50 },
  { id: '3', name: 'David Lee', rating: 1350, matches_played: 32, win_rate: 0.63 },
  { id: '4', name: 'Emily Chen', rating: 1400, matches_played: 41, win_rate: 0.71 },
  { id: '5', name: 'Michael Wong', rating: 1280, matches_played: 28, win_rate: 0.60 },
  { id: '6', name: 'Ava Martinez', rating: 1180, matches_played: 15, win_rate: 0.47 },
  { id: '7', name: 'William Taylor', rating: 1320, matches_played: 30, win_rate: 0.60 },
  { id: '8', name: 'Sophia Kim', rating: 1260, matches_played: 22, win_rate: 0.55 },
];

type Team = {
  players: Player[];
  totalRating: number;
  winProbability: number;
};

const TeamBalancerPage: React.FC = () => {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [teamA, setTeamA] = useState<Team | null>(null);
  const [teamB, setTeamB] = useState<Team | null>(null);

  const handleSelectPlayers = (ids: string[]) => {
    setSelectedPlayerIds(ids);
    // Reset teams when selection changes
    if (teamA || teamB) {
      setTeamA(null);
      setTeamB(null);
    }
  };

  const handleGenerateTeams = async () => {
    if (selectedPlayerIds.length < 2) {
      toast.error('Please select at least 2 players');
      return;
    }

    if (selectedPlayerIds.length % 2 !== 0) {
      toast.error('Please select an even number of players');
      return;
    }

    setLoading(true);

    // In a real app, this would call an AI API endpoint
    // Simulate API call for now
    setTimeout(() => {
      // Get the selected players
      const selectedPlayers = mockPlayers.filter(p => 
        selectedPlayerIds.includes(p.id)
      );
      
      // Simple team balancing logic (this would be replaced by AI logic)
      // Sort players by rating
      const sortedPlayers = [...selectedPlayers].sort((a, b) => b.rating - a.rating);
      
      const teamAPlayers: Player[] = [];
      const teamBPlayers: Player[] = [];
      
      // Distribute players (best player with worst player, etc.)
      for (let i = 0; i < sortedPlayers.length; i++) {
        if (i % 2 === 0) {
          if (i / 2 % 2 === 0) {
            teamAPlayers.push(sortedPlayers[i]);
          } else {
            teamBPlayers.push(sortedPlayers[i]);
          }
        } else {
          if (Math.floor(i / 2) % 2 === 0) {
            teamBPlayers.push(sortedPlayers[i]);
          } else {
            teamAPlayers.push(sortedPlayers[i]);
          }
        }
      }
      
      // Calculate team ratings
      const teamARating = teamAPlayers.reduce((sum, p) => sum + p.rating, 0);
      const teamBRating = teamBPlayers.reduce((sum, p) => sum + p.rating, 0);
      
      // Simple win probability calculation based on ratings
      const totalRating = teamARating + teamBRating;
      const teamAWinProb = teamARating / totalRating;
      const teamBWinProb = 1 - teamAWinProb;

      setTeamA({
        players: teamAPlayers,
        totalRating: teamARating,
        winProbability: teamAWinProb
      });
      
      setTeamB({
        players: teamBPlayers,
        totalRating: teamBRating,
        winProbability: teamBWinProb
      });
      
      setLoading(false);
    }, 1500); // Simulate API delay
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Team Balancer" 
        description="Create balanced teams using AI"
        icon={<GitCompare size={32} />}
      />
      
      <div className="badminton-card mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Players</h2>
        <div className="mb-6">
          <PlayerSelector 
            players={mockPlayers} 
            onSelectPlayers={handleSelectPlayers}
            selectedPlayerIds={selectedPlayerIds}
          />
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleGenerateTeams} 
            disabled={loading || selectedPlayerIds.length < 2}
            className="px-8"
          >
            {loading ? 'Balancing Teams...' : 'Generate Balanced Teams'}
          </Button>
        </div>
      </div>
      
      {(teamA && teamB) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <TeamCard team={teamA} name="Team A" color="badminton-blue" />
          <TeamCard team={teamB} name="Team B" color="badminton-yellow" />
        </div>
      )}
    </div>
  );
};

export default TeamBalancerPage;
