TRUNCATE bookmarks RESTART IDENTITY;

INSERT INTO bookmarks 
  (title, url, description, rating)
  VALUES
  ('Google', 'https://google.com', 'A great search engine and more', 5), 
  ('Thinkful', 'https://thinkful.com', 'A coding bootcamp', 5), 
  ('Magic', 'https://youtube.com', 'A video streaming site', 4), 
  ('The Coolest Knife Blocks EVer', 'https://myfriendworkshere.com', 'Cool blocks', 2)