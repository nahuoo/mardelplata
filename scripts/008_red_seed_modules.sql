-- Red — seed inicial del catálogo de módulos.
--
-- Da de alta las cajas de capacidad que ya están implementadas (o en plan)
-- en el repo separado mardelplata-modules. Se insertan sin created_by para
-- que sean entradas "de la red" y no propiedad de un usuario puntual.
--
-- Idempotente: ON CONFLICT (slug) DO NOTHING, así esta migración se puede
-- correr varias veces o reaplicarse sin duplicar filas.

INSERT INTO public.modules (slug, name, description, kind, version, source_url, license, is_public)
VALUES
  (
    'vision',
    'Vision',
    'Lee imágenes con un LLM y devuelve datos estructurados validados con Zod. Provider swappable (OpenRouter por default).',
    'integration',
    '0.1.0',
    'https://github.com/nahuoo/mardelplata-modules/tree/main/modules/vision',
    'MIT',
    TRUE
  ),
  (
    'facturacion-argentina',
    'Facturación Argentina',
    'Emisión de comprobantes electrónicos para Argentina vía SOAP. Aún no implementado — entrada de catálogo para declarar uso desde proyectos.',
    'integration',
    '0.0.1',
    'https://github.com/nahuoo/mardelplata-modules/tree/main/modules/facturacion-argentina',
    'MIT',
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;
