import os
import sys

# Add the backend directory to sys.path so we can import app.main
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta, timezone
from app.main import SessionLocal, User, Event, EventParticipant, Subscription

def seed():
    session = SessionLocal()
    try:
        # Get or create a user
        user = session.query(User).first()
        if not user:
            print("No users found. Creating a default user...")
            user = User(
                firebase_uid="dummy_firebase_uid_123",
                name="System Organizer",
                phone="1234567890",
                email="admin@clubofsports.com"
            )
            session.add(user)
            session.flush()
            session.add(Subscription(user_id=user.id, plan="Free"))
            session.commit()
            session.refresh(user)
            print(f"Created user: {user.name} with ID: {user.id}")
        else:
            print(f"Using existing user: {user.name} with ID: {user.id}")

        # Create events
        events_to_create = [
            Event(
                organizer_id=user.id,
                title="Weekend Badminton Doubles",
                sport="Badminton",
                description="Join us for a friendly badminton doubles match.",
                venue="Gachibowli Indoor Stadium",
                city="Hyderabad",
                starts_at=datetime.now(timezone.utc) + timedelta(days=2),
                capacity=4
            ),
            Event(
                organizer_id=user.id,
                title="Morning 5K Run",
                sport="Running",
                description="A casual 5K run around KBR park.",
                venue="KBR Park Main Gate",
                city="Hyderabad",
                starts_at=datetime.now(timezone.utc) + timedelta(days=1, hours=2),
                capacity=20
            ),
            Event(
                organizer_id=user.id,
                title="Sunday Cricket Match",
                sport="Cricket",
                description="Looking for players for an 11-a-side match.",
                venue="LB Stadium",
                city="Hyderabad",
                starts_at=datetime.now(timezone.utc) + timedelta(days=5),
                capacity=22
            )
        ]
        
        for event in events_to_create:
            session.add(event)
            session.flush()
            # Also add the organizer as a participant
            participant = EventParticipant(event_id=event.id, user_id=user.id)
            session.add(participant)
            print(f"Created event: {event.title}")
            
        session.commit()
        print("Successfully created events.")
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed()
