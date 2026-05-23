-- ============================================================================
-- HSN Journeys Initial Schema
-- ============================================================================

-- ----- 用户（管理员）-----
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----- 旅程主表 -----
CREATE TABLE IF NOT EXISTS journeys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  story TEXT,
  highlights_json TEXT,
  cost_json TEXT,
  photo_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_journeys_date ON journeys(date DESC);
CREATE INDEX IF NOT EXISTS idx_journeys_country ON journeys(country);

-- ----- 子卡片（每个 journey 至少 1 个 sub_card 承载 itinerary）-----
CREATE TABLE IF NOT EXISTS sub_cards (
  id TEXT PRIMARY KEY,
  journey_id INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  province TEXT,
  city TEXT,
  country TEXT,
  date TEXT NOT NULL,
  end_date TEXT,
  emoji TEXT,
  story TEXT,
  highlights_json TEXT,
  itinerary_table_json TEXT,
  cost_json TEXT,
  photo_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sub_cards_journey ON sub_cards(journey_id, sort_order);

-- ----- 心愿单 -----
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  emoji TEXT,
  season TEXT,
  duration TEXT,
  description TEXT,
  highlights_json TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----- 城市坐标 -----
CREATE TABLE IF NOT EXISTS city_coords (
  name TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('domestic', 'international')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----- 行李清单 -----
CREATE TABLE IF NOT EXISTS packing_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  note TEXT,
  is_overseas_only INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_packing_category ON packing_items(category, sort_order);

-- ----- 站点设置（kv 表）-----
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
