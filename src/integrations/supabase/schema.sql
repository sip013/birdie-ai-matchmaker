CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 1000,
  matches_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL GENERATED ALWAYS AS (
    CASE 
      WHEN matches_played = 0 THEN 0
      ELSE (wins::float / matches_played) * 100
    END
  ) STORED,
  position TEXT NOT NULL CHECK (position IN ('Singles', 'Doubles', 'Both')),
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  last_played_at TIMESTAMP WITH TIME ZONE,
  streak_count INTEGER DEFAULT 0,
  CONSTRAINT rating_check CHECK (rating >= 800)
); 