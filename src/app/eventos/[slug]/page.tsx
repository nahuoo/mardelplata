import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { IS_MOCK, mockEvents } from "@/lib/devMock";
import type { EventRecord } from "@/lib/events/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadEvent(slug: string): Promise<EventRecord | null> {
  if (IS_MOCK) {
    const e = mockEvents.find((m) => m.slug === slug);
    return e ? ({ ...e, tags: e.tags ?? [] } as EventRecord) : null;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(
      "id, slug, title, subtitle, description, date, end_date, location, tags, image_url, registration_url, is_mystery, codename, teaser, is_published",
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as EventRecord) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) return { title: "Evento — MdPDev" };
  const title = event.is_mystery
    ? `${event.codename ?? "Próximamente"} — MdPDev`
    : `${event.title} — MdPDev`;
  return {
    title,
    description: event.is_mystery
      ? event.teaser ?? "Evento próximamente."
      : event.description ?? event.subtitle ?? undefined,
  };
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  );
}

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date();
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event || !event.is_published) notFound();

  const past = isPast(event.date);

  if (event.is_mystery) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white">
          <article className="max-w-4xl mx-auto px-6 pt-32 pb-20">
            <Link
              href="/eventos"
              className="text-slate-500 hover:text-ocean-700 text-sm font-semibold inline-flex items-center gap-1.5 mb-10"
            >
              ← Volver a eventos
            </Link>
            <div className="event-header-mystery rounded-[32px] p-10 md:p-16 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-300 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Próximamente
              </span>
              <h1 className="font-display font-bold text-[clamp(2.5rem,6vw,5rem)] tracking-tight leading-tight text-white/95">
                {event.codename ?? event.title}
              </h1>
              {event.teaser && (
                <p className="text-slate-400 text-lg leading-relaxed mt-6 max-w-2xl">
                  {event.teaser}
                </p>
              )}
            </div>
          </article>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <article className="max-w-4xl mx-auto px-6 pt-32 pb-20">
          <Link
            href="/eventos"
            className="text-slate-500 hover:text-ocean-700 text-sm font-semibold inline-flex items-center gap-1.5 mb-10"
          >
            ← Volver a eventos
          </Link>

          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 text-ocean-700 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em]">
                {past ? (
                  <>✓ Finalizado</>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 pulse-dot" />
                    Próximo
                  </>
                )}
              </span>
              {event.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[0.7rem] font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="display-h2 text-ocean-900 text-[clamp(2.5rem,6vw,5rem)] leading-tight">
              {event.title}
            </h1>
            {event.subtitle && (
              <p className="text-slate-500 text-xl mt-4">{event.subtitle}</p>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div className="md:col-span-2">
              {event.description && (
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
            <aside className="space-y-6">
              <div className="bento-card p-6">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-slate-500 mb-2">
                  Cuándo
                </p>
                <p className="text-ocean-900 font-semibold">
                  {formatFullDate(event.date)}
                </p>
              </div>
              {event.location && (
                <div className="bento-card p-6">
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-slate-500 mb-2">
                    Dónde
                  </p>
                  <p className="text-ocean-900 font-semibold">📍 {event.location}</p>
                </div>
              )}
            </aside>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {event.registration_url && !past && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-primary"
              >
                Registrarme
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            )}
            <button
              type="button"
              disabled
              title="Próximamente — vamos a sumar add-to-calendar"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Agregar a Google Calendar
              <span className="ml-1 text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                · Próximamente
              </span>
            </button>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
