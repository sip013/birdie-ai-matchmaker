
// Rating calculation algorithm
// Ported from the Python version provided

export interface Player {
  id: string;
  rating: number;
  streak_count?: number | null;
}

interface RatingUpdate {
  newRating: number;
  ratingChange: number;
}

// Constants (can be tweaked as needed)
const BASE_K = 24;                  // Base sensitivity (24 = similar to chess Elo)
const INFLATION_RATE = 0.0015;      // Daily inflation for active players (0.15%)
const DECAY_RATE = 0.003;           // Daily decay after 15 days inactivity (0.3%)
const DECAY_START_DAYS = 15;        // Days until decay starts
const BASELINE = 1000;              // Rating anchor point
const MIN_RATING = 800;             // Prevent tanking below 80% of baseline

export const updateRatings = (
  winner: Player,
  loser: Player,
  winnerScore: number,
  loserScore: number,
  daysInactiveWinner: number,
  daysInactiveLoser: number
): { winner: RatingUpdate, loser: RatingUpdate } => {
  
  // ---- 1. Match Performance Adjustment (Zero-Sum) ----
  const margin = (winnerScore - loserScore) / 21;  // Normalized score dominance [0-1]
  const expectedWin = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
  
  // Winner gains more for dominant wins
  const winnerGain = BASE_K * (1 - expectedWin) * (1 + margin * 2);  // 2x bonus for blowouts
  const loserLoss = BASE_K * expectedWin * (1 - margin);

  // ---- 2. Activity-Based Adjustments (Non-Zero-Sum) ----
  const computeInflation = (daysInactive: number) => {
    // Active players (<15 days) gain inflation proportional to activity
    const activeDays = Math.max(0, DECAY_START_DAYS - daysInactive);
    return INFLATION_RATE * (activeDays / DECAY_START_DAYS) * winner.rating;
  };

  const computeDecay = (daysInactive: number) => {
    // Inactive players (>15 days) lose rating linearly
    return DECAY_RATE * Math.max(0, daysInactive - DECAY_START_DAYS) * winner.rating;
  };

  // Apply to both players
  const winnerInflation = computeInflation(daysInactiveWinner);
  const loserInflation = computeInflation(daysInactiveLoser);
  const winnerDecay = computeDecay(daysInactiveWinner);
  const loserDecay = computeDecay(daysInactiveLoser);

  // ---- 3. Prepare Final Rating Changes ----
  const winnerRatingChange = winnerGain + winnerInflation - winnerDecay;
  const loserRatingChange = -loserLoss + loserInflation - loserDecay;

  // Start with the original ratings
  let newWinnerRating = winner.rating + winnerRatingChange;
  let newLoserRating = loser.rating + loserRatingChange;
  
  // Ensure minimum rating
  newWinnerRating = Math.max(MIN_RATING, newWinnerRating);
  newLoserRating = Math.max(MIN_RATING, newLoserRating);

  // ---- 4. Streak Bonus (Optional) ----
  let streakBonus = 0;
  let newStreakCount = winner.streak_count || 0;
  
  if (winnerGain > BASE_K * 0.5) {  // Significant win
    newStreakCount += 1;
    if (newStreakCount >= 3) {
      streakBonus = BASE_K * 0.1 * newStreakCount;  // +10% per streak
      newWinnerRating += streakBonus;
    }
  } else {
    newStreakCount = 0;
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
};

// Calculate days inactive from last played date
export const calculateDaysInactive = (lastPlayedAt: string | null): number => {
  if (!lastPlayedAt) return 0;
  
  const lastPlayed = new Date(lastPlayedAt);
  const now = new Date();
  
  // Calculate difference in days
  const diffTime = now.getTime() - lastPlayed.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};
