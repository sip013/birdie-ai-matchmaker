
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Player } from '../players/PlayersPage';
import { Match } from './MatchLoggerPage';
import { matchFormSchema, MatchFormValues } from './schemas/matchFormSchema';
import TeamSection from './components/TeamSection';

interface MatchFormProps {
  players: Player[];
  onLogMatch: (match: Omit<Match, 'id' | 'date'>) => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ players, onLogMatch }) => {
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  
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
        <TeamSection
          team="A"
          form={form}
          scoreName="teamAScore"
          availablePlayers={getAvailablePlayers('A')}
          selectedPlayerIds={teamAPlayers}
          onSelectPlayers={setTeamAPlayers}
        />
        
        <TeamSection
          team="B"
          form={form}
          scoreName="teamBScore"
          availablePlayers={getAvailablePlayers('B')}
          selectedPlayerIds={teamBPlayers}
          onSelectPlayers={setTeamBPlayers}
        />
        
        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
        )}
        
        <Button type="submit" className="w-full">Log Match</Button>
      </form>
    </Form>
  );
};

export default MatchForm;
