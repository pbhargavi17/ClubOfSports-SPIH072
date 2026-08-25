import axios from "axios";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clubofsports-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Types ──────────────────────────────────────────────────────────────────
export type ApiUser = {
  id: string;
  name: string;
  city: string;
  primary_sport: string;
  skill_level: string;
  availability: string;
  profile_image?: string | null;
};

export type FeedPost = {
  id: string;
  caption: string;
  image_url?: string | null;
  created_at: string;
  author: ApiUser;
};

export type ApiAthlete = {
  id: string;
  name: string;
  city: string;
  sport: string;
  skill_index: number;
  availability: string;
  trust_score: number;
  match: number;
  profile_image?: string | null;
};

export type ApiEvent = {
  id: string;
  title: string;
  sport: string;
  description: string;
  venue: string;
  city: string;
  starts_at: string;
  capacity: number;
  organizer_id: string;
};

export type ApiConnection = {
  id: string;
  name: string;
  city: string;
  primary_sport: string;
  skill_level: string;
  availability: string;
  profile_image?: string | null;
};

export type ApiConnectionRequest = {
  id: string;
  from: ApiUser;
};

export type AiMatchResult = {
  sport: string | null;
  distance: number | null;
  time: string | null;
  skill: string | null;
};

export type TemplateField = {
  name: string;
  label: string;
  type: "select" | "number" | "text" | "multiselect";
  options?: string[];
  placeholder?: string;
};

export type SportTemplate = {
  id: string;
  sport_name: string;
  template_config: {
    fields: TemplateField[];
    matching_factors?: string[];
  };
};

export type UserSportProfile = {
  id: string;
  sport_name: string;
  profile_data: Record<string, string | number>;
  skill_index: number;
  created_at: string;
};

// ── Auth ───────────────────────────────────────────────────────────────────
export function isLoggedIn() {
  return !!localStorage.getItem("clubofsports-token");
}

export async function getMe(): Promise<ApiUser | null> {
  if (!isLoggedIn()) return null;
  try {
    const result = await api.get<ApiUser>("/auth/me");
    return result.data;
  } catch {
    return null;
  }
}

export async function login(idToken: string, name?: string, phone?: string, email?: string) {
  const payload: Record<string, string> = { id_token: idToken };
  if (name) payload.name = name;
  if (phone) payload.phone = phone;
  if (email) payload.email = email;
  
  const result = await api.post("/auth/login", payload);
  if (result.data.success && result.data.access_token) {
    localStorage.setItem("clubofsports-token", result.data.access_token);
  }
  return result.data;
}

// ── Feed / Posts ───────────────────────────────────────────────────────────
export async function getFeed(): Promise<FeedPost[]> {
  const result = await api.get<FeedPost[]>("/posts/feed");
  return result.data;
}

export async function createPost(caption: string, imageUrl?: string): Promise<FeedPost> {
  const result = await api.post<FeedPost>("/posts", { caption, image_url: imageUrl });
  return result.data;
}

// ── Discover ───────────────────────────────────────────────────────────────
export async function getDiscover(sport?: string, city?: string): Promise<ApiAthlete[]> {
  const params: Record<string, string> = {};
  if (sport && sport !== "All") params.sport = sport;
  if (city) params.city = city;
  const result = await api.get<ApiAthlete[]>("/discover", { params });
  return result.data;
}

// ── Connections ────────────────────────────────────────────────────────────
export async function getConnections(): Promise<ApiConnection[]> {
  const result = await api.get<ApiConnection[]>("/connections");
  return result.data;
}

export async function getConnectionRequests(): Promise<ApiConnectionRequest[]> {
  const result = await api.get<ApiConnectionRequest[]>("/connections/requests");
  return result.data;
}

export async function requestConnection(userId: string) {
  return api.post("/connections/request", { user_id: userId });
}

export async function acceptConnection(connectionId: string) {
  return api.post(`/connections/${connectionId}/accept`);
}

export async function rejectConnection(connectionId: string) {
  return api.post(`/connections/${connectionId}/reject`);
}

// ── Events ─────────────────────────────────────────────────────────────────
export async function getEvents(): Promise<ApiEvent[]> {
  const result = await api.get<ApiEvent[]>("/events");
  return result.data;
}

export async function joinEvent(eventId: string) {
  return api.post(`/events/${eventId}/join`);
}

// ── History ────────────────────────────────────────────────────────────────
export async function getHistory() {
  const result = await api.get("/history");
  return result.data;
}

// ── Profile ────────────────────────────────────────────────────────────────
export interface ProfileUpdatePayload {
  name?: string;
  bio?: string;
  city?: string;
  primary_sport?: string;
  skill_level?: string;
  availability?: string;
  profile_image?: string;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<ApiUser> {
  const result = await api.patch<ApiUser>("/profiles/me", payload);
  return result.data;
}

export async function getTrustScore(userId: string) {
  const result = await api.get(`/trust/${userId}`);
  return result.data;
}

// ── AI Match Assistant ─────────────────────────────────────────────────────
export async function aiMatchAssistant(prompt: string): Promise<AiMatchResult> {
  const result = await api.post<AiMatchResult>("/ai/match-assistant", { prompt });
  return result.data;
}

// ── Sport Templates ────────────────────────────────────────────────────────
export async function getSportTemplates(): Promise<SportTemplate[]> {
  const result = await api.get<SportTemplate[]>("/sports/templates");
  return result.data;
}

export async function getSportTemplate(sportName: string): Promise<SportTemplate> {
  const result = await api.get<SportTemplate>(`/sports/templates/${encodeURIComponent(sportName)}`);
  return result.data;
}

// ── User Sport Profiles ────────────────────────────────────────────────────
export async function getMySportProfiles(): Promise<UserSportProfile[]> {
  const result = await api.get<UserSportProfile[]>("/profiles/me/sports");
  return result.data;
}

export async function getMySportProfile(sportName: string): Promise<UserSportProfile> {
  const result = await api.get<UserSportProfile>(`/profiles/me/sports/${encodeURIComponent(sportName)}`);
  return result.data;
}

export async function saveSportProfile(
  sportName: string,
  profileData: Record<string, string | number>
): Promise<{ success: boolean; skill_index: number }> {
  const result = await api.post("/profiles/me/sports", {
    sport_name: sportName,
    profile_data: profileData,
  });
  return result.data;
}
