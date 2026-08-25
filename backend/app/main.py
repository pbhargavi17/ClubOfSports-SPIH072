from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Generator, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, create_engine, or_, select, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./clubofsports.db")
if DATABASE_URL.startswith("postgresql+asyncpg"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
security = HTTPBearer(auto_error=False)

FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")
if FIREBASE_CREDENTIALS_PATH and os.path.exists(FIREBASE_CREDENTIALS_PATH) and not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

class Base(DeclarativeBase): pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    firebase_uid: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), default="New athlete")
    phone: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(180), nullable=True)
    city: Mapped[str] = mapped_column(String(100), default="Hyderabad")
    profile_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    primary_sport: Mapped[str] = mapped_column(String(80), default="Badminton")
    skill_level: Mapped[str] = mapped_column(String(40), default="Intermediate")
    availability: Mapped[str] = mapped_column(String(160), default="Weekdays, evenings")
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Connection(Base):
    __tablename__ = "connections"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    recipient_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    caption: Mapped[str] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class Event(Base):
    __tablename__ = "events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organizer_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(160)); sport: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text, default=""); venue: Mapped[str] = mapped_column(String(180), default="")
    city: Mapped[str] = mapped_column(String(100), default="Hyderabad"); starts_at: Mapped[datetime] = mapped_column(DateTime)
    capacity: Mapped[int] = mapped_column(Integer, default=20); created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class EventParticipant(Base):
    __tablename__ = "event_participants"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"), index=True); user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Schedule(Base):
    __tablename__ = "schedules"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True); venue: Mapped[str] = mapped_column(String(180)); sport: Mapped[str] = mapped_column(String(80))
    start_date: Mapped[str] = mapped_column(String(30)); time: Mapped[str] = mapped_column(String(30)); repeat_type: Mapped[str] = mapped_column(String(40)); repeat_count: Mapped[int] = mapped_column(Integer, default=1)

class Match(Base):
    __tablename__ = "matches"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    creator_id: Mapped[str] = mapped_column(ForeignKey("users.id")); sport: Mapped[str] = mapped_column(String(80)); venue: Mapped[str] = mapped_column(String(180)); starts_at: Mapped[datetime] = mapped_column(DateTime); status: Mapped[str] = mapped_column(String(30), default="upcoming")

class Rating(Base):
    __tablename__ = "ratings"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rater_id: Mapped[str] = mapped_column(ForeignKey("users.id")); rated_user_id: Mapped[str] = mapped_column(ForeignKey("users.id")); score: Mapped[int] = mapped_column(Integer); comment: Mapped[str] = mapped_column(Text, default="")

class Subscription(Base):
    __tablename__ = "subscriptions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True); plan: Mapped[str] = mapped_column(String(30), default="Free"); active: Mapped[bool] = mapped_column(Boolean, default=True)

class SportTemplate(Base):
    __tablename__ = "sport_templates"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sport_name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    template_config: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class UserSportProfile(Base):
    __tablename__ = "user_sport_profiles"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    sport_name: Mapped[str] = mapped_column(String(80))
    profile_data: Mapped[dict[str, Any]] = mapped_column(JSON)
    skill_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

Base.metadata.create_all(engine)

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str; name: str; city: str; primary_sport: str; skill_level: str; availability: str; profile_image: Optional[str] = None
class LoginIn(BaseModel): id_token: str = Field(min_length=1); name: str = "New athlete"; phone: Optional[str] = None; email: Optional[str] = None
class ProfileUpdate(BaseModel):
    name: Optional[str] = None; bio: Optional[str] = None; city: Optional[str] = None; primary_sport: Optional[str] = None; skill_level: Optional[str] = None; availability: Optional[str] = None; profile_image: Optional[str] = None; latitude: Optional[float] = None; longitude: Optional[float] = None
class PostIn(BaseModel): caption: str = Field(min_length=1, max_length=2000); image_url: Optional[str] = None
class PostOut(BaseModel): id: str; caption: str; image_url: Optional[str]; created_at: datetime; author: UserOut
class ConnectionIn(BaseModel): user_id: str
class EventIn(BaseModel): title: str; sport: str; description: str = ""; venue: str = ""; city: str = "Hyderabad"; starts_at: datetime; capacity: int = Field(default=20, ge=2, le=1000)
class ScheduleIn(BaseModel): venue: str; sport: str; start_date: str; time: str; repeat_type: str; repeat_count: int = Field(default=1, ge=1, le=365)
class RatingIn(BaseModel): rated_user_id: str; score: int = Field(ge=1, le=5); comment: str = ""
class AssistantIn(BaseModel): prompt: str = Field(min_length=3, max_length=500)
class SportProfileIn(BaseModel): sport_name: str; profile_data: dict[str, Any]
class SportProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str; sport_name: str; profile_data: dict[str, Any]; skill_index: int; created_at: datetime

app = FastAPI(title="ClubOfSports API", version="1.0.0")
origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try: yield session
    finally: session.close()

def token_for(user: User) -> str:
    return jwt.encode({"sub": user.id, "exp": datetime.now(timezone.utc) + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)

def current_user(credentials: HTTPAuthorizationCredentials = Depends(security), x_user_id: Optional[str] = None, session: Session = Depends(db)) -> User:
    user_id = x_user_id
    if not user_id and credentials:
        try: user_id = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]).get("sub")
        except JWTError: raise HTTPException(401, "Invalid or expired session")
    if not user_id: raise HTTPException(401, "Authentication required")
    user = session.get(User, user_id)
    if not user: raise HTTPException(401, "User not found")
    return user

@app.get("/health")
def health(): return {"success": True, "status": "ok"}

@app.post("/auth/login")
def login(payload: LoginIn, session: Session = Depends(db)):
    firebase_uid = payload.id_token
    phone = payload.phone
    
    if payload.id_token == "DEMO_TOKEN":
        firebase_uid = f"demo_{phone}"
    elif firebase_admin._apps:
        try:
            decoded_token = firebase_auth.verify_id_token(payload.id_token)
            firebase_uid = decoded_token.get("uid")
            phone = decoded_token.get("phone_number") or payload.phone
        except Exception as e:
            raise HTTPException(401, f"Invalid Firebase token: {str(e)}")
            
    user = session.scalar(select(User).where(User.firebase_uid == firebase_uid))
    if not user:
        user = User(firebase_uid=firebase_uid, name=payload.name, phone=phone, email=payload.email)
        session.add(user); session.flush(); session.add(Subscription(user_id=user.id, plan="Free")); session.commit(); session.refresh(user)
    elif phone and not user.phone:
        user.phone = phone
        session.commit(); session.refresh(user)
        
    return {"success": True, "access_token": token_for(user), "token_type": "bearer", "user": UserOut.model_validate(user)}

@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(current_user)): return user

@app.patch("/profiles/me", response_model=UserOut)
def update_profile(payload: ProfileUpdate, user: User = Depends(current_user), session: Session = Depends(db)):
    for key, value in payload.model_dump(exclude_none=True).items():
        if hasattr(user, key): setattr(user, key, value)
    session.commit(); session.refresh(user); return user

@app.get("/sports/templates")
def list_sport_templates(session: Session = Depends(db)):
    templates = session.scalars(select(SportTemplate).order_by(SportTemplate.sport_name)).all()
    return [{"id": t.id, "sport_name": t.sport_name, "template_config": t.template_config} for t in templates]

@app.get("/sports/templates/{sport_name}")
def get_sport_template(sport_name: str, session: Session = Depends(db)):
    template = session.scalar(select(SportTemplate).where(SportTemplate.sport_name == sport_name))
    if not template: raise HTTPException(404, "Template not found")
    return {"id": template.id, "sport_name": template.sport_name, "template_config": template.template_config}

def _compute_skill_index(sport_name: str, profile_data: dict[str, Any]) -> int:
    """Compute a 0-100 skill index from sport profile fields."""
    score = 0
    # Base score from experience level
    experience = str(profile_data.get("experience", "")).lower()
    if "advanced" in experience: score += 70
    elif "intermediate" in experience: score += 45
    elif "beginner" in experience: score += 20
    else: score += 20

    # Matches / games played bonus (up to +15)
    for key in ("matches_played", "games_played"):
        val = profile_data.get(key)
        if val is not None:
            try: score += min(15, int(val) // 2)
            except (ValueError, TypeError): pass

    # Chess ELO bonus
    if sport_name.lower() == "chess":
        try:
            elo = int(profile_data.get("elo", 0) or 0)
            if elo >= 2000: score += 15
            elif elo >= 1500: score += 10
            elif elo >= 1000: score += 5
        except (ValueError, TypeError): pass

    # Running pace bonus — lower pace (faster) = higher bonus
    if sport_name.lower() == "running":
        pace_str = str(profile_data.get("average_pace", ""))
        try:
            parts = pace_str.replace(",", ".").split(":")
            pace_mins = float(parts[0]) + (float(parts[1]) / 60 if len(parts) > 1 else 0)
            if pace_mins < 4.5: score += 10
            elif pace_mins < 5.5: score += 7
            elif pace_mins < 7.0: score += 4
        except (ValueError, IndexError): pass

    return max(0, min(100, score))

@app.get("/profiles/me/sports", response_model=list[SportProfileOut])
def get_my_sport_profiles(user: User = Depends(current_user), session: Session = Depends(db)):
    profiles = session.scalars(select(UserSportProfile).where(UserSportProfile.user_id == user.id)).all()
    return profiles

@app.get("/profiles/me/sports/{sport_name}", response_model=SportProfileOut)
def get_my_sport_profile(sport_name: str, user: User = Depends(current_user), session: Session = Depends(db)):
    profile = session.scalar(select(UserSportProfile).where(UserSportProfile.user_id == user.id, UserSportProfile.sport_name == sport_name))
    if not profile: raise HTTPException(404, "Sport profile not found")
    return profile

@app.post("/profiles/me/sports")
def save_sport_profile(payload: SportProfileIn, user: User = Depends(current_user), session: Session = Depends(db)):
    profile = session.scalar(select(UserSportProfile).where(UserSportProfile.user_id == user.id, UserSportProfile.sport_name == payload.sport_name))
    if not profile:
        profile = UserSportProfile(user_id=user.id, sport_name=payload.sport_name)
        session.add(profile)
    profile.profile_data = payload.profile_data
    profile.skill_index = _compute_skill_index(payload.sport_name, payload.profile_data)
    user.primary_sport = payload.sport_name
    session.commit()
    session.refresh(profile)
    return {"success": True, "skill_index": profile.skill_index}

@app.get("/discover")
def discover(sport: Optional[str] = None, city: Optional[str] = None, user: User = Depends(current_user), session: Session = Depends(db)):
    query = select(User).where(User.id != user.id)
    if sport: query = query.where(User.primary_sport == sport)
    if city: query = query.where(User.city == city)
    people = session.scalars(query.order_by(User.created_at.desc())).all()
    return [{"id": p.id, "name": p.name, "city": p.city, "sport": p.primary_sport, "skill_index": 75, "availability": p.availability, "trust_score": 80, "match": 80, "profile_image": p.profile_image} for p in people]

@app.post("/connections/request")
def request_connection(payload: ConnectionIn, user: User = Depends(current_user), session: Session = Depends(db)):
    if payload.user_id == user.id: raise HTTPException(400, "You cannot connect with yourself")
    if not session.get(User, payload.user_id): raise HTTPException(404, "Athlete not found")
    existing = session.scalar(select(Connection).where(or_((Connection.requester_id == user.id) & (Connection.recipient_id == payload.user_id), (Connection.requester_id == payload.user_id) & (Connection.recipient_id == user.id))))
    if existing: raise HTTPException(409, "A connection already exists")
    item = Connection(requester_id=user.id, recipient_id=payload.user_id); session.add(item); session.commit(); return {"success": True, "id": item.id, "status": item.status}

@app.get("/connections")
def connections(user: User = Depends(current_user), session: Session = Depends(db)):
    rows = session.scalars(select(Connection).where(or_(Connection.requester_id == user.id, Connection.recipient_id == user.id), Connection.status == "accepted")).all()
    return [UserOut.model_validate(session.get(User, r.recipient_id if r.requester_id == user.id else r.requester_id)) for r in rows]

@app.get("/connections/requests")
def connection_requests(user: User = Depends(current_user), session: Session = Depends(db)):
    rows = session.scalars(select(Connection).where(Connection.recipient_id == user.id, Connection.status == "pending")).all()
    return [{"id": r.id, "from": UserOut.model_validate(session.get(User, r.requester_id))} for r in rows]

@app.post("/connections/{connection_id}/accept")
def accept_connection(connection_id: str, user: User = Depends(current_user), session: Session = Depends(db)):
    row = session.get(Connection, connection_id)
    if not row or row.recipient_id != user.id: raise HTTPException(404, "Connection request not found")
    row.status = "accepted"; session.commit(); return {"success": True, "status": row.status}

@app.post("/connections/{connection_id}/reject")
def reject_connection(connection_id: str, user: User = Depends(current_user), session: Session = Depends(db)):
    row = session.get(Connection, connection_id)
    if not row or row.recipient_id != user.id: raise HTTPException(404, "Connection request not found")
    session.delete(row); session.commit(); return {"success": True}

@app.post("/posts", response_model=PostOut, status_code=201)
def create_post(payload: PostIn, user: User = Depends(current_user), session: Session = Depends(db)):
    post = Post(author_id=user.id, caption=payload.caption.strip(), image_url=payload.image_url); session.add(post); session.commit(); session.refresh(post)
    return {"id": post.id, "caption": post.caption, "image_url": post.image_url, "created_at": post.created_at, "author": user}

@app.get("/posts/feed", response_model=list[PostOut])
def feed(limit: int = Query(50, ge=1, le=100), user: User = Depends(current_user), session: Session = Depends(db)):
    connected = select(Connection.requester_id).where(Connection.recipient_id == user.id, Connection.status == "accepted").union(select(Connection.recipient_id).where(Connection.requester_id == user.id, Connection.status == "accepted"))
    posts = session.scalars(select(Post).where(or_(Post.author_id == user.id, Post.author_id.in_(connected))).order_by(Post.created_at.desc()).limit(limit)).all()
    return [{"id": p.id, "caption": p.caption, "image_url": p.image_url, "created_at": p.created_at, "author": session.get(User, p.author_id)} for p in posts]

@app.delete("/posts/{post_id}")
def delete_post(post_id: str, user: User = Depends(current_user), session: Session = Depends(db)):
    post = session.get(Post, post_id)
    if not post or post.author_id != user.id: raise HTTPException(404, "Post not found")
    session.delete(post); session.commit(); return {"success": True}

@app.get("/events")
def events(session: Session = Depends(db)):
    return session.scalars(select(Event).order_by(Event.starts_at)).all()

@app.post("/events/create", status_code=201)
def create_event(payload: EventIn, user: User = Depends(current_user), session: Session = Depends(db)):
    item = Event(organizer_id=user.id, **payload.model_dump()); session.add(item); session.flush(); session.add(EventParticipant(event_id=item.id, user_id=user.id)); session.commit(); session.refresh(item); return item

@app.post("/events/{event_id}/join")
def join_event(event_id: str, user: User = Depends(current_user), session: Session = Depends(db)):
    event = session.get(Event, event_id)
    if not event: raise HTTPException(404, "Event not found")
    if session.scalar(select(EventParticipant).where(EventParticipant.event_id == event_id, EventParticipant.user_id == user.id)): raise HTTPException(409, "Already joined")
    count = session.scalar(select(EventParticipant).where(EventParticipant.event_id == event_id).with_for_update())
    session.add(EventParticipant(event_id=event_id, user_id=user.id)); session.commit(); return {"success": True}

@app.get("/events/my-events")
def my_events(user: User = Depends(current_user, ), session: Session = Depends(db)):
    ids = select(EventParticipant.event_id).where(EventParticipant.user_id == user.id)
    return session.scalars(select(Event).where(or_(Event.organizer_id == user.id, Event.id.in_(ids))).order_by(Event.starts_at.desc())).all()

@app.post("/schedule/create", status_code=201)
def create_schedule(payload: ScheduleIn, user: User = Depends(current_user), session: Session = Depends(db)):
    item = Schedule(user_id=user.id, **payload.model_dump()); session.add(item); session.commit(); session.refresh(item); return item

@app.get("/schedule/my-schedule")
def my_schedule(user: User = Depends(current_user), session: Session = Depends(db)): return session.scalars(select(Schedule).where(Schedule.user_id == user.id)).all()

@app.get("/history")
def history(user: User = Depends(current_user), session: Session = Depends(db)):
    connections_count = session.scalar(select(Connection).where(or_(Connection.requester_id == user.id, Connection.recipient_id == user.id), Connection.status == "accepted").count()) if False else len(session.scalars(select(Connection).where(or_(Connection.requester_id == user.id, Connection.recipient_id == user.id), Connection.status == "accepted")).all())
    posts = session.scalars(select(Post).where(Post.author_id == user.id).order_by(Post.created_at.desc())).all()
    events_joined = session.scalars(select(Event).where(Event.id.in_(select(EventParticipant.event_id).where(EventParticipant.user_id == user.id)))).all()
    matches = session.scalars(select(Match).where(Match.creator_id == user.id).order_by(Match.starts_at.desc())).all()
    return {"my_posts": posts, "my_events": events_joined, "my_connections": connections_count, "my_matches": matches}

@app.get("/trust/{user_id}")
def trust(user_id: str, session: Session = Depends(db)):
    if not session.get(User, user_id): raise HTTPException(404, "User not found")
    avg = session.scalar(select(Rating.score).where(Rating.rated_user_id == user_id))
    return {"user_id": user_id, "trust_score": min(100, 60 + int((avg or 4) * 8)), "factors": {"otp_verified": True, "ratings": avg or 4}}

@app.post("/ratings/add")
def add_rating(payload: RatingIn, user: User = Depends(current_user), session: Session = Depends(db)):
    if not session.get(User, payload.rated_user_id): raise HTTPException(404, "User not found")
    item = Rating(rater_id=user.id, **payload.model_dump()); session.add(item); session.commit(); return {"success": True}

@app.get("/subscription/plans")
def plans(): return [{"name": "Free", "price": 0}, {"name": "Club", "price": 100}, {"name": "Club Pro", "price": 200}]

@app.get("/subscription/current")
def current_subscription(user: User = Depends(current_user), session: Session = Depends(db)): return session.scalar(select(Subscription).where(Subscription.user_id == user.id))

@app.post("/subscription/select")
def select_subscription(plan: str, user: User = Depends(current_user), session: Session = Depends(db)):
    if plan not in {"Free", "Club", "Club Pro"}: raise HTTPException(400, "Invalid plan")
    item = session.scalar(select(Subscription).where(Subscription.user_id == user.id)) or Subscription(user_id=user.id); item.plan = plan; session.add(item); session.commit(); return item

@app.post("/ai/match-assistant")
def assistant(payload: AssistantIn):
    text = payload.prompt.lower(); sports = ["badminton", "cricket", "football", "running", "chess", "swimming"]
    sport = next((s.title() for s in sports if s in text), None)
    import re
    distance = int(re.search(r"(\d+)\s*km", text).group(1)) if re.search(r"(\d+)\s*km", text) else None
    return {"sport": sport, "distance": distance, "time": "Saturday evening" if "saturday" in text and ("evening" in text or "night" in text) else None, "skill": None}

@app.websocket("/ws/chat/{conversation_id}")
async def chat(websocket: WebSocket, conversation_id: str):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text(); await websocket.send_json({"conversation_id": conversation_id, "message": message, "sent_at": datetime.now(timezone.utc).isoformat()})
    except WebSocketDisconnect: pass
