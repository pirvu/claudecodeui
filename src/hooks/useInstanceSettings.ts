import { useEffect, useState } from 'react';

export type InstanceSettings = {
  instanceName: string;
  accentColor: string;
};

const STORAGE_KEY = 'instanceSettings';
const MAX_INSTANCE_NAME_LENGTH = 64;
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const DEFAULTS: InstanceSettings = {
  instanceName: '',
  accentColor: '',
};

/** Returns true if the string is a valid CSS hex color (#rgb or #rrggbb, case-insensitive). */
export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value);
}

/** Convert a hex color string (#rrggbb or #rgb, case-insensitive) to "H S% L%" CSS HSL components. */
export function hexToHslComponents(hex: string): string | null {
  if (!isValidHexColor(hex)) {
    return null;
  }

  const cleaned = hex.replace('#', '');
  let r: number, g: number, b: number;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
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

function sanitizeInstanceName(value: unknown): string {
  if (typeof value !== 'string') {
    return DEFAULTS.instanceName;
  }
  return value.slice(0, MAX_INSTANCE_NAME_LENGTH);
}

function sanitizeAccentColor(value: unknown): string {
  if (typeof value !== 'string' || !isValidHexColor(value)) {
    return DEFAULTS.accentColor;
  }
  return value;
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
        instanceName: sanitizeInstanceName(parsed.instanceName),
        accentColor: sanitizeAccentColor(parsed.accentColor),
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
    setSettings((prev) => ({ ...prev, instanceName: sanitizeInstanceName(name) }));
  };

  const setAccentColor = (color: string) => {
    // Allow empty string to clear the accent color
    const sanitized = color === '' ? '' : sanitizeAccentColor(color);
    setSettings((prev) => ({ ...prev, accentColor: sanitized }));
  };

  return {
    instanceName: settings.instanceName,
    accentColor: settings.accentColor,
    setInstanceName,
    setAccentColor,
  };
}

