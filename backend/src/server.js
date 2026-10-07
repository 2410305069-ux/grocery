import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDatabase } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Initialize Database on boot
getDatabase();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', CLIENT_URL],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Visual Interactive API Explorer for developer testing
const renderApiDocs = (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verdant Market API Explorer</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0b130e; color: #e1e9e3; }
        code, pre { font-family: 'JetBrains Mono', monospace; }
        .glass-card { background: rgba(18, 30, 23, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(80, 160, 100, 0.2); }
      </style>
    </head>
    <body class="p-4 md:p-8 min-h-screen">
      <div class="max-w-5xl mx-auto flex flex-col gap-6">
        <!-- Header Banner -->
        <header class="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-emerald-500 shadow-2xl">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-8 h-8 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-extrabold text-base">V</span>
              <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Verdant Market API</h1>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">v1.0.0 Live</span>
            </div>
            <p class="text-sm text-emerald-200/80">Production Node.js & Express REST Backend with Persistent SQLite Database</p>
          </div>
          <div class="flex items-center gap-3">
            <a href="http://localhost:3000" target="_blank" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5">
              <span>Open React Frontend</span>
              <span>↗</span>
            </a>
            <a href="/api/health" class="px-4 py-2 glass-card hover:border-emerald-400 text-emerald-300 text-xs font-semibold rounded-xl transition-all">
              Health Check
            </a>
          </div>
        </header>

        <!-- Stats Quick Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4" id="statsGrid">
          <div class="glass-card rounded-xl p-4 flex flex-col">
            <span class="text-xs text-emerald-300/70 font-semibold">Total Catalog</span>
            <span class="text-2xl font-bold text-white mt-1" id="statProducts">22 Items</span>
            <span class="text-[11px] text-emerald-400/80">Across 8 categories</span>
          </div>
          <div class="glass-card rounded-xl p-4 flex flex-col">
            <span class="text-xs text-emerald-300/70 font-semibold">Database</span>
            <span class="text-2xl font-bold text-emerald-400 mt-1">SQLite</span>
            <span class="text-[11px] text-emerald-300/70">Native WAL Mode</span>
          </div>
          <div class="glass-card rounded-xl p-4 flex flex-col">
            <span class="text-xs text-emerald-300/70 font-semibold">Active Coupons</span>
            <span class="text-2xl font-bold text-white mt-1">5 Promos</span>
            <span class="text-[11px] text-emerald-400/80">VERDANT20, PURE20</span>
          </div>
          <div class="glass-card rounded-xl p-4 flex flex-col">
            <span class="text-xs text-emerald-300/70 font-semibold">Server Port</span>
            <span class="text-2xl font-bold text-white mt-1">${PORT}</span>
            <span class="text-[11px] text-emerald-400/80">Express.js Engine</span>
          </div>
        </div>

        <!-- Endpoints Explorer -->
        <section class="glass-card rounded-2xl p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="text-emerald-400">⚡</span> RESTful API Endpoints
            </h2>
            <span class="text-xs text-emerald-300/70">Click 'Try It' to execute live requests</span>
          </div>

          <div class="flex flex-col gap-3.5" id="endpointsList">
            <!-- Product Endpoints -->
            ${renderEndpointRow('GET', '/api/products', 'Get all products with category/search filters', '/api/products?limit=6')}
            ${renderEndpointRow('GET', '/api/products/bev-1', 'Get single product details with reviews', '/api/products/bev-1')}
            ${renderEndpointRow('GET', '/api/categories', 'Get 8 categories with live item count', '/api/categories')}
            ${renderEndpointRow('GET', '/api/coupons', 'List active promotional discount codes', '/api/coupons')}
            ${renderEndpointRow('POST', '/api/coupons/validate', 'Validate coupon code against cart total', null, JSON.stringify({ code: 'VERDANT20', subtotalInr: 250 }, null, 2))}
            ${renderEndpointRow('GET', '/api/orders', 'List all customer orders and history', '/api/orders')}
            ${renderEndpointRow('GET', '/api/locations', 'List serviceable pincodes and delivery zones', '/api/locations')}
            ${renderEndpointRow('GET', '/api/locations/check/110001', 'Check delivery ETA for pincode 110001', '/api/locations/check/110001')}
            ${renderEndpointRow('GET', '/api/admin/stats', 'Store dashboard metrics & low stock alerts', '/api/admin/stats')}
            ${renderEndpointRow('GET', '/api/health', 'Server health and system status', '/api/health')}
          </div>
        </section>

        <!-- Live Response Viewer -->
        <section class="glass-card rounded-2xl p-6">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <span>📡 Live API Response Viewer</span>
              <span id="responseStatus" class="hidden text-[10px] px-2 py-0.5 rounded font-mono"></span>
            </h3>
            <span class="text-[11px] text-zinc-400 font-mono" id="responseTime">Ready</span>
          </div>
          <pre id="responseBox" class="bg-black/60 border border-emerald-950 rounded-xl p-4 text-emerald-300 text-xs overflow-x-auto max-h-80 leading-relaxed font-mono select-all">// Click any 'Try It' button above to inspect live JSON responses from the SQLite database.</pre>
        </section>
      </div>

      <script>
        async function runRequest(method, url, body) {
          const resBox = document.getElementById('responseBox');
          const statusBadge = document.getElementById('responseStatus');
          const timeBadge = document.getElementById('responseTime');
          
          resBox.innerText = 'Loading...';
          statusBadge.className = 'text-[10px] px-2 py-0.5 rounded font-mono bg-zinc-800 text-zinc-300';
          statusBadge.innerText = 'FETCHING';
          statusBadge.classList.remove('hidden');
          
          const t0 = performance.now();
          try {
            const options = { method, headers: { 'Content-Type': 'application/json' } };
            if (body && method !== 'GET') options.body = body;
            const res = await fetch(url, options);
            const data = await res.json();
            const elapsed = Math.round(performance.now() - t0);
            
            timeBadge.innerText = elapsed + 'ms';
            statusBadge.innerText = res.status + ' ' + res.statusText;
            statusBadge.className = res.ok 
              ? 'text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-950 text-emerald-400 border border-emerald-700' 
              : 'text-[10px] px-2 py-0.5 rounded font-mono bg-red-950 text-red-400 border border-red-700';
              
            resBox.innerText = JSON.stringify(data, null, 2);
          } catch (err) {
            statusBadge.innerText = 'ERROR';
            statusBadge.className = 'text-[10px] px-2 py-0.5 rounded font-mono bg-red-950 text-red-400';
            resBox.innerText = '// Request failed: ' + err.message;
          }
        }
      </script>
    </body>
    </html>
  `);
};

function renderEndpointRow(method, path, desc, sampleUrl, bodyJson) {
  const methodColor = method === 'GET' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  const urlToFetch = sampleUrl || path;
  const bodyArg = bodyJson ? `'${bodyJson.replace(/'/g, "\\'")}'` : 'null';

  return `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-black/30 border border-emerald-900/40 hover:border-emerald-700/60 transition-colors">
      <div class="flex items-center gap-3 min-w-0">
        <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg border ${methodColor} font-mono">${method}</span>
        <div class="flex flex-col min-w-0">
          <span class="font-mono text-xs text-white font-semibold truncate">${path}</span>
          <span class="text-[11px] text-zinc-400 truncate">${desc}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
        <button onclick="runRequest('${method}', '${urlToFetch}', ${bodyArg})" class="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-all shadow">
          Try It
        </button>
      </div>
    </div>
  `;
}

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);

// Landing / Documentation route
app.get('/', renderApiDocs);
app.get('/api', renderApiDocs);
app.get('/api-docs', renderApiDocs);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
  🌿 ========================================================
     VERDANT MARKET BACKEND API SERVER RUNNING
     Port: ${PORT}
     Environment: ${process.env.NODE_ENV || 'development'}
     API Explorer: http://localhost:${PORT}/api
     Database: SQLite (WAL Mode, persistent)
  🌿 ========================================================
    `);
  });
}

export default app;
