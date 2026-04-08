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
}

export interface ContextData {
  timestamp: string;
  location: { lat: number; lon: number };
  weather: WeatherData | null;
  air_quality: AirQualityData | null;
  calendar_events: CalendarEvent[];
  data_availability: {
    weather: boolean;
    air_quality: boolean;
    calendar: boolean;
  };
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
