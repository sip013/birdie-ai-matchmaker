
import React, { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { ClipboardList, Trophy } from 'lucide-react';
import { Player } from '../players/PlayersPage';
import MatchForm from './MatchForm';
import RecentMatches from './RecentMatches';
import { toast } from 'sonner';

// Mock data - would normally come from Supabase
const mockPlayers = [
  { id: '1', name: 'John Smith', rating: 1240, matches_played: 24, win_rate: 0.58 },
  { id: '2', name: 'Sarah Johnson', rating: 1120, matches_played: 18, win_rate: 0.50 },
  { id: '3', name: 'David Lee', rating: 1350, matches_played: 32, win_rate: 0.63 },
  { id: '4', name: 'Emily Chen', rating: 1400, matches_played: 41, win_rate: 0.71 },
  { id: '5', name: 'Michael Wong', rating: 1280, matches_played: 28, win_rate: 0.60 },
];

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

const initialMatches: Match[] = [
  {
    id: '1',
    date: new Date(2023, 3, 15),
    team_a: {
      players: [mockPlayers[0], mockPlayers[2]],
      score: 21
    },
    team_b: {
      players: [mockPlayers[1], mockPlayers[3]],
      score: 18
    },
    winner_team: 'A'
  },
  {
    id: '2',
    date: new Date(2023, 3, 10),
    team_a: {
      players: [mockPlayers[2], mockPlayers[4]],
      score: 19
    },
    team_b: {
      players: [mockPlayers[0], mockPlayers[3]],
      score: 21
    },
    winner_team: 'B'
  }
];

const MatchLoggerPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);

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
            <MatchForm players={mockPlayers} onLogMatch={handleLogMatch} />
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
