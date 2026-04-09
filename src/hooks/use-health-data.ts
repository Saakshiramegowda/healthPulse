import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { buildLifestyleTips } from "@/lib/lifestyle-tips";
import type { ContextData, Recommendations, Mood, HealthProfile, WeatherData } from "@/types/health";

/** Open-Meteo (no API key) — used when the edge function has no OpenWeather key. */
async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<WeatherData | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index",
    wind_speed_unit: "ms",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    current?: {
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      weather_code: number;
      wind_speed_10m: number;
      uv_index?: number;
    };
  };
  const cur = json.current;
  if (!cur) return null;
  const code = cur.weather_code;
  const description = WMO_WEATHER_DESCRIPTIONS[code] ?? "unknown";
  return {
    temp: cur.temperature_2m,
    feels_like: cur.apparent_temperature,
    humidity: Math.round(cur.relative_humidity_2m),
    description,
    icon: wmoToOpenWeatherIcon(code),
    wind_speed: Number(cur.wind_speed_10m.toFixed(1)),
    ...(cur.uv_index != null ? { uv_index: Number(cur.uv_index.toFixed(1)) } : {}),
  };
}

const WMO_WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "fog",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "dense drizzle",
  56: "freezing drizzle",
  57: "freezing drizzle",
  61: "slight rain",
  63: "moderate rain",
  65: "heavy rain",
  66: "freezing rain",
  67: "freezing rain",
  71: "slight snow",
  73: "moderate snow",
  75: "heavy snow",
  77: "snow grains",
  80: "rain showers",
  81: "moderate rain showers",
  82: "violent rain showers",
  85: "snow showers",
  86: "heavy snow showers",
  95: "thunderstorm",
  96: "thunderstorm with hail",
  99: "thunderstorm with hail",
};

function wmoToOpenWeatherIcon(code: number): string {
  if (code === 0 || code === 1) return "01d";
  if (code === 2) return "02d";
  if (code === 3) return "03d";
  if (code === 45 || code === 48) return "50d";
  if (code >= 51 && code <= 57) return "09d";
  if (code >= 61 && code <= 67) return "10d";
  if (code >= 71 && code <= 77) return "13d";
  if (code >= 80 && code <= 82) return "09d";
  if (code >= 85 && code <= 86) return "13d";
  if (code >= 95) return "11d";
  return "02d";
}

// Mock data for when APIs aren't configured
const MOCK_CONTEXT_BASE: Omit<ContextData, "lifestyle_tips"> = {
  timestamp: new Date().toISOString(),
  location: { lat: 40.7128, lon: -74.006 },
  weather: {
    temp: 22,
    feels_like: 21,
    humidity: 55,
    description: "partly cloudy",
    icon: "02d",
    wind_speed: 3.5,
    uv_index: 4,
  },
  air_quality: {
    aqi: 42,
    category: "Good",
    pm25: 8.3,
    pm10: 15.2,
    pollen_level: "Moderate",
  },
  calendar_events: [
    { summary: "Morning Standup", start: new Date(Date.now() + 3600000).toISOString(), end: new Date(Date.now() + 5400000).toISOString() },
    { summary: "Lunch with Sarah", start: new Date(Date.now() + 14400000).toISOString(), end: new Date(Date.now() + 18000000).toISOString(), location: "Downtown Cafe" },
    { summary: "Yoga Class", start: new Date(Date.now() + 28800000).toISOString(), end: new Date(Date.now() + 32400000).toISOString(), location: "FitLife Studio" },
  ],
  data_availability: { weather: true, air_quality: true, calendar: true },
};

const MOCK_CONTEXT: ContextData = {
  ...MOCK_CONTEXT_BASE,
  lifestyle_tips: buildLifestyleTips(MOCK_CONTEXT_BASE),
};

const MOCK_RECOMMENDATIONS: Recommendations = {
  exercise: {
    title: "Gentle Morning Walk",
    description: "Start your day with a 30-minute brisk walk in the park. The partly cloudy weather is perfect for outdoor activity without overheating.",
    duration: "30 minutes",
    intensity: "moderate",
  },
  nutrition: {
    title: "Anti-Inflammatory Lunch Bowl",
    description: "Build a nutrient-rich bowl with leafy greens, salmon, and turmeric dressing to support your immune system during moderate pollen season.",
    foods: ["Spinach", "Wild Salmon", "Quinoa", "Avocado", "Turmeric"],
    meal_type: "Lunch",
  },
  caution: {
    title: "Moderate Pollen Alert",
    description: "Pollen levels are moderate today. If you have sensitivities, consider taking your allergy medication before outdoor activities and showering after.",
    severity: "moderate",
  },
  explanation: "Based on your calm mood and the pleasant weather, today is a great opportunity for moderate outdoor activity. The air quality is good, but pollen levels warrant some precaution.",
  disclaimer: "⚕️ This is an AI-generated suggestion, not medical advice. Consult your doctor for all clinical decisions.",
  generated_at: new Date().toISOString(),
  mood: "calm",
};

export function useHealthData() {
  const [context, setContext] = useState<ContextData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async (lat: number, lon: number, googleToken?: string) => {
    setIsLoadingContext(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("context", {
        body: { lat, lon, google_access_token: googleToken },
      });
      if (fnError) throw fnError;
      if (data == null || typeof data !== "object") {
        throw new Error("Empty context response");
      }
      const raw = data as ContextData & { error?: string };
      if (raw.error) throw new Error(raw.error);

      let ctx: ContextData = {
        ...(raw as ContextData),
        location: raw?.location ?? { lat, lon },
        data_availability: raw?.data_availability ?? {
          weather: !!raw?.weather,
          air_quality: !!raw?.air_quality,
          calendar: (raw?.calendar_events?.length ?? 0) > 0,
        },
      };

      if (!ctx.weather) {
        try {
          const fallback = await fetchOpenMeteoWeather(lat, lon);
          if (fallback) {
            ctx = {
              ...ctx,
              weather: fallback,
              data_availability: { ...ctx.data_availability, weather: true },
            };
          }
        } catch (e) {
          console.warn("Open-Meteo weather fallback failed:", e);
        }
      }

      ctx.calendar_events = Array.isArray(ctx.calendar_events) ? ctx.calendar_events : [];
      ctx.lifestyle_tips = buildLifestyleTips(ctx);

      setContext(ctx);
      return ctx;
    } catch (e) {
      console.error("Failed to fetch context, using mock:", e);
      const fallbackCtx: ContextData = {
        ...MOCK_CONTEXT,
        timestamp: new Date().toISOString(),
        lifestyle_tips: buildLifestyleTips(MOCK_CONTEXT_BASE),
      };
      setContext(fallbackCtx);
      return fallbackCtx;
    } finally {
      setIsLoadingContext(false);
    }
  }, []);

  const fetchRecommendations = useCallback(
    async (ctx: ContextData, mood: Mood, healthProfile: HealthProfile) => {
      setIsLoadingRecs(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("recommend", {
          body: { context: ctx, mood, health_profile: healthProfile },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        setRecommendations(data as Recommendations);
        return data as Recommendations;
      } catch (e) {
        console.error("Failed to fetch recommendations, using mock:", e);
        const mock = { ...MOCK_RECOMMENDATIONS, mood };
        setRecommendations(mock);
        return mock;
      } finally {
        setIsLoadingRecs(false);
      }
    },
    []
  );

  return {
    context,
    recommendations,
    isLoadingContext,
    isLoadingRecs,
    error,
    fetchContext,
    fetchRecommendations,
  };
}
