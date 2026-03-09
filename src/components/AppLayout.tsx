import { Outlet } from "react-router-dom";
import Header from "@/components/Header";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-10 md:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 bg-card/10 py-8 text-center backdrop-blur-xl">
        <p className="text-xs text-muted-foreground font-display">© 2026 KineticAI. Powered by AI.</p>
      </footer>
    </div>
  );
}

