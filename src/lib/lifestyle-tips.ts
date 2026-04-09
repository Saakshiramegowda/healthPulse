import type { ContextData, LifestyleTip } from "@/types/health";

const MAX_TIPS = 8;

/**
 * Deterministic wellness tips from current weather, air quality, and schedule.
 * Not medical advice — for general lifestyle awareness only.
 */
export function buildLifestyleTips(
  context: Pick<ContextData, "weather" | "air_quality" | "calendar_events">
): LifestyleTip[] {
  const tips: LifestyleTip[] = [];
  const w = context.weather;
  const aq = context.air_quality;
  const events = context.calendar_events ?? [];

  if (!w) {
    return [
      {
        id: "no-weather",
        headline: "Weather unavailable",
        detail: "Connect OpenWeather on the server or refresh — tips need current conditions.",
      },
    ];
  }

  const desc = w.description.toLowerCase();
  const icon = (w.icon ?? "").toLowerCase();
  const temp = w.temp;
  const feels = w.feels_like;
  const humidity = w.humidity;
  const wind = w.wind_speed;
  const uv = w.uv_index;

  const isSunnyClear =
    desc.includes("clear") ||
    desc.includes("mainly clear") ||
    icon === "01d" ||
    icon === "01n";
  const isHeavyCloud =
    desc.includes("overcast") ||
    desc === "cloudy" ||
    (desc.includes("cloud") && !desc.includes("partly")) ||
    icon === "03d" ||
    icon === "03n" ||
    icon === "04d" ||
    icon === "04n";
  const isPartlyCloudy = desc.includes("partly cloudy");
  const isPrecip =
    desc.includes("rain") ||
    desc.includes("drizzle") ||
    desc.includes("shower") ||
    desc.includes("thunderstorm") ||
    desc.includes("snow") ||
    desc.includes("sleet") ||
    desc.includes("hail");
  const isFog = desc.includes("fog");

  // Heat & sun
  if (temp >= 28 || feels >= 30) {
    tips.push({
      id: "heat-hydration",
      headline: "Hot conditions — stay hydrated",
      detail: "Carry a water bottle, sip regularly, and take shade breaks. Limit intense outdoor exercise during peak heat.",
    });
  } else if (temp >= 24 && (isSunnyClear || feels > temp + 2)) {
    tips.push({
      id: "warm-hydration",
      headline: "Warm day — keep water handy",
      detail: "Sip water through the day, especially if you are active outdoors.",
    });
  }

  if (uv != null && uv >= 6) {
    tips.push({
      id: "uv-protection",
      headline: "High UV — protect skin and eyes",
      detail: "Use sunscreen (SPF 30+), a hat, and sunglasses; seek shade during midday when possible.",
    });
  } else if (uv != null && uv >= 3 && uv < 6 && isSunnyClear && temp >= 22) {
    tips.push({
      id: "uv-moderate",
      headline: "Moderate UV",
      detail: "Sunscreen and a hat are sensible if you will be outside for a while.",
    });
  } else if (uv == null && isSunnyClear && temp >= 26) {
    tips.push({
      id: "sun-bright",
      headline: "Bright sun",
      detail: "Carry water, consider a hat and sunscreen if you will be outside for extended periods.",
    });
  }

  // Cloud / light — migraine-prone users (non-diagnostic)
  if (isHeavyCloud && !isPartlyCloudy) {
    tips.push({
      id: "cloudy-light",
      headline: "Flat, gray skies",
      detail:
        "Some people are sensitive to dull light or pressure changes. If you get migraines, consider sunglasses for glare, steady meals, and a small go-bag (water, snacks, any meds you already use as prescribed). Talk to a clinician about recurring headaches.",
    });
  } else if (isPartlyCloudy && !isPrecip) {
    tips.push({
      id: "changing-sky",
      headline: "Changing sky",
      detail: "Light levels can shift; if you are light-sensitive, keeping essentials (water, cap) helps for longer outings.",
    });
  }

  // Cold & wind
  if (temp <= 5) {
    tips.push({
      id: "cold-layers",
      headline: "Cold air",
      detail: "Dress in layers, cover extremities, and warm up gradually after being outside.",
    });
  }

  if (wind >= 10) {
    tips.push({
      id: "strong-wind",
      headline: "Strong wind",
      detail: "Secure loose items; wind can dry skin and eyes — lip balm and wrap layers help.",
    });
  }

  // Humidity
  if (humidity >= 75 && temp >= 22) {
    tips.push({
      id: "humid-muggy",
      headline: "Humid air",
      detail: "Muggy conditions make heat feel heavier — hydrate and pace outdoor activity.",
    });
  }
  if (humidity <= 35) {
    tips.push({
      id: "dry-air",
      headline: "Dry air",
      detail: "Sip water; consider saline nasal spray or a humidifier indoors if you are prone to dryness irritation.",
    });
  }

  // Precip & fog
  if (isPrecip) {
    tips.push({
      id: "wet-weather",
      headline: "Wet weather",
      detail: "Waterproof footwear and a compact umbrella reduce chill and slipping risk.",
    });
  }
  if (isFog) {
    tips.push({
      id: "fog-visibility",
      headline: "Low visibility",
      detail: "Allow extra travel time and use lights; go slower in foggy conditions.",
    });
  }

  // Air quality & pollen
  if (aq) {
    if (aq.aqi > 150) {
      tips.push({
        id: "aqi-very-poor",
        headline: "Air quality is poor",
        detail: "Keep outdoor exertion short; consider indoor exercise. Sensitive groups should follow local health guidance.",
      });
    } else if (aq.aqi > 100) {
      tips.push({
        id: "aqi-moderate-pollution",
        headline: "Elevated air pollution",
        detail: "Limit long, hard outdoor workouts; windows closed at home can help on smoggy days.",
      });
    }

    const pollen = (aq.pollen_level ?? "").toLowerCase();
    if (pollen.includes("high") || pollen.includes("very")) {
      tips.push({
        id: "pollen-high",
        headline: "Higher pollen",
        detail: "If you have allergies, rinse off after outdoor time; keep usual allergy plan per your clinician.",
      });
    }
  }

  // Upcoming events — retained for scheduling awareness
  if (events.length >= 1) {
    tips.push({
      id: "calendar-upcoming",
      headline: `Upcoming schedule (${events.length} event${events.length === 1 ? "" : "s"})`,
      detail:
        "Your calendar events stay attached to this view for upcoming features — plan hydration and breaks between commitments.",
    });
  }

  // Dedupe by id, cap length
  const seen = new Set<string>();
  const out: LifestyleTip[] = [];
  for (const t of tips) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    out.push(t);
    if (out.length >= MAX_TIPS) break;
  }
  return out;
}
