-- Run this in the Supabase SQL Editor to add gender to profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
