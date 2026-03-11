import express from 'express';
import cors from 'cors';
import * as sim from './simulator.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── Health / Status ────────────────────────────────────────

app.get('/status', async (_req, res) => {
  try {
    const status = await sim.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Screenshot ─────────────────────────────────────────────

app.get('/screenshot', async (_req, res) => {
  try {
    const base64 = await sim.screenshot();
    res.json({ image: base64, mediaType: 'image/png' });
  } catch (err) {
    res.status(500).json({ error: `Screenshot failed: ${err}` });
  }
});

// ── Tap ────────────────────────────────────────────────────

app.post('/tap', async (req, res) => {
  const { x, y } = req.body;
  if (typeof x !== 'number' || typeof y !== 'number') {
    res.status(400).json({ error: 'x and y coordinates required' });
    return;
  }
  try {
    await sim.tap(x, y);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: `Tap failed: ${err}` });
  }
});

// ── Type Text ──────────────────────────────────────────────

app.post('/type', async (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string') {
    res.status(400).json({ error: 'text string required' });
    return;
  }
  try {
    await sim.typeText(text);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: `Type failed: ${err}` });
  }
});

// ── Swipe / Scroll ─────────────────────────────────────────

app.post('/swipe', async (req, res) => {
  const { direction, startX, startY, distance } = req.body;
  if (!['up', 'down', 'left', 'right'].includes(direction)) {
    res.status(400).json({ error: 'direction must be up/down/left/right' });
    return;
  }
  try {
    await sim.swipe(direction, startX, startY, distance);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: `Swipe failed: ${err}` });
  }
});

// ── Press Button ───────────────────────────────────────────

app.post('/press', async (req, res) => {
  const { button } = req.body;
  if (!['home', 'lock'].includes(button)) {
    res.status(400).json({ error: 'button must be home or lock' });
    return;
  }
  try {
    await sim.pressButton(button);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: `Press failed: ${err}` });
  }
});

// ── Start ──────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  Ash Feedback Lab — Simulator Bridge`);
  console.log(`  Running on http://localhost:${PORT}\n`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /status      — Check simulator status`);
  console.log(`    GET  /screenshot  — Capture current screen`);
  console.log(`    POST /tap         — Tap at {x, y}`);
  console.log(`    POST /type        — Type {text}`);
  console.log(`    POST /swipe       — Swipe {direction}`);
  console.log(`    POST /press       — Press {button}\n`);

  sim.getStatus().then((status) => {
    if (status.running) {
      console.log(`  Simulator: ${status.device} (running)`);
    } else {
      console.log(`  Simulator: not running — start with 'xcrun simctl boot "iPhone 16 Pro"'`);
    }
    console.log('');
  });
});
