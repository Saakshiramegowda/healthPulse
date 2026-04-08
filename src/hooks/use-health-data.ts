import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ContextData, Recommendations, Mood, HealthProfile } from "@/types/health";

// Mock data for when APIs aren't configured
const MOCK_CONTEXT: ContextData = {
  timestamp: new Date().toISOString(),
  location: { lat: 40.7128, lon: -74.006 },
  weather: {
    temp: 22,
    feels_like: 21,
    humidity: 55,
    description: "partly cloudy",
    icon: "02d",
    wind_speed: 3.5,
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
      setContext(data as ContextData);
      return data as ContextData;
    } catch (e) {
      console.error("Failed to fetch context, using mock:", e);
      setContext(MOCK_CONTEXT);
      return MOCK_CONTEXT;
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
