import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { Home, Trophy, Users, ArrowUp, BarChart3, Flame, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RatingChart from './RatingChart';
import PlayerStats from './PlayerStats';
import { Player } from '../players/PlayersPage';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

type RatingHistory = {
  date: string;
  [playerName: string]: number | string;
};

type PlayerStats = {
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

type Match = {
  id: string;
  player1_id: string;
  player2_id: string;
  date: string;
  score_difference: number;
};

type History = {
  data: Match[] | null;
  error: Error | null;
};

type FierceNemesis = {
  player1: string;
  player2: string;
  matches: number;
  avgScoreDiff: number;
  recentForm: 'hot' | 'cold' | 'neutral';
  streak: number;
  lastMatchDate: string;
};

type TeamSynergy = {
  player1: string;
  player2: string;
  matches: number;
  wins: number;
  winRate: number;
  recentForm: 'hot' | 'cold' | 'neutral';
  streak: number;
  lastMatchDate: string;
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [ratingHistory, setRatingHistory] = useState<RatingHistory[]>([]);
  const [fierceNemesis, setFierceNemesis] = useState<FierceNemesis[]>([]);
  const [teamSynergy, setTeamSynergy] = useState<TeamSynergy[]>([]);
  const [history, setHistory] = useState<History>({ data: null, error: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch players and their rating history
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .order('rating', { ascending: false });

        if (playersError) throw playersError;

        const typedPlayers = playersData?.map(player => ({
          ...player,
          position: player.position as 'Singles' | 'Doubles' | 'Both'
        })) as PlayerStats[];

        setPlayers(typedPlayers || []);

        // Fetch match history
        const { data: historyData, error: historyError } = await supabase
          .from('match_history')
          .select('*')
          .order('date', { ascending: true });

        if (historyError) throw historyError;

        // Calculate fierce rivalries
        const rivalries = new Map<string, FierceNemesis>();
        const synergies = new Map<string, TeamSynergy>();

        historyData?.forEach(match => {
          const player1 = typedPlayers?.find(p => p.id === match.player_id);
          if (!player1) return;

          const opponentRecord = historyData.find(
            r => r.match_id === match.match_id && r.player_id !== match.player_id
          );
          if (!opponentRecord) return;

          const player2 = typedPlayers?.find(p => p.id === opponentRecord.player_id);
          if (!player2) return;

          // Calculate score difference
          const scoreDiff = Math.abs(match.score_difference);

          // Update fierce nemesis stats
          const key = [player1.name, player2.name].sort().join('-');
          const existing = rivalries.get(key) || {
            player1: player1.name,
            player2: player2.name,
            matches: 0,
            avgScoreDiff: 0,
            recentForm: 'neutral',
            streak: 0,
            lastMatchDate: match.date
          };

          // Update streak
          const isWinningStreak = match.is_winner && existing.recentForm === 'hot';
          const isLosingStreak = !match.is_winner && existing.recentForm === 'cold';
          
          if (isWinningStreak || isLosingStreak) {
            existing.streak++;
          } else {
            existing.streak = 1;
          }

          // Update recent form
          existing.recentForm = match.is_winner ? 'hot' : 'cold';
          existing.matches++;
          existing.avgScoreDiff = (existing.avgScoreDiff * (existing.matches - 1) + scoreDiff) / existing.matches;
          existing.lastMatchDate = match.date;
          rivalries.set(key, existing);

          // Update team synergy stats
          if (match.is_winner) {
            const teamKey = [player1.name, player2.name].sort().join('-');
            const existingTeam = synergies.get(teamKey) || {
              player1: player1.name,
              player2: player2.name,
              matches: 0,
              wins: 0,
              winRate: 0,
              recentForm: 'neutral',
              streak: 0,
              lastMatchDate: match.date
            };

            // Update streak
            if (existingTeam.recentForm === 'hot') {
              existingTeam.streak++;
            } else {
              existingTeam.streak = 1;
            }

            existingTeam.recentForm = 'hot';
            existingTeam.matches++;
            existingTeam.wins++;
            existingTeam.winRate = (existingTeam.wins / existingTeam.matches) * 100;
            existingTeam.lastMatchDate = match.date;
            synergies.set(teamKey, existingTeam);
          }
        });

        // Convert maps to arrays and sort
        const fierceNemesisArray = Array.from(rivalries.values())
          .filter(n => n.matches >= 2)
          .sort((a, b) => {
            if (a.streak !== b.streak) return b.streak - a.streak;
            if (a.matches !== b.matches) return b.matches - a.matches;
            return a.avgScoreDiff - b.avgScoreDiff;
          })
          .slice(0, 2);

        const teamSynergyArray = Array.from(synergies.values())
          .filter(t => t.matches >= 2)
          .sort((a, b) => {
            if (a.streak !== b.streak) return b.streak - a.streak;
            if (a.winRate !== b.winRate) return b.winRate - a.winRate;
            return b.matches - a.matches;
          })
          .slice(0, 2);

        setFierceNemesis(fierceNemesisArray);
        setTeamSynergy(teamSynergyArray);

        // Group matches by date for the rating trend graph
        const matchesByDate = historyData?.reduce((acc, record) => {
          const date = new Date(record.date).toLocaleDateString();
          const player = typedPlayers?.find(p => p.id === record.player_id);
          if (!player) return acc;

          if (!acc[date]) {
            acc[date] = {};
          }
          acc[date][player.name] = record.rating_after;
          return acc;
        }, {} as Record<string, Record<string, number>>);

        // Transform into chart data format
        const chartData = Object.entries(matchesByDate || {}).map(([date, ratings]) => {
          const entry: RatingHistory = { date };
          typedPlayers?.forEach(player => {
            entry[player.name] = ratings[player.name] || 
              (historyData?.find(h => h.player_id === player.id && new Date(h.date).toLocaleDateString() <= date)?.rating_after || player.rating);
          });
          return entry;
        });

        setRatingHistory(chartData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate stats
  const totalPlayers = players?.length || 0;
  const totalMatches = players?.reduce((sum, p) => sum + p.matches_played, 0) / 2 || 0;
  const averageRating = totalPlayers > 0
    ? Math.round(players?.reduce((sum, p) => sum + p.rating, 0) / totalPlayers)
    : 0;
  
  // Top player by rating
  const topPlayer = players && players.length > 0
    ? players[0]
    : { name: 'No players', rating: 0 };

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Dashboard" 
          description="Club statistics and player performance"
          icon={<Home size={32} />}
        />
        <div className="text-center py-8">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Dashboard" 
          description="Club statistics and player performance"
          icon={<Home size={32} />}
        />
        <div className="text-center text-red-500 py-8">
          Error loading dashboard data. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Dashboard" 
        description="Club statistics and player performance"
        icon={<Home size={32} />}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Players"
          value={totalPlayers.toString()}
          description="Registered players"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        
        <StatCard 
          title="Total Matches"
          value={Math.floor(totalMatches).toString()}
          description="Recorded matches"
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
        />
        
        <StatCard 
          title="Average Rating"
          value={averageRating.toString()}
          description="Club average"
          icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
        />
        
        <StatCard 
          title="Top Player"
          value={topPlayer.name}
          description={`Rating: ${Math.round(topPlayer.rating)}`}
          icon={<ArrowUp className="h-5 w-5 text-green-500" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Player Rating Trends</CardTitle>
              <CardDescription>
                Rating progression over the last month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ratingHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 border rounded-lg shadow-lg">
                              <p className="font-medium mb-2">
                                {new Date(label).toLocaleDateString()}
                              </p>
                              {payload.map((entry, index) => (
                                <p 
                                  key={index} 
                                  className="text-sm"
                                  style={{ color: entry.color }}
                                >
                                  {entry.name}: {Math.round(entry.value as number)}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm font-medium">{value}</span>
                      )}
                    />
                    {players.map((player, index) => {
                      // Generate unique colors using HSL with varying hue, saturation, and lightness
                      const hue = (index * 137.508) % 360; // Golden angle for hue
                      const saturation = 70 + (index % 3) * 10; // Varying saturation (70%, 80%, 90%)
                      const lightness = 45 + (Math.floor(index / 3) % 3) * 10; // Varying lightness (45%, 55%, 65%)
                      const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                      
                      return (
                        <Line
                          key={player.id}
                          type="monotone"
                          dataKey={player.name}
                          stroke={color}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 8 }}
                          connectNulls={true}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Top Players</CardTitle>
              <CardDescription>
                Highest rated players in the club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerStats players={players || []} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fierce Rivalries Section */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 text-red-500 mr-2" />
              Top 2 Fierce Rivalries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : fierceNemesis.length > 0 ? (
              <div className="space-y-4">
                {fierceNemesis.map((rivalry, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      rivalry.recentForm === 'hot' 
                        ? 'bg-red-50 border border-red-200' 
                        : rivalry.recentForm === 'cold'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="text-lg font-medium">{rivalry.player1}</span>
                        <span className="mx-2 text-gray-500">vs</span>
                        <span className="text-lg font-medium">{rivalry.player2}</span>
                      </div>
                      {rivalry.streak > 1 && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          {rivalry.streak} match streak
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Matches: {rivalry.matches}</div>
                      <div className="text-sm text-gray-500">
                        Avg Score Diff: {rivalry.avgScoreDiff.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Last match: {new Date(rivalry.lastMatchDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No fierce rivalries found</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Synergy Section */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
              Top 2 Team Synergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : teamSynergy.length > 0 ? (
              <div className="space-y-4">
                {teamSynergy.map((synergy, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      synergy.recentForm === 'hot' 
                        ? 'bg-green-50 border border-green-200' 
                        : synergy.recentForm === 'cold'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <span className="text-lg font-medium">{synergy.player1}</span>
                        <span className="mx-2 text-gray-500">+</span>
                        <span className="text-lg font-medium">{synergy.player2}</span>
                      </div>
                      {synergy.streak > 1 && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {synergy.streak} match streak
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Matches: {synergy.matches}</div>
                      <div className="text-sm text-green-500">Win Rate: {synergy.winRate}%</div>
                      <div className="text-xs text-gray-400">
                        Last match: {new Date(synergy.lastMatchDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">No team synergies found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardPage;
