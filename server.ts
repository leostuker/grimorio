import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { router as apiRouter } from './server/routes.js';
import { initDatabaseConnection } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Inicializar conexão com o banco de dados
  await initDatabaseConnection();

  // Rotas da API
  app.use('/api', apiRouter);

  // Servir aplicação React / Vite
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Grimório] Servidor rodando na porta ${PORT} (http://0.0.0.0:${PORT})`);
  });
}

startServer().catch((err) => {
  console.error('[Grimório] Erro crítico ao iniciar servidor:', err);
});
