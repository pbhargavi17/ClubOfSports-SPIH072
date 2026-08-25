import os
import sys
import random
import uuid
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.main import SessionLocal, User, Event, EventParticipant, Subscription, Post, Connection

def seed_random_data():
    session = SessionLocal()
    try:
        # Create random users
        first_names = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Sam", "Jamie"]
        last_names = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson"]
        sports = ["Badminton", "Cricket", "Football", "Running", "Tennis", "Basketball"]
        cities = ["Hyderabad", "Bangalore", "Mumbai", "Delhi", "Chennai", "Pune"]
        skill_levels = ["Beginner", "Intermediate", "Advanced", "Professional"]

        new_users = []
        for i in range(10):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            name = f"{first_name} {last_name}"
            email = f"{first_name.lower()}.{last_name.lower()}{random.randint(10, 99)}@example.com"
            firebase_uid = f"fake_uid_{uuid.uuid4().hex[:10]}"
            
            user = User(
                firebase_uid=firebase_uid,
                name=name,
                phone=f"98765{random.randint(10000, 99999)}",
                email=email,
                city=random.choice(cities),
                primary_sport=random.choice(sports),
                skill_level=random.choice(skill_levels),
                availability=random.choice(["Weekends", "Weekday evenings", "Flexible"]),
            )
            session.add(user)
            session.flush()
            session.add(Subscription(user_id=user.id, plan="Free"))
            new_users.append(user)
            print(f"Created user: {name} ({email}) - {user.primary_sport}")

        session.commit()
        
        # Create random events
        for i in range(5):
            organizer = random.choice(new_users)
            sport = random.choice(sports)
            event = Event(
                organizer_id=organizer.id,
                title=f"Weekend {sport} Match",
                sport=sport,
                description=f"Looking for players for a friendly {sport.lower()} game.",
                venue=f"Stadium {random.randint(1, 10)}",
                city=organizer.city,
                starts_at=datetime.now(timezone.utc) + timedelta(days=random.randint(1, 14), hours=random.randint(0, 23)),
                capacity=random.randint(4, 20)
            )
            session.add(event)
            session.flush()
            
            # Organizer joins automatically
            session.add(EventParticipant(event_id=event.id, user_id=organizer.id))
            
            # Random other users join
            participants = random.sample(new_users, random.randint(1, min(4, len(new_users)-1)))
            for p in participants:
                if p.id != organizer.id:
                    session.add(EventParticipant(event_id=event.id, user_id=p.id))
                    
            print(f"Created event: {event.title} in {event.city}")
            
        session.commit()
        
        # Create random posts
        for i in range(15):
            author = random.choice(new_users)
            post = Post(
                author_id=author.id,
                caption=f"Had a great time playing {author.primary_sport} today! #sports #fitness {random.choice(['🏸', '🏏', '⚽', '🏃', '🎾', '🏀'])}",
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 10), hours=random.randint(0, 23))
            )
            session.add(post)
            
        session.commit()
        print(f"Created 15 posts.")
        
        # Create connections between users
        for i in range(15):
            user1, user2 = random.sample(new_users, 2)
            # Check if connection exists
            existing = session.query(Connection).filter(
                ((Connection.requester_id == user1.id) & (Connection.recipient_id == user2.id)) |
                ((Connection.requester_id == user2.id) & (Connection.recipient_id == user1.id))
            ).first()
            
            if not existing:
                status = random.choice(["pending", "accepted", "accepted", "accepted"]) # Higher chance of accepted
                conn = Connection(
                    requester_id=user1.id,
                    recipient_id=user2.id,
                    status=status
                )
                session.add(conn)
                
        session.commit()
        print("Created connections.")
        
        print("\nSuccessfully seeded random data!")
        
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_random_data()
