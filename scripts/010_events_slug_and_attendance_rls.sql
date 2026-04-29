-- Eventos como páginas: agrega slug a la tabla events para que cada evento
-- tenga URL propia (/eventos/<slug>). Backfill desde el title.
-- Además abre lectura de event_attendance al propio usuario para que
-- /perfil pueda mostrar "eventos a los que asistí".

-- ============================================================
-- events.slug
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Slugify mínimo: lowercase + ascii-fold simple + espacios y signos a guión.
-- Para registros sin slug solamente. La unicidad real la da el UNIQUE de abajo;
-- si dos titles colapsan al mismo slug hay que ajustar a mano (poco probable).
UPDATE public.events
SET slug = trim(both '-' from regexp_replace(
  lower(
    translate(
      coalesce(title, ''),
      'áéíóúüñÁÉÍÓÚÜÑ',
      'aeiouunAEIOUUN'
    )
  ),
  '[^a-z0-9]+', '-', 'g'
))
WHERE slug IS NULL;

-- Si quedaron filas con slug vacío (title raro o vacío), las dejamos para review.
UPDATE public.events
SET slug = 'evento-' || substr(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

ALTER TABLE public.events
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS events_slug_idx ON public.events(slug);

-- ============================================================
-- event_attendance: SELECT propio
-- ============================================================
-- La policy actual "Admins can manage attendance" cubre solo admins.
-- Sumamos una de SELECT para que cada user lea sus filas.

DROP POLICY IF EXISTS "Users can read own attendance" ON public.event_attendance;
CREATE POLICY "Users can read own attendance"
  ON public.event_attendance
  FOR SELECT
  USING (auth.uid() = user_id);
