
import React from 'react';
import { Match } from './MatchLoggerPage';
import { format } from 'date-fns';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecentMatchesProps {
  matches: Match[];
}

const RecentMatches: React.FC<RecentMatchesProps> = ({ matches }) => {
  return (
    <div className="space-y-4">
      {matches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No matches have been recorded yet.
        </div>
      ) : (
        matches.map((match) => (
          <div 
            key={match.id}
            className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">
                {format(new Date(match.date), 'MMM d, yyyy')}
              </div>
              <Badge variant={match.winner_team === 'A' ? 'default' : 'secondary'}>
                Team {match.winner_team} Won
              </Badge>
            </div>
            
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="col-span-2">
                <h3 className="font-medium text-primary">Team A</h3>
                <div className="mt-1 space-y-1">
                  {match.team_a.players.map(player => (
                    <div key={player.id} className="text-sm">
                      {player.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="col-span-1 text-center">
                <div className="text-2xl font-bold">
                  {match.team_a.score} - {match.team_b.score}
                </div>
                {match.winner_team === 'A' ? (
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mt-1" />
                ) : (
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mt-1 opacity-0" />
                )}
              </div>
              
              <div className="col-span-2">
                <h3 className="font-medium text-secondary">Team B</h3>
                <div className="mt-1 space-y-1">
                  {match.team_b.players.map(player => (
                    <div key={player.id} className="text-sm">
                      {player.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentMatches;
