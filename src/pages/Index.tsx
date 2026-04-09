import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Heart } from "lucide-react";
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

  // Apply mood to document for CSS variable switching
  useEffect(() => {
    document.documentElement.setAttribute("data-mood", mood);
    return () => document.documentElement.removeAttribute("data-mood");
  }, [mood]);

  // Initial load
  useEffect(() => {
    loadContext();
  }, []);

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
    <div className="min-h-screen bg-background transition-colors duration-700">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Heart className="h-6 w-6 text-primary fill-primary" />
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight">PatientPulse</h1>
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
      <main className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Mood Selector */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <MoodSelector selected={mood} onSelect={handleMoodChange} />
        </motion.section>

        {/* Context Section */}
        <section className="grid gap-4 md:grid-cols-2">
          <WeatherCard context={context} isLoading={isLoadingContext} />
          <CalendarCard events={context?.calendar_events ?? []} isLoading={isLoadingContext} />
        </section>

        <section>
          <LifestyleTipsCard tips={context?.lifestyle_tips ?? []} isLoading={isLoadingContext} />
        </section>

        {/* Recommendations */}
        <section>
          <RecommendationCards recommendations={recommendations} isLoading={isLoadingRecs} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8">
        <div className="container mx-auto max-w-4xl px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            PatientPulse — Your intelligent health coordination assistant. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
