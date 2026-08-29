/**
 * server.js
 * Lightweight Express backend for the Bitget Trader Dashboard.
 * - Serves the static frontend from /public
 * - Exposes /api/status/bitget which pings Bitget's public time endpoint
 *   and reports whether the exchange API is reachable.
 *
 * Designed to run as-is on Render.com (uses process.env.PORT).
 */

const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

// Render (and most PaaS hosts) inject PORT at runtime. Fall back to 3000 for local dev.
const PORT = process.env.PORT || 3000;

// Bitget's public "server time" endpoint — cheap, unauthenticated, perfect for a heartbeat check.
const BITGET_TIME_URL = 'https://api.bitget.com/api/v1/public/time';

// How long we'll wait for Bitget to respond before declaring it disconnected.
const UPSTREAM_TIMEOUT_MS = 8000;

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Static frontend
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------------
// API: Bitget connectivity status
// ---------------------------------------------------------------------------
app.get('/api/status/bitget', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(BITGET_TIME_URL, { signal: controller.signal });
    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
      throw new Error(`Bitget responded with HTTP ${response.status}`);
    }

    const data = await response.json();

    return res.json({
      connected: true,
      status: 'connected',
      message: 'Bitget public API is reachable.',
      latencyMs,
      serverTime: data && data.data ? data.data : null,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const reason = error.name === 'AbortError' ? 'Request timed out' : error.message;

    return res.status(200).json({
      connected: false,
      status: 'disconnected',
      message: `Unable to reach Bitget: ${reason}`,
      latencyMs,
      serverTime: null,
      checkedAt: new Date().toISOString(),
    });
  } finally {
    clearTimeout(timeout);
  }
});

// Simple health check for Render's own uptime monitoring.
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true });
});

// ---------------------------------------------------------------------------
// Fallback: send index.html for unmatched non-API routes (nice for direct links)
// ---------------------------------------------------------------------------
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Dashboard:     http://localhost:${PORT}`);
  console.log(`   Status check:  http://localhost:${PORT}/api/status/bitget`);
});
