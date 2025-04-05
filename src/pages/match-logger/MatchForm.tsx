import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Player } from '../players/PlayersPage';
import { Match } from './MatchLoggerPage';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  teamAScore: z.coerce.number().min(0).max(30),
  teamBScore: z.coerce.number().min(0).max(30),
});

type FormValues = z.infer<typeof formSchema>;

interface MatchFormProps {
  players: Player[];
  onLogMatch: (match: Omit<Match, 'id' | 'date'>) => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ players, onLogMatch }) => {
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamAScore: 0,
      teamBScore: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    // Validate team selections
    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
      form.setError('root', {
        message: 'Please select players for both teams',
      });
      return;
    }

    // Validate that a team has won
    if (values.teamAScore === values.teamBScore) {
      form.setError('root', {
        message: 'Match cannot end in a tie',
      });
      return;
    }

    const teamAPlayerObjects = players.filter(p => teamAPlayers.includes(p.id));
    const teamBPlayerObjects = players.filter(p => teamBPlayers.includes(p.id));

    const match: Omit<Match, 'id' | 'date'> = {
      team_a: {
        players: teamAPlayerObjects,
        score: values.teamAScore
      },
      team_b: {
        players: teamBPlayerObjects,
        score: values.teamBScore
      },
      winner_team: values.teamAScore > values.teamBScore ? 'A' : 'B'
    };

    onLogMatch(match);
    
    // Reset form
    form.reset();
    setTeamAPlayers([]);
    setTeamBPlayers([]);
  };

  const getAvailablePlayers = (currentTeam: 'A' | 'B') => {
    const selectedPlayers = currentTeam === 'A' ? teamBPlayers : teamAPlayers;
    return players.filter(player => !selectedPlayers.includes(player.id));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Team A</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Players</label>
            <PlayerSelector
              availablePlayers={getAvailablePlayers('A')}
              selectedPlayerIds={teamAPlayers}
              onSelectPlayers={setTeamAPlayers}
              team="A"
            />
          </div>
          
          <FormField
            control={form.control}
            name="teamAScore"
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
        
        <div className="space-y-4">
          <h3 className="font-medium">Team B</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Players</label>
            <PlayerSelector
              availablePlayers={getAvailablePlayers('B')}
              selectedPlayerIds={teamBPlayers}
              onSelectPlayers={setTeamBPlayers}
              team="B"
            />
          </div>
          
          <FormField
            control={form.control}
            name="teamBScore"
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
        
        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
        )}
        
        <Button type="submit" className="w-full">Log Match</Button>
      </form>
    </Form>
  );
};

interface PlayerSelectorProps {
  availablePlayers: Player[];
  selectedPlayerIds: string[];
  onSelectPlayers: (ids: string[]) => void;
  team: 'A' | 'B';
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({ 
  availablePlayers, 
  selectedPlayerIds, 
  onSelectPlayers,
  team
}) => {
  const [open, setOpen] = React.useState(false);

  const togglePlayer = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      onSelectPlayers(selectedPlayerIds.filter(id => id !== playerId));
    } else {
      onSelectPlayers([...selectedPlayerIds, playerId]);
    }
  };

  const getBorderColor = () => {
    return team === 'A' ? 'border-badminton-blue' : 'border-badminton-yellow';
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between border-2 ${getBorderColor()}`}
          >
            {selectedPlayerIds.length > 0 
              ? `${selectedPlayerIds.length} players selected`
              : "Select players"
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search players..." />
            <CommandList>
              <CommandEmpty>No player found.</CommandEmpty>
              <CommandGroup>
                {availablePlayers.map((player) => (
                  <CommandItem
                    key={player.id}
                    value={player.id}
                    onSelect={() => {
                      togglePlayer(player.id);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedPlayerIds.includes(player.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {player.name} - {Math.round(player.rating)} rating
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedPlayerIds.length > 0 && (
        <div className="mt-2">
          <ul className="space-y-1">
            {availablePlayers
              .filter(p => selectedPlayerIds.includes(p.id))
              .map(player => (
                <li 
                  key={player.id}
                  className="text-sm flex justify-between bg-muted/50 px-3 py-1 rounded"
                >
                  <span>{player.name}</span>
                  <button 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => togglePlayer(player.id)}
                    type="button"
                  >
                    ✕
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MatchForm;
