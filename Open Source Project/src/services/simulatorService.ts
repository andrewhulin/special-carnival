/**
 * Client-side service for communicating with the Simulator Bridge server.
 * The bridge runs on localhost:3001 and controls the iOS Simulator.
 */

const BRIDGE_URL = 'http://localhost:3001';

export class SimulatorService {
  /** Check if the bridge server and simulator are running. */
  async getStatus(): Promise<{ running: boolean; device: string | null; bridgeOnline: boolean }> {
    try {
      const res = await fetch(`${BRIDGE_URL}/status`);
      if (!res.ok) return { running: false, device: null, bridgeOnline: true };
      const data = await res.json();
      return { ...data, bridgeOnline: true };
    } catch {
      return { running: false, device: null, bridgeOnline: false };
    }
  }

  /** Capture a screenshot from the iOS Simulator. Returns base64 PNG. */
  async screenshot(): Promise<string> {
    const res = await fetch(`${BRIDGE_URL}/screenshot`);
    if (!res.ok) throw new Error(`Screenshot failed: ${res.statusText}`);
    const data = await res.json();
    return data.image;
  }

  /** Tap at coordinates in the simulator. */
  async tap(x: number, y: number): Promise<void> {
    const res = await fetch(`${BRIDGE_URL}/tap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y }),
    });
    if (!res.ok) throw new Error(`Tap failed: ${res.statusText}`);
  }

  /** Type text into the currently focused field. */
  async type(text: string): Promise<void> {
    const res = await fetch(`${BRIDGE_URL}/type`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`Type failed: ${res.statusText}`);
  }

  /** Swipe/scroll in the given direction. */
  async swipe(direction: 'up' | 'down' | 'left' | 'right'): Promise<void> {
    const res = await fetch(`${BRIDGE_URL}/swipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    if (!res.ok) throw new Error(`Swipe failed: ${res.statusText}`);
  }

  /** Press a hardware button. */
  async pressButton(button: 'home' | 'lock'): Promise<void> {
    const res = await fetch(`${BRIDGE_URL}/press`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ button }),
    });
    if (!res.ok) throw new Error(`Press failed: ${res.statusText}`);
  }
}

export const simulatorService = new SimulatorService();
