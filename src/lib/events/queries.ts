import { createClient } from "@/lib/supabase/client";
import { IS_MOCK, mockEvents, mockAttendances } from "@/lib/devMock";

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  date: string;
  end_date: string | null;
  location: string | null;
  tags: string[];
  image_url: string | null;
  registration_url: string | null;
  is_mystery: boolean;
  codename: string | null;
  teaser: string | null;
  is_published: boolean;
}

export interface AttendanceRecord {
  id: string;
  event_id: string;
  user_id: string;
  scanned_at: string;
}

export interface AttendedEvent {
  attendance: AttendanceRecord;
  event: Pick<EventRecord, "id" | "slug" | "title" | "subtitle" | "date" | "location" | "is_mystery" | "codename"> | null;
}

const EVENT_COLUMNS =
  "id, slug, title, subtitle, description, date, end_date, location, tags, image_url, registration_url, is_mystery, codename, teaser, is_published";

export async function listPublishedEvents(): Promise<EventRecord[]> {
  if (IS_MOCK) {
    return mockEvents
      .filter((e) => e.is_published)
      .map((e) => ({ ...e, tags: e.tags ?? [] })) as EventRecord[];
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("is_published", true)
    .order("date", { ascending: false });
  if (error || !data) return [];
  return data as EventRecord[];
}

export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  if (IS_MOCK) {
    const e = mockEvents.find((m) => m.slug === slug);
    return e ? ({ ...e, tags: e.tags ?? [] } as EventRecord) : null;
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as EventRecord;
}

export async function listMyAttendances(userId: string): Promise<AttendedEvent[]> {
  if (!userId) return [];
  if (IS_MOCK) {
    return mockAttendances
      .filter((a) => a.user_id === userId)
      .map((a) => {
        const e = mockEvents.find((ev) => ev.id === a.event_id) ?? null;
        return {
          attendance: {
            id: a.id,
            event_id: a.event_id,
            user_id: a.user_id,
            scanned_at: a.scanned_at,
          },
          event: e
            ? {
                id: e.id,
                slug: e.slug,
                title: e.title,
                subtitle: e.subtitle,
                date: e.date,
                location: e.location,
                is_mystery: e.is_mystery,
                codename: e.codename,
              }
            : null,
        };
      })
      .sort((a, b) => b.attendance.scanned_at.localeCompare(a.attendance.scanned_at));
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("event_attendance")
    .select(
      `id, event_id, user_id, scanned_at, event:events(id, slug, title, subtitle, date, location, is_mystery, codename)`,
    )
    .eq("user_id", userId)
    .order("scanned_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Array<{
    id: string;
    event_id: string;
    user_id: string;
    scanned_at: string;
    event: AttendedEvent["event"];
  }>).map((r) => ({
    attendance: {
      id: r.id,
      event_id: r.event_id,
      user_id: r.user_id,
      scanned_at: r.scanned_at,
    },
    event: r.event,
  }));
}
