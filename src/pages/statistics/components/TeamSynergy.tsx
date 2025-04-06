
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Users } from 'lucide-react';

interface Match {
  id: string;
  team1_player1: { id: string; name: string };
  team1_player2: { id: string; name: string } | null;
  team2_player1: { id: string; name: string };
  team2_player2: { id: string; name: string } | null;
  team1_score: number;
  team2_score: number;
  winner: string;
}

interface TeamSynergyProps {
  matches: Match[];
}

const TeamSynergy: React.FC<TeamSynergyProps> = ({ matches }) => {
  const teamSynergies = useMemo(() => {
    // We need only doubles matches (where both teams have 2 players)
    const doublesMatches = matches.filter(
      m => m.team1_player2 && m.team2_player2
    );

    // Map to store team synergies
    const synergyMap = new Map<string, {
      player1: { id: string; name: string };
      player2: { id: string; name: string };
      matchesPlayed: number;
      matchesWon: number;
      winRate: number;
    }>();

    // Process all doubles matches
    doublesMatches.forEach(match => {
      // Process team 1
      if (match.team1_player1 && match.team1_player2) {
        // Create unique key for this team pair (sort by ID to ensure consistency)
        const pairKey = [match.team1_player1.id, match.team1_player2.id].sort().join('-');
        
        // Get existing team data or create new one
        const existing = synergyMap.get(pairKey) || {
          player1: match.team1_player1.id < match.team1_player2.id 
            ? match.team1_player1 
            : match.team1_player2,
          player2: match.team1_player1.id < match.team1_player2.id 
            ? match.team1_player2 
            : match.team1_player1,
          matchesPlayed: 0,
          matchesWon: 0,
          winRate: 0
        };
        
        // Update stats
        existing.matchesPlayed += 1;
        if (match.winner === 'team1') {
          existing.matchesWon += 1;
        }
        existing.winRate = existing.matchesWon / existing.matchesPlayed;
        
        synergyMap.set(pairKey, existing);
      }
      
      // Process team 2
      if (match.team2_player1 && match.team2_player2) {
        // Create unique key for this team pair (sort by ID to ensure consistency)
        const pairKey = [match.team2_player1.id, match.team2_player2.id].sort().join('-');
        
        // Get existing team data or create new one
        const existing = synergyMap.get(pairKey) || {
          player1: match.team2_player1.id < match.team2_player2.id 
            ? match.team2_player1 
            : match.team2_player2,
          player2: match.team2_player1.id < match.team2_player2.id 
            ? match.team2_player2 
            : match.team2_player1,
          matchesPlayed: 0,
          matchesWon: 0,
          winRate: 0
        };
        
        // Update stats
        existing.matchesPlayed += 1;
        if (match.winner === 'team2') {
          existing.matchesWon += 1;
        }
        existing.winRate = existing.matchesWon / existing.matchesPlayed;
        
        synergyMap.set(pairKey, existing);
      }
    });

    // Convert to array and sort by win rate and match count
    return Array.from(synergyMap.values())
      .filter(team => team.matchesPlayed >= 2) // Only consider teams with at least 2 matches
      .sort((a, b) => {
        // First sort by win rate (descending)
        if (a.winRate !== b.winRate) {
          return b.winRate - a.winRate;
        }
        // Then by number of matches won (descending)
        if (a.matchesWon !== b.matchesWon) {
          return b.matchesWon - a.matchesWon;
        }
        // Then by number of matches played (descending)
        return b.matchesPlayed - a.matchesPlayed;
      })
      .slice(0, 5); // Get top 5 teams
  }, [matches]);

  if (teamSynergies.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Not enough doubles matches to determine team synergies yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team</TableHead>
          <TableHead>Matches</TableHead>
          <TableHead>Wins</TableHead>
          <TableHead>Win Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamSynergies.map((team) => (
          <TableRow key={`${team.player1.id}-${team.player2.id}`}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>
                  {team.player1.name} & {team.player2.name}
                </span>
              </div>
            </TableCell>
            <TableCell>{team.matchesPlayed}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {team.matchesWon}
                <Award className="h-3 w-3 text-yellow-500" />
              </div>
            </TableCell>
            <TableCell>
              {(team.winRate * 100).toFixed(0)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TeamSynergy;
