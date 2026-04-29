import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { IS_MOCK, mockEvents } from "@/lib/devMock";
import type { EventRecord } from "@/lib/events/queries";

export const metadata: Metadata = {
  title: "Eventos — MdPDev",
  description:
    "Meetups, hackathons y encuentros de la comunidad MdPDev en Mar del Plata.",
};

async function loadEvents(): Promise<EventRecord[]> {
  if (IS_MOCK) {
    return mockEvents
      .filter((e) => e.is_published)
      .map((e) => ({ ...e, tags: e.tags ?? [] })) as EventRecord[];
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(
      "id, slug, title, subtitle, description, date, end_date, location, tags, image_url, registration_url, is_mystery, codename, teaser, is_published",
    )
    .eq("is_published", true)
    .order("date", { ascending: false });
  return (data ?? []) as EventRecord[];
}

function formatBadge(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date();
}

export default async function EventosPage() {
  const events = await loadEvents();
  const upcoming = events.filter((e) => !isPast(e.date)).reverse();
  const past = events.filter((e) => isPast(e.date));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="relative px-6 pt-32 pb-20 max-w-6xl mx-auto">
          <span className="eyebrow">
            <span className="w-1.5 h-1.5 rounded-full bg-ocean-500" />
            Eventos
          </span>
          <h1 className="display-h2 mt-5 text-ocean-900 text-[clamp(2.5rem,6vw,5rem)]">
            Lo que se viene <br />
            <span className="gradient-text">y lo que pasó.</span>
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mt-6 max-w-xl">
            Cada evento tiene su página propia. Entrá para ver detalles, agregar
            al calendario y ver quiénes participaron.
          </p>
        </section>

        <section className="px-6 pb-20 max-w-6xl mx-auto">
          {upcoming.length === 0 && past.length === 0 ? (
            <div className="bento-card text-center py-20 px-8">
              <p className="text-slate-700 text-xl font-display font-semibold mb-2">
                Estamos cocinando el próximo encuentro.
              </p>
              <p className="text-slate-500">
                Seguinos en redes para enterarte cuando se anuncie.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {upcoming.length > 0 && (
                <div>
                  <h2 className="eyebrow mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-ocean-500" />
                    Próximos
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcoming.map((e) => (
                      <EventListCard key={e.id} event={e} past={false} />
                    ))}
                  </div>
                </div>
              )}

              {past.length > 0 && (
                <div>
                  <h2 className="eyebrow mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Pasados
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {past.map((e) => (
                      <EventListCard key={e.id} event={e} past />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function EventListCard({ event, past }: { event: EventRecord; past: boolean }) {
  const href = `/eventos/${event.slug}`;
  if (event.is_mystery) {
    return (
      <Link
        href={href}
        className="block relative overflow-hidden rounded-[28px] event-header-mystery text-white p-7 hover:scale-[1.01] transition-transform"
      >
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-300 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Próximamente
          </span>
          <h3 className="font-display font-bold text-2xl tracking-tight leading-tight text-white/95">
            {event.codename ?? event.title}
          </h3>
          {event.teaser && (
            <p className="text-slate-400 text-sm leading-relaxed mt-4">
              {event.teaser}
            </p>
          )}
        </div>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="block bento-card p-7 hover:scale-[1.01] transition-transform"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean-50 text-ocean-700 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em]">
          {past ? "✓ Finalizado" : formatBadge(event.date)}
        </span>
        {event.location && (
          <span className="text-xs text-slate-500 truncate">
            📍 {event.location}
          </span>
        )}
      </div>
      <h3 className="font-display font-bold text-2xl text-ocean-900 leading-tight">
        {event.title}
      </h3>
      {event.subtitle && (
        <p className="text-slate-500 text-sm mt-2">{event.subtitle}</p>
      )}
      {event.description && (
        <p className="text-slate-600 text-sm leading-relaxed mt-4 line-clamp-3">
          {event.description}
        </p>
      )}
    </Link>
  );
}
