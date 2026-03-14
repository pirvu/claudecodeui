import { useEffect, useState } from 'react';

export type InstanceSettings = {
  instanceName: string;
  accentColor: string;
};

const STORAGE_KEY = 'instanceSettings';

const DEFAULTS: InstanceSettings = {
  instanceName: '',
  accentColor: '',
};

/** Convert a hex color string (#rrggbb or #rgb) to "H S% L%" CSS HSL components. */
export function hexToHslComponents(hex: string): string | null {
  const cleaned = hex.replace('#', '');
  let r: number, g: number, b: number;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
  } else {
    return null;
  }

  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
    }

    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${h} ${sPct}% ${lPct}%`;
}

/** Apply (or remove) an accent color by setting CSS variables on the document root. */
export function applyAccentColor(hex: string | null) {
  const root = document.documentElement;

  if (!hex) {
    root.style.removeProperty('--primary');
    root.style.removeProperty('--ring');
    return;
  }

  const hsl = hexToHslComponents(hex);
  if (!hsl) {
    return;
  }

  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--ring', hsl);
}

function readSettings(): InstanceSettings {
  if (typeof window === 'undefined') {
    return DEFAULTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<InstanceSettings>;
      return {
        instanceName: typeof parsed.instanceName === 'string' ? parsed.instanceName : DEFAULTS.instanceName,
        accentColor: typeof parsed.accentColor === 'string' ? parsed.accentColor : DEFAULTS.accentColor,
      };
    }
  } catch {
    // ignore
  }

  return DEFAULTS;
}

export function useInstanceSettings() {
  const [settings, setSettings] = useState<InstanceSettings>(() => readSettings());

  // Apply accent color on mount and whenever it changes
  useEffect(() => {
    applyAccentColor(settings.accentColor || null);
  }, [settings.accentColor]);

  // Persist to localStorage whenever settings change
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setInstanceName = (name: string) => {
    setSettings((prev) => ({ ...prev, instanceName: name }));
  };

  const setAccentColor = (color: string) => {
    setSettings((prev) => ({ ...prev, accentColor: color }));
  };

  return {
    instanceName: settings.instanceName,
    accentColor: settings.accentColor,
    setInstanceName,
    setAccentColor,
  };
}
