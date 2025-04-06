import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Trophy, Users, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

type PlayerStats = {
  total_players: number;
  avg_rating: number;
  highest_rating: number;
  most_matches: number;
  best_win_rate: number;
};

type MatchStats = {
  total_matches: number;
  avg_match_duration: number;
  most_competitive_match: string;
  highest_rating_change: number;
};

type Player = {
  id: string;
  name: string;
  rating: number;
  matches_played: number;
  wins: number;
  win_rate: number;
  position: 'Singles' | 'Doubles' | 'Both';
  age: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  last_played_at?: string;
};

type RatingHistory = {
  date: string;
  rating: number;
  change: number;
  isWin: boolean;
};

type MatchHistory = {
  id: string;
  match_id: string;
  player_id: string;
  date: string;
  rating_before: number;
  rating_after: number;
  rating_change: number;
  is_winner: boolean;
  score_difference: number;
};

const StatisticsPage: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [ratingHistory, setRatingHistory] = useState<RatingHistory[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats>({
    total_matches: 0,
    avg_match_duration: 0,
    most_competitive_match: 'N/A',
    highest_rating_change: 0
  });

  // Fetch players when component mounts
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!user) return;

      try {
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .order('rating', { ascending: false });

        if (playersError) throw playersError;

        // Ensure the position field matches our type
        const typedPlayers = (playersData || []).map(player => ({
          ...player,
          position: player.position as 'Singles' | 'Doubles' | 'Both'
        })) as Player[];

        setPlayers(typedPlayers);

        // If we have players, select the first one by default
        if (typedPlayers.length > 0) {
          setSelectedPlayer(typedPlayers[0]);
        }
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Failed to load players');
      }
    };

    fetchPlayers();
  }, [user]);

  // Fetch rating history when selected player changes
  useEffect(() => {
    const fetchRatingHistory = async () => {
      if (!selectedPlayer || !user) return;

      try {
        setLoading(true);
        
        // Fetch match history for the selected player
        const { data: history, error: historyError } = await supabase
          .from('match_history')
          .select('*')
          .eq('player_id', selectedPlayer.id)
          .order('date', { ascending: true });

        if (historyError) throw historyError;

        // Transform history data for the chart
        const chartData = history?.map(record => ({
          date: new Date(record.date).toLocaleDateString(),
          rating: record.rating_after,
          change: record.rating_change,
          isWin: record.is_winner
        })) || [];

        setRatingHistory(chartData);
        setMatchHistory(history || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rating history:', err);
        setError('Failed to load rating history');
        setLoading(false);
      }
    };

    fetchRatingHistory();
  }, [selectedPlayer, user]);

  // Fetch match statistics
  useEffect(() => {
    const fetchMatchStats = async () => {
      if (!user) return;

      try {
        const { data: matches, error: matchesError } = await supabase
          .from('matches')
          .select('*');

        if (matchesError) throw matchesError;

        if (matches && matches.length > 0) {
          setMatchStats({
            total_matches: matches.length,
            avg_match_duration: 0, // You can calculate this if you have duration data
            most_competitive_match: 'N/A', // You can calculate this based on score difference
            highest_rating_change: 0 // You can calculate this if you track rating changes
          });
        }
      } catch (err) {
        console.error('Error fetching match stats:', err);
        setError('Failed to load match statistics');
      }
    };

    fetchMatchStats();
  }, [user]);

  // Calculate overall statistics
  const playerStats: PlayerStats = players ? {
    total_players: players.length,
    avg_rating: players.reduce((sum, p) => sum + p.rating, 0) / players.length,
    highest_rating: Math.max(...players.map(p => p.rating)),
    most_matches: Math.max(...players.map(p => p.matches_played)),
    best_win_rate: Math.max(...players.map(p => p.win_rate || 0))
  } : {
    total_players: 0,
    avg_rating: 0,
    highest_rating: 0,
    most_matches: 0,
    best_win_rate: 0
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Statistics" 
        description="View player and match statistics"
        icon={<BarChart3 size={32} />}
      />
      
      {loading ? (
        <div className="text-center py-8">Loading statistics...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Overall Statistics Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{playerStats.total_players}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(playerStats.avg_rating)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Rating</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{playerStats.highest_rating}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Win Rate</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {`${Math.round(playerStats.best_win_rate)}%`}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Statistics Table */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Player Statistics</CardTitle>
              <CardDescription>Overview of all players and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Last Played</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player, index) => (
                    <TableRow 
                      key={player.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.rating}</TableCell>
                      <TableCell>{player.matches_played}</TableCell>
                      <TableCell>{player.wins}</TableCell>
                      <TableCell>{player.win_rate.toFixed(1)}%</TableCell>
                      <TableCell>
                        {player.last_played_at ? (
                          <span className="text-sm text-gray-600">
                            {new Date(player.last_played_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Player Rating Trend */}
          <div className="grid gap-6 mt-8">
            <div className="bg-card rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                {selectedPlayer?.name}'s Rating Trend
              </h2>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : ratingHistory.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ratingHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 border rounded shadow">
                                <p className="font-medium">Rating: {data.rating}</p>
                                <p className={data.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                                  Change: {data.change >= 0 ? '+' : ''}{data.change}
                                </p>
                                <p className={data.isWin ? 'text-green-500' : 'text-red-500'}>
                                  Result: {data.isWin ? 'Win' : 'Loss'}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-gray-500">No rating history available</div>
              )}
            </div>
          </div>

          {/* Match History Table */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              {selectedPlayer?.name}'s Match History
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : matchHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Rating Change</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Score Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchHistory.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                      <TableCell className={match.rating_change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {match.rating_change >= 0 ? '+' : ''}{match.rating_change}
                      </TableCell>
                      <TableCell>
                        <span className={match.is_winner ? 'text-green-500' : 'text-red-500'}>
                          {match.is_winner ? 'Win' : 'Loss'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {match.score_difference > 0 ? '+' : ''}{match.score_difference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500">No match history available</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatisticsPage; 