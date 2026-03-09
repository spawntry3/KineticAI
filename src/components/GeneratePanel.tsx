import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Video, Image, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "image" | "video";

const GeneratePanel = () => {
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<"image" | "video">("image");
  const [videoProgress, setVideoProgress] = useState("");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationPromptRef = useRef<string>("");
  const generationModeRef = useRef<Mode>("image");
  const mongoApiBase = import.meta.env.VITE_MONGO_API_URL || "http://localhost:5050";

  const saveMongoMeta = useCallback(
    async (generationId: string, m: Mode, p: string) => {
      try {
        await fetch(`${mongoApiBase}/generations/${generationId}/meta`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              promptLength: p.length,
              source: "web",
              mode: m,
            },
          }),
        });
      } catch (err) {
        console.warn("mongo meta save skipped:", err);
      }
    },
    [mongoApiBase],
  );

  const saveToGallery = useCallback(async (m: Mode, p: string, resultUrl: string) => {
    try {
      const { data, error } = await supabase
        .from("generations")
        .insert({
          mode: m,
          prompt: p,
          result_url: resultUrl,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (data?.id) void saveMongoMeta(data.id, m, p);
      toast.success("Сохранено в галерее");
    } catch (err: unknown) {
      console.error("saveToGallery error:", err);
      toast.error("Не удалось сохранить в галерею");
    }
  }, [saveMongoMeta]);

  const pollVideoStatus = useCallback(async (taskId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("kling-video", {
        body: { action: "poll", taskId },
      });

      if (error) throw error;

      if (data?.status === "completed" && data?.videoUrl) {
        setResult(data.videoUrl);
        setResultType("video");
        setIsLoading(false);
        setVideoProgress("");
        void saveToGallery("video", generationPromptRef.current, data.videoUrl);
        toast.success("Видео создано!");
      } else if (data?.status === "failed") {
        setIsLoading(false);
        setVideoProgress("");
        toast.error(data.error || "Генерация видео не удалась");
      } else {
        // Still processing, poll again in 5 seconds
        setVideoProgress("Генерируем видео... Это может занять 1-3 минуты");
        pollRef.current = setTimeout(() => pollVideoStatus(taskId), 5000);
      }
    } catch (err: unknown) {
      console.error("Poll error:", err);
      setIsLoading(false);
      setVideoProgress("");
      toast.error("Ошибка проверки статуса видео");
    }
  }, [saveToGallery]);

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error("Введите описание для генерации");
      return;
    }

    generationPromptRef.current = trimmedPrompt;
    generationModeRef.current = mode;
    setIsLoading(true);
    setResult(null);
    setVideoProgress("");

    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }

    try {
      if (mode === "image") {
        const { data, error } = await supabase.functions.invoke("generate", {
          body: { prompt: trimmedPrompt, mode: "image" },
        });

        if (error) throw error;

        if (data?.imageUrl) {
          setResult(data.imageUrl);
          setResultType("image");
          void saveToGallery("image", trimmedPrompt, data.imageUrl);
          toast.success("Изображение создано!");
        } else if (data?.error) {
          throw new Error(data.error);
        }
        setIsLoading(false);
      } else {
        // Video mode - Kling AI
        setVideoProgress("Отправляем запрос на генерацию видео...");
        const { data, error } = await supabase.functions.invoke("kling-video", {
          body: { action: "create", prompt: trimmedPrompt },
        });

        if (error) throw error;

        if (data?.taskId) {
          setVideoProgress("Видео генерируется... Это может занять 1-3 минуты");
          pollRef.current = setTimeout(() => pollVideoStatus(data.taskId), 5000);
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          throw new Error("Не удалось создать задачу генерации");
        }
      }
    } catch (err: unknown) {
      console.error("Generation error:", err);
      toast.error(err instanceof Error ? err.message : "Ошибка генерации. Попробуйте ещё раз.");
      setIsLoading(false);
      setVideoProgress("");
    }
  };

  return (
    <section id="generate" className="container px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Mode tabs */}
        <div className="glass-panel flex gap-1 mb-6 p-1 w-fit mx-auto">
          <button
            onClick={() => setMode("image")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-display text-sm font-medium transition-all ${
              mode === "image"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Image className="w-4 h-4" />
            Изображение
          </button>
          <button
            onClick={() => setMode("video")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-display text-sm font-medium transition-all ${
              mode === "video"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="w-4 h-4" />
            Видео
          </button>
        </div>

        {/* Prompt input */}
        <div className="glass-panel neon-border p-3">
          <div className="flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === "image"
                  ? "Опишите изображение, которое хотите создать..."
                  : "Опишите видео, которое хотите создать..."
              }
              className="prompt-input flex-1 min-h-[80px] max-h-[160px] resize-none rounded-lg px-4 py-3 text-sm bg-transparent border-0 focus:ring-0 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 px-2 pb-1">
            <span className="text-xs text-muted-foreground">
              {mode === "image" ? "Gemini Image Generation" : "Kling AI Video Generation"}
            </span>
            <Button
              variant="generate"
              size="lg"
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isLoading ? "Генерация..." : "Создать"}
            </Button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 result-card">
            {resultType === "video" ? (
              <video
                src={result}
                controls
                autoPlay
                loop
                className="w-full rounded-xl"
              />
            ) : (
              <img
                src={result}
                alt="Generated result"
                className="w-full rounded-xl"
              />
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-8 glass-panel neon-border p-12 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
            <p className="text-muted-foreground text-sm font-display">
              {videoProgress || (mode === "image" ? "Создаём изображение..." : "Создаём видео...")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default GeneratePanel;
