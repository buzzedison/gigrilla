-- Add support for "Worldwide with Exclusions" in music release geography

ALTER TABLE music_releases
  ADD COLUMN IF NOT EXISTS available_worldwide_with_exclusions BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS excluded_territories TEXT[] DEFAULT '{}';
