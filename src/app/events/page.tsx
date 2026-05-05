import { getEvents } from "@/actions/community";
import { CalendarDays, MapPin, Users, Clock } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";

export default async function EventsPage() {
  const result = await getEvents(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allEvents = (result.success ? result.data || [] : []) as any[];

  // Separate upcoming vs past
  const now = new Date().toISOString();
  const upcoming = allEvents.filter(
    (e) => e.isActive && new Date(e.date) >= new Date(),
  );
  const past = allEvents.filter(
    (e) => !e.isActive || new Date(e.date) < new Date(),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Community Events</h1>
        <p className="mt-2 text-slate-400">
          Discover local events, meetups, and community drives happening near
          you.
        </p>
      </div>

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-white mb-4">
            Upcoming Events
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {upcoming.map((event) => (
              <Link
                href={`/events/${event._id}`}
                key={event._id}
                className="glass-card overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1 block">
                {event.image ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                    <CalendarDays className="h-10 w-10 text-purple-400/50" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {event.attendees?.length || 0} attending{" "}
                      {event.maxAttendees
                        ? `/ ${event.maxAttendees} max`
                        : ""}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Organized by {event.organizer}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Past / All Events */}
      {past.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-slate-400 mb-4">
            {upcoming.length > 0 ? "Past Events" : "Events"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <Link
                href={`/events/${event._id}`}
                key={event._id}
                className="glass-card overflow-hidden opacity-75 hover:opacity-100 transition-all block">
                {event.image ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-full w-full object-cover grayscale-[30%]"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-slate-700/30 to-slate-600/20">
                    <CalendarDays className="h-10 w-10 text-slate-600" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">
                      {event.title}
                    </h3>
                    <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                      Past
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {event.attendees?.length || 0} attended
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {allEvents.length === 0 && (
        <div className="glass-card p-16 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-300">
            No events yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Check back later for community events.
          </p>
        </div>
      )}
    </div>
  );
}
