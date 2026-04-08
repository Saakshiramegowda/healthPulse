import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  uvi?: number;
}

interface AirQualityData {
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  pollen_level?: string;
}

interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  location?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, google_access_token } = await req.json();

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: "Location (lat, lon) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch weather data
    let weather: WeatherData | null = null;
    const OPENWEATHER_KEY = Deno.env.get("OPENWEATHER_API_KEY");
    if (OPENWEATHER_KEY) {
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_KEY}`
        );
        if (weatherRes.ok) {
          const wd = await weatherRes.json();
          weather = {
            temp: wd.main.temp,
            feels_like: wd.main.feels_like,
            humidity: wd.main.humidity,
            description: wd.weather?.[0]?.description ?? "N/A",
            icon: wd.weather?.[0]?.icon ?? "01d",
            wind_speed: wd.wind?.speed ?? 0,
          };
        } else {
          console.error("Weather API error:", weatherRes.status, await weatherRes.text());
        }
      } catch (e) {
        console.error("Weather fetch failed:", e);
      }
    }

    // Fetch air quality
    let airQuality: AirQualityData | null = null;
    const AMBEE_KEY = Deno.env.get("AMBEE_API_KEY");
    if (AMBEE_KEY) {
      try {
        const aqRes = await fetch(
          `https://api.ambeedata.com/latest/by-lat-lng?lat=${lat}&lng=${lon}`,
          { headers: { "x-api-key": AMBEE_KEY, "Content-type": "application/json" } }
        );
        if (aqRes.ok) {
          const aqData = await aqRes.json();
          const station = aqData.stations?.[0];
          if (station) {
            airQuality = {
              aqi: station.AQI ?? 0,
              category: station.aqiInfo?.category ?? "Unknown",
              pm25: station.PM25 ?? 0,
              pm10: station.PM10 ?? 0,
            };
          }
        } else {
          console.error("Ambee API error:", aqRes.status, await aqRes.text());
        }
      } catch (e) {
        console.error("Ambee fetch failed:", e);
      }
    }

    // Fetch pollen data
    if (AMBEE_KEY && airQuality) {
      try {
        const pollenRes = await fetch(
          `https://api.ambeedata.com/latest/pollen/by-lat-lng?lat=${lat}&lng=${lon}`,
          { headers: { "x-api-key": AMBEE_KEY, "Content-type": "application/json" } }
        );
        if (pollenRes.ok) {
          const pollenData = await pollenRes.json();
          const risk = pollenData.data?.[0]?.Risk;
          if (risk) {
            const levels = Object.values(risk) as Record<string, string>[];
            const maxLevel = levels.reduce((max: string, r: any) => {
              const order = ["Low", "Moderate", "High", "Very High"];
              const riskVal = r?.overall_risk ?? "Low";
              return order.indexOf(riskVal) > order.indexOf(max) ? riskVal : max;
            }, "Low");
            airQuality.pollen_level = maxLevel;
          }
        }
      } catch (e) {
        console.error("Pollen fetch failed:", e);
      }
    }

    // Fetch Google Calendar events (ephemeral — not stored)
    let calendarEvents: CalendarEvent[] = [];
    if (google_access_token) {
      try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const calRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${nextWeek.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=20`,
          { headers: { Authorization: `Bearer ${google_access_token}` } }
        );
        if (calRes.ok) {
          const calData = await calRes.json();
          calendarEvents = (calData.items ?? []).map((e: any) => ({
            summary: e.summary ?? "Untitled",
            start: e.start?.dateTime ?? e.start?.date ?? "",
            end: e.end?.dateTime ?? e.end?.date ?? "",
            location: e.location,
          }));
        } else {
          console.error("Calendar API error:", calRes.status, await calRes.text());
        }
      } catch (e) {
        console.error("Calendar fetch failed:", e);
      }
    }

    const context = {
      timestamp: new Date().toISOString(),
      location: { lat, lon },
      weather,
      air_quality: airQuality,
      calendar_events: calendarEvents,
      data_availability: {
        weather: !!weather,
        air_quality: !!airQuality,
        calendar: calendarEvents.length > 0,
      },
    };

    return new Response(JSON.stringify(context), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Context function error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
