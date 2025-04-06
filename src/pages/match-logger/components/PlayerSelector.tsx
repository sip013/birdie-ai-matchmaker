
import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { Player } from '../../players/PlayersPage';

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

export default PlayerSelector;
