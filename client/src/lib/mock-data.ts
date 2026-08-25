// Floodlit Clubhouse reminder: data supports human connection, match confidence, and repeat play.
export type SportName = "Badminton" | "Cricket" | "Football" | "Basketball" | "Running" | "Chess" | "Swimming";

export interface User {
  id: string;
  name: string;
  city: string;
  primarySport: SportName;
  skillLevel: string;
  availability: string;
  avatar: string;
  plan: "Free" | "Club" | "Club Pro";
}

export interface Sport {
  id: string;
  name: SportName;
  icon: string;
  description: string;
  color: string;
}

export interface SportProfile {
  sport: SportName;
  skillIndex: number;
  experience: string;
  speciality: string;
  matches: number;
  details: { label: string; value: string }[];
}

export interface Athlete {
  id: string;
  name: string;
  sport: SportName;
  skillIndex: number;
  distance: string;
  availability: string;
  trustScore: number;
  match: number;
  city: string;
  avatar: string;
  image?: string;
  verified?: boolean;
}

export interface Event {
  id: string;
  name: string;
  sport: SportName;
  date: string;
  time: string;
  location: string;
  participants: number;
  capacity: number;
  description: string;
  color: string;
}

export interface Connection {
  id: string;
  athlete: Athlete;
  status: "request" | "friend";
  message: string;
}

export interface Match {
  id: string;
  sport: SportName;
  date: string;
  time: string;
  location: string;
  athletes: string[];
}

export interface Schedule {
  id: string;
  day: string;
  time: string;
  title: string;
  subtitle: string;
  sport: SportName;
}

export interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Subscription {
  name: "Free" | "Club" | "Club Pro";
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const primaryUser: User = {
  id: "arjun-1",
  name: "Arjun Sharma",
  city: "Hyderabad",
  primarySport: "Badminton",
  skillLevel: "Intermediate",
  availability: "Weekdays, 6 PM onwards",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=85",
  plan: "Free",
};

export const sports: Sport[] = [
  { id: "badminton", name: "Badminton", icon: "⌁", description: "Fast exchanges. Better company.", color: "#C7F25C" },
  { id: "cricket", name: "Cricket", icon: "◒", description: "Find a side for the weekend.", color: "#F3B25B" },
  { id: "football", name: "Football", icon: "◉", description: "Build your regular five-a-side.", color: "#71B9FF" },
  { id: "basketball", name: "Basketball", icon: "🏀", description: "Run the court, find your team.", color: "#FF8C42" },
  { id: "running", name: "Running", icon: "↗", description: "Go further with a pace partner.", color: "#F68A7A" },
  { id: "chess", name: "Chess", icon: "♞", description: "A sharper opponent awaits.", color: "#C7C4FF" },
  { id: "swimming", name: "Swimming", icon: "≈", description: "Share the lane, not the noise.", color: "#55D8D0" },
];

export const userSportProfiles: SportProfile[] = [
  {
    sport: "Badminton",
    skillIndex: 78,
    experience: "3 years",
    speciality: "Doubles • all-court",
    matches: 12,
    details: [
      { label: "Playing style", value: "All-court attacker" },
      { label: "Format", value: "Singles & doubles" },
      { label: "Experience", value: "3 years" },
    ],
  },
  {
    sport: "Cricket",
    skillIndex: 64,
    experience: "5 years",
    speciality: "Middle-order bat",
    matches: 8,
    details: [
      { label: "Role", value: "Middle-order batter" },
      { label: "Batting style", value: "Right hand" },
      { label: "Experience", value: "5 years" },
    ],
  },
];

export const athletes: Athlete[] = [
  {
    id: "ananya",
    name: "Ananya Rao",
    sport: "Badminton",
    skillIndex: 76,
    distance: "2.4 km away",
    availability: "Available evenings",
    trustScore: 91,
    match: 94,
    city: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=85",
    image: "/manus-storage/clubofsports-badminton-athlete_a73c85dd.jpg",
    verified: true,
  },
  {
    id: "kabir",
    name: "Kabir Mehta",
    sport: "Badminton",
    skillIndex: 81,
    distance: "3.8 km away",
    availability: "Saturday mornings",
    trustScore: 88,
    match: 89,
    city: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=85",
    verified: true,
  },
  {
    id: "nisha",
    name: "Nisha Reddy",
    sport: "Running",
    skillIndex: 73,
    distance: "4.6 km away",
    availability: "Sunday mornings",
    trustScore: 86,
    match: 82,
    city: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=85",
    verified: true,
  },
  {
    id: "rohan",
    name: "Rohan Kapoor",
    sport: "Cricket",
    skillIndex: 69,
    distance: "5.1 km away",
    availability: "Weekends",
    trustScore: 82,
    match: 78,
    city: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=85",
  },
  {
    id: "sana",
    name: "Sana Siddiqui",
    sport: "Football",
    skillIndex: 75,
    distance: "1.9 km away",
    availability: "Tuesday & Thursday",
    trustScore: 89,
    match: 76,
    city: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=240&q=85",
    verified: true,
  },
];

export const events: Event[] = [
  {
    id: "hyderabad-badminton",
    name: "Hyderabad Badminton Meetup",
    sport: "Badminton",
    date: "Saturday, 24 Aug",
    time: "6:00 PM",
    location: "SmashPoint Sports Arena, Gachibowli",
    participants: 24,
    capacity: 32,
    description: "A friendly evening of doubles rotations for intermediate players. Bring your racket; we will handle the court pairings.",
    color: "#C7F25C",
  },
  {
    id: "hyderabad-5k",
    name: "Hyderabad 5K at Dawn",
    sport: "Running",
    date: "Sunday, 25 Aug",
    time: "6:00 AM",
    location: "KBR Park, Jubilee Hills",
    participants: 38,
    capacity: 60,
    description: "An easy, social 5K followed by coffee. Every pace has a place in the pack.",
    color: "#F68A7A",
  },
  {
    id: "cricket-sunday",
    name: "Sunday Turf Cricket",
    sport: "Cricket",
    date: "Sunday, 25 Aug",
    time: "7:00 AM",
    location: "PlayPro Turf, Kondapur",
    participants: 16,
    capacity: 22,
    description: "A relaxed 12-over morning game. Teams are balanced after sign-up.",
    color: "#F3B25B",
  },
];

export const schedules: Schedule[] = [
  { id: "s1", day: "Monday", time: "—", title: "Rest day", subtitle: "No session planned", sport: "Badminton" },
  { id: "s2", day: "Wednesday", time: "6:00 PM", title: "Badminton practice", subtitle: "SmashPoint Sports Arena", sport: "Badminton" },
  { id: "s3", day: "Saturday", time: "6:00 PM", title: "Badminton with Ananya", subtitle: "XYZ Sports Arena", sport: "Badminton" },
  { id: "s4", day: "Sunday", time: "6:00 AM", title: "Hyderabad 5K", subtitle: "KBR Park · Jubilee Hills", sport: "Running" },
];

export const connections: Connection[] = [
  { id: "c1", athlete: athletes[0], status: "request", message: "Hi Arjun — we have a similar badminton rhythm. Want to play this Saturday?" },
  { id: "c2", athlete: athletes[1], status: "friend", message: "Kabir is in your badminton circle." },
  { id: "c3", athlete: athletes[2], status: "friend", message: "Nisha is in your running circle." },
];

export const starterMessages: Message[] = [
  { id: "m1", from: "them", text: "Hi Arjun! I noticed we are both looking for doubles games.", time: "5:42 PM" },
  { id: "m2", from: "me", text: "That’s right. Are you free at XYZ Sports Arena this Saturday?", time: "5:45 PM" },
  { id: "m3", from: "them", text: "Yes — 6 PM works well for me. Shall we lock it in?", time: "5:47 PM" },
];

export const subscriptionPlans: Subscription[] = [
  { name: "Free", price: "₹0", description: "A real start for your sports circle.", features: ["Athlete profile", "Basic player discovery", "Events discovery", "Basic connections"] },
  { name: "Club", price: "₹100", description: "For the athlete who plays every week.", features: ["Advanced player matching", "Recurring venue scheduling", "Weekly sport schedule", "More discovery filters"], highlighted: true },
  { name: "Club Pro", price: "₹200", description: "A faster route to better play.", features: ["AI Match Assistant", "Multi-city discovery", "Advanced scheduling", "Activity insights"] },
];

export const cities = ["Hyderabad", "Bangalore", "Chennai", "Mumbai", "Delhi", "Pune"];
