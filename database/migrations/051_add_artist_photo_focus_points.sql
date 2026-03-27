ALTER TABLE artist_photos
ADD COLUMN IF NOT EXISTS focus_x DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS focus_y DOUBLE PRECISION NOT NULL DEFAULT 50;

ALTER TABLE artist_photos
DROP CONSTRAINT IF EXISTS artist_photos_focus_x_range,
ADD CONSTRAINT artist_photos_focus_x_range CHECK (focus_x >= 0 AND focus_x <= 100);

ALTER TABLE artist_photos
DROP CONSTRAINT IF EXISTS artist_photos_focus_y_range,
ADD CONSTRAINT artist_photos_focus_y_range CHECK (focus_y >= 0 AND focus_y <= 100);
