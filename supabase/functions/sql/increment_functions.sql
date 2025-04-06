
-- Function to increment matches_played
CREATE OR REPLACE FUNCTION public.increment_matches_played(player_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE players
  SET matches_played = matches_played + 1,
      win_rate = CASE WHEN matches_played > 0 THEN wins::numeric / (matches_played + 1) ELSE 0 END
  WHERE id = player_id
  RETURNING matches_played INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Function to increment wins
CREATE OR REPLACE FUNCTION public.increment_wins(player_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_wins INTEGER;
BEGIN
  UPDATE players
  SET wins = wins + 1,
      win_rate = CASE WHEN matches_played > 0 THEN (wins + 1)::numeric / matches_played ELSE 0 END
  WHERE id = player_id
  RETURNING wins INTO new_wins;
  
  RETURN new_wins;
END;
$$;
