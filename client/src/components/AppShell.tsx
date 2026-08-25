// Floodlit Clubhouse reminder: the navigation is a reliable clubhouse rail, calm and always close to the next play.
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronLeft, CircleHelp, Compass, Home, LogOut, Mail, Menu, MessageSquare, Search, Settings, Trophy, UserRound, UsersRound, X, History as HistoryIcon, Flag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { BrandMark } from "@/components/Brand";
import { primaryUser, type SportName } from "@/lib/mock-data";
import { toast } from "sonner";
import { api, getDiscover, getMe, requestConnection, type ApiAthlete, type ApiUser } from "@/lib/api";

const navigation = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/discover", label: "Discover", icon: Compass },
  { href: "/app/events", label: "Events", icon: Trophy },
  { href: "/app/connections", label: "Connections", icon: UsersRound },
  { href: "/app/profile", label: "My profile", icon: UserRound },
  { href: "/app/history", label: "History", icon: HistoryIcon },
];

const cursorForSport: Record<SportName, string> = { Badminton: "⌁", Cricket: "◒", Football: "◉", Running: "↗", Chess: "♞", Swimming: "≈" };
type UtilityDialog = { title: string; description: string; fieldLabel?: string; actionLabel?: string };

function SportCursor({ sport }: { sport: SportName }) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => setPosition({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);
  return <motion.div className="sport-cursor" animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 700, damping: 38, mass: 0.15 }} aria-hidden="true">{cursorForSport[sport]}</motion.div>;
}

// ── Search Modal ────────────────────────────────────────────────────────────
function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All");
  const [results, setResults] = useState<ApiAthlete[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const tid = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getDiscover(sport === "All" ? undefined : sport, undefined);
        const q = query.toLowerCase().trim();
        setResults(q ? data.filter(a =>
          a.name.toLowerCase().includes(q) ||
          a.sport.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q)
        ) : data.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => window.clearTimeout(tid);
  }, [query, sport]);

  async function connect(athlete: ApiAthlete) {
    setConnectingId(athlete.id);
    try {
      await requestConnection(athlete.id);
      toast.success(`Connection request sent to ${athlete.name}`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail;
      if (msg === "A connection already exists") toast.info("Already connected or request pending");
      else toast.error("Could not send request");
    } finally {
      setConnectingId(null);
    }
  }

  const sportTabs = ["All", "Badminton", "Cricket", "Football", "Running", "Chess", "Swimming"];

  return (
    <div
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(7,10,9,.85)", display: "grid", placeItems: "start center", paddingTop: "80px", paddingLeft: 16, paddingRight: 16 }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Search athletes"
        className="panel-card"
        style={{ width: "min(660px,100%)", background: "#151b18", border: "1px solid rgba(199,242,92,.22)", boxShadow: "0 32px 80px rgba(0,0,0,.5)", borderRadius: 18, overflow: "hidden" }}
      >
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <Search size={18} style={{ color: "rgba(255,255,255,.4)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search athletes, sports, cities…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 16, color: "#fff" }}
          />
          <button onClick={onClose} className="icon-button" aria-label="Close search"><X size={18} /></button>
        </div>

        {/* Sport filter chips */}
        <div style={{ display: "flex", gap: 8, padding: "12px 20px", overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          {sportTabs.map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              style={{
                flexShrink: 0, padding: "4px 12px", borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: sport === s ? "#c7f25c" : "rgba(255,255,255,.07)",
                color: sport === s ? "#0a0f0c" : "rgba(255,255,255,.7)",
                border: "none"
              }}
            >{s}</button>
          ))}
        </div>

        {/* Results */}
        <div style={{ maxHeight: 380, overflowY: "auto", padding: "12px 0" }}>
          {loading && <p className="empty-state">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="empty-state">{query ? "No athletes match that search." : "Type to search athletes."}</p>
          )}
          {!loading && results.map(athlete => (
            <div
              key={athlete.id}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px" }}
              className="search-result-row"
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(199,242,92,.15)", display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0, color: "#c7f25c" }}>
                {athlete.profile_image
                  ? <img src={athlete.profile_image} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                  : athlete.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", fontSize: 14 }}>{athlete.name}</strong>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{athlete.sport} · {athlete.city}</span>
              </div>
              <span style={{ fontSize: 12, color: "#c7f25c", fontWeight: 600 }}>{athlete.trust_score} trust</span>
              <button
                className="button-lime compact-action"
                style={{ fontSize: 12, padding: "4px 12px" }}
                disabled={connectingId === athlete.id}
                onClick={() => connect(athlete)}
              >
                {connectingId === athlete.id ? "…" : "Connect"}
              </button>
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,.06)", fontSize: 12, color: "rgba(255,255,255,.3)" }}>
          Press <kbd style={{ background: "rgba(255,255,255,.08)", padding: "1px 5px", borderRadius: 4 }}>Esc</kbd> to close
        </div>
      </section>
    </div>
  );
}

export function AppShell({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [utilityDialog, setUtilityDialog] = useState<UtilityDialog | null>(null);
  const [utilityText, setUtilityText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [me, setMe] = useState<ApiUser | null>(null);

  // Load real user
  useEffect(() => {
    getMe().then(user => { if (user) setMe(user); }).catch(() => {});
  }, []);

  // ⌘K / Ctrl+K shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const displayName = me?.name ?? "Athlete";
  const displayAvatar = me?.profile_image ?? primaryUser.avatar;
  const displayPlan = localStorage.getItem("clubofsports-plan") ?? "Free";
  const displaySport = (me?.primary_sport as SportName) ?? primaryUser.primarySport;

  function openUtility(dialog: UtilityDialog) {
    setUtilityText("");
    setAccountOpen(false);
    setUtilityDialog(dialog);
  }
  function closeUtility() { setUtilityDialog(null); setUtilityText(""); }
  function submitUtility() {
    toast.success(`${utilityDialog?.title} received`, { description: "Thanks for helping us make the clubhouse better." });
    closeUtility();
  }
  function logout() {
    localStorage.removeItem("clubofsports-token");
    localStorage.removeItem("clubofsports-onboarded");
    localStorage.removeItem("clubofsports-plan");
    setAccountOpen(false);
    setLocation("/");
    toast.success("You have been logged out");
  }

  const rail = (mobile = false) => <nav className={mobile ? "mobile-rail" : `app-rail ${collapsed ? "is-collapsed" : ""}`} aria-label="Primary navigation">
    {!mobile && <><div className="rail-brand"><BrandMark compact={collapsed} /><button className="rail-collapse" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar">{collapsed ? <Menu size={17} /> : <ChevronLeft size={17} />}</button></div><div className="rail-divider" /></>}
    <div className="rail-links">{navigation.map((item) => { const Icon = item.icon; const active = item.href === "/app" ? location === "/app" : location.startsWith(item.href); return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`rail-link ${active ? "active" : ""}`}><Icon size={19} /><span>{item.label}</span>{active && !collapsed && <i />}</Link>; })}</div>
    {!mobile && <div className="rail-bottom"><button className="rail-link" onClick={() => openUtility({ title: "Settings", description: "Account settings will be available here soon.", actionLabel: "Close" })}><Settings size={19} /><span>Settings</span></button><button className="rail-link" onClick={() => openUtility({ title: "Help / FAQ", description: "Need a hand? Tell us what you are trying to do and our team will guide you.", fieldLabel: "YOUR QUESTION", actionLabel: "Send question" })}><CircleHelp size={19} /><span>Help / FAQ</span></button><button className="rail-link" onClick={() => openUtility({ title: "Contact us", description: "We would love to hear from you. Leave a message and the ClubOfSports team will get back to you.", fieldLabel: "YOUR MESSAGE", actionLabel: "Send message" })}><Mail size={19} /><span>Contact us</span></button><div className="rail-user"><img src={displayAvatar} alt="" /><div><b>{displayName}</b><span>{displayPlan} plan</span></div></div></div>}
  </nav>;

  return <div className="app-frame"><SportCursor sport={displaySport} />{rail()}<AnimatePresence>{open && <motion.div className="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="mobile-menu-card"><button className="mobile-close" onClick={() => setOpen(false)}><X size={20} /></button><BrandMark />{rail(true)}<div style={{ display: "grid", gap: 8, padding: "16px 0 0" }}><button className="rail-link" onClick={() => openUtility({ title: "Help / FAQ", description: "Need a hand? Tell us what you are trying to do and our team will guide you.", fieldLabel: "YOUR QUESTION", actionLabel: "Send question" })}><CircleHelp size={19} /><span>Help / FAQ</span></button><button className="rail-link" onClick={logout}><LogOut size={19} /><span>Log out</span></button></div></div></motion.div>}</AnimatePresence><main className="app-main"><header className="app-topbar"><div className="app-mobile-brand"><button className="icon-button" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><BrandMark compact /></div><div className="app-heading"><p className="section-kicker"><span />YOUR CLUBHOUSE</p><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div><div className="topbar-actions"><button className="top-search" id="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search athletes, sports, cities"><Search size={18} /><span>Search athletes, sports, cities…</span><kbd>⌘ K</kbd></button><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button><div style={{ position: "relative" }}><button className="top-avatar-button" onClick={() => setAccountOpen(!accountOpen)} aria-label="Open account menu" aria-expanded={accountOpen}><img className="top-avatar" src={displayAvatar} alt={displayName} /></button>{accountOpen && <div className="account-menu"><div className="account-menu-heading"><strong>{displayName}</strong><span>Manage your clubhouse</span></div><button onClick={() => openUtility({ title: "Contact us", description: "We would love to hear from you. Leave a message and the ClubOfSports team will get back to you.", fieldLabel: "YOUR MESSAGE", actionLabel: "Send message" })}><Mail size={16} />Contact us</button><button onClick={() => openUtility({ title: "Help / FAQ", description: "Need a hand? Tell us what you are trying to do and our team will guide you.", fieldLabel: "YOUR QUESTION", actionLabel: "Send question" })}><CircleHelp size={16} />Help / FAQ</button><button onClick={() => openUtility({ title: "Send feedback", description: "Tell us what is working well or what you would improve.", fieldLabel: "YOUR FEEDBACK", actionLabel: "Send feedback" })}><MessageSquare size={16} />Feedback</button><button onClick={() => openUtility({ title: "Report a problem", description: "Report inappropriate content, a safety concern, or a technical issue.", fieldLabel: "WHAT SHOULD WE KNOW?", actionLabel: "Submit report" })}><Flag size={16} />Report</button><button className="account-menu-danger" onClick={logout}><LogOut size={16} />Log out</button></div>}</div>{action}</div></header><div className="app-content">{children}</div></main><div className="mobile-bottom-nav">{navigation.map((item) => { const Icon = item.icon; const active = item.href === "/app" ? location === "/app" : location.startsWith(item.href); return <Link key={item.href} href={item.href} className={active ? "active" : ""}><Icon size={19} /><span>{item.label === "My profile" ? "Profile" : item.label}</span></Link>; })}</div>{utilityDialog && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeUtility(); }} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(7, 10, 9, .78)", display: "grid", placeItems: "center", padding: 20 }}><section role="dialog" aria-modal="true" aria-labelledby="utility-dialog-title" className="panel-card" style={{ width: "min(500px, 100%)", padding: 24, background: "#151b18", border: "1px solid rgba(199,242,92,.24)", boxShadow: "0 24px 80px rgba(0,0,0,.42)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}><div><p className="section-kicker"><span />CLUBHOUSE SUPPORT</p><h2 id="utility-dialog-title" style={{ margin: "8px 0 0" }}>{utilityDialog.title}</h2></div><button className="icon-button" onClick={closeUtility} aria-label="Close dialog"><X size={20} /></button></div><p className="text-muted" style={{ marginTop: 12, lineHeight: 1.6 }}>{utilityDialog.description}</p>{utilityDialog.fieldLabel && <label className="field-label" style={{ display: "block", marginTop: 20 }}>{utilityDialog.fieldLabel}<textarea autoFocus value={utilityText} onChange={(event) => setUtilityText(event.target.value)} rows={5} placeholder="Write here…" style={{ width: "100%", resize: "vertical", marginTop: 8 }} /></label>}<div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}><button className="button-outline" onClick={closeUtility}>{utilityDialog.actionLabel === "Close" ? "Close" : "Cancel"}</button>{utilityDialog.actionLabel !== "Close" && <button className="button-lime" disabled={!utilityText.trim()} onClick={submitUtility}>{utilityDialog.actionLabel}</button>}</div></section></div>}
    {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
  </div>;
}
