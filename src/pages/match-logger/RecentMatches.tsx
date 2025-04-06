import React from 'react';
import type { Match } from './MatchLoggerPage';
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
                {format(new Date(match.created_at), 'MMM d, yyyy')}
              </div>
              <Badge variant={match.winner === 'team1' ? 'default' : 'secondary'}>
                Team {match.winner === 'team1' ? 'A' : 'B'} Won
              </Badge>
            </div>
            
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="col-span-2">
                <h3 className="font-medium text-badminton-blue">Team A</h3>
                <div className="mt-1 space-y-1">
                  {match.team_a?.players.map(player => (
                    <div key={player.id} className="text-sm">
                      {player.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="col-span-1 text-center">
                <div className="text-2xl font-bold">
                  {match.team1_score} - {match.team2_score}
                </div>
                {match.winner === 'team1' ? (
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mt-1" />
                ) : (
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mt-1 opacity-0" />
                )}
              </div>
              
              <div className="col-span-2">
                <h3 className="font-medium text-badminton-yellow">Team B</h3>
                <div className="mt-1 space-y-1">
                  {match.team_b?.players.map(player => (
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
