
import React from 'react';
import { Player } from '../players/PlayersPage';
import { Progress } from '@/components/ui/progress';

interface PlayerStatsProps {
  players: Player[];
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ players }) => {
  // Sort players by rating
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
  
  // Get max rating for calculating percentages
  const maxRating = Math.max(...players.map(p => p.rating));
  const minRating = Math.min(...players.map(p => p.rating));
  const ratingRange = maxRating - minRating;

  return (
    <div className="space-y-6">
      {sortedPlayers.map((player, index) => {
        const percentage = ratingRange > 0 
          ? ((player.rating - minRating) / ratingRange) * 100
          : 50;
        
        // Calculate win rate percentage ensuring it's always valid
        const winRatePercent = player.matches_played > 0
          ? (player.wins / player.matches_played) * 100
          : 0;
          
        return (
          <div key={player.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="font-medium flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs">
                    {index + 1}
                  </span>
                  {player.name}
                </div>
              </div>
              <div className="font-semibold">{Math.round(player.rating)}</div>
            </div>
            <div className="space-y-1">
              <Progress value={percentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{player.matches_played} matches</span>
                <span>{winRatePercent.toFixed(0)}% win rate</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerStats;
