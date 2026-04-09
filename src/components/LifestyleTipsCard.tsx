import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { LifestyleTip } from "@/types/health";
import { Skeleton } from "@/components/ui/skeleton";

interface LifestyleTipsCardProps {
  tips: LifestyleTip[];
  isLoading: boolean;
}

export function LifestyleTipsCard({ tips, isLoading }: LifestyleTipsCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (tips.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="border-border/70 bg-card/90 shadow-sm vetra-asym-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base editorial-heading">
            <Sparkles className="h-4 w-4 text-primary" />
            Lifestyle tips from today&apos;s environment
          </CardTitle>
          <p className="text-xs editorial-subtext font-normal">
            Practical habits based on weather and air — not medical advice.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <motion.li
                key={tip.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border/60 bg-background/65 px-3 py-2.5"
              >
                <p className="text-sm font-medium leading-snug">{tip.headline}</p>
                <p className="text-xs editorial-subtext mt-1 leading-relaxed">{tip.detail}</p>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
