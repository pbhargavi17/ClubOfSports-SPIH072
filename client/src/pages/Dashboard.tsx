import { ArrowRight, CalendarDays, ChevronRight, CircleCheck, Clock3, ImagePlus, MapPin, Plus, Send, UsersRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import { AthleteCard, EventCard, ScheduleCard, SectionKicker, SkillIndex, TrustScore } from "@/components/ProductPrimitives";
import { athletes, events, schedules, userSportProfiles } from "@/lib/mock-data";
import { createPost, getFeed, getMe, type ApiUser, type FeedPost } from "@/lib/api";
import { toast } from "sonner";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [imageName, setImageName] = useState("");
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [posting, setPosting] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [me, setMe] = useState<ApiUser | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFeed().then(setFeed).catch(() => setFeed([])).finally(() => setLoadingFeed(false));
    getMe().then(user => { if (user) setMe(user); }).catch(() => {});
  }, []);

  function resetComposer() {
    setCaption("");
    setImageUrl(undefined);
    setImageName("");
    setPostOpen(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function selectImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Please choose an image smaller than 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { setImageUrl(String(reader.result)); setImageName(file.name); };
    reader.readAsDataURL(file);
  }

  async function publish() {
    if (!caption.trim()) return;
    setPosting(true);
    try {
      const post = await createPost(caption.trim(), imageUrl);
      setFeed((current) => [post, ...current]);
      resetComposer();
      toast.success("Posted to your connections");
    } catch { toast.error("Could not publish right now", { description: "Make sure the backend is running." }); }
    finally { setPosting(false); }
  }

  const firstName = me?.name?.split(" ")[0] ?? "Athlete";
  return <AppShell title={`${getGreeting()}, ${firstName}.`} subtitle="The right session is closer than you think." action={<Link href="/app/discover" className="button-lime compact-action">Find players <ArrowRight size={15} /></Link>}>
    <div className="dashboard-grid">
      <section className="today-card"><div className="today-copy"><SectionKicker>YOUR NEXT PLAY</SectionKicker><h2>Saturday doubles<br />is <em>taking shape.</em></h2><p>Ananya is free at 6:00 PM, and a court is open at XYZ Sports Arena.</p><div className="today-meta"><span><CalendarDays size={16} />Saturday, 24 Aug</span><span><Clock3 size={16} />6:00 PM</span><span><MapPin size={16} />2.4 km away</span></div><button className="button-lime" onClick={() => toast.success("Match held for Saturday", { description: "See you on court." })}>View the match <ChevronRight size={16} /></button></div><div className="today-orbit"><div className="orbit-ring ring-a" /><div className="orbit-ring ring-b" /><div className="orbit-ball"><span>⌁</span></div><div className="orbit-player one"><img src={athletes[0].avatar} alt="" /></div><div className="orbit-player two"><img src={athletes[0].avatar} alt="" /></div></div></section>
      <section className="panel-section" style={{ gridColumn: "1 / -1" }}><div className="panel-heading"><div><SectionKicker>YOUR CLUB FEED</SectionKicker><h2>What your people are playing.</h2></div><span className="text-muted"><UsersRound size={15} /> Connections only</span></div><div style={{ display: "grid", gap: 14, gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.5fr)" }}><div className="panel-card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 190 }}><div><p className="section-kicker"><span />SHARE AN UPDATE</p><h3 style={{ margin: "8px 0 6px" }}>Keep your circle in the loop.</h3><p className="text-muted">Post a caption and a moment from your latest session.</p></div><button className="button-lime" onClick={() => setPostOpen(true)} style={{ alignSelf: "flex-start", marginTop: 16 }}><Plus size={15} /> Create a post</button></div><div style={{ display: "grid", gap: 10 }}>{loadingFeed && <p className="empty-state">Loading your connection feed…</p>}{!loadingFeed && feed.length === 0 && <p className="empty-state">No posts yet. Share the first update with your connections.</p>}{feed.map((post) => <article key={post.id} className="panel-card" style={{ padding: 18 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><img src={post.author.profile_image || athletes[0].avatar} alt="" className="top-avatar" /><div><strong>{post.author.name}</strong><p className="text-muted">{post.author.city} · {new Date(post.created_at).toLocaleString()}</p></div></div>{post.image_url && <img src={post.image_url} alt="Post attachment" style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12, marginTop: 14 }} />}<p style={{ margin: "14px 0 0", lineHeight: 1.6 }}>{post.caption}</p></article>)}</div></div></section>
      <section className="sports-summary panel-section"><div className="panel-heading"><div><SectionKicker>YOUR SPORTS</SectionKicker><h2>Keep your edge.</h2></div><Link href="/app/profile" className="text-link">View profile <ArrowRight size={15} /></Link></div><div className="sport-summary-list">{userSportProfiles.map((profile) => <article key={profile.sport}><div className="sport-summary-icon">{profile.sport === "Badminton" ? "⌁" : "◒"}</div><div><h3>{profile.sport}</h3><p>{profile.speciality}</p></div><SkillIndex value={profile.skillIndex} compact /></article>)}</div></section>
      <section className="nearby-card"><div className="nearby-visual"><div className="nearby-ping ping-one" /><div className="nearby-ping ping-two" /><span className="nearby-center">A</span></div><div><SectionKicker>NEARBY</SectionKicker><strong>12 athletes<br />near you</strong><Link href="/app/discover" className="text-link">Explore nearby <ArrowRight size={15} /></Link></div></section>
      <section className="recommend-section panel-section"><div className="panel-heading"><div><SectionKicker>RECOMMENDED</SectionKicker><h2>Designed for your rhythm.</h2></div><Link href="/app/discover" className="text-link">See all <ArrowRight size={15} /></Link></div><div className="athlete-grid">{athletes.slice(0, 3).map((athlete) => <AthleteCard key={athlete.id} athlete={athlete} onConnect={() => toast.success(`Connection request sent to ${athlete.name}`)} onView={() => toast.info(`${athlete.name}'s profile is ready to view in Discover.`)} onMatch={() => toast.info("This match is built on sport, skill, location and availability.")} />)}</div></section>
      <section className="schedule-section panel-section"><div className="panel-heading"><div><SectionKicker>THIS WEEK</SectionKicker><h2>Make time for play.</h2></div><button className="button-outline small" onClick={() => toast.info("Use Events to plan a new session.")}><Plus size={15} />Add session</button></div><div className="schedule-list">{schedules.map((schedule) => <ScheduleCard key={schedule.id} schedule={schedule} />)}</div></section>
      <section className="trust-card"><TrustScore value={84} /><div className="trust-breakdown"><p><CircleCheck size={16} />Profile complete</p><p><CircleCheck size={16} />12 completed matches</p><p><CircleCheck size={16} />10 confirmed sessions</p></div></section>
      <section className="near-events panel-section"><div className="panel-heading"><div><SectionKicker>NEARBY EVENTS</SectionKicker><h2>Join a shared starting line.</h2></div><Link href="/app/events" className="text-link">All events <ArrowRight size={15} /></Link></div><div className="event-stack">{events.slice(0, 2).map((event) => <EventCard event={event} key={event.id} onView={() => toast.info(`${event.name} opens in Events.`)} />)}</div></section>
    </div>
    {postOpen && <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) resetComposer(); }} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(7, 10, 9, .78)", display: "grid", placeItems: "center", padding: 20 }}><section role="dialog" aria-modal="true" aria-labelledby="post-dialog-title" className="panel-card" style={{ width: "min(560px, 100%)", padding: 24, background: "#151b18", border: "1px solid rgba(199,242,92,.24)", boxShadow: "0 24px 80px rgba(0,0,0,.42)" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}><div><p className="section-kicker"><span />NEW CLUB UPDATE</p><h2 id="post-dialog-title" style={{ margin: "8px 0 0" }}>Share with your people.</h2><p className="text-muted" style={{ marginTop: 6 }}>Your post will be visible to accepted connections.</p></div><button className="icon-button" onClick={resetComposer} aria-label="Close post composer"><X size={20} /></button></div><label className="field-label" style={{ display: "block", marginTop: 22 }}>CAPTION<textarea autoFocus value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="What are you playing, learning, or celebrating?" rows={5} maxLength={2000} style={{ width: "100%", resize: "vertical", marginTop: 8 }} /></label><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, flexWrap: "wrap" }}><input ref={imageInputRef} type="file" accept="image/*" hidden onChange={(event) => selectImage(event.target.files?.[0])} /><button className="button-outline small" type="button" onClick={() => imageInputRef.current?.click()}><ImagePlus size={16} /> {imageName || "Add image"}</button>{imageUrl && <button className="text-button" type="button" onClick={() => { setImageUrl(undefined); setImageName(""); if (imageInputRef.current) imageInputRef.current.value = ""; }}>Remove image</button>}<span className="text-muted" style={{ marginLeft: "auto" }}>{caption.length}/2000</span></div>{imageUrl && <img src={imageUrl} alt="Selected post preview" style={{ width: "100%", maxHeight: 230, objectFit: "cover", borderRadius: 12, marginTop: 16 }} />}<div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}><button className="button-outline" type="button" onClick={resetComposer}>Cancel</button><button className="button-lime" type="button" disabled={posting || !caption.trim()} onClick={publish}><Send size={15} />{posting ? "Publishing…" : "Publish post"}</button></div></section></div>}
  </AppShell>;
}
