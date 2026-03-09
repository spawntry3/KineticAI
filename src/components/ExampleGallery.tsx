const examples = [
  {
    prompt: "Киберпанк город будущего на закате",
    type: "image" as const,
  },
  {
    prompt: "Волшебный лес с светящимися грибами",
    type: "image" as const,
  },
  {
    prompt: "Астронавт на поверхности Марса",
    type: "image" as const,
  },
];

const ExampleGallery = () => {
  return (
    <section id="gallery" className="container px-6 py-16">
      <h2 className="text-2xl font-display font-bold text-center mb-2 gradient-text">
        Примеры промтов
      </h2>
      <p className="text-center text-muted-foreground mb-10 text-sm">
        Попробуйте эти идеи для вдохновения
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {examples.map((example, i) => (
          <div
            key={i}
            className="glass-panel p-5 transition-all duration-300 cursor-pointer group hover:bg-card/70 hover:border-foreground/15 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-display font-medium text-primary uppercase tracking-wider">
                {example.type === "image" ? "Изображение" : "Видео"}
              </span>
            </div>
            <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
              "{example.prompt}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExampleGallery;
