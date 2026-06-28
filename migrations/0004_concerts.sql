CREATE TABLE IF NOT EXISTS concerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  artist TEXT NOT NULL,
  title TEXT NOT NULL,
  venue TEXT NOT NULL,
  cost REAL NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_concerts_date ON concerts(date DESC, id DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_concerts_unique_event ON concerts(date, artist, title, venue);
