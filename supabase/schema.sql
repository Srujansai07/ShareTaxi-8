-- ShareTaxi Database Schema
-- Run this in your Supabase SQL Editor

-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Buildings Table
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index for buildings
CREATE INDEX idx_buildings_location ON buildings USING GIST(location);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  photo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on phone for faster lookups
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_building ON users(building_id);

-- Trips Table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  destination_name TEXT NOT NULL,
  destination_location GEOGRAPHY(POINT) NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  trip_type VARCHAR(20) DEFAULT 'general' CHECK (trip_type IN ('general', 'work', 'dinner', 'shopping', 'other')),
  max_passengers INTEGER DEFAULT 4,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for trip queries
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_departure ON trips(departure_time);
CREATE INDEX idx_trips_destination ON trips USING GIST(destination_location);

-- Matches Table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id_1 UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  trip_id_2 UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  distance_km DECIMAL(5,2),
  time_diff_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id_1, trip_id_2)
);

-- Create indexes for match queries
CREATE INDEX idx_matches_trip1 ON matches(trip_id_1);
CREATE INDEX idx_matches_trip2 ON matches(trip_id_2);
CREATE INDEX idx_matches_status ON matches(status);

-- Messages Table (for in-app chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for message queries
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, reviewer_id, reviewee_id)
);

-- Create indexes for review queries
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_trip ON reviews(trip_id);

-- Function to find matching trips
CREATE OR REPLACE FUNCTION find_matching_trips(
  p_trip_id UUID,
  p_max_distance_km DECIMAL DEFAULT 2.0,
  p_max_time_diff_minutes INTEGER DEFAULT 15
)
RETURNS TABLE (
  match_trip_id UUID,
  distance_km DECIMAL,
  time_diff_minutes INTEGER,
  user_name VARCHAR,
  user_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t2.id AS match_trip_id,
    ROUND(ST_Distance(t1.destination_location, t2.destination_location)::numeric / 1000, 2) AS distance_km,
    EXTRACT(EPOCH FROM (t2.departure_time - t1.departure_time))::INTEGER / 60 AS time_diff_minutes,
    u.name AS user_name,
    u.rating AS user_rating
  FROM trips t1
  JOIN trips t2 ON t2.id != t1.id
  JOIN users u1 ON t1.user_id = u1.id
  JOIN users u2 ON t2.user_id = u2.id
  JOIN users u ON u.id = t2.user_id
  WHERE 
    t1.id = p_trip_id
    AND t2.status = 'active'
    AND u1.building_id = u2.building_id  -- Same building
    AND ST_DWithin(t1.destination_location, t2.destination_location, p_max_distance_km * 1000)  -- Within distance
    AND ABS(EXTRACT(EPOCH FROM (t2.departure_time - t1.departure_time))) <= p_max_time_diff_minutes * 60  -- Within time window
  ORDER BY distance_km ASC, time_diff_minutes ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to update user rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET rating = (
    SELECT COALESCE(AVG(rating), 5.0)
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user rating after review
CREATE TRIGGER trigger_update_user_rating
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can read all users in their building
CREATE POLICY users_select_policy ON users
FOR SELECT USING (
  building_id IN (
    SELECT building_id FROM users WHERE id = auth.uid()
  )
);

-- Users can update only their own profile
CREATE POLICY users_update_policy ON users
FOR UPDATE USING (id = auth.uid());

-- Users can read all trips in their building
CREATE POLICY trips_select_policy ON trips
FOR SELECT USING (
  user_id IN (
    SELECT id FROM users WHERE building_id = (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
  )
);

-- Users can insert/update/delete only their own trips
CREATE POLICY trips_insert_policy ON trips
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY trips_update_policy ON trips
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY trips_delete_policy ON trips
FOR DELETE USING (user_id = auth.uid());

-- Sample data for testing
INSERT INTO buildings (name, address, location, verified) VALUES
('Prestige Lakeside Habitat', 'Varthur, Bangalore', ST_GeogFromText('POINT(77.7499 12.9539)'), true),
('Sobha City', 'Thanisandra, Bangalore', ST_GeogFromText('POINT(77.6565 13.0569)'), true),
('Brigade Gateway', 'Rajajinagar, Bangalore', ST_GeogFromText('POINT(77.5385 12.9882)'), true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
