-- Fix sub_cards id type from INTEGER to TEXT (legacy data uses string IDs like "sub-1-1")
DROP TABLE IF EXISTS sub_card_itinerary;
DROP TABLE IF EXISTS sub_card_costs;
DROP TABLE IF EXISTS sub_card_highlights;
DROP TABLE IF EXISTS sub_cards;

CREATE TABLE sub_cards (
    id          TEXT PRIMARY KEY,
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
    sub_card_id TEXT NOT NULL REFERENCES sub_cards(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sub_card_costs (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    sub_card_id       TEXT NOT NULL UNIQUE REFERENCES sub_cards(id) ON DELETE CASCADE,
    package_fee       REAL NOT NULL DEFAULT 0,
    transport_fee     REAL NOT NULL DEFAULT 0,
    accommodation_fee REAL NOT NULL DEFAULT 0,
    food_fee          REAL NOT NULL DEFAULT 0,
    shopping_fee      REAL NOT NULL DEFAULT 0,
    ticket_fee        REAL NOT NULL DEFAULT 0
);

CREATE TABLE sub_card_itinerary (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    sub_card_id     TEXT NOT NULL REFERENCES sub_cards(id) ON DELETE CASCADE,
    header_index    INTEGER NOT NULL DEFAULT 0,
    header_text     TEXT NOT NULL DEFAULT '',
    row_index       INTEGER NOT NULL DEFAULT 0,
    cell_value      TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_sub_cards_journey ON sub_cards(journey_id);
CREATE INDEX idx_sub_card_hl ON sub_card_highlights(sub_card_id);
CREATE INDEX idx_sub_card_itinerary ON sub_card_itinerary(sub_card_id);
