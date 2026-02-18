-- Add color column to closet_items
ALTER TABLE closet_items ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE closet_items ADD COLUMN IF NOT EXISTS color_code TEXT;
