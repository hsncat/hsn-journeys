ALTER TABLE journeys ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_journeys_featured ON journeys(is_featured, date DESC);
