import GeneratePanel from "@/components/GeneratePanel";

export default function Generate() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Генерация</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Опишите, что хотите получить. Готовый результат автоматически сохранится в галерее.
        </p>
      </header>

      <GeneratePanel />
    </div>
  );
}

