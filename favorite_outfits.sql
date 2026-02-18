-- Create favorite_outfits table
CREATE TABLE IF NOT EXISTS favorite_outfits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    explanation TEXT,
    item_ids TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE favorite_outfits ENABLE ROW LEVEL SECURITY;

-- Allow all public access (same pattern as closet_items)
CREATE POLICY "Allow all public favorites" ON favorite_outfits
    FOR ALL
    USING (true)
    WITH CHECK (true);
