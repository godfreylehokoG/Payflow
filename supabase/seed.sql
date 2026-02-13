insert into public.merchants (name, category, address, distance, latitude, longitude, is_active)
values
  ('Corner Spaza', 'spaza', '12 Main Rd', '0.4 km', -26.195246, 28.034088, true),
  ('Township Kota Hub', 'kota', '45 Freedom Ave', '1.1 km', -26.210531, 28.047912, true),
  ('Rank Taxi Point', 'taxi', 'Central Taxi Rank', '0.7 km', -26.204102, 28.043087, true),
  ('Street Fresh Produce', 'street_vendor', 'Market Street', '1.6 km', -26.216400, 28.030021, true)
on conflict do nothing;
