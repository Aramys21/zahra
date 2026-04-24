-- ============================================
-- ADD REVIEWS TABLE TO ZAHRA DIFFUSION
-- ============================================

-- Table reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Enable Row Level Security for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews (public read, authenticated write own)
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own reviews" ON reviews;
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Policy pour permettre la lecture du full_name des utilisateurs via jointure avec reviews
DROP POLICY IF EXISTS "Users can view full_name via reviews" ON users;
CREATE POLICY "Users can view full_name via reviews" ON users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM reviews 
    WHERE reviews.user_id = users.id
  )
);
