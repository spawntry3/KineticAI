import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, VideoIcon, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

type MongoMeta = {
  generationId: string;
  tags: string[];
  note: string;
};

type Generation = {
  id: string;
  prompt: string;
  mode: string;
  result_url: string | null;
  created_at: string;
};

type Filter = "all" | "image" | "video";

export default function Gallery() {
  const [items, setItems] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Generation | null>(null);
  const [meta, setMeta] = useState<MongoMeta | null>(null);
  const [metaTags, setMetaTags] = useState("");
  const [metaNote, setMetaNote] = useState("");
  const [isMetaLoading, setIsMetaLoading] = useState(false);
  const [isMetaSaving, setIsMetaSaving] = useState(false);

  const mongoApiBase = import.meta.env.VITE_MONGO_API_URL || "http://localhost:5050";

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((x) => x.mode === filter);
  }, [items, filter]);

  const load = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("generations")
        .select("id,prompt,mode,result_url,created_at")
        .order("created_at", { ascending: false })
        .limit(60);

      if (error) throw error;
      setItems((data ?? []) as Generation[]);
    } catch (err: unknown) {
      console.error("load generations error:", err);
      toast.error(err instanceof Error ? err.message : "Не удалось загрузить галерею");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!selected) {
      setMeta(null);
      setMetaTags("");
      setMetaNote("");
      return;
    }

    const loadMeta = async () => {
      setIsMetaLoading(true);
      try {
        const res = await fetch(`${mongoApiBase}/generations/${selected.id}/meta`);
        if (!res.ok) throw new Error("Не удалось загрузить метаданные");
        const json = (await res.json()) as MongoMeta;
        setMeta(json);
        setMetaTags((json.tags ?? []).join(", "));
        setMetaNote(json.note ?? "");
      } catch (err: unknown) {
        console.error("load mongo meta error:", err);
        setMeta(null);
      } finally {
        setIsMetaLoading(false);
      }
    };

    void loadMeta();
  }, [selected, mongoApiBase]);

  const saveMeta = async () => {
    if (!selected) return;
    setIsMetaSaving(true);
    try {
      const tags = metaTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 30);

      const res = await fetch(`${mongoApiBase}/generations/${selected.id}/meta`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags, note: metaNote }),
      });
      if (!res.ok) throw new Error("Не удалось сохранить метаданные");
      toast.success("Метаданные сохранены (MongoDB)");
    } catch (err: unknown) {
      console.error("save mongo meta error:", err);
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить метаданные");
    } finally {
      setIsMetaSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Галерея</h1>
          <p className="text-sm text-muted-foreground md:text-base">Здесь хранятся все ваши генерации.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant={filter === "all" ? "secondary" : "outline"} onClick={() => setFilter("all")}>
            Все
          </Button>
          <Button variant={filter === "image" ? "secondary" : "outline"} onClick={() => setFilter("image")}>
            Фото
          </Button>
          <Button variant={filter === "video" ? "secondary" : "outline"} onClick={() => setFilter("video")}>
            Видео
          </Button>
          <Button variant="outline" onClick={load} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4" />
            Обновить
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-panel neon-border h-[260px] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass-panel neon-border p-10 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/40">
            {filter === "video" ? <VideoIcon className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          </div>
          <div className="mt-4 font-display text-lg font-semibold">Пока пусто</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Сгенерируйте контент на странице «Генерация» — и он появится здесь.
          </p>
          <div className="mt-6">
            <Button asChild variant="generate">
              <Link to="/generate">Перейти к генерации</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <Card
              key={g.id}
              className="glass-panel neon-border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:bg-card/70 cursor-pointer"
              onClick={() => setSelected(g)}
              role="button"
              tabIndex={0}
            >
              <div className="relative">
                {g.mode === "image" && g.result_url ? (
                  <img src={g.result_url} alt={g.prompt} className="h-44 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-gradient-to-b from-card/30 to-card/80">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <VideoIcon className="h-4 w-4" />
                      Видео
                    </div>
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <Badge variant="secondary" className="bg-black/30 text-foreground/90 backdrop-blur-xl">
                    {g.mode === "video" ? "Видео" : "Фото"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 p-4">
                <div className="line-clamp-2 text-sm text-foreground/90">“{g.prompt}”</div>
                <div className="text-xs text-muted-foreground">{new Date(g.created_at).toLocaleString()}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {selected ? (
          <DialogContent className="glass-panel neon-border max-w-3xl border-border/60">
            <DialogHeader>
              <DialogTitle className="font-display">Результат</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">“{selected.prompt}”</div>
              {selected.mode === "video" && selected.result_url ? (
                <video src={selected.result_url} controls className="w-full rounded-xl" />
              ) : selected.result_url ? (
                <img src={selected.result_url} alt={selected.prompt} className="w-full rounded-xl" />
              ) : (
                <div className="rounded-xl border border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground">
                  У этого элемента пока нет ссылки на результат.
                </div>
              )}

              <div className="rounded-xl border border-border/60 bg-card/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-display text-sm font-semibold">Метаданные (MongoDB)</div>
                  <Button variant="outline" onClick={saveMeta} disabled={isMetaSaving || isMetaLoading}>
                    Сохранить
                  </Button>
                </div>

                {isMetaLoading ? (
                  <div className="mt-3 text-sm text-muted-foreground">Загрузка…</div>
                ) : meta ? (
                  <div className="mt-4 grid gap-3">
                    <div className="grid gap-2">
                      <div className="text-xs text-muted-foreground">Теги (через запятую)</div>
                      <Input value={metaTags} onChange={(e) => setMetaTags(e.target.value)} placeholder="art, anime, neon" />
                    </div>
                    <div className="grid gap-2">
                      <div className="text-xs text-muted-foreground">Заметка</div>
                      <Input value={metaNote} onChange={(e) => setMetaNote(e.target.value)} placeholder="Например: сделать вариации" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-muted-foreground">
                    MongoDB API не отвечает. Запусти `npm run dev:api` и Mongo через `npm run dev:mongo`.
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

