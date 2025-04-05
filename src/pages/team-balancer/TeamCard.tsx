
import React from 'react';
import { Player } from '../players/PlayersPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
  const getColorClass = () => {
    if (color === 'badminton-blue') return 'border-l-badminton-blue';
    if (color === 'badminton-yellow') return 'border-l-badminton-yellow';
    return '';
  };

  return (
    <Card className={`overflow-hidden border-l-4 ${getColorClass()} animate-fade-in`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>{name}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {team.players.length} players
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Win Probability</span>
            <span className="text-sm font-medium">{(team.winProbability * 100).toFixed(1)}%</span>
          </div>
          <Progress value={team.winProbability * 100} />
        </div>

        <div className="mb-4">
          <div className="flex justify-between">
            <span>Total Rating</span>
            <span className="font-semibold">{Math.round(team.totalRating)}</span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Players</h3>
          <ul className="space-y-2">
            {team.players.map(player => (
              <li key={player.id} className="flex justify-between items-center py-2 px-3 bg-muted/40 rounded-md">
                <span>{player.name}</span>
                <span className="font-medium">{Math.round(player.rating)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
