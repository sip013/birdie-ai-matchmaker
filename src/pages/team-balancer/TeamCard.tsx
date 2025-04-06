
import React from 'react';
import { Player } from '../players/PlayersPage';
import { Badge } from '@/components/ui/badge';

interface TeamCardProps {
  team: {
    players: Player[];
    totalRating: number;
    winProbability: number;
  };
  name: string;
  color: string;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, name, color }) => {
  if (!team.players || team.players.length === 0) {
    return (
      <div className={`${color === 'team-card-a' ? 'team-card-a' : 'team-card-b'} opacity-70`}>
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-gray-500">No players selected</p>
      </div>
    );
  }

  const winProbabilityPercent = Math.round(team.winProbability * 100);

  return (
    <div className={color === 'team-card-a' ? 'team-card-a' : 'team-card-b'}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={winProbabilityPercent > 50 ? "default" : "secondary"}>
            {winProbabilityPercent}% Win Chance
          </Badge>
          <span className="text-lg font-bold">
            {team.totalRating.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="divide-y">
        {team.players.map((player) => (
          <div key={player.id} className="py-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{player.name}</div>
              <div className="text-sm text-gray-500">
                {player.position || 'No position'} • {player.matches_played} matches
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{player.rating}</div>
              <div className="text-xs">
                {player.win_rate ? `${Math.round(player.win_rate * 100)}% wins` : 'No matches'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamCard;
