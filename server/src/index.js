import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const PORT = Number(process.env.PORT ?? "5050");
const MONGO_URL = process.env.MONGO_URL ?? "mongodb://localhost:27017";
const MONGO_DB = process.env.MONGO_DB ?? "kineticai";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN ?? "http://localhost:8080";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: [ALLOW_ORIGIN],
    credentials: true,
  }),
);

const client = new MongoClient(MONGO_URL);
await client.connect();
const db = client.db(MONGO_DB);
const meta = db.collection("generation_meta");

app.get("/health", async (_req, res) => {
  try {
    await db.command({ ping: 1 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

app.get("/generations/:id/meta", async (req, res) => {
  const generationId = String(req.params.id ?? "").trim();
  if (!generationId) return res.status(400).json({ error: "generationId is required" });

  const doc = await meta.findOne({ _id: generationId });
  return res.json({
    generationId,
    data: doc?.data ?? {},
    tags: doc?.tags ?? [],
    note: doc?.note ?? "",
    createdAt: doc?.createdAt ?? null,
    updatedAt: doc?.updatedAt ?? null,
  });
});

app.put("/generations/:id/meta", async (req, res) => {
  const generationId = String(req.params.id ?? "").trim();
  if (!generationId) return res.status(400).json({ error: "generationId is required" });

  const body = req.body ?? {};
  const next = {
    _id: generationId,
    data: typeof body.data === "object" && body.data ? body.data : {},
    tags: Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === "string").slice(0, 30) : [],
    note: typeof body.note === "string" ? body.note.slice(0, 2000) : "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await meta.updateOne({ _id: generationId }, { $set: next, $setOnInsert: { createdAt: next.createdAt } }, { upsert: true });
  return res.json({ ok: true });
});

app.patch("/generations/:id/meta", async (req, res) => {
  const generationId = String(req.params.id ?? "").trim();
  if (!generationId) return res.status(400).json({ error: "generationId is required" });

  const body = req.body ?? {};
  const patch = {};

  if (typeof body.note === "string") patch.note = body.note.slice(0, 2000);
  if (Array.isArray(body.tags)) patch.tags = body.tags.filter((t) => typeof t === "string").slice(0, 30);
  if (typeof body.data === "object" && body.data) patch.data = body.data;

  patch.updatedAt = new Date();

  await meta.updateOne(
    { _id: generationId },
    { $set: patch, $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );

  return res.json({ ok: true });
});

process.on("SIGINT", async () => {
  await client.close().catch(() => {});
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await client.close().catch(() => {});
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[mongo-api] listening on http://localhost:${PORT}`);
});

