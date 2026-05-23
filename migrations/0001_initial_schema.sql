-- HSN Journeys v2 — Initial Schema
-- ============================================================

CREATE TABLE users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- JOURNEYS
-- ============================================================
CREATE TABLE journeys (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    province    TEXT NOT NULL DEFAULT '',
    city        TEXT NOT NULL DEFAULT '',
    country     TEXT NOT NULL DEFAULT '中国',
    date        TEXT NOT NULL,
    end_date    TEXT NOT NULL DEFAULT '',
    title       TEXT NOT NULL DEFAULT '',
    emoji       TEXT NOT NULL DEFAULT '📍',
    description TEXT NOT NULL DEFAULT '',
    story       TEXT NOT NULL DEFAULT '',
    photo_key   TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE highlights (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    journey_id  INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE costs (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    journey_id        INTEGER NOT NULL UNIQUE REFERENCES journeys(id) ON DELETE CASCADE,
    package_fee       REAL NOT NULL DEFAULT 0,
    transport_fee     REAL NOT NULL DEFAULT 0,
    accommodation_fee REAL NOT NULL DEFAULT 0,
    food_fee          REAL NOT NULL DEFAULT 0,
    shopping_fee      REAL NOT NULL DEFAULT 0,
    ticket_fee        REAL NOT NULL DEFAULT 0
);

CREATE TABLE itinerary_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    journey_id  INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    date        TEXT NOT NULL DEFAULT '',
    morning     TEXT NOT NULL DEFAULT '',
    afternoon   TEXT NOT NULL DEFAULT '',
    evening     TEXT NOT NULL DEFAULT '',
    note        TEXT NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- SUB-CARDS
-- ============================================================
CREATE TABLE sub_cards (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    journey_id  INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    name        TEXT NOT NULL DEFAULT '',
    province    TEXT NOT NULL DEFAULT '',
    city        TEXT NOT NULL DEFAULT '',
    country     TEXT NOT NULL DEFAULT '中国',
    date        TEXT NOT NULL DEFAULT '',
    end_date    TEXT NOT NULL DEFAULT '',
    emoji       TEXT NOT NULL DEFAULT '📍',
    story       TEXT NOT NULL DEFAULT '',
    photo_key   TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sub_card_highlights (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sub_card_id INTEGER NOT NULL REFERENCES sub_cards(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sub_card_costs (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    sub_card_id       INTEGER NOT NULL UNIQUE REFERENCES sub_cards(id) ON DELETE CASCADE,
    package_fee       REAL NOT NULL DEFAULT 0,
    transport_fee     REAL NOT NULL DEFAULT 0,
    accommodation_fee REAL NOT NULL DEFAULT 0,
    food_fee          REAL NOT NULL DEFAULT 0,
    shopping_fee      REAL NOT NULL DEFAULT 0,
    ticket_fee        REAL NOT NULL DEFAULT 0
);

CREATE TABLE sub_card_itinerary (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    sub_card_id     INTEGER NOT NULL REFERENCES sub_cards(id) ON DELETE CASCADE,
    header_index    INTEGER NOT NULL DEFAULT 0,
    header_text     TEXT NOT NULL DEFAULT '',
    row_index       INTEGER NOT NULL DEFAULT 0,
    cell_value      TEXT NOT NULL DEFAULT ''
);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE wishlist_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL DEFAULT '',
    city        TEXT NOT NULL DEFAULT '',
    emoji       TEXT NOT NULL DEFAULT '✈️',
    duration    TEXT NOT NULL DEFAULT '',
    season      TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE wishlist_highlights (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    wishlist_id     INTEGER NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
    text            TEXT NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- PACKING LIST
-- ============================================================
CREATE TABLE packing_categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE packing_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES packing_categories(id) ON DELETE CASCADE,
    item        TEXT NOT NULL,
    note        TEXT NOT NULL DEFAULT '',
    checked     INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- CITY COORDINATES
-- ============================================================
CREATE TABLE city_coordinates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    country     TEXT NOT NULL DEFAULT '中国',
    lat         REAL NOT NULL,
    lng         REAL NOT NULL,
    type        TEXT NOT NULL DEFAULT 'domestic'
);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_journeys_date ON journeys(date DESC);
CREATE INDEX idx_journeys_city ON journeys(city);
CREATE INDEX idx_highlights_journey ON highlights(journey_id);
CREATE INDEX idx_itinerary_journey ON itinerary_items(journey_id);
CREATE INDEX idx_sub_cards_journey ON sub_cards(journey_id);
CREATE INDEX idx_sub_card_itinerary ON sub_card_itinerary(sub_card_id);
CREATE INDEX idx_sub_card_hl ON sub_card_highlights(sub_card_id);
CREATE INDEX idx_wishlist_sort ON wishlist_items(sort_order);
CREATE INDEX idx_wishlist_hl ON wishlist_highlights(wishlist_id);
CREATE INDEX idx_packing_sort ON packing_items(category_id, sort_order);
