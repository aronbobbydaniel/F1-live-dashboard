export interface TrackTireLimit {
  soft: number;
  medium: number;
  hard: number;
  intermediate?: number;
  wet?: number;
}

export const TRACK_TIRE_LIMITS: Record<string, TrackTireLimit> = {
  spa: { soft: 14, medium: 24, hard: 44 },
  mexico_city: { soft: 18, medium: 35, hard: 50 },
  monza: { soft: 15, medium: 28, hard: 40 },
  bahrain: { soft: 12, medium: 22, hard: 38 },
  jeddah: { soft: 15, medium: 28, hard: 42 },
  albert_park: { soft: 16, medium: 26, hard: 45 },
  suzuka: { soft: 13, medium: 22, hard: 36 },
  shanghai: { soft: 14, medium: 24, hard: 40 },
  miami: { soft: 16, medium: 30, hard: 45 },
  imola: { soft: 15, medium: 27, hard: 42 },
  monaco: { soft: 20, medium: 38, hard: 60 },
  montreal: { soft: 18, medium: 32, hard: 48 },
  barcelona: { soft: 12, medium: 22, hard: 38 },
  spielberg: { soft: 15, medium: 26, hard: 42 },
  silverstone: { soft: 14, medium: 24, hard: 42 },
  hungaroring: { soft: 14, medium: 25, hard: 40 },
  zandvoort: { soft: 14, medium: 24, hard: 40 },
  baku: { soft: 16, medium: 30, hard: 46 },
  singapore: { soft: 16, medium: 30, hard: 46 },
  cota: { soft: 13, medium: 22, hard: 38 },
  interlagos: { soft: 14, medium: 24, hard: 40 },
  las_vegas: { soft: 18, medium: 32, hard: 48 },
  lusail: { soft: 12, medium: 20, hard: 34 },
  yas_marina: { soft: 15, medium: 26, hard: 42 },
  default: { soft: 15, medium: 25, hard: 40 }
};

/**
 * Calculates algorithmic tire degradation percentage for a given track, compound, and laps on tire.
 * Includes F1 exponential non-linear drop-off cliff after 70% wear.
 */
export function calculateTireDegradation(trackKey: string, compound: string, lapsOnTire: number): number {
  const cleanKey = trackKey.toLowerCase().trim();
  const cleanCompound = compound.toLowerCase().trim() as 'soft' | 'medium' | 'hard';

  const limits = TRACK_TIRE_LIMITS[cleanKey] ?? TRACK_TIRE_LIMITS['default'];
  const maxLaps = limits[cleanCompound] ?? limits['medium'] ?? 25;

  const wearPercentage = Math.min((lapsOnTire / maxLaps) * 100, 100);

  let displayWear = wearPercentage;
  if (wearPercentage > 70) {
    displayWear = wearPercentage + Math.pow((wearPercentage - 70) / 10, 2);
  }

  return parseFloat(Math.min(displayWear, 100).toFixed(1));
}
