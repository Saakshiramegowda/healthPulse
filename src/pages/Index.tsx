import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoodSelector } from "@/components/MoodSelector";
import { WeatherCard } from "@/components/WeatherCard";
import { CalendarCard } from "@/components/CalendarCard";
import { RecommendationCards } from "@/components/RecommendationCards";
import { LifestyleTipsCard } from "@/components/LifestyleTipsCard";
import { useHealthData } from "@/hooks/use-health-data";
import type { Mood, HealthProfile } from "@/types/health";

// Default health profile (will be replaced with DB-fetched profile when auth is wired)
const DEFAULT_PROFILE: HealthProfile = {
  health_conditions: [],
  allergies: [],
  nutrition_preferences: [],
};

const Index = () => {
  const [mood, setMood] = useState<Mood>("calm");
  const { context, recommendations, isLoadingContext, isLoadingRecs, fetchContext, fetchRecommendations } = useHealthData();

  const loadContext = useCallback(async () => {
    // Try geolocation, fall back to NYC
    let lat = 40.7128, lon = -74.006;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
    } catch {
      // Use default location
    }
    const ctx = await fetchContext(lat, lon);
    if (ctx) {
      await fetchRecommendations(ctx, mood, DEFAULT_PROFILE);
    }
  }, [fetchContext, fetchRecommendations, mood]);

  // Apply mood to document for CSS variable switching
  useEffect(() => {
    document.documentElement.setAttribute("data-mood", mood);
    return () => document.documentElement.removeAttribute("data-mood");
  }, [mood]);

  // Initial load
  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const handleMoodChange = async (newMood: Mood) => {
    setMood(newMood);
    if (context) {
      await fetchRecommendations(context, newMood, DEFAULT_PROFILE);
    }
  };

  const handleRefresh = () => {
    loadContext();
  };

  return (
    <div className="min-h-screen warm-editorial warm-bg transition-colors duration-700">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/75 bg-background/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 max-w-6xl">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Heart className="h-6 w-6 text-primary" />
            </motion.div>
            <h1 className="text-xl font-semibold tracking-tight">HealthPulse</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingContext}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingContext ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="editorial-panel p-6 md:p-8">
          <p className="editorial-chip mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Daily wellbeing snapshot
          </p>
          <h2 className="editorial-heading text-4xl md:text-5xl">Welcome to HealthPulse</h2>
          <p className="editorial-subtext mt-2 max-w-2xl">
            Track your mood and review recommendations shaped by weather, schedule context, and health preferences.
          </p>
        </motion.section>

        {/* Mood Selector */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="editorial-card p-4 md:p-5">
          <MoodSelector selected={mood} onSelect={handleMoodChange} />
        </motion.section>

        {/* Context Section */}
        <section className="grid gap-4 md:grid-cols-2">
          <article className="editorial-card p-1">
            <WeatherCard context={context} isLoading={isLoadingContext} />
          </article>
          <article className="editorial-card p-1">
            <CalendarCard events={context?.calendar_events ?? []} isLoading={isLoadingContext} />
          </article>
        </section>

        <section className="editorial-card p-1">
          <LifestyleTipsCard tips={context?.lifestyle_tips ?? []} isLoading={isLoadingContext} />
        </section>

        {/* Recommendations */}
        <section className="editorial-card p-1">
          <RecommendationCards recommendations={recommendations} isLoading={isLoadingRecs} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 mt-8">
        <div className="container mx-auto max-w-6xl px-4 py-4 text-center">
          <p className="text-xs editorial-subtext">
            HealthPulse offers supportive guidance and does not replace professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
