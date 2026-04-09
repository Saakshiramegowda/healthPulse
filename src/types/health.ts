export type Mood = "calm" | "low" | "energetic" | "anxious" | "happy";

export interface MoodOption {
  value: Mood;
  emoji: string;
  label: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: "calm", emoji: "😌", label: "Calm" },
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "energetic", emoji: "⚡", label: "Energetic" },
  { value: "low", emoji: "😔", label: "Low" },
  { value: "anxious", emoji: "😰", label: "Anxious" },
];

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  /** UV index when available (e.g. Open-Meteo / OpenWeather). */
  uv_index?: number;
}

/** Short lifestyle guidance derived from environment (not a diagnosis). */
export interface LifestyleTip {
  id: string;
  headline: string;
  detail: string;
}

export interface AirQualityData {
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  pollen_level?: string;
}

export interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  location?: string;
  /** Set when syncing from Google Calendar for stable keys. */
  id?: string;
}

export interface ContextData {
  timestamp: string;
  location: { lat: number; lon: number };
  weather: WeatherData | null;
  air_quality: AirQualityData | null;
  /** Upcoming events from Google Calendar when connected; preserved for richer scheduling features. */
  calendar_events: CalendarEvent[];
  data_availability: {
    weather: boolean;
    air_quality: boolean;
    calendar: boolean;
  };
  /** Rule-based tips from current weather + air + schedule (client-computed). */
  lifestyle_tips: LifestyleTip[];
}

export interface ExerciseRec {
  title: string;
  description: string;
  duration: string;
  intensity: "low" | "moderate" | "high";
}

export interface NutritionRec {
  title: string;
  description: string;
  foods: string[];
  meal_type: string;
}

export interface CautionRec {
  title: string;
  description: string;
  severity: "low" | "moderate" | "high";
}

export interface Recommendations {
  exercise: ExerciseRec;
  nutrition: NutritionRec;
  caution: CautionRec;
  explanation: string;
  disclaimer: string;
  generated_at: string;
  mood: Mood;
}

export interface HealthProfile {
  health_conditions: string[];
  allergies: string[];
  nutrition_preferences: string[];
}
