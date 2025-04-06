
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, GitCompare } from 'lucide-react';

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

interface FierceRivalryProps {
  matches: Match[];
}

// Calculate player vs player rivalries based on score closeness
const FierceRivalry: React.FC<FierceRivalryProps> = ({ matches }) => {
  const rivalries = useMemo(() => {
    // We'll focus on singles matches first for simplicity
    const singleMatches = matches.filter(
      m => !m.team1_player2 && !m.team2_player2
    );

    // Build player vs player stats
    const rivalryMap = new Map<string, {
      player1: { id: string; name: string };
      player2: { id: string; name: string };
      matchCount: number;
      averageScoreDiff: number;
      player1Wins: number;
      player2Wins: number;
    }>();

    singleMatches.forEach(match => {
      const player1 = match.team1_player1;
      const player2 = match.team2_player1;
      
      // Create unique key for this player pair (sort by ID to ensure consistency)
      const pairKey = [player1.id, player2.id].sort().join('-');
      
      // Calculate score difference
      const scoreDiff = Math.abs(match.team1_score - match.team2_score);
      
      // Get existing rivalry or create new one
      const existing = rivalryMap.get(pairKey) || {
        player1: player1.id < player2.id ? player1 : player2,
        player2: player1.id < player2.id ? player2 : player1,
        matchCount: 0,
        averageScoreDiff: 0,
        player1Wins: 0,
        player2Wins: 0
      };
      
      // Update rivalry stats
      const totalScoreDiff = (existing.averageScoreDiff * existing.matchCount) + scoreDiff;
      existing.matchCount += 1;
      existing.averageScoreDiff = totalScoreDiff / existing.matchCount;
      
      // Track wins
      if (match.winner === 'team1' && player1.id === existing.player1.id) {
        existing.player1Wins += 1;
      } else if (match.winner === 'team2' && player2.id === existing.player1.id) {
        existing.player1Wins += 1;
      } else {
        existing.player2Wins += 1;
      }
      
      rivalryMap.set(pairKey, existing);
    });

    // Convert to array and sort by closest average score difference and then by match count
    return Array.from(rivalryMap.values())
      .filter(r => r.matchCount >= 2) // Only consider rivalries with at least 2 matches
      .sort((a, b) => {
        // First sort by score closeness (ascending)
        if (a.averageScoreDiff !== b.averageScoreDiff) {
          return a.averageScoreDiff - b.averageScoreDiff;
        }
        // Then by number of matches (descending)
        return b.matchCount - a.matchCount;
      })
      .slice(0, 5); // Get top 5 rivalries
  }, [matches]);

  if (rivalries.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Not enough match data to determine rivalries yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Players</TableHead>
          <TableHead>Matches</TableHead>
          <TableHead>Avg. Score Diff</TableHead>
          <TableHead>Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rivalries.map((rivalry) => (
          <TableRow key={`${rivalry.player1.id}-${rivalry.player2.id}`}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-primary" />
                <span>
                  {rivalry.player1.name} vs {rivalry.player2.name}
                </span>
              </div>
            </TableCell>
            <TableCell>{rivalry.matchCount}</TableCell>
            <TableCell>{rivalry.averageScoreDiff.toFixed(1)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {rivalry.player1Wins}
                <Trophy className="h-3 w-3 text-yellow-500" />
                {rivalry.player2Wins}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FierceRivalry;
