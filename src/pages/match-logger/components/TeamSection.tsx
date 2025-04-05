
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Player } from '../../players/PlayersPage';
import PlayerSelector from './PlayerSelector';

interface TeamSectionProps {
  team: 'A' | 'B';
  form: UseFormReturn<any>;
  scoreName: 'teamAScore' | 'teamBScore';
  availablePlayers: Player[];
  selectedPlayerIds: string[];
  onSelectPlayers: (ids: string[]) => void;
}

const TeamSection: React.FC<TeamSectionProps> = ({
  team,
  form,
  scoreName,
  availablePlayers,
  selectedPlayerIds,
  onSelectPlayers
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Team {team}</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Players</label>
        <PlayerSelector
          availablePlayers={availablePlayers}
          selectedPlayerIds={selectedPlayerIds}
          onSelectPlayers={onSelectPlayers}
          team={team}
        />
      </div>
      
      <FormField
        control={form.control}
        name={scoreName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Score</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TeamSection;
