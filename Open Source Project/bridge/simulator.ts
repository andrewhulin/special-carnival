import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const exec = promisify(execFile);

/**
 * iOS Simulator control layer.
 * Prefers Facebook IDB if installed, falls back to xcrun + osascript.
 */

let _hasIdb: boolean | null = null;

async function hasIdb(): Promise<boolean> {
  if (_hasIdb !== null) return _hasIdb;
  try {
    await exec('which', ['idb']);
    _hasIdb = true;
  } catch {
    _hasIdb = false;
  }
  return _hasIdb;
}

// ── Screenshot ─────────────────────────────────────────────

export async function screenshot(): Promise<string> {
  if (await hasIdb()) {
    return screenshotIdb();
  }
  return screenshotXcrun();
}

async function screenshotIdb(): Promise<string> {
  const tmpPath = join(tmpdir(), `ash-sim-${Date.now()}.png`);
  await exec('idb', ['screenshot', '--udid', 'booted', tmpPath]);
  const data = await readFile(tmpPath);
  await unlink(tmpPath).catch(() => {});
  return data.toString('base64');
}

async function screenshotXcrun(): Promise<string> {
  const tmpPath = join(tmpdir(), `ash-sim-${Date.now()}.png`);
  await exec('xcrun', ['simctl', 'io', 'booted', 'screenshot', tmpPath]);
  const data = await readFile(tmpPath);
  await unlink(tmpPath).catch(() => {});
  return data.toString('base64');
}

// ── Tap ────────────────────────────────────────────────────

export async function tap(x: number, y: number): Promise<void> {
  if (await hasIdb()) {
    await exec('idb', ['ui', 'tap', String(x), String(y)]);
    return;
  }
  // Fallback: osascript click in Simulator window
  const script = `
    tell application "Simulator" to activate
    delay 0.2
    tell application "System Events"
      tell process "Simulator"
        set frontWindow to first window
        set {wx, wy} to position of frontWindow
        click at {${x} + wx, ${y} + wy}
      end tell
    end tell
  `;
  await exec('osascript', ['-e', script]);
}

// ── Type Text ──────────────────────────────────────────────

export async function typeText(text: string): Promise<void> {
  if (await hasIdb()) {
    await exec('idb', ['ui', 'text', text]);
    return;
  }
  // Fallback: osascript keystroke
  const escaped = text.replace(/"/g, '\\"');
  const script = `
    tell application "Simulator" to activate
    delay 0.1
    tell application "System Events"
      keystroke "${escaped}"
    end tell
  `;
  await exec('osascript', ['-e', script]);
}

// ── Swipe / Scroll ─────────────────────────────────────────

export async function swipe(
  direction: 'up' | 'down' | 'left' | 'right',
  startX = 195,
  startY = 420,
  distance = 300,
): Promise<void> {
  const offsets: Record<string, [number, number]> = {
    up: [0, -distance],
    down: [0, distance],
    left: [-distance, 0],
    right: [distance, 0],
  };
  const [dx, dy] = offsets[direction];
  const endX = startX + dx;
  const endY = startY + dy;

  if (await hasIdb()) {
    await exec('idb', [
      'ui', 'swipe',
      String(startX), String(startY),
      String(endX), String(endY),
    ]);
    return;
  }
  // Fallback: osascript drag
  const script = `
    tell application "Simulator" to activate
    delay 0.1
    tell application "System Events"
      tell process "Simulator"
        set frontWindow to first window
        set {wx, wy} to position of frontWindow
        -- Perform drag from start to end
        do shell script "cliclick dd:" & (${startX} + wx) & "," & (${startY} + wy) & " du:" & (${endX} + wx) & "," & (${endY} + wy)
      end tell
    end tell
  `;
  try {
    await exec('osascript', ['-e', script]);
  } catch {
    console.warn('Swipe fallback failed — cliclick may not be installed');
  }
}

// ── Press Hardware Button ──────────────────────────────────

export async function pressButton(button: 'home' | 'lock'): Promise<void> {
  if (await hasIdb()) {
    const idbButton = button === 'home' ? 'HOME' : 'LOCK';
    await exec('idb', ['ui', 'button', idbButton]);
    return;
  }
  if (button === 'home') {
    await exec('xcrun', ['simctl', 'ui', 'booted', 'home']);
  }
}

// ── Status ─────────────────────────────────────────────────

export async function getStatus(): Promise<{
  running: boolean;
  device: string | null;
}> {
  try {
    const { stdout } = await exec('xcrun', [
      'simctl', 'list', 'devices', 'booted', '--json',
    ]);
    const data = JSON.parse(stdout);
    for (const runtime of Object.values(data.devices) as Array<Array<{ name: string; state: string }>>) {
      for (const device of runtime) {
        if (device.state === 'Booted') {
          return { running: true, device: device.name };
        }
      }
    }
  } catch {}
  return { running: false, device: null };
}
