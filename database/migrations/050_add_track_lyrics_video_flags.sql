ALTER TABLE public.music_tracks
ADD COLUMN IF NOT EXISTS no_lyrics BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lyrics_input_mode TEXT DEFAULT 'paste',
ADD COLUMN IF NOT EXISTS no_video BOOLEAN DEFAULT FALSE;

UPDATE public.music_tracks
SET
  no_lyrics = COALESCE(no_lyrics, FALSE),
  lyrics_input_mode = COALESCE(lyrics_input_mode, 'paste'),
  no_video = COALESCE(no_video, FALSE);

ALTER TABLE public.music_tracks
ALTER COLUMN no_lyrics SET DEFAULT FALSE,
ALTER COLUMN lyrics_input_mode SET DEFAULT 'paste',
ALTER COLUMN no_video SET DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'music_tracks_lyrics_input_mode_check'
  ) THEN
    ALTER TABLE public.music_tracks
    ADD CONSTRAINT music_tracks_lyrics_input_mode_check
    CHECK (lyrics_input_mode IN ('paste', 'upload'));
  END IF;
END $$;
