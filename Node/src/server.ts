import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import postsRouter from './routes/posts';
import DatabaseConnection from './database/connection';

const app = express();
const PORT = process.env.PORT || 3000;

// ❌ PROBLEMA: Configuração de CORS muito permissiva
app.use(cors({
  origin: '*',
  credentials: true
}));

// ✅ PONTO FORTE: Usa helmet para segurança
app.use(helmet());

// ❌ PROBLEMA: Rate limiting muito básico
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // muito alto para teste
  message: 'Too many requests from this IP'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' })); // ❌ PROBLEMA: Limite muito alto
app.use(express.urlencoded({ extended: true }));

// ✅ PONTO FORTE: Middleware de logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/posts', postsRouter);

// ❌ PROBLEMA: Health check muito simples
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ❌ PROBLEMA: Middleware de erro muito básico
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// ❌ PROBLEMA: 404 handler muito simples
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ❌ PROBLEMA: Não trata graceful shutdown
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API Docs: http://localhost:${PORT}/api/posts`);
  
  // Inicializa conexão com banco
  DatabaseConnection.getInstance();
});

// ❌ PROBLEMA: Não trata sinais de processo
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
