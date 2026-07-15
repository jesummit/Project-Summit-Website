-- Optional, additive. NOT required for the Gran Diagonal launch: that signup
-- uses the existing contact_source value 'gran_diagonal'. Apply this only when
-- you add more blog articles that should be attributed to a generic 'blog'
-- source, then switch sourceFor() in blog_subscribe_v1 to return 'blog'.
--
-- Note: ALTER TYPE ... ADD VALUE cannot run inside a transaction block on older
-- Postgres. On Supabase, run it as its own statement (the dashboard SQL editor
-- or `supabase db execute`), not bundled in a multi-statement transaction.

alter type contact_source add value if not exists 'blog';
