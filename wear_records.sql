-- Create wear_records table
CREATE TABLE IF NOT EXISTS wear_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    item_ids TEXT[] NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE wear_records ENABLE ROW LEVEL SECURITY;

-- Allow all public access
CREATE POLICY "Allow all public wear_records" ON wear_records
    FOR ALL
    USING (true)
    WITH CHECK (true);
