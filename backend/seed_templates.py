import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import SessionLocal, SportTemplate

def seed_templates():
    session = SessionLocal()
    try:
        templates = [
            {
                "sport_name": "Badminton",
                "template_config": {
                    "fields": [
                        {"name": "playing_type", "label": "Playing Type", "type": "select", "options": ["Singles", "Doubles", "Both"]},
                        {"name": "experience", "label": "Experience Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]},
                        {"name": "playing_style", "label": "Playing Style", "type": "select", "options": ["Offensive", "Defensive", "Balanced"]},
                        {"name": "matches_played", "label": "Matches Played", "type": "number", "placeholder": "e.g. 24"},
                        {"name": "preferred_court", "label": "Preferred Court", "type": "select", "options": ["Indoor", "Outdoor", "Any"]},
                        {"name": "availability", "label": "Availability", "type": "select", "options": ["Weekdays", "Weekends", "Both"]},
                        {"name": "preferred_time", "label": "Preferred Time", "type": "select", "options": ["Morning", "Afternoon", "Evening"]}
                    ],
                    "matching_factors": ["playing_type", "experience", "playing_style", "matches_played", "availability", "preferred_time"]
                }
            },
            {
                "sport_name": "Cricket",
                "template_config": {
                    "fields": [
                        {"name": "primary_role", "label": "Primary Role", "type": "select", "options": ["Batsman", "Bowler", "All-Rounder", "Wicketkeeper"]},
                        {"name": "batting_style", "label": "Batting Style", "type": "select", "options": ["Right Hand", "Left Hand"]},
                        {"name": "bowling_style", "label": "Bowling Style", "type": "select", "options": ["Fast", "Medium Pace", "Spin", "Not Applicable"]},
                        {"name": "preferred_format", "label": "Preferred Format", "type": "select", "options": ["T10", "T20", "50 Overs", "Casual"]},
                        {"name": "experience", "label": "Experience Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]},
                        {"name": "matches_played", "label": "Matches Played", "type": "number", "placeholder": "e.g. 30"},
                        {"name": "availability", "label": "Availability", "type": "select", "options": ["Weekdays", "Weekends", "Both"]},
                        {"name": "preferred_time", "label": "Preferred Time", "type": "select", "options": ["Morning", "Afternoon", "Evening"]}
                    ],
                    "matching_factors": ["primary_role", "batting_style", "bowling_style", "preferred_format", "experience", "matches_played", "availability"]
                }
            },
            {
                "sport_name": "Football",
                "template_config": {
                    "fields": [
                        {"name": "position", "label": "Position", "type": "select", "options": ["Goalkeeper", "Defender", "Midfielder", "Forward"]},
                        {"name": "preferred_format", "label": "Preferred Format", "type": "select", "options": ["5v5", "7v7", "11v11"]},
                        {"name": "playing_style", "label": "Playing Style", "type": "select", "options": ["Attacking", "Defensive", "Balanced"]},
                        {"name": "experience", "label": "Experience Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]},
                        {"name": "matches_played", "label": "Matches Played", "type": "number", "placeholder": "e.g. 40"},
                        {"name": "availability", "label": "Availability", "type": "select", "options": ["Weekdays", "Weekends", "Both"]},
                        {"name": "preferred_time", "label": "Preferred Time", "type": "select", "options": ["Morning", "Afternoon", "Evening"]}
                    ],
                    "matching_factors": ["position", "preferred_format", "playing_style", "experience", "matches_played", "availability"]
                }
            },
            {
                "sport_name": "Basketball",
                "template_config": {
                    "fields": [
                        {"name": "position", "label": "Position", "type": "select", "options": ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"]},
                        {"name": "preferred_format", "label": "Preferred Format", "type": "select", "options": ["3v3", "5v5"]},
                        {"name": "playing_style", "label": "Playing Style", "type": "select", "options": ["Offensive", "Defensive", "Balanced"]},
                        {"name": "experience", "label": "Experience Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]},
                        {"name": "matches_played", "label": "Matches Played", "type": "number", "placeholder": "e.g. 20"},
                        {"name": "availability", "label": "Availability", "type": "select", "options": ["Weekdays", "Weekends", "Both"]},
                        {"name": "preferred_time", "label": "Preferred Time", "type": "select", "options": ["Morning", "Afternoon", "Evening"]}
                    ],
                    "matching_factors": ["position", "preferred_format", "playing_style", "experience", "matches_played", "availability"]
                }
            },
            {
                "sport_name": "Running",
                "template_config": {
                    "fields": [
                        {"name": "preferred_distance", "label": "Preferred Distance", "type": "select", "options": ["5K", "10K", "Half Marathon", "Marathon"]},
                        {"name": "average_pace", "label": "Average Pace (min/km)", "type": "text", "placeholder": "e.g. 5:30"},
                        {"name": "personal_best", "label": "Personal Best", "type": "text", "placeholder": "e.g. 28:00 for 5K"},
                        {"name": "experience", "label": "Running Experience", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]},
                        {"name": "preferred_running_type", "label": "Preferred Running Type", "type": "select", "options": ["Road", "Track", "Trail", "Any"]},
                        {"name": "availability", "label": "Availability", "type": "select", "options": ["Weekdays", "Weekends", "Both"]},
                        {"name": "preferred_time", "label": "Preferred Time", "type": "select", "options": ["Morning", "Evening"]}
                    ],
                    "matching_factors": ["preferred_distance", "average_pace", "personal_best", "experience", "availability"]
                }
            },
            {
                "sport_name": "Chess",
                "template_config": {
                    "fields": [
                        {"name": "elo", "label": "Rating / ELO", "type": "number", "placeholder": "e.g. 1200"},
                        {"name": "preferred_format", "label": "Preferred Format", "type": "select", "options": ["Blitz", "Rapid", "Classical"]},
                        {"name": "experience", "label": "Experience Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]},
                        {"name": "games_played", "label": "Games Played", "type": "number", "placeholder": "e.g. 500"},
                        {"name": "preferred_mode", "label": "Preferred Playing Mode", "type": "select", "options": ["Online", "Offline", "Both"]},
                        {"name": "availability", "label": "Availability", "type": "select", "options": ["Weekdays", "Weekends", "Both"]},
                        {"name": "preferred_time", "label": "Preferred Time", "type": "select", "options": ["Morning", "Afternoon", "Evening"]}
                    ],
                    "matching_factors": ["elo", "preferred_format", "experience", "games_played", "availability"]
                }
            },
            {
                "sport_name": "Table Tennis",
                "template_config": {
                    "fields": [
                        {"name": "playing_type", "label": "Playing Type", "type": "select", "options": ["Singles", "Doubles", "Both"]},
                        {"name": "playing_style", "label": "Playing Style", "type": "select", "options": ["Offensive", "Defensive", "Balanced"]},
                        {"name": "grip", "label": "Grip", "type": "select", "options": ["Shakehand", "Penhold", "Other"]},
                        {"name": "experience", "label": "Experience Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]},
                        {"name": "matches_played", "label": "Matches Played", "type": "number", "placeholder": "e.g. 15"},
                        {"name": "availability", "label": "Availability", "type": "select", "options": ["Weekdays", "Weekends", "Both"]},
                        {"name": "preferred_time", "label": "Preferred Time", "type": "select", "options": ["Morning", "Afternoon", "Evening"]}
                    ],
                    "matching_factors": ["playing_type", "playing_style", "grip", "experience", "matches_played", "availability"]
                }
            },
            {
                "sport_name": "Swimming",
                "template_config": {
                    "fields": [
                        {"name": "preferred_stroke", "label": "Preferred Stroke", "type": "select", "options": ["Freestyle", "Breaststroke", "Backstroke", "Butterfly", "Any"]},
                        {"name": "experience", "label": "Experience Level", "type": "select", "options": ["Beginner", "Intermediate", "Advanced"]},
                        {"name": "average_pace", "label": "Average Pace (per 100m)", "type": "text", "placeholder": "e.g. 1:45"},
                        {"name": "availability", "label": "Availability", "type": "select", "options": ["Weekdays", "Weekends", "Both"]},
                        {"name": "preferred_time", "label": "Preferred Time", "type": "select", "options": ["Morning", "Afternoon", "Evening"]}
                    ],
                    "matching_factors": ["preferred_stroke", "experience", "average_pace", "availability"]
                }
            }
        ]
        
        for t in templates:
            existing = session.query(SportTemplate).filter_by(sport_name=t["sport_name"]).first()
            if existing:
                existing.template_config = t["template_config"]
                print(f"Updated template for {t['sport_name']}")
            else:
                new_template = SportTemplate(sport_name=t["sport_name"], template_config=t["template_config"])
                session.add(new_template)
                print(f"Created template for {t['sport_name']}")
        
        session.commit()
        print("Successfully seeded templates.")
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_templates()
