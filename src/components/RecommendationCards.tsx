import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, UtensilsCrossed, ShieldAlert, Info } from "lucide-react";
import type { Recommendations } from "@/types/health";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface RecommendationCardsProps {
  recommendations: Recommendations | null;
  isLoading: boolean;
}

function IntensityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-800 border-green-200",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors[level] ?? colors.moderate}`}>
      {level}
    </span>
  );
}

export function RecommendationCards({ recommendations, isLoading }: RecommendationCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg editorial-heading tracking-tight">Your Daily Plan</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations) return null;

  const cards = [
    {
      key: "exercise",
      icon: Dumbbell,
      title: recommendations.exercise.title,
      description: recommendations.exercise.description,
      meta: (
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">{recommendations.exercise.duration}</Badge>
          <IntensityBadge level={recommendations.exercise.intensity} />
        </div>
      ),
    },
    {
      key: "nutrition",
      icon: UtensilsCrossed,
      title: recommendations.nutrition.title,
      description: recommendations.nutrition.description,
      meta: (
        <div className="mt-2 space-y-1">
          <p className="text-xs editorial-subtext font-medium">{recommendations.nutrition.meal_type}</p>
          <div className="flex flex-wrap gap-1">
            {recommendations.nutrition.foods.map((food) => (
              <Badge key={food} variant="outline" className="text-xs">{food}</Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "caution",
      icon: ShieldAlert,
      title: recommendations.caution.title,
      description: recommendations.caution.description,
      meta: <div className="mt-2"><IntensityBadge level={recommendations.caution.severity} /></div>,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg editorial-heading tracking-tight">Your Daily Plan</h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={recommendations.mood}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {cards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
            >
              <Card className="h-full border-border/70 bg-card/90 hover:shadow-md transition-shadow vetra-hover-lift vetra-asym-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base editorial-heading">
                    <card.icon className="h-4 w-4 text-primary" />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm editorial-subtext leading-relaxed">{card.description}</p>
                  {card.meta}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Explanation + Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-accent/50 p-3 vetra-cutout">
          <Info className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-accent-foreground leading-relaxed">{recommendations.explanation}</p>
        </div>
        <p className="text-xs editorial-subtext text-center">{recommendations.disclaimer}</p>
      </motion.div>
    </div>
  );
}
