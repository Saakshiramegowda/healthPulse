import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Thermometer, Leaf } from "lucide-react";
import type { ContextData } from "@/types/health";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherCardProps {
  context: ContextData | null;
  isLoading: boolean;
}

export function WeatherCard({ context, isLoading }: WeatherCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/70 bg-card/90">
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-4"><Skeleton className="h-8 w-20" /><Skeleton className="h-8 w-20" /><Skeleton className="h-8 w-20" /></div>
        </CardContent>
      </Card>
    );
  }

  const weather = context?.weather;
  const aq = context?.air_quality;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base editorial-heading">
            <Cloud className="h-4 w-4 text-primary" />
            Weather and environment
          </CardTitle>
          <p className="text-xs editorial-subtext font-normal">
            Local outdoor conditions and air quality at a glance.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {weather ? (
            <>
              <div className="flex items-end gap-2">
                <span className="text-4xl editorial-heading tracking-tight">{Math.round(weather.temp)}°</span>
                <span className="editorial-subtext text-sm capitalize pb-1">{weather.description}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-1.5 text-sm editorial-subtext">
                  <Thermometer className="h-3.5 w-3.5" />
                  <span>Feels {Math.round(weather.feels_like)}°</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm editorial-subtext">
                  <Droplets className="h-3.5 w-3.5" />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm editorial-subtext">
                  <Wind className="h-3.5 w-3.5" />
                  <span>{weather.wind_speed} m/s</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm editorial-subtext">Weather data unavailable</p>
          )}

          {aq && (
            <div className="border-t border-border/70 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${aq.aqi <= 50 ? "bg-green-500" : aq.aqi <= 100 ? "bg-yellow-500" : "bg-red-500"}`} />
                <span className="text-sm font-medium">AQI {aq.aqi}</span>
                <span className="text-xs editorial-subtext">({aq.category})</span>
              </div>
              {aq.pollen_level && (
                <div className="flex items-center gap-1 text-xs editorial-subtext">
                  <Leaf className="h-3 w-3" />
                  <span>Pollen: {aq.pollen_level}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
