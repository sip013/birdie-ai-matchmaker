import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Player } from '../../players/PlayersPage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeamSectionProps {
  team: 'A' | 'B';
  form: UseFormReturn<any>;
  scoreName: string;
  availablePlayers: Player[];
  selectedPlayerIds: string[];
  onSelectPlayers: (players: string[]) => void;
  isMobile?: boolean;
}

const TeamSection: React.FC<TeamSectionProps> = ({
  team,
  form,
  scoreName,
  availablePlayers,
  selectedPlayerIds,
  onSelectPlayers,
  isMobile = false
}) => {
  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      onSelectPlayers(selectedPlayerIds.filter(id => id !== playerId));
    } else {
      onSelectPlayers([...selectedPlayerIds, playerId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Team {team}</Label>
        <div className="flex items-center gap-2">
          {selectedPlayerIds.map(playerId => {
            const player = availablePlayers.find(p => p.id === playerId);
            return player ? (
              <Badge key={playerId} variant="secondary" className="flex items-center gap-1">
                {player.name}
                <button
                  type="button"
                  onClick={() => handlePlayerSelect(playerId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      </div>

      {isMobile ? (
        <ScrollArea className="h-[200px] rounded-md border p-4">
          <div className="space-y-2">
            {availablePlayers.map(player => (
              <Button
                key={player.id}
                variant={selectedPlayerIds.includes(player.id) ? "default" : "outline"}
                className="w-full justify-start"
                type="button"
                onClick={() => handlePlayerSelect(player.id)}
              >
                {player.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Select
          onValueChange={handlePlayerSelect}
          value={selectedPlayerIds[selectedPlayerIds.length - 1] || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select player for Team ${team}`} />
          </SelectTrigger>
          <SelectContent>
            {availablePlayers.map(player => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="space-y-2">
        <Label htmlFor={`score-${team}`}>Score</Label>
        <Input
          id={`score-${team}`}
          type="number"
          min="0"
          {...form.register(scoreName)}
        />
      </div>
    </div>
  );
};

export default TeamSection;
