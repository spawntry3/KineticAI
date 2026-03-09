import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center px-6 py-16">
      <Card className="glass-panel neon-border w-full max-w-md p-8 text-center">
        <div className="font-display text-4xl font-bold">404</div>
        <p className="mt-2 text-sm text-muted-foreground">Страница не найдена: {location.pathname}</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button asChild variant="generate">
            <Link to="/">На главную</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/generate">Генерация</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
