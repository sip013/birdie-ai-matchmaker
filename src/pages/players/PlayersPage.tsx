
import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Users } from 'lucide-react';
import PlayerForm from './PlayerForm';
import PlayersTable from './PlayersTable';
import { toast } from 'sonner';

// Mock data - would normally come from Supabase
const initialPlayers = [
  { id: '1', name: 'John Smith', rating: 1240, matches_played: 24, win_rate: 0.58 },
  { id: '2', name: 'Sarah Johnson', rating: 1120, matches_played: 18, win_rate: 0.50 },
  { id: '3', name: 'David Lee', rating: 1350, matches_played: 32, win_rate: 0.63 },
  { id: '4', name: 'Emily Chen', rating: 1400, matches_played: 41, win_rate: 0.71 },
  { id: '5', name: 'Michael Wong', rating: 1280, matches_played: 28, win_rate: 0.60 },
];

export type Player = {
  id: string;
  name: string;
  rating: number;
  matches_played: number;
  win_rate: number;
  age?: number;
  position?: 'Singles' | 'Doubles' | 'Both';
};

const PlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  // In a real app, this would fetch from Supabase
  useEffect(() => {
    // Fetch players data
    // const fetchPlayers = async () => {
    //   const { data, error } = await supabase.from('players').select('*');
    //   if (error) console.error('Error fetching players:', error);
    //   else setPlayers(data);
    // };
    // fetchPlayers();
  }, []);

  const handleAddPlayer = (newPlayer: Omit<Player, 'id' | 'win_rate' | 'matches_played' | 'rating'>) => {
    // In a real app, this would be sent to Supabase
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayer.name,
      age: newPlayer.age,
      position: newPlayer.position,
      rating: 1000, // Default rating for new players
      matches_played: 0,
      win_rate: 0,
    };

    setPlayers([...players, player]);
    toast.success('Player added successfully');
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
            <PlayersTable players={players} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayersPage;
