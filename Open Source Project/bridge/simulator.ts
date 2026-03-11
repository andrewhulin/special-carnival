import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const exec = promisify(execFile);

/**
 * iOS Simulator control layer.
 * Prefers AXe CLI if installed, falls back to xcrun + osascript.
 */

let _hasAxe: boolean | null = null;
let _bootedUdid: string | null = null;

async function hasAxe(): Promise<boolean> {
  if (_hasAxe !== null) return _hasAxe;
  try {
    await exec('which', ['axe']);
    _hasAxe = true;
  } catch {
    _hasAxe = false;
  }
  return _hasAxe;
}

/** Resolve the UDID of the booted simulator (AXe doesn't accept 'booted'). */
async function getBootedUdid(): Promise<string> {
  if (_bootedUdid) return _bootedUdid;
  const { stdout } = await exec('xcrun', ['simctl', 'list', 'devices', 'booted', '--json']);
  const data = JSON.parse(stdout);
  for (const devices of Object.values(data.devices) as Array<Array<{ udid: string; state: string }>>) {
    for (const device of devices) {
      if (device.state === 'Booted') {
        _bootedUdid = device.udid;
        return device.udid;
      }
    }
  }
  throw new Error('No booted simulator found');
}

// ── Screenshot ─────────────────────────────────────────────

export async function screenshot(): Promise<string> {
  if (await hasAxe()) {
    return screenshotAxe();
  }
  return screenshotXcrun();
}

async function screenshotAxe(): Promise<string> {
  const udid = await getBootedUdid();
  const tmpPath = join(tmpdir(), `ash-sim-${Date.now()}.png`);
  await exec('axe', ['screenshot', '--output', tmpPath, '--udid', udid]);
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
  if (await hasAxe()) {
    const udid = await getBootedUdid();
    await exec('axe', ['tap', '-x', String(x), '-y', String(y), '--udid', udid]);
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
  if (await hasAxe()) {
    const udid = await getBootedUdid();
    await exec('axe', ['type', text, '--udid', udid]);
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
  if (await hasAxe()) {
    const udid = await getBootedUdid();
    // Map direction to AXe gesture presets
    const gestureMap: Record<string, string> = {
      up: 'scroll-up',
      down: 'scroll-down',
      left: 'scroll-left',
      right: 'scroll-right',
    };
    await exec('axe', ['gesture', gestureMap[direction], '--udid', udid]);
    return;
  }

  const offsets: Record<string, [number, number]> = {
    up: [0, -distance],
    down: [0, distance],
    left: [-distance, 0],
    right: [distance, 0],
  };
  const [dx, dy] = offsets[direction];
  const endX = startX + dx;
  const endY = startY + dy;

  // Fallback: osascript drag
  const script = `
    tell application "Simulator" to activate
    delay 0.1
    tell application "System Events"
      tell process "Simulator"
        set frontWindow to first window
        set {wx, wy} to position of frontWindow
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
  if (await hasAxe()) {
    const udid = await getBootedUdid();
    const axeButton = button === 'home' ? 'HOME' : 'LOCK';
    await exec('axe', ['ui', 'button', axeButton, '--udid', udid]);
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
