CREATE TABLE budgitz_users (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_name TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  nickname TEXT,
  date_created TIMESTAMPTZ DEFAULT now() NOT NULL,
  date_modified TIMESTAMPTZ
);

ALTER TABLE budgitz_lists
  ADD COLUMN
    user_id INTEGER REFERENCES budgitz_users(id)
    ON DELETE SET NULL;