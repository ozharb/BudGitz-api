BEGIN;

TRUNCATE
  budgitz_items,
  budgitz_lists,
  budgitz_users
  RESTART IDENTITY CASCADE;

INSERT INTO budgitz_users (user_name, full_name, nickname, password)
VALUES
  ('dunder', 'Dunder Mifflin', null, '$2a$12$lHK6LVpc15/ZROZcKU00QeiD.RyYq5dVlV/9m4kKYbGibkRc5l4Ne'),
  ('b.deboop', 'Bodeep Deboop', 'Bo', '$2a$12$VQ5HgWm34QQK2rJyLc0lmu59cy2jcZiV6U1.bE8rBBnC9VxDf/YQO'),
  ('c.bloggs', 'Charlie Bloggs', 'Charlie', '$2a$12$2fv9OPgM07xGnhDbyL6xsuAeQjAYpZx/3V2dnu0XNIR27gTeiK2gK'),
  ('s.smith', 'Sam Smith', 'Sam', '$2a$12$/4P5/ylaB7qur/McgrEKwuCy.3JZ6W.cRtqxiJsYCdhr89V4Z3rp.'),
  ('lexlor', 'Alex Taylor', 'Lex', '$2a$12$Hq9pfcWWvnzZ8x8HqJotveRHLD13ceS7DDbrs18LpK6rfj4iftNw.'),
  ('wippy', 'Ping Won In', 'Ping', '$2a$12$ntGOlTLG5nEXYgDVqk4bPejBoJP65HfH2JEMc1JBpXaVjXo5RsTUu');

INSERT INTO budgitz_lists (list_name, user_id)
VALUES
('Arcade Game',1),
('Road Trip',1),
('Car Repair',1),
('Miscellaneous',2);

INSERT INTO budgitz_items (item_name, price, content, list_id, quantity)
VALUES

('Buttons', 50, 'BUTTONS WITH MICROSWITCHES. xgaming.com',1, 2),
('Joy Stick', 25, 'snappy 8-way joystick. adafruit.com ',1, DEFAULT),
('Monitor', 200, '19" Vision Pro LED LCD CGA/VGA Arcade Monitor. ebay.com',1, DEFAULT),
('Cabinet', 300, 'Arcade Machine 2 Player Cabinet - QualityArcades.com',1, DEFAULT),
('Gas', 250, '500-600 miles',2, DEFAULT),
('Food', 200, 'diners and gas stations for 2 days',2, DEFAULT),
('Motel', 8, 'two nights',2, 2),
('Tires', 80, 'need new tires',3, 4),
('Engine', 250, 'needs check up',3, DEFAULT),
('Paint job', 250, 'scratches',3, DEFAULT),
('Sun glasses', 50, 'black', 4, DEFAULT),
('Gloves', 50, 'driving gloves',4, DEFAULT),
('tube socks', 10,'red and blue',4, 2);

COMMIT;
