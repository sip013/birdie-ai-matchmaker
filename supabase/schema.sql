-- Create players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rating FLOAT DEFAULT 1000.0,
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team1_id UUID NOT NULL,
    team2_id UUID NOT NULL,
    score TEXT NOT NULL,
    winner UUID NOT NULL,
    match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player1_id UUID NOT NULL REFERENCES players(id),
    player2_id UUID NOT NULL REFERENCES players(id),
    match_id UUID NOT NULL REFERENCES matches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create match_history table
CREATE TABLE match_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id),
    player_id UUID NOT NULL REFERENCES players(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    rating_before FLOAT NOT NULL,
    rating_after FLOAT NOT NULL,
    rating_change FLOAT NOT NULL,
    is_winner BOOLEAN NOT NULL,
    score_difference INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update player ratings
CREATE OR REPLACE FUNCTION update_player_ratings(
    winner_id UUID,
    loser_id UUID,
    score_diff INTEGER
) RETURNS VOID AS $$
DECLARE
    winner_rating FLOAT;
    loser_rating FLOAT;
    k_factor FLOAT;
    expected_winner FLOAT;
    expected_loser FLOAT;
    new_winner_rating FLOAT;
    new_loser_rating FLOAT;
BEGIN
    -- Get current ratings
    SELECT rating INTO winner_rating FROM players WHERE id = winner_id;
    SELECT rating INTO loser_rating FROM players WHERE id = loser_id;
    
    -- Calculate expected scores
    expected_winner := 1 / (1 + 10^((loser_rating - winner_rating)/400));
    expected_loser := 1 - expected_winner;
    
    -- Adjust K-factor based on score difference
    k_factor := 32;
    IF score_diff > 5 THEN
        k_factor := k_factor * 1.2;
    END IF;
    
    -- Calculate new ratings
    new_winner_rating := winner_rating + k_factor * (1 - expected_winner);
    new_loser_rating := loser_rating + k_factor * (0 - expected_loser);
    
    -- Update ratings
    UPDATE players 
    SET rating = new_winner_rating,
        matches_played = matches_played + 1,
        wins = wins + 1,
        updated_at = NOW()
    WHERE id = winner_id;
    
    UPDATE players 
    SET rating = new_loser_rating,
        matches_played = matches_played + 1,
        losses = losses + 1,
        updated_at = NOW()
    WHERE id = loser_id;
END;
$$ LANGUAGE plpgsql; 