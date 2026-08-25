// Floodlit Clubhouse reminder: history is evidence of showing up — present it with earned weight.
import { motion } from "framer-motion";
import { CalendarDays, Clock3, FileText, MapPin, Sparkles, Trophy, UsersRound, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionKicker } from "@/components/ProductPrimitives";
import { getHistory } from "@/lib/api";
import "../history.css";

type HistoryData = {
  my_posts: { id: string; caption: string; created_at: string }[];
  my_events: { id: string; title: string; sport: string; starts_at: string; venue: string }[];
  my_connections: number;
  my_matches: { id: string; sport: string; venue: string; starts_at: string; status: string }[];
};

const sportGlyph: Record<string, string> = {
  Badminton: "⌁", Cricket: "◒", Football: "◉", Basketball: "🏀",
  Running: "↗", Chess: "♞", Swimming: "≈",
};

const sportColor: Record<string, string> = {
  Badminton: "#C7F25C", Cricket: "#F3B25B", Football: "#71B9FF",
  Basketball: "#FF8C42", Running: "#F68A7A", Chess: "#C7C4FF", Swimming: "#55D8D0",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] } };

export default function History() {
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(() => setHistory({ my_posts: [], my_events: [], my_connections: 0, my_matches: [] }))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: <FileText size={20} />, value: history?.my_posts.length ?? 0, label: "Posts shared", color: "#C7F25C" },
    { icon: <UsersRound size={20} />, value: history?.my_connections ?? 0, label: "Connections", color: "#71B9FF" },
    { icon: <CalendarDays size={20} />, value: history?.my_events.length ?? 0, label: "Events joined", color: "#F3B25B" },
    { icon: <Trophy size={20} />, value: history?.my_matches.length ?? 0, label: "Matches", color: "#F68A7A" },
  ];

  return (
    <AppShell title="Your playing history." subtitle="Everything you have shared, joined, and built together.">
      <div className="history-page">

        {/* ── Stats hero ────────────────────────────────────────────────────── */}
        <motion.section className="history-stats-hero" {...fadeUp}>
          <div className="history-hero-copy">
            <SectionKicker>YOUR RECORD</SectionKicker>
            <h2>A club life<br /><em>worth keeping.</em></h2>
            <p>Every session, post, and connection adds up. This is what you have built.</p>
          </div>
          <div className="history-stat-grid">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="history-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
                <strong>{loading ? "—" : s.value}</strong>
                <small>{s.label}</small>
                {!loading && Number(s.value) > 0 && (
                  <div className="history-stat-bar" style={{ background: `${s.color}22` }}>
                    <div style={{ width: `${Math.min(100, Number(s.value) * 10)}%`, background: s.color }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Activity streak banner ────────────────────────────────────────── */}
        {!loading && (history?.my_posts.length ?? 0) + (history?.my_events.length ?? 0) > 0 && (
          <motion.div className="history-streak-banner" {...fadeUp} transition={{ delay: 0.15, duration: 0.28 }}>
            <Zap size={16} />
            <span>You have been active. Keep the momentum — your Trust Score improves with every session.</span>
            <span className="history-streak-badge"><Sparkles size={12} />Active</span>
          </motion.div>
        )}

        {/* ── Two-column content ────────────────────────────────────────────── */}
        <div className="history-content-grid">

          {/* Posts ─────────────────────────────────────────────────── */}
          <motion.section
            className="history-panel"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="history-panel-head">
              <SectionKicker>MY POSTS</SectionKicker>
              <h3>Shared with<br />your people.</h3>
              <p>Your published updates appear here.</p>
            </div>

            {loading ? (
              <div className="history-skeleton-list">
                {[1, 2, 3].map(i => <div key={i} className="history-skeleton-row" />)}
              </div>
            ) : history?.my_posts.length ? (
              <div className="history-item-list">
                {history.my_posts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    className="history-post-card"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="history-post-icon"><FileText size={14} /></div>
                    <div className="history-post-body">
                      <p>{post.caption.length > 100 ? post.caption.slice(0, 100) + "…" : post.caption}</p>
                      <time>{timeAgo(post.created_at)} · {formatDate(post.created_at)}</time>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="history-empty">
                <span>✏️</span>
                <h4>No posts yet</h4>
                <p>Your published updates and match stories will show here.</p>
              </div>
            )}
          </motion.section>

          {/* Events ─────────────────────────────────────────────────── */}
          <motion.section
            className="history-panel"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18 }}
          >
            <div className="history-panel-head">
              <SectionKicker>MY EVENTS</SectionKicker>
              <h3>Places you<br />showed up.</h3>
              <p>Events you signed up for and attended.</p>
            </div>

            {loading ? (
              <div className="history-skeleton-list">
                {[1, 2, 3].map(i => <div key={i} className="history-skeleton-row" />)}
              </div>
            ) : history?.my_events.length ? (
              <div className="history-item-list">
                {history.my_events.map((event, i) => {
                  const color = sportColor[event.sport] ?? "#C7F25C";
                  const glyph = sportGlyph[event.sport] ?? "◈";
                  return (
                    <motion.article
                      key={event.id}
                      className="history-event-card"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="history-event-glyph" style={{ color, background: `${color}18` }}>
                        {glyph}
                      </div>
                      <div className="history-event-body">
                        <strong>{event.title}</strong>
                        <span style={{ color }}>{event.sport}</span>
                        {event.venue && (
                          <p><MapPin size={11} />{event.venue}</p>
                        )}
                        <time><CalendarDays size={11} />{formatDate(event.starts_at)}</time>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <div className="history-empty">
                <span>📅</span>
                <h4>No events yet</h4>
                <p>Events you join will be kept in your history.</p>
              </div>
            )}
          </motion.section>

          {/* Matches ─────────────────────────────────────────────────── */}
          {(loading || (history?.my_matches.length ?? 0) > 0) && (
            <motion.section
              className="history-panel history-panel-wide"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.24 }}
            >
              <div className="history-panel-head">
                <SectionKicker>MY MATCHES</SectionKicker>
                <h3>Games on the record.</h3>
                <p>Confirmed sessions and organised matches.</p>
              </div>

              {loading ? (
                <div className="history-matches-grid">
                  {[1, 2].map(i => <div key={i} className="history-skeleton-row" style={{ height: 80 }} />)}
                </div>
              ) : (
                <div className="history-matches-grid">
                  {history!.my_matches.map((match, i) => {
                    const color = sportColor[match.sport] ?? "#C7F25C";
                    const glyph = sportGlyph[match.sport] ?? "◈";
                    return (
                      <motion.article
                        key={match.id}
                        className="history-match-card"
                        style={{ borderColor: `${color}30` }}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <div className="history-match-glyph" style={{ color, background: `${color}18` }}>{glyph}</div>
                        <div>
                          <b>{match.sport}</b>
                          <p><MapPin size={11} />{match.venue}</p>
                          <p><Clock3 size={11} />{formatDate(match.starts_at)}</p>
                        </div>
                        <span className={`history-match-status ${match.status}`}>{match.status}</span>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </motion.section>
          )}

        </div>
      </div>
    </AppShell>
  );
}
