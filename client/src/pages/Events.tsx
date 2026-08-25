// Floodlit Clubhouse reminder: events are invitations to show up, not tournament-management machinery.
import { AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarCheck2, CalendarDays, Clock3, Crown, MapPin, Repeat2, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EventCard, ModalSurface, ScheduleCard, SectionKicker } from "@/components/ProductPrimitives";
import { schedules, type Event } from "@/lib/mock-data";
import { getEvents, joinEvent, type ApiEvent } from "@/lib/api";

// Map ApiEvent → the Event shape used by EventCard
function toEventCard(e: ApiEvent, index: number): Event {
  const d = new Date(e.starts_at);
  const sportColors: Record<string, string> = {
    Badminton: "#C7F25C", Running: "#F68A7A", Cricket: "#F3B25B",
    Football: "#71B9FF", Chess: "#C7C4FF", Swimming: "#55D8D0",
  };
  return {
    id: e.id,
    name: e.title,
    sport: (e.sport as any) ?? "Badminton",
    date: d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    location: e.venue || e.city,
    participants: 0,
    capacity: e.capacity,
    description: e.description || "A local sporting event. Join to participate.",
    color: sportColors[e.sport] ?? "#C7F25C",
  };
}

export default function Events() {
  const [apiEvents, setApiEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    getEvents()
      .then(data => setApiEvents(data.map(toEventCard)))
      .catch(() => {
        toast.error("Could not load events. Is the backend running?");
        setApiEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleJoin(event: Event) {
    if (joinedIds.has(event.id)) {
      toast.info("You already joined this event.");
      return;
    }
    setJoiningId(event.id);
    try {
      await joinEvent(event.id);
      setJoinedIds(prev => { const next = new Set(Array.from(prev)); next.add(event.id); return next; });
      toast.success("You're on the session list.", { description: "A confirmation would be sent before the event." });
      setActiveEvent(null);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (detail === "Already joined") {
        toast.info("You've already joined this event.");
        setJoinedIds(prev => { const next = new Set(Array.from(prev)); next.add(event.id); return next; });
      } else {
        toast.error("Could not join event right now.");
      }
    } finally {
      setJoiningId(null);
    }
  }

  const displayEvents = apiEvents;

  return <AppShell title="Events near you." subtitle="Shared sessions, honest timing, zero tournament clutter." action={<button className="button-outline compact-action" onClick={() => setScheduleOpen(true)}><CalendarCheck2 size={15} />My schedule</button>}>
    <section className="events-intro"><div><SectionKicker>LOCAL PLAY, ALREADY IN MOTION</SectionKicker><h2>Make the part between<br />"we should play" and <em>playing</em> shorter.</h2></div><div className="events-intro-card"><CalendarDays size={22} /><div><b>{loading ? "…" : `${displayEvents.length} events`} near you</b><span>Badminton, running, cricket and more.</span></div></div></section>
    <div className="events-layout">
      <section className="events-list">
        <div className="panel-heading"><div><SectionKicker>UPCOMING</SectionKicker><h2>Find your starting line.</h2></div><span className="pill">Hyderabad</span></div>
        {loading ? (
          <div style={{ display: "grid", gap: 12 }}>{[...Array(3)].map((_, i) => <div key={i} className="panel-card" style={{ height: 130, background: "rgba(255,255,255,.04)", borderRadius: 16, animation: "pulse 1.5s ease-in-out infinite" }} />)}</div>
        ) : displayEvents.length === 0 ? (
          <p className="empty-state">No events yet. Check back soon or create one.</p>
        ) : (
          <div className="event-list-full">{displayEvents.map((event) => <EventCard event={event} key={event.id} onView={() => setActiveEvent(event)} />)}</div>
        )}
      </section>
      <aside className="recurring-card"><div className="recurring-icon"><Repeat2 size={22} /></div><SectionKicker>CLUB FEATURE</SectionKicker><h3>Schedule your<br /><em>sessions.</em></h3><p>Keep the court and your people in the calendar every week.</p><div className="recurring-preview"><span>Every Saturday</span><b>6:00 PM</b><span>Badminton • XYZ Sports Arena</span><small>4 sessions planned</small></div><button className="button-lime wide" onClick={() => setUpgradeOpen(true)}>Set recurring session <ArrowRight size={16} /></button><small><Crown size={13} />Available in Club</small></aside>
    </div>
    <AnimatePresence>{activeEvent && <ModalSurface title={activeEvent.name} eyebrow={`${activeEvent.sport.toUpperCase()} • EVENT DETAILS`} onClose={() => setActiveEvent(null)}><div className="event-detail"><p>{activeEvent.description}</p><div className="event-detail-facts"><span><CalendarDays size={17} />{activeEvent.date}</span><span><Clock3 size={17} />{activeEvent.time}</span><span><MapPin size={17} />{activeEvent.location}</span><span><UsersRound size={17} />{activeEvent.participants} of {activeEvent.capacity} players</span></div><button className="button-lime wide" disabled={joiningId === activeEvent.id || joinedIds.has(activeEvent.id)} onClick={() => handleJoin(activeEvent)}>{joiningId === activeEvent.id ? "Joining…" : joinedIds.has(activeEvent.id) ? "Already joined ✓" : <>Join event <ArrowRight size={16} /></>}</button></div></ModalSurface>}</AnimatePresence>
    <AnimatePresence>{scheduleOpen && <ModalSurface title="Your week, at a glance." eyebrow="MY SCHEDULE" onClose={() => setScheduleOpen(false)}><div className="schedule-modal">{schedules.map((item) => <ScheduleCard key={item.id} schedule={item} />)}<button className="button-outline wide" onClick={() => { setScheduleOpen(false); setUpgradeOpen(true); }}><Repeat2 size={16} />Schedule a recurring session</button></div></ModalSurface>}</AnimatePresence>
    <AnimatePresence>{upgradeOpen && <ModalSurface title="Unlock recurring scheduling." eyebrow="PLAY REGULARLY" onClose={() => setUpgradeOpen(false)}><div className="upgrade-modal"><div className="upgrade-symbol"><Repeat2 size={22} /></div><p>Schedule your favourite venue every weekend or every month, then let your sports circle know where to find you.</p><div className="upgrade-price"><b>Club</b><span>₹100 / month</span></div><button className="button-lime wide" onClick={() => { toast.success("Club upgrade selected", { description: "Payment is intentionally not enabled in this demo." }); setUpgradeOpen(false); }}>Upgrade to Club <ArrowRight size={16} /></button><small>Demo plan—no payment will be collected.</small></div></ModalSurface>}</AnimatePresence>
  </AppShell>;
}
