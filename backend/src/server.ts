import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { auditLoggerMiddleware } from './middleware/auditLogger.js';
import { sendNotFound, sendSuccess } from './utils/response.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import stockRoutes from './routes/stock.routes.js';
import userRoutes from './routes/user.routes.js';
import auditRoutes from './routes/audit.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import saleRoutes from './routes/sale.routes.js';
import quotationRoutes from './routes/quotation.routes.js';
import accountRoutes from './routes/account.routes.js';
import gstRoutes from './routes/gst.routes.js';
import crmRoutes from './routes/crm.routes.js';
import reportRoutes from './routes/report.routes.js';
import adminRoutes from './routes/admin.routes.js';
import searchRoutes from './routes/search.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// 1. Security & Core Middlewares
app.use(helmet());

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      callback(new Error('CORS policy: Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// 2. Global Rate Limiter & Audit Logger
app.use('/api', apiRateLimiter);
app.use(auditLoggerMiddleware as any);

// 3. Health & Root Endpoints
app.get('/', (_req, res) => {
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>BIKE ERP — API Gateway</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); text-align: center; max-width: 480px; border: 1px solid #334155; }
        h1 { margin-top: 0; color: #38bdf8; font-size: 1.75rem; }
        p { color: #94a3b8; line-height: 1.6; }
        .btn { display: inline-block; background: #0284c7; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; margin-top: 1.25rem; transition: background 0.2s; }
        .btn:hover { background: #0369a1; }
        .badge { display: inline-block; background: #065f46; color: #34d399; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">● Backend REST API Online</span>
        <h1>🏍️ BIKE ERP API Gateway</h1>
        <p>You have reached the backend API service (Port 5000). To use the interactive BIKE ERP user interface, please open the frontend application:</p>
        <a href="http://localhost:3001" class="btn">Open BIKE ERP Frontend (Port 3001)</a>
        <br>
        <a href="http://localhost:3000" class="btn" style="background: #475569; margin-top: 0.5rem;">Alternative Port (Port 3000)</a>
      </div>
    </body>
    </html>
  `);
});

app.get('/api', (_req, res) => {
  return sendSuccess(res, {
    service: 'BIKE ERP REST API Engine',
    version: '1.0.0',
    status: 'ONLINE',
    docs: '/api/health',
    frontend: 'http://localhost:3001'
  }, 'BIKE ERP API Service Online');
});

app.get('/api/health', async (_req, res) => {
  const isDbConnected = await checkDatabaseConnection();
  return sendSuccess(res, {
    status: isDbConnected ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    service: 'BIKE ERP Express Backend',
    version: '1.0.0',
    database: isDbConnected ? 'Connected (PostgreSQL / Prisma)' : 'Connection Failed'
  });
});

// 4. Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/inventory', stockRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/pos', saleRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/customers', crmRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);

// 5. 404 Catch-all Handler
app.use((_req, res) => {
  sendNotFound(res, 'API endpoint not found on BIKE ERP Server');
});

// 6. Centralized Error Handler
app.use(errorHandler);

// 7. Server Initialization
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, async () => {
    console.log(`\n🏍️  BIKE ERP Backend Server running on http://localhost:${env.PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
    console.log(`🛡️  Security: Helmet, CORS, Rate-Limiting, JWT, RBAC enabled\n`);

    const isConnected = await checkDatabaseConnection();
    if (isConnected) {
      console.log('✅ PostgreSQL Database connected successfully via Prisma');
    } else {
      console.warn('⚠️  PostgreSQL Database connection pending or database server unreachable');
    }
  });
}

export default app;
