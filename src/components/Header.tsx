import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Header = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Вы вышли из аккаунта");
    } catch (err: unknown) {
      console.error("signOut error:", err);
      toast.error(err instanceof Error ? err.message : "Не удалось выйти");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-card/30 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="KineticAI" className="h-12 w-12 rounded-lg" />
              <span className="font-display text-xl font-bold tracking-tight gradient-text md:text-2xl">
                KineticAI
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeClassName="text-foreground"
            >
              Главная
            </NavLink>
            <NavLink
              to="/generate"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeClassName="text-foreground"
            >
              Генерация
            </NavLink>
            <NavLink
              to="/gallery"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeClassName="text-foreground"
            >
              Галерея
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {isLoading ? null : user ? (
                <>
                  <span className="max-w-[180px] truncate text-xs text-muted-foreground">{user.email}</span>
                  <Button variant="secondary" onClick={signOut}>
                    Выйти
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setIsAuthOpen(true)}>
                  Войти
                </Button>
              )}
            </div>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Открыть меню">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-panel neon-border border-border/60">
                  <SheetHeader>
                    <SheetTitle className="font-display">Меню</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 grid gap-3">
                    <Link className="text-sm text-foreground/90" to="/">
                      Главная
                    </Link>
                    <Link className="text-sm text-foreground/90" to="/generate">
                      Генерация
                    </Link>
                    <Link className="text-sm text-foreground/90" to="/gallery">
                      Галерея
                    </Link>

                    <div className="mt-4 border-t border-border/60 pt-4">
                      {isLoading ? null : user ? (
                        <div className="grid gap-3">
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                          <Button variant="secondary" onClick={signOut}>
                            Выйти
                          </Button>
                        </div>
                      ) : (
                        <Button variant="secondary" onClick={() => setIsAuthOpen(true)}>
                          Войти
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};

export default Header;
