// Floodlit Clubhouse reminder: connections are trusted sports relationships, never follower counts or a generic social feed.
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, MessageCircle, QrCode, ScanLine, Send, Trophy, UserPlus, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ModalSurface, QRProfileCard, SectionKicker } from "@/components/ProductPrimitives";
import { starterMessages, type Message } from "@/lib/mock-data";
import {
  acceptConnection, getConnectionRequests, getConnections, rejectConnection,
  type ApiConnection, type ApiConnectionRequest
} from "@/lib/api";

type Tab = "requests" | "friends" | "chats";

export default function Connections() {
  const [tab, setTab] = useState<Tab>("requests");
  const [qrOpen, setQrOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [draft, setDraft] = useState("");

  // Real API state
  const [friends, setFriends] = useState<ApiConnection[]>([]);
  const [requests, setRequests] = useState<ApiConnectionRequest[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    getConnections()
      .then(setFriends)
      .catch(() => setFriends([]))
      .finally(() => setLoadingFriends(false));

    getConnectionRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoadingRequests(false));
  }, []);

  async function accept(req: ApiConnectionRequest) {
    setProcessingId(req.id);
    try {
      await acceptConnection(req.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setFriends(prev => [...prev, req.from]);
      toast.success(`${req.from.name} is now in your sports circle.`);
    } catch {
      toast.error("Could not accept request");
    } finally {
      setProcessingId(null);
    }
  }

  async function reject(req: ApiConnectionRequest) {
    setProcessingId(req.id);
    try {
      await rejectConnection(req.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      toast.info("Request declined.");
    } catch {
      toast.error("Could not decline request");
    } finally {
      setProcessingId(null);
    }
  }

  const send = () => {
    if (!draft.trim()) return;
    setMessages([...messages, { id: String(Date.now()), from: "me", text: draft, time: "Now" }]);
    setDraft("");
  };

  const firstFriend = friends[0];
  const secondFriend = friends[1];

  return <AppShell title="Your sports circle." subtitle="People you can actually make plans with." action={<div className="connection-actions"><button className="button-outline compact-action" onClick={() => setQrOpen(true)}><QrCode size={15} />My QR</button><button className="button-lime compact-action" onClick={() => setScanOpen(true)}><ScanLine size={15} />Scan QR</button></div>}>
    <section className="connections-hero"><div><SectionKicker>PLAYING PARTNERS, NOT FOLLOWERS</SectionKicker><h2>Keep the people<br />who <em>show up.</em></h2></div><div className="connection-stat"><UsersRound size={20} /><div><b>{friends.length} connections</b><span>Your club gets stronger by playing.</span></div></div></section>
    <div className="connections-tabs" role="tablist">{(["requests", "friends", "chats"] as Tab[]).map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item === "requests" && requests.length > 0 ? `Requests · ${requests.length}` : item}</button>)}</div>

    {tab === "requests" && <section className="connection-body">
      <div className="requests-header"><div><SectionKicker>CONNECTION REQUESTS</SectionKicker><h2>{requests.length > 0 ? "Someone's ready to play." : "You're all caught up."}</h2></div></div>
      {loadingRequests && <p className="empty-state">Loading requests…</p>}
      {!loadingRequests && requests.length === 0 && <div className="caught-up"><span><CheckCircle2 size={24} /></span><h3>Your circle is ready for the next game.</h3><p>Head to Discover to find another compatible player.</p><button className="button-outline" onClick={() => setTab("friends")}>See friends <ArrowRight size={16} /></button></div>}
      {requests.map(req => (
        <article className="request-card" key={req.id}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(199,242,92,.15)", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 700, color: "#c7f25c", flexShrink: 0 }}>
            {req.from.profile_image ? <img src={req.from.profile_image} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} /> : req.from.name[0]}
          </div>
          <div>
            <div><h3>{req.from.name}</h3><span>{req.from.primary_sport} • {req.from.city}</span></div>
            <p>"{req.from.name} wants to connect with you."</p>
            <small><CheckCircle2 size={14} />{req.from.skill_level} • {req.from.availability}</small>
          </div>
          <div className="request-actions">
            <button className="button-outline" disabled={processingId === req.id} onClick={() => reject(req)}>Decline</button>
            <button className="button-lime" disabled={processingId === req.id} onClick={() => accept(req)}>Accept <Check size={16} /></button>
          </div>
        </article>
      ))}
    </section>}

    {tab === "friends" && <section className="connection-body friends-list">
      <div className="panel-heading"><div><SectionKicker>YOUR FRIENDS</SectionKicker><h2>People in your playing orbit.</h2></div><button className="button-outline small" onClick={() => setScanOpen(true)}><UserPlus size={15} />Add friend</button></div>
      {loadingFriends && <p className="empty-state">Loading connections…</p>}
      {!loadingFriends && friends.length === 0 && <p className="empty-state">No connections yet. Head to Discover to find and connect with athletes.</p>}
      {friends.map((conn) => (
        <article className="friend-row" key={conn.id}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(199,242,92,.15)", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 700, color: "#c7f25c", flexShrink: 0 }}>
            {conn.profile_image ? <img src={conn.profile_image} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} /> : conn.name[0]}
          </div>
          <div><h3>{conn.name}</h3><p>{conn.primary_sport} • {conn.city}</p></div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{conn.skill_level}</span>
          <button className="button-outline small" onClick={() => setTab("chats")}><MessageCircle size={15} />Chat</button>
        </article>
      ))}
    </section>}

    {tab === "chats" && <section className="chat-layout">
      <aside className="chat-list">
        <SectionKicker>CHATS</SectionKicker>
        {firstFriend && <button className="chat-person active"><div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(199,242,92,.15)", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, color: "#c7f25c" }}>{firstFriend.profile_image ? <img src={firstFriend.profile_image} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} /> : firstFriend.name[0]}</div><span><b>{firstFriend.name}</b><small>Shall we lock it in?</small></span><i>Now</i></button>}
        {secondFriend && <button className="chat-person"><div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(199,242,92,.15)", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, color: "#c7f25c" }}>{secondFriend.profile_image ? <img src={secondFriend.profile_image} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} /> : secondFriend.name[0]}</div><span><b>{secondFriend.name}</b><small>Saturday morning works.</small></span></button>}
        {!loadingFriends && friends.length === 0 && <p className="empty-state" style={{ fontSize: 13 }}>No connections yet.</p>}
      </aside>
      <section className="chat-panel">
        <header>
          <div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(199,242,92,.15)", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, color: "#c7f25c" }}>{firstFriend?.profile_image ? <img src={firstFriend.profile_image} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} /> : (firstFriend?.name[0] ?? "?")}</div>
            <span><b>{firstFriend?.name ?? "No connections yet"}</b><small>{firstFriend?.primary_sport ?? "—"} • {firstFriend?.city ?? "—"}</small></span>
          </div>
          <button className="button-outline small" onClick={() => setMatchOpen(true)}><Trophy size={15} />Confirm match</button>
        </header>
        <div className="messages">{messages.map((message) => <div className={message.from === "me" ? "mine" : "theirs"} key={message.id}><p>{message.text}</p><small>{message.time}</small></div>)}</div>
        <form className="chat-input" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Keep it about the game…" /><button type="submit" aria-label="Send message"><Send size={17} /></button></form>
      </section>
    </section>}

    <AnimatePresence>{qrOpen && <ModalSurface title="Share your sports identity." eyebrow="MY CLUBOFSPORTS QR" onClose={() => setQrOpen(false)}><div className="qr-modal"><QRProfileCard onScan={() => { setQrOpen(false); setScanOpen(true); }} /><p>Show this code after a game or at an event. A new player can view your profile before adding you to their sports circle.</p></div></ModalSurface>}</AnimatePresence>
    <AnimatePresence>{scanOpen && <ModalSurface title="Scan a player's code." eyebrow="ADD A FRIEND" onClose={() => setScanOpen(false)}><div className="scan-modal"><div className="scanner-frame"><ScanLine size={32} /><span>Camera preview is simulated in this frontend prototype.</span></div><div className="scan-preview"><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&q=85" alt="Mira Joshi" /><div><b>Mira Joshi</b><span>Badminton • Hyderabad</span><small>Verified athlete identity</small></div></div><button className="button-lime wide" onClick={() => { toast.success("Mira added to your sports circle."); setScanOpen(false); }}>Add friend <UserPlus size={16} /></button></div></ModalSurface>}</AnimatePresence>
    <AnimatePresence>{matchOpen && <ModalSurface title="Match confirmed." eyebrow="BADMINTON • SATURDAY" onClose={() => setMatchOpen(false)}><div className="match-confirm"><div className="confirmed-icon"><Trophy size={25} /></div><h3>Saturday, 24 Aug<br />6:00 PM</h3><p>XYZ Sports Arena<br />You + {firstFriend?.name ?? "Friend"}</p><button className="button-lime wide" onClick={() => { toast.success("Added to your schedule.", { description: "You're both playing Saturday. See you on court." }); setMatchOpen(false); }}>Add to my schedule <ArrowRight size={16} /></button></div></ModalSurface>}</AnimatePresence>
  </AppShell>;
}
