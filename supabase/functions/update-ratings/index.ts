
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Constants for rating calculation
const BASE_K = 24;
const INFLATION_RATE = 0.0015;
const DECAY_RATE = 0.003;
const DECAY_START_DAYS = 15;
const BASELINE = 1000;
const MIN_RATING = 800;

interface Player {
  id: string;
  rating: number;
  streak_count: number | null;
  last_played_at: string | null;
}

interface MatchData {
  team1_player1_id: string;
  team1_player2_id?: string | null;
  team2_player1_id: string;
  team2_player2_id?: string | null;
  team1_score: number;
  team2_score: number;
  winner: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get match data from request
    const matchData: MatchData = await req.json();
    const {
      team1_player1_id,
      team1_player2_id,
      team2_player1_id,
      team2_player2_id,
      team1_score,
      team2_score,
      winner
    } = matchData;

    // Determine winning and losing players based on winner
    const winnerTeamIds = winner === "team1" 
      ? [team1_player1_id, team1_player2_id].filter(Boolean)
      : [team2_player1_id, team2_player2_id].filter(Boolean);
    
    const loserTeamIds = winner === "team1"
      ? [team2_player1_id, team2_player2_id].filter(Boolean)
      : [team1_player1_id, team1_player2_id].filter(Boolean);

    const winnerScore = winner === "team1" ? team1_score : team2_score;
    const loserScore = winner === "team1" ? team2_score : team1_score;

    // Fetch all players involved in this match
    const allPlayerIds = [...winnerTeamIds, ...loserTeamIds] as string[];
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id, rating, streak_count, last_played_at")
      .in("id", allPlayerIds);

    if (playersError) {
      throw new Error(`Error fetching players: ${playersError.message}`);
    }

    // Process each winner-loser pair
    const now = new Date().toISOString();
    const matchHistoryEntries = [];
    const playerUpdates = [];

    for (const winnerId of winnerTeamIds) {
      const winner = players.find(p => p.id === winnerId) as Player;
      if (!winner) continue;

      for (const loserId of loserTeamIds) {
        const loser = players.find(p => p.id === loserId) as Player;
        if (!loser) continue;

        // Calculate days inactive
        const daysInactiveWinner = calculateDaysInactive(winner.last_played_at);
        const daysInactiveLoser = calculateDaysInactive(loser.last_played_at);

        // Calculate new ratings
        const ratings = updateRatings(
          winner,
          loser,
          winnerScore,
          loserScore,
          daysInactiveWinner,
          daysInactiveLoser
        );

        // Update winner
        playerUpdates.push({
          id: winner.id,
          rating: ratings.winner.newRating,
          streak_count: winner.streak_count !== null 
            ? (ratings.winner.ratingChange > BASE_K * 0.5 ? (winner.streak_count + 1) : 0)
            : (ratings.winner.ratingChange > BASE_K * 0.5 ? 1 : 0),
          wins: supabase.rpc('increment_wins', { player_id: winner.id }),
          matches_played: supabase.rpc('increment_matches_played', { player_id: winner.id }),
          last_played_at: now
        });

        // Update loser
        playerUpdates.push({
          id: loser.id,
          rating: ratings.loser.newRating,
          streak_count: 0,
          matches_played: supabase.rpc('increment_matches_played', { player_id: loser.id }),
          last_played_at: now
        });

        // Create match history entries
        matchHistoryEntries.push({
          player_id: winner.id,
          match_id: null, // This will be set after match is created
          rating_before: winner.rating,
          rating_after: ratings.winner.newRating,
          rating_change: ratings.winner.ratingChange,
          is_winner: true,
          score_difference: winnerScore - loserScore,
          date: now
        });

        matchHistoryEntries.push({
          player_id: loser.id,
          match_id: null, // This will be set after match is created
          rating_before: loser.rating,
          rating_after: ratings.loser.newRating,
          rating_change: ratings.loser.ratingChange,
          is_winner: false,
          score_difference: loserScore - winnerScore,
          date: now
        });
      }
    }

    // Batch update players
    for (const update of playerUpdates) {
      const { error } = await supabase
        .from("players")
        .update({
          rating: update.rating,
          streak_count: update.streak_count,
          last_played_at: update.last_played_at,
          matches_played: update.matches_played,
          wins: update.wins
        })
        .eq("id", update.id);

      if (error) {
        throw new Error(`Error updating player ${update.id}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Ratings updated successfully"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});

// Rating calculation algorithm
function updateRatings(
  winner: Player,
  loser: Player,
  winnerScore: number,
  loserScore: number,
  daysInactiveWinner: number,
  daysInactiveLoser: number
) {
  // ---- 1. Match Performance Adjustment (Zero-Sum) ----
  const margin = (winnerScore - loserScore) / 21;  // Normalized score dominance [0-1]
  const expectedWin = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
  
  // Winner gains more for dominant wins
  const winnerGain = BASE_K * (1 - expectedWin) * (1 + margin * 2);
  const loserLoss = BASE_K * expectedWin * (1 - margin);

  // ---- 2. Activity-Based Adjustments (Non-Zero-Sum) ----
  const computeInflation = (daysInactive: number) => {
    const activeDays = Math.max(0, DECAY_START_DAYS - daysInactive);
    return INFLATION_RATE * (activeDays / DECAY_START_DAYS) * winner.rating;
  };

  const computeDecay = (daysInactive: number) => {
    return DECAY_RATE * Math.max(0, daysInactive - DECAY_START_DAYS) * winner.rating;
  };

  const winnerInflation = computeInflation(daysInactiveWinner);
  const loserInflation = computeInflation(daysInactiveLoser);
  const winnerDecay = computeDecay(daysInactiveWinner);
  const loserDecay = computeDecay(daysInactiveLoser);

  // ---- 3. Final Rating Changes ----
  const winnerRatingChange = winnerGain + winnerInflation - winnerDecay;
  const loserRatingChange = -loserLoss + loserInflation - loserDecay;

  let newWinnerRating = winner.rating + winnerRatingChange;
  let newLoserRating = loser.rating + loserRatingChange;
  
  // Ensure minimum rating
  newWinnerRating = Math.max(MIN_RATING, newWinnerRating);
  newLoserRating = Math.max(MIN_RATING, newLoserRating);

  // ---- 4. Streak Bonus (Optional) ----
  let streakBonus = 0;
  if (winnerGain > BASE_K * 0.5 && winner.streak_count !== null && winner.streak_count >= 2) {
    streakBonus = BASE_K * 0.1 * (winner.streak_count + 1);
    newWinnerRating += streakBonus;
  }

  return {
    winner: {
      newRating: Math.round(newWinnerRating),
      ratingChange: Math.round(winnerRatingChange + streakBonus)
    },
    loser: {
      newRating: Math.round(newLoserRating),
      ratingChange: Math.round(loserRatingChange)
    }
  };
}

// Calculate days inactive from last played date
function calculateDaysInactive(lastPlayedAt: string | null): number {
  if (!lastPlayedAt) return 0;
  
  const lastPlayed = new Date(lastPlayedAt);
  const now = new Date();
  
  const diffTime = now.getTime() - lastPlayed.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}
