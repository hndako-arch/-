-- Add category column to closet_items
ALTER TABLE public.closet_items 
ADD COLUMN category TEXT DEFAULT '未分類';

-- Update RLS policies (just in case they need to be refreshed for the new column)
-- SELECT and INSERT policies already use "true", so they should pick up the new column automatically.
-- We already have UPDATE and DELETE from the previous fix.
