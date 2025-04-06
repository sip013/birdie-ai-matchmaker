import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Player } from '../players/PlayersPage';
import { useAuth } from '@/context/AuthContext';
import { matchFormSchema, MatchFormValues } from './schemas/matchFormSchema';
import TeamSection from './components/TeamSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

type Match = {
  id: string;
  team1_player1_id: string;
  team1_player2_id: string | null;
  team2_player1_id: string;
  team2_player2_id: string | null;
  team1_score: number;
  team2_score: number;
  winner: 'team1' | 'team2';
  duration_minutes: number;
  created_at: string;
  user_id: string;
};

interface MatchFormProps {
  players: Player[];
  onLogMatch: (match: Omit<Match, 'id'>) => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ players, onLogMatch }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  const [matchDate, setMatchDate] = useState<Date>(new Date());
  
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      teamAScore: 0,
      teamBScore: 0,
    },
  });

  const onSubmit = (values: MatchFormValues) => {
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

    const match: Omit<Match, 'id'> = {
      team1_player1_id: teamAPlayers[0],
      team1_player2_id: teamAPlayers[1] || null,
      team2_player1_id: teamBPlayers[0],
      team2_player2_id: teamBPlayers[1] || null,
      team1_score: values.teamAScore,
      team2_score: values.teamBScore,
      winner: values.teamAScore > values.teamBScore ? 'team1' : 'team2',
      duration_minutes: 0,
      created_at: new Date().toISOString(),
      user_id: user?.id || ''
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
        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="match-date">Match Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !matchDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {matchDate ? format(matchDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={isMobile ? "center" : "start"}>
              <Calendar
                mode="single"
                selected={matchDate}
                onSelect={(date) => date && setMatchDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {isMobile ? (
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6">
              <TeamSection
                team="A"
                form={form}
                scoreName="teamAScore"
                availablePlayers={getAvailablePlayers('A')}
                selectedPlayerIds={teamAPlayers}
                onSelectPlayers={setTeamAPlayers}
                isMobile={isMobile}
              />
              
              <TeamSection
                team="B"
                form={form}
                scoreName="teamBScore"
                availablePlayers={getAvailablePlayers('B')}
                selectedPlayerIds={teamBPlayers}
                onSelectPlayers={setTeamBPlayers}
                isMobile={isMobile}
              />
            </div>
          </ScrollArea>
        ) : (
          <>
            <TeamSection
              team="A"
              form={form}
              scoreName="teamAScore"
              availablePlayers={getAvailablePlayers('A')}
              selectedPlayerIds={teamAPlayers}
              onSelectPlayers={setTeamAPlayers}
              isMobile={isMobile}
            />
            
            <TeamSection
              team="B"
              form={form}
              scoreName="teamBScore"
              availablePlayers={getAvailablePlayers('B')}
              selectedPlayerIds={teamBPlayers}
              onSelectPlayers={setTeamBPlayers}
              isMobile={isMobile}
            />
          </>
        )}
        
        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
        )}
        
        <Button type="submit" className="w-full">Log Match</Button>
      </form>
    </Form>
  );
};

export default MatchForm;
