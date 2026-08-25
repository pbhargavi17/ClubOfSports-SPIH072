// Floodlit Clubhouse reminder: profile information conveys earned confidence and sporting intent, never social vanity.
import { AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronRight, Edit3, Loader2, MapPin, Pencil, QrCode, Save, ShieldCheck, Sparkles, Trophy, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ModalSurface, QRProfileCard, SectionKicker, SkillIndex, TrustScore } from "@/components/ProductPrimitives";
import { SportTemplateForm } from "@/components/SportTemplateForm";
import { sports } from "@/lib/mock-data";
import {
  getConnections, getHistory, getMe, getTrustScore, updateProfile,
  getMySportProfiles,
  type ApiUser,
  type UserSportProfile,
} from "@/lib/api";

// ── Sport glyph / color maps ────────────────────────────────────────────────
const sportGlyph: Record<string, string> = {
  Badminton: "⌁", Cricket: "◒", Football: "◉", Basketball: "🏀",
  Running: "↗", Chess: "♞", Swimming: "≈", "Table Tennis": "◈",
};

/** Convert a raw profile_data record into display-friendly detail rows. */
function buildDetails(sportName: string, data: Record<string, string | number>) {
  return Object.entries(data)
    .filter(([, v]) => v !== "" && v !== 0 && v !== null && v !== undefined)
    .map(([k, v]) => ({
      label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: String(v),
    }));
}

export default function Profile() {
  const [qrOpen, setQrOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addSportOpen, setAddSportOpen] = useState(false);
  // "pick" = user choosing a sport from the list, "fill" = template form
  const [addSportStage, setAddSportStage] = useState<"pick" | "fill">("pick");
  const [addSportTarget, setAddSportTarget] = useState<string>("");

  const [activeSport, setActiveSport] = useState<UserSportProfile | null>(null);
  const [editSportOpen, setEditSportOpen] = useState(false);
  const [editSportTarget, setEditSportTarget] = useState<string>("");

  const [mySportProfiles, setMySportProfiles] = useState<UserSportProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const [me, setMe] = useState<ApiUser | null>(null);
  const [trustScore, setTrustScore] = useState<number>(75);
  const [connectionCount, setConnectionCount] = useState<number>(0);
  const [postCount, setPostCount] = useState<number>(0);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editSport, setEditSport] = useState("");
  const [editSkill, setEditSkill] = useState("");
  const [editAvailability, setEditAvailability] = useState("");

  function loadSportProfiles() {
    setLoadingProfiles(true);
    getMySportProfiles()
      .then(setMySportProfiles)
      .catch(() => setMySportProfiles([]))
      .finally(() => setLoadingProfiles(false));
  }

  useEffect(() => {
    getMe().then((user) => {
      if (!user) return;
      setMe(user);
      setEditName(user.name);
      setEditCity(user.city);
      setEditSport(user.primary_sport);
      setEditSkill(user.skill_level);
      setEditAvailability(user.availability);
      getTrustScore(user.id).then((t) => setTrustScore(t.trust_score)).catch(() => {});
      getConnections().then((c) => setConnectionCount(c.length)).catch(() => {});
      getHistory()
        .then((h) => {
          setPostCount(h.my_posts?.length ?? 0);
          setMatchCount(h.my_matches?.length ?? 0);
        })
        .catch(() => {});
    }).catch(() => {});
    loadSportProfiles();
  }, []);

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await updateProfile({
        name: editName,
        city: editCity,
        primary_sport: editSport,
        skill_level: editSkill,
        availability: editAvailability,
      });
      setMe(updated);
      setEditOpen(false);
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Could not save profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  // Called after template form saves successfully
  function handleSportSaved(skillIndex: number) {
    loadSportProfiles();
    setAddSportOpen(false);
    setAddSportStage("pick");
    setAddSportTarget("");
    setEditSportOpen(false);
    setEditSportTarget("");
    setActiveSport(null);
  }

  const displayName = me?.name ?? "Athlete";
  const displayAvatar =
    me?.profile_image ??
    `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=85`;
  const displayCity = me?.city ?? "Hyderabad";
  const displaySport = me?.primary_sport ?? "Badminton";
  const displaySkill = me?.skill_level ?? "Intermediate";
  const displayAvailability = me?.availability ?? "Weekdays, evenings";

  // Sports the user has NOT yet added a profile for
  const addableSports = sports.filter((s) => !mySportProfiles.some((p) => p.sport_name === s.name));

  return (
    <AppShell
      title="Your athlete identity."
      subtitle="The details that make a good match feel easy."
      action={
        <button className="button-outline compact-action" onClick={() => setEditOpen(true)}>
          <Edit3 size={15} />Edit profile
        </button>
      }
    >
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="profile-hero">
        <div className="profile-avatar">
          <img src={displayAvatar} alt={displayName} />
          <span><ShieldCheck size={15} /></span>
        </div>
        <div className="profile-intro">
          <SectionKicker>ATHLETE PROFILE</SectionKicker>
          <h2>{displayName}</h2>
          <p><MapPin size={15} />{displayCity} <i /> Primary sport: <b>{displaySport}</b></p>
          <div><span>{displaySkill}</span><span>{displayAvailability}</span></div>
        </div>
        <button className="button-lime profile-qr" onClick={() => setQrOpen(true)}>
          <QrCode size={17} />My QR
        </button>
      </section>

      <div className="profile-layout">
        {/* ── Sport profiles ───────────────────────────────────────────────── */}
        <section className="profile-sports panel-section">
          <div className="panel-heading">
            <div>
              <SectionKicker>YOUR SPORTS</SectionKicker>
              <h2>Built through play.</h2>
            </div>
            {addableSports.length > 0 && (
              <button
                className="text-link"
                onClick={() => { setAddSportStage("pick"); setAddSportOpen(true); }}
              >
                Add sport <ChevronRight size={15} />
              </button>
            )}
          </div>

          <div className="profile-sport-list">
            {loadingProfiles ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0", opacity: 0.6 }}>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                <span>Loading sport profiles…</span>
              </div>
            ) : mySportProfiles.length === 0 ? (
              <div className="sport-empty-state">
                <p>No sport profiles yet.</p>
                <button
                  className="button-lime"
                  style={{ marginTop: 10 }}
                  onClick={() => { setAddSportStage("pick"); setAddSportOpen(true); }}
                >
                  Add your first sport <ChevronRight size={15} />
                </button>
              </div>
            ) : (
              mySportProfiles.map((profile) => {
                const sportInfo = sports.find((s) => s.name === profile.sport_name);
                const glyph = sportGlyph[profile.sport_name] ?? "◈";
                const details = buildDetails(profile.sport_name, profile.profile_data);
                const specialty = details.find((d) =>
                  ["Primary Role", "Position", "Playing Type", "Preferred Distance"].includes(d.label)
                )?.value ?? "General";
                const experience = details.find((d) => d.label === "Experience Level" || d.label === "Running Experience" || d.label === "Experience")?.value ?? "";
                return (
                  <button
                    key={profile.sport_name}
                    className="profile-sport-item"
                    onClick={() => setActiveSport(profile)}
                  >
                    <div className="profile-sport-symbol" style={{ color: sportInfo?.color ?? "#C7F25C" }}>
                      {glyph}
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <h3>{profile.sport_name}</h3>
                      <p>{specialty}{experience ? ` • ${experience}` : ""}</p>
                    </div>
                    <SkillIndex value={profile.skill_index} compact />
                    <ChevronRight size={18} />
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* ── Trust score ──────────────────────────────────────────────────── */}
        <section className="profile-trust-card">
          <SectionKicker>TRUST SCORE</SectionKicker>
          <TrustScore value={trustScore} />
          <div className="trust-detail-list">
            <p><span>✓</span>Profile verified</p>
            <p><span>{matchCount}</span>Completed matches</p>
            <p><span>{postCount}</span>Posts shared</p>
            <p><span>{connectionCount}</span>Sporting connections</p>
          </div>
        </section>

        {/* ── Activity ─────────────────────────────────────────────────────── */}
        <section className="profile-activity panel-section">
          <div className="panel-heading">
            <div><SectionKicker>ACTIVITY</SectionKicker><h2>Your playing record.</h2></div>
          </div>
          <div className="activity-stats">
            <div><Trophy size={18} /><strong>{matchCount}</strong><span>Matches</span></div>
            <div><UsersRound size={18} /><strong>{connectionCount}</strong><span>Connections</span></div>
            <div><CalendarDays size={18} /><strong>{postCount}</strong><span>Posts</span></div>
          </div>
          <div className="activity-banner">
            <Sparkles size={17} />
            <p>Two more confirmed sessions will take your trust score into the 90s.</p>
          </div>
        </section>

        <section className="profile-qr-panel">
          <QRProfileCard name={displayName} id={me?.id} onScan={() => setQrOpen(true)} />
        </section>
      </div>

      {/* ── Edit profile modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {editOpen && (
          <ModalSurface title="Update your profile." eyebrow="EDIT IDENTITY" onClose={() => setEditOpen(false)}>
            <div style={{ display: "grid", gap: 16 }}>
              <label className="field-label">YOUR NAME<input value={editName} onChange={(e) => setEditName(e.target.value)} /></label>
              <label className="field-label">CITY<input value={editCity} onChange={(e) => setEditCity(e.target.value)} /></label>
              <label className="field-label">PRIMARY SPORT
                <select value={editSport} onChange={(e) => setEditSport(e.target.value)}>
                  {["Badminton","Cricket","Football","Basketball","Running","Chess","Swimming"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field-label">SKILL LEVEL
                <select value={editSkill} onChange={(e) => setEditSkill(e.target.value)}>
                  {["Beginner","Intermediate","Advanced"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="field-label">AVAILABILITY<input value={editAvailability} onChange={(e) => setEditAvailability(e.target.value)} /></label>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="button-outline" onClick={() => setEditOpen(false)}>Cancel</button>
                <button className="button-lime" disabled={saving} onClick={saveProfile}>
                  {saving ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />Saving…</> : <><Save size={15} />Save profile</>}
                </button>
              </div>
            </div>
          </ModalSurface>
        )}
      </AnimatePresence>

      {/* ── QR modal ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {qrOpen && (
          <ModalSurface title="Share your sports identity." eyebrow="MY CLUBOFSPORTS QR" onClose={() => setQrOpen(false)}>
            <div className="qr-modal">
              <QRProfileCard name={displayName} id={me?.id} />
              <p>Let a player preview your sporting details before adding you to their sports circle.</p>
            </div>
          </ModalSurface>
        )}
      </AnimatePresence>

      {/* ── View sport profile modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {activeSport && !editSportOpen && (
          <ModalSurface
            title={`${activeSport.sport_name} profile`}
            eyebrow="SPORT DETAILS"
            onClose={() => setActiveSport(null)}
          >
            <div className="sport-profile-modal">
              <div className="sport-profile-title">
                <span style={{ color: sports.find((s) => s.name === activeSport.sport_name)?.color ?? "#C7F25C", fontSize: 32 }}>
                  {sportGlyph[activeSport.sport_name] ?? "◈"}
                </span>
                <div>
                  <h3>{activeSport.sport_name}</h3>
                  <p>
                    {buildDetails(activeSport.sport_name, activeSport.profile_data)
                      .find((d) => ["Primary Role", "Position", "Playing Type", "Preferred Distance"].includes(d.label))?.value ?? "General"}
                  </p>
                </div>
              </div>

              <SkillIndex value={activeSport.skill_index} />

              <div className="sport-detail-grid">
                {buildDetails(activeSport.sport_name, activeSport.profile_data).map((detail) => (
                  <div key={detail.label}>
                    <span>{detail.label}</span>
                    <b>{detail.value}</b>
                  </div>
                ))}
              </div>

              <div className="sport-profile-foot">
                <Trophy size={16} />
                <span>
                  {activeSport.profile_data["matches_played"] || activeSport.profile_data["games_played"] || 0} matches played
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  className="button-lime"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setEditSportTarget(activeSport.sport_name);
                    setEditSportOpen(true);
                  }}
                >
                  <Pencil size={15} /> Edit profile
                </button>
              </div>
            </div>
          </ModalSurface>
        )}
      </AnimatePresence>

      {/* ── Edit sport profile modal (template form) ──────────────────────────── */}
      <AnimatePresence>
        {editSportOpen && editSportTarget && (
          <ModalSurface
            title={`Edit ${editSportTarget} profile`}
            eyebrow="EDIT SPORT PROFILE"
            onClose={() => { setEditSportOpen(false); setEditSportTarget(""); }}
          >
            <SportTemplateForm
              sportName={editSportTarget}
              onSaved={handleSportSaved}
              onCancel={() => { setEditSportOpen(false); setEditSportTarget(""); }}
            />
          </ModalSurface>
        )}
      </AnimatePresence>

      {/* ── Add sport modal — Stage 1: Pick sport ───────────────────────────── */}
      <AnimatePresence>
        {addSportOpen && addSportStage === "pick" && (
          <ModalSurface
            title="Add a sport to your profile."
            eyebrow="ADD SPORT"
            onClose={() => { setAddSportOpen(false); setAddSportStage("pick"); setAddSportTarget(""); }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {addableSports.length === 0 ? (
                <p style={{ fontSize: 14, opacity: 0.7, textAlign: "center", padding: "20px 0" }}>
                  You have added all available sports.
                </p>
              ) : (
                addableSports.map((s) => (
                  <button
                    key={s.id}
                    className="button-outline"
                    style={{
                      justifyContent: "flex-start", padding: "14px 16px", height: "auto",
                      border: "1px solid var(--border-color)", borderRadius: 12,
                    }}
                    onClick={() => {
                      setAddSportTarget(s.name);
                      setAddSportStage("fill");
                    }}
                  >
                    <span style={{ fontSize: 26, marginRight: 16, color: s.color }}>{s.icon}</span>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{s.name}</div>
                      <div style={{ fontSize: 13, opacity: 0.65, marginTop: 2 }}>{s.description}</div>
                    </div>
                    <ChevronRight size={17} style={{ opacity: 0.5 }} />
                  </button>
                ))
              )}
            </div>
          </ModalSurface>
        )}
      </AnimatePresence>

      {/* ── Add sport modal — Stage 2: Fill template ─────────────────────────── */}
      <AnimatePresence>
        {addSportOpen && addSportStage === "fill" && addSportTarget && (
          <ModalSurface
            title={`Set up your ${addSportTarget} profile`}
            eyebrow="SPORT PROFILE SETUP"
            onClose={() => { setAddSportOpen(false); setAddSportStage("pick"); setAddSportTarget(""); }}
          >
            <SportTemplateForm
              sportName={addSportTarget}
              onSaved={handleSportSaved}
              onCancel={() => setAddSportStage("pick")}
            />
          </ModalSurface>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
