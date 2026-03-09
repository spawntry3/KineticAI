import HeroSection from "@/components/HeroSection";
import ExampleGallery from "@/components/ExampleGallery";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Image, Video, GalleryHorizontalEnd } from "lucide-react";

export default function Welcome() {
  return (
    <div className="space-y-12">
      <div className="-mx-4 md:-mx-6">
        <HeroSection />
      </div>

      <section className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Что умеет KineticAI</h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Генерация изображений и видео по текстовому описанию. Сохраняйте результаты в галерее и возвращайтесь к ним
            позже.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild variant="generate" size="lg">
              <Link to="/generate">Перейти к генерации</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/gallery">Открыть галерею</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="glass-panel neon-border p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-border/60 bg-card/40 p-2">
                <Image className="h-4 w-4 text-foreground/90" />
              </div>
              <div className="font-display font-semibold">Фото</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Создавайте кинематографичные изображения: стиль, освещение, композиция — всё в одном промте.
            </p>
          </Card>
          <Card className="glass-panel neon-border p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-border/60 bg-card/40 p-2">
                <Video className="h-4 w-4 text-foreground/90" />
              </div>
              <div className="font-display font-semibold">Видео</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Запускайте генерацию видео и следите за прогрессом — результат появится автоматически.
            </p>
          </Card>
          <Card className="glass-panel neon-border p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-border/60 bg-card/40 p-2">
                <GalleryHorizontalEnd className="h-4 w-4 text-foreground/90" />
              </div>
              <div className="font-display font-semibold">Галерея</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Все генерации сохраняются и доступны на отдельной странице галереи.
            </p>
          </Card>
        </div>
      </section>

      <ExampleGallery />
    </div>
  );
}

