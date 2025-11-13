-- 029_restore_new_age_subtypes.sql
-- Restore New Age sub-genres that were accidentally deleted

BEGIN;

-- Re-insert New Age subtypes
INSERT INTO public.genre_subtypes (id, type_id, name) VALUES ('new-age-healing-wellness', 'new-age', 'Healing & Wellness') ON CONFLICT (id) DO UPDATE SET name = excluded.name, type_id = excluded.type_id;
INSERT INTO public.genre_subtypes (id, type_id, name) VALUES ('new-age-healing-ambient', 'new-age', 'Healing Ambient (Hybrid: Ambient + New Age)') ON CONFLICT (id) DO UPDATE SET name = excluded.name, type_id = excluded.type_id;
INSERT INTO public.genre_subtypes (id, type_id, name) VALUES ('new-age-meditation', 'new-age', 'Meditation') ON CONFLICT (id) DO UPDATE SET name = excluded.name, type_id = excluded.type_id;
INSERT INTO public.genre_subtypes (id, type_id, name) VALUES ('new-age-neoclassical-new-age', 'new-age', 'Neoclassical New Age (Hybrid: Ambient + New Age)') ON CONFLICT (id) DO UPDATE SET name = excluded.name, type_id = excluded.type_id;
INSERT INTO public.genre_subtypes (id, type_id, name) VALUES ('new-age-new-age-meditation', 'new-age', 'New Age Meditation (Hybrid: New Age + New Age Spiritual)') ON CONFLICT (id) DO UPDATE SET name = excluded.name, type_id = excluded.type_id;
INSERT INTO public.genre_subtypes (id, type_id, name) VALUES ('new-age-space-cosmic', 'new-age', 'Space & Cosmic') ON CONFLICT (id) DO UPDATE SET name = excluded.name, type_id = excluded.type_id;
INSERT INTO public.genre_subtypes (id, type_id, name) VALUES ('new-age-spiritual-new-age', 'new-age', 'Spiritual New Age (Hybrid: New Age + New Age Spiritual)') ON CONFLICT (id) DO UPDATE SET name = excluded.name, type_id = excluded.type_id;

COMMIT;
