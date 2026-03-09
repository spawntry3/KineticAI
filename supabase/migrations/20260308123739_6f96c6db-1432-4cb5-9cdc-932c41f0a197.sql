-- Create generations table (relational PostgreSQL)
CREATE TABLE public.generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('image', 'video')),
  result_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view generations"
  ON public.generations FOR SELECT USING (true);

CREATE POLICY "Anyone can create generations"
  ON public.generations FOR INSERT WITH CHECK (true);

-- Create JSONB metadata table (NoSQL-style document storage)
CREATE TABLE public.generation_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generation_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view metadata"
  ON public.generation_metadata FOR SELECT USING (true);

CREATE POLICY "Anyone can create metadata"
  ON public.generation_metadata FOR INSERT WITH CHECK (true);