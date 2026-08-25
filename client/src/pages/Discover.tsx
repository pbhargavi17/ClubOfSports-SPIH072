// Floodlit Clubhouse reminder: discovery is explainable, specific, and focused on a better next game.
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronDown, MapPin, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AthleteCard, ModalSurface, SectionKicker } from "@/components/ProductPrimitives";
import { cities, sports, type Athlete } from "@/lib/mock-data";
import { aiMatchAssistant, getDiscover, requestConnection, type AiMatchResult, type ApiAthlete } from "@/lib/api";

// Map an ApiAthlete from the backend to the Athlete shape used by AthleteCard
function toAthleteCard(a: ApiAthlete, index: number): Athlete {
  return {
    id: a.id,
    name: a.name,
    sport: (a.sport as any) ?? "Badminton",
    skillIndex: a.skill_index ?? 70,
    distance: "Nearby",
    availability: a.availability ?? "—",
    trustScore: a.trust_score ?? 75,
    match: a.match ?? 80,
    city: a.city,
    avatar: a.profile_image ?? `https://i.pravatar.cc/240?img=${(index % 70) + 1}`,
    verified: a.trust_score >= 80,
  };
}

export default function Discover() {
  const [sport, setSport] = useState<string>("All");
  const [city, setCity] = useState("Hyderabad");
  const [skillFilter, setSkillFilter] = useState("All skills");
  const [availFilter, setAvailFilter] = useState("All times");
  const [openDropdown, setOpenDropdown] = useState<"skill" | "avail" | null>(null);
  const [activeAthlete, setActiveAthlete] = useState<Athlete | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState("I want a badminton partner this Saturday evening within 5 km.");
  const [aiResult, setAiResult] = useState<AiMatchResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const load = useCallback(async (s: string, c: string) => {
    setLoading(true);
    try {
      const data = await getDiscover(s === "All" ? undefined : s, c);
      setAthletes(data.map(toAthleteCard));
    } catch {
      toast.error("Could not load athletes. Is the backend running?");
      setAthletes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(sport, city); }, [sport, city, load]);

  async function connect(athlete: Athlete) {
    setConnectingId(athlete.id);
    try {
      await requestConnection(athlete.id);
      toast.success(`Connection request sent to ${athlete.name}`, { description: "A better game may already be on the calendar." });
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (detail === "A connection already exists") toast.info("Already connected or request pending");
      else if (err?.response?.status === 400) toast.warning(detail ?? "Cannot connect");
      else toast.error("Could not send request");
    } finally {
      setConnectingId(null);
    }
  }

  async function runAi() {
    setAiLoading(true);
    try {
      const result = await aiMatchAssistant(prompt);
      setAiResult(result);
      if (result.sport) setSport(result.sport);
      setAiUsed(true);
      setAiOpen(false);
      toast.success("AI match complete", { description: `Filtered to ${result.sport ?? "all sports"}` });
    } catch {
      toast.error("AI assistant unavailable");
    } finally {
      setAiLoading(false);
    }
  }

  const skillOptions = ["All skills", "Beginner", "Intermediate", "Advanced"];
  const availOptions = ["All times", "Weekdays, evenings", "Weekend mornings", "Weekends"];

  const filteredAthletes = useMemo(() => {
    return athletes.filter(a => {
      // Skill filter (0-40 Beg, 41-75 Int, 76+ Adv)
      if (skillFilter === "Beginner" && a.skillIndex > 40) return false;
      if (skillFilter === "Intermediate" && (a.skillIndex <= 40 || a.skillIndex > 75)) return false;
      if (skillFilter === "Advanced" && a.skillIndex <= 75) return false;
      
      // Availability filter
      if (availFilter !== "All times" && a.availability !== availFilter && a.availability !== "—") return false;
      
      return true;
    });
  }, [athletes, skillFilter, availFilter]);

  return <AppShell title="Find your people." subtitle={`Compatible athletes around ${city}.`} action={<button className="button-lime compact-action" onClick={() => setAiOpen(true)}><Sparkles size={15} />Find with AI</button>}>
    <section className="discover-hero"><div><SectionKicker>PLAYER DISCOVERY</SectionKicker><h2>Good games start with a <em>useful match.</em></h2></div><div className="discover-filter-summary"><MapPin size={16} /><span>{city}</span><i /> <span>Within 5 km</span></div></section>
    <section className="filter-bar">
      <div className="filter-label"><SlidersHorizontal size={17} />Filters</div>
      <div className="filter-chips">
        <button className={sport === "All" ? "active" : ""} onClick={() => setSport("All")}>All sports</button>
        {sports.slice(0, 4).map((item) => (
          <button key={item.name} className={sport === item.name ? "active" : ""} onClick={() => setSport(item.name)}>{item.icon} {item.name}</button>
        ))}
      </div>
      
      <div style={{ position: "relative" }}>
        <button className={`filter-more ${skillFilter !== "All skills" ? "active" : ""}`} onClick={() => setOpenDropdown(openDropdown === "skill" ? null : "skill")}>
          {skillFilter} <ChevronDown size={15} />
        </button>
        {openDropdown === "skill" && (
          <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 6, background: "#151e1a", border: "1px solid rgba(244,242,234,.1)", borderRadius: 10, padding: 6, zIndex: 50, minWidth: 160, boxShadow: "0 10px 30px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", gap: 2 }}>
            {skillOptions.map(opt => (
              <button key={opt} style={{ textAlign: "left", padding: "9px 12px", background: skillFilter === opt ? "rgba(199,242,92,0.1)" : "transparent", color: skillFilter === opt ? "#c7f25c" : "#a6b4a8", border: "none", borderRadius: 7, fontSize: 11, fontWeight: skillFilter === opt ? 700 : 500 }} onClick={() => { setSkillFilter(opt); setOpenDropdown(null); }}>{opt}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <button className={`filter-more ${availFilter !== "All times" ? "active" : ""}`} onClick={() => setOpenDropdown(openDropdown === "avail" ? null : "avail")}>
          {availFilter} <ChevronDown size={15} />
        </button>
        {openDropdown === "avail" && (
          <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "#151e1a", border: "1px solid rgba(244,242,234,.1)", borderRadius: 10, padding: 6, zIndex: 50, minWidth: 180, boxShadow: "0 10px 30px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", gap: 2 }}>
            {availOptions.map(opt => (
              <button key={opt} style={{ textAlign: "left", padding: "9px 12px", background: availFilter === opt ? "rgba(199,242,92,0.1)" : "transparent", color: availFilter === opt ? "#c7f25c" : "#a6b4a8", border: "none", borderRadius: 7, fontSize: 11, fontWeight: availFilter === opt ? 700 : 500 }} onClick={() => { setAvailFilter(opt); setOpenDropdown(null); }}>{opt}</button>
            ))}
          </div>
        )}
      </div>
    </section>
    {aiUsed && <motion.section className="ai-result-strip" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><Sparkles size={18} /><div><b>{filteredAthletes.length} matches found</b><span>{aiResult?.sport ?? "All"} {aiResult?.time ? `• ${aiResult.time}` : ""}</span></div><button onClick={() => { setAiUsed(false); setAiResult(null); setSport("All"); }}><X size={16} /></button></motion.section>}
    <section className="discover-content">
      <div className="discover-count"><p><strong>{filteredAthletes.length}</strong> athletes ready to play</p><span>Sorted by compatibility</span></div>
      {loading ? (
        <div className="discover-grid">{[...Array(6)].map((_, i) => <div key={i} className="panel-card" style={{ height: 220, background: "rgba(255,255,255,.04)", borderRadius: 16, animation: "pulse 1.5s ease-in-out infinite" }} />)}</div>
      ) : filteredAthletes.length === 0 ? (
        <p className="empty-state">No athletes found for these filters. Try broadening your search.</p>
      ) : (
        <div className="discover-grid">{filteredAthletes.map((athlete) => <AthleteCard key={athlete.id} athlete={athlete} onConnect={() => connect(athlete)} onView={() => setActiveAthlete(athlete)} onMatch={() => setActiveAthlete(athlete)} />)}</div>
      )}
    </section>
    <section className="city-switcher"><div><SectionKicker>OTHER CITY DISCOVERY</SectionKicker><h2>Playing somewhere else?</h2></div><div>{cities.map((item) => <button key={item} onClick={() => { setCity(item); toast.success(`Discovery moved to ${item}`); }} className={city === item ? "active" : ""}>{city === item && <MapPin size={14} />}{item}</button>)}</div></section>
    <button className="ai-floating" onClick={() => setAiOpen(true)}><Sparkles size={18} /><span>Find with AI</span></button>
    <AnimatePresence>{activeAthlete && <ModalSurface title={activeAthlete.name} eyebrow={activeAthlete.sport.toUpperCase()} onClose={() => setActiveAthlete(null)}><div className="match-explain"><div><strong>{activeAthlete.match}%</strong><span>Match confidence</span></div><div className="explain-list"><p><CheckCircle2 size={17} /><span><b>Skill compatibility</b>Your {activeAthlete.skillIndex}/100 skill index is in the same playing range.</span></p><p><CheckCircle2 size={17} /><span><b>Location</b>{activeAthlete.distance} keeps a regular session realistic.</span></p><p><CheckCircle2 size={17} /><span><b>Availability</b>{activeAthlete.availability} overlaps with your schedule.</span></p><p><CheckCircle2 size={17} /><span><b>Sport compatibility</b>You both want a useful {activeAthlete.sport} game.</span></p></div><button className="button-lime wide" disabled={connectingId === activeAthlete.id} onClick={() => { connect(activeAthlete); setActiveAthlete(null); }}>Connect with {activeAthlete.name.split(" ")[0]} <ArrowRight size={16} /></button></div></ModalSurface>}</AnimatePresence>
    <AnimatePresence>{aiOpen && <ModalSurface title="Find a player in plain language." eyebrow="AI MATCH ASSISTANT" onClose={() => setAiOpen(false)}><div className="ai-modal"><p>Tell us the game you want. We will translate it into simple, explainable filters.</p><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />{aiResult && <div className="ai-translation"><span>WE UNDERSTAND</span><p><b>Sport</b><i>{aiResult.sport ?? "Any"}</i>{aiResult.time && <><b>Time</b><i>{aiResult.time}</i></>}{aiResult.distance && <><b>Distance</b><i>{aiResult.distance} km</i></>}</p></div>}<button className="button-lime wide" disabled={aiLoading} onClick={runAi}>{aiLoading ? "Analysing…" : "Show strong matches"} <ArrowRight size={16} /></button><small>This uses the real AI Match Assistant endpoint on your backend.</small></div></ModalSurface>}</AnimatePresence>
  </AppShell>;
}
