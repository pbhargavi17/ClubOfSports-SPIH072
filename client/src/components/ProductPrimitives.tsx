// Floodlit Clubhouse reminder: every component should feel like a precise on-court signal, not generic dashboard chrome.
import { motion } from "framer-motion";
import { CalendarDays, Check, ChevronRight, CircleCheck, Crown, MapPin, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { type Athlete, type Event, type Schedule, type Sport, type Subscription } from "@/lib/mock-data";
import QRCode from "react-qr-code";

const sportGlyph: Record<string, string> = { Badminton: "⌁", Cricket: "◒", Football: "◉", Running: "↗", Chess: "♞", Swimming: "≈" };

export function SectionKicker({ children }: { children: React.ReactNode }) {
  return <p className="section-kicker"><span />{children}</p>;
}

export function SkillIndex({ value, label = "Skill index", compact = false }: { value: number; label?: string; compact?: boolean }) {
  return (
    <div className={compact ? "score-compact" : "score-block"}>
      <div className="flex items-baseline justify-between gap-3"><span>{label}</span><strong>{value}<small>/100</small></strong></div>
      <div className="score-rail"><motion.i initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }} /></div>
    </div>
  );
}

export function TrustScore({ value = 84, compact = false }: { value?: number; compact?: boolean }) {
  const dash = 264 - (264 * value) / 100;
  return (
    <div className={`trust-score ${compact ? "trust-compact" : ""}`}>
      <div className="trust-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" /><motion.circle cx="50" cy="50" r="42" initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset: dash }} transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }} /></svg><div><b>{value}</b><span>/100</span></div></div>
      {!compact && <div><p>Trust score</p><small>Built through showing up.</small></div>}
    </div>
  );
}

export function MatchScore({ value, onClick }: { value: number; onClick?: () => void }) {
  return <button className="match-score" onClick={onClick} aria-label={`View why this is a ${value} percent match`}><Sparkles size={13} /><span>{value}% Match</span><ChevronRight size={14} /></button>;
}

export function SportCard({ sport, selected, onClick }: { sport: Sport; selected?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`sport-card ${selected ? "selected" : ""}`}><span className="sport-glyph" style={{ color: sport.color }}>{sport.icon}</span><span><b>{sport.name}</b><small>{sport.description}</small></span>{selected && <Check size={16} />}</button>;
}

export function AthleteCard({ athlete, onConnect, onView, onMatch }: { athlete: Athlete; onConnect?: () => void; onView?: () => void; onMatch?: () => void }) {
  return (
    <motion.article className="athlete-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ duration: 0.24 }}>
      <div className="athlete-card-top"><div className="avatar-wrap"><img src={athlete.avatar} alt="" /><span className="sport-chip">{sportGlyph[athlete.sport]}</span></div><MatchScore value={athlete.match} onClick={onMatch} /></div>
      <div className="athlete-name"><div><h3>{athlete.name}{athlete.verified && <ShieldCheck size={15} />}</h3><p>{athlete.sport} <i>•</i> {athlete.skillIndex}/100</p></div><span className="trust-mini">{athlete.trustScore}</span></div>
      <div className="athlete-facts"><span><MapPin size={14} />{athlete.distance}</span><span><CalendarDays size={14} />{athlete.availability}</span></div>
      <div className="card-actions"><button className="button-quiet" onClick={onView}>View profile</button><button className="button-lime" onClick={onConnect}>Connect <ChevronRight size={15} /></button></div>
    </motion.article>
  );
}

export function EventCard({ event, onView }: { event: Event; onView: () => void }) {
  return <motion.article className="event-card" whileHover={{ y: -4 }} transition={{ duration: 0.22 }}><div className="event-date"><span>{event.date.split(",")[0]}</span><b>{event.date.split(" ").at(-1)}</b></div><div className="event-copy"><p className="event-sport" style={{ color: event.color }}>{event.sport}</p><h3>{event.name}</h3><span><MapPin size={14} />{event.location}</span><span><UsersRound size={14} />{event.participants} of {event.capacity} players</span></div><button className="icon-button" onClick={onView} aria-label={`View ${event.name}`}><ChevronRight size={19} /></button></motion.article>;
}

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const empty = schedule.time === "—";
  return <article className={`schedule-card ${empty ? "quiet" : ""}`}><div><span>{schedule.day}</span><b>{schedule.time}</b></div><i /><div><h4>{schedule.title}</h4><p>{schedule.subtitle}</p></div></article>;
}

export function PricingCard({ plan, onSelect }: { plan: Subscription; onSelect: () => void }) {
  return <article className={`pricing-card ${plan.highlighted ? "is-featured" : ""}`}>{plan.highlighted && <p className="popular">MOST PLAYED</p>}<div><span>{plan.name === "Club Pro" ? <Crown size={16} /> : "PLAN"}</span><h3>{plan.name}</h3><p>{plan.description}</p></div><div className="price">{plan.price}<small>{plan.price !== "₹0" && "/ month"}</small></div><ul>{plan.features.map((feature) => <li key={feature}><CircleCheck size={16} />{feature}</li>)}</ul><button className={plan.highlighted ? "button-lime wide" : "button-outline wide"} onClick={onSelect}>{plan.name === "Free" ? "Continue Free" : plan.name === "Club" ? "Start Club" : "Start Pro"}</button></article>;
}

export function QRProfileCard({ name = "Arjun Sharma", onScan, id = "unknown" }: { name?: string; onScan?: () => void; id?: string }) {
  const url = `${window.location.origin}/app/profile/${id}`;
  return <div className="qr-card"><div className="qr-real" style={{ background: "white", padding: 16, borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center" }} aria-label="Profile QR code"><QRCode value={url} size={136} bgColor="#ffffff" fgColor="#000000" /></div><div><p className="section-kicker"><span />MY CLUBOFSPORTS QR</p><h3>{name}</h3><p>Let a player add you in one scan.</p><button className="button-outline" onClick={onScan}>Scan QR <ChevronRight size={15} /></button></div></div>;
}

export function ModalSurface({ title, eyebrow, children, onClose }: { title: string; eyebrow?: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-scrim" role="dialog" aria-modal="true"><motion.div className="modal-surface" initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22 }}><button className="modal-close" onClick={onClose} aria-label="Close">×</button>{eyebrow && <SectionKicker>{eyebrow}</SectionKicker>}<h2>{title}</h2>{children}</motion.div></div>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><div>⌁</div><h3>{title}</h3><p>{text}</p></div>;
}
