
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
import { Badge } from '@/components/ui/badge';
import { Player } from '../players/PlayersPage';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayerIds: string[];
  onSelectPlayers: (ids: string[]) => void;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({ 
  players, 
  selectedPlayerIds, 
  onSelectPlayers 
}) => {
  const [open, setOpen] = React.useState(false);

  const togglePlayer = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      onSelectPlayers(selectedPlayerIds.filter(id => id !== playerId));
    } else {
      onSelectPlayers([...selectedPlayerIds, playerId]);
    }
  };

  const selectedPlayers = players.filter(player => 
    selectedPlayerIds.includes(player.id)
  );

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
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
                {players.map((player) => (
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

      {selectedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedPlayers.map(player => (
            <Badge 
              key={player.id}
              variant="secondary"
              className="py-1 px-3"
            >
              {player.name}
              <button 
                className="ml-2 text-xs opacity-70 hover:opacity-100"
                onClick={() => togglePlayer(player.id)}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerSelector;
