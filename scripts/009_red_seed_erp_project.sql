-- Red — seed del proyecto ERP y sus declaraciones de uso de módulos.
--
-- ERP es un proyecto open-source que vive en su propio repo (mardelplata-erp,
-- mirror público sin info sensible). Acá lo damos de alta como entrada del
-- catálogo de proyectos y declaramos qué módulos de la red consume.
--
-- A medida que se extraigan piezas del ERP como módulos independientes en
-- mardelplata-modules, se agregan más filas en module_usages. El sentido de
-- la relación es siempre proyecto → módulo (declaración explícita); la lista
-- inversa "qué proyectos usan X módulo" se deriva con un count.
--
-- Idempotente.

-- ============================================================
-- Project
-- ============================================================

INSERT INTO public.projects (slug, name, description, status, repo_url, is_public)
VALUES (
  'erp',
  'ERP',
  'Sistema de gestión open-source construido por módulos reusables. Funciona end-to-end; los módulos se van extrayendo de a uno hacia mardelplata-modules.',
  'active',
  'https://github.com/nahuoo/mardelplata-erp',
  TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Module usages — ERP declara que usa vision y facturacion-argentina
-- ============================================================

INSERT INTO public.module_usages (project_id, module_id, note)
SELECT
  p.id,
  m.id,
  CASE m.slug
    WHEN 'vision' THEN 'Lectura de comprobantes y documentos escaneados.'
    WHEN 'facturacion-argentina' THEN 'Emisión de comprobantes electrónicos a clientes.'
  END
FROM public.projects p
CROSS JOIN public.modules m
WHERE p.slug = 'erp'
  AND m.slug IN ('vision', 'facturacion-argentina')
ON CONFLICT (project_id, module_id) DO NOTHING;
