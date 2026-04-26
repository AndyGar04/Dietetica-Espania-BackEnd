import 'dotenv/config';
import app from './app';
import { initSchema } from './db/schema';

const PORT = Number(process.env['PORT'] ?? 3000);

async function main(): Promise<void> {
  await initSchema();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'okis', timestamp: new Date() });
});

export default app;
