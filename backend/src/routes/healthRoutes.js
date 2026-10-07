import express from 'express';
import { getDatabase } from '../config/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const dbCheck = db.prepare('SELECT 1 as live').get();

    res.json({
      status: 'healthy',
      service: 'Verdant Market REST API Server',
      database: dbCheck?.live === 1 ? 'connected' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      service: 'Verdant Market REST API Server',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
