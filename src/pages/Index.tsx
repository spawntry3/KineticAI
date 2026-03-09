import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GeneratePanel from "@/components/GeneratePanel";
import ExampleGallery from "@/components/ExampleGallery";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20">
        <HeroSection />
        <GeneratePanel />
        <ExampleGallery />
      </main>
      <footer className="border-t border-border/60 bg-card/10 py-8 text-center backdrop-blur-xl">
        <p className="text-xs text-muted-foreground font-display">
          © 2026 KineticAI. Powered by AI.
        </p>
      </footer>
    </div>
  );
};

export default Index;
