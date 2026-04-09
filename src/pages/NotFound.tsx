import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen warm-editorial warm-bg flex items-center justify-center p-4">
      <div className="editorial-panel p-8 md:p-12 text-center max-w-xl w-full">
        <Heart className="h-8 w-8 text-primary mx-auto mb-4" />
        <p className="editorial-chip mb-4">404</p>
        <h1 className="editorial-heading mb-3 text-5xl md:text-6xl">Page not found</h1>
        <p className="mb-6 editorial-subtext text-base md:text-lg">
          The page you are looking for is unavailable or may have moved. Let&apos;s get you back to HealthPulse.
        </p>
        <Button asChild className="editorial-button">
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
