'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as d3 from 'd3';

/* ─────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────*/
interface GeoFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
}
interface GeoJSON {
  type: 'FeatureCollection';
  features: GeoFeature[];
}
interface CircuitMap3DProps {
  circuitId: string;
  color?: string;
  height?: number;
}
interface CircuitConfig {
  drsZones: Array<{ start: number; end: number }>;
  speedTrap: number;
  labels: Array<{ t: number; text: string; ox: number; oy: number }>;
}

/* ─────────────────────────────────────────────────────────────
   Circuit ID → /public/circuits/<file>.json
──────────────────────────────────────────────────────────────*/
const CIRCUIT_FILE_MAP: Record<string, string> = {
  bahrain: 'bahrain', jeddah: 'jeddah', albert_park: 'albert_park',
  suzuka: 'suzuka', shanghai: 'shanghai', miami: 'miami',
  imola: 'imola', monaco: 'monaco', villeneuve: 'montreal',
  catalunya: 'barcelona', red_bull_ring: 'red_bull_ring',
  silverstone: 'silverstone', hungaroring: 'hungaroring',
  spa: 'spa', zandvoort: 'zandvoort', monza: 'monza',
  baku: 'baku', marina_bay: 'singapore', americas: 'cota',
  rodriguez: 'mexico_city', interlagos: 'interlagos',
  las_vegas: 'las_vegas', losail: 'lusail', lusail: 'lusail',
  yas_marina: 'yas_marina',
  montreal: 'montreal', barcelona: 'barcelona', singapore: 'singapore',
  cota: 'cota', mexico_city: 'mexico_city',
};

/* ─────────────────────────────────────────────────────────────
   Per-circuit config — DRS zones, speed trap & key labels
   All t values are normalised progress along the track (0–1)
──────────────────────────────────────────────────────────────*/
const CIRCUIT_CONFIGS: Record<string, CircuitConfig> = {
  bahrain: {
    drsZones: [{ start: 0.92, end: 1.00 }, { start: 0.44, end: 0.54 }],
    speedTrap: 0.48,
    labels: [
      { t: 0.00, text: 'Start / Finish',    ox:  0.5, oy: 1.8 },
      { t: 0.08, text: 'T1–T4 Complex',     ox:  1.2, oy: 1.6 },
      { t: 0.36, text: 'T8 Hairpin',        ox: -1.2, oy: 1.6 },
      { t: 0.60, text: 'T13 Hairpin',       ox:  1.0, oy: 1.6 },
    ],
  },
  jeddah: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.30, end: 0.44 }, { start: 0.62, end: 0.74 }],
    speedTrap: 0.36,
    labels: [
      { t: 0.00, text: 'Start / Finish',    ox:  0.6, oy: 1.8 },
      { t: 0.14, text: 'T1–T4 Complex',     ox: -1.2, oy: 1.6 },
      { t: 0.50, text: 'T13–T17 Section',   ox:  1.0, oy: 1.6 },
      { t: 0.70, text: 'T22 Hairpin',       ox: -1.0, oy: 1.6 },
    ],
  },
  albert_park: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.42, end: 0.54 }],
    speedTrap: 0.95,
    labels: [
      { t: 0.00, text: 'Start / Finish',    ox:  0.6, oy: 1.8 },
      { t: 0.06, text: 'T1',               ox: -1.0, oy: 1.5 },
      { t: 0.20, text: 'T3–T4 Chicane',    ox:  1.0, oy: 1.5 },
      { t: 0.50, text: 'T9–T10',           ox: -1.0, oy: 1.5 },
    ],
  },
  suzuka: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.48, end: 0.58 }],
    speedTrap: 0.55,
    labels: [
      { t: 0.00, text: 'Start / Finish',    ox:  0.6, oy: 1.8 },
      { t: 0.15, text: 'Degner Curve',      ox:  1.0, oy: 1.5 },
      { t: 0.30, text: 'Hairpin',           ox: -1.2, oy: 1.5 },
      { t: 0.45, text: 'Spoon Curve',       ox:  1.0, oy: 1.5 },
      { t: 0.62, text: '130R',              ox: -1.0, oy: 1.5 },
      { t: 0.80, text: 'Casio Triangle',    ox:  1.0, oy: 1.5 },
    ],
  },
  shanghai: {
    drsZones: [{ start: 0.92, end: 1.00 }, { start: 0.44, end: 0.56 }],
    speedTrap: 0.97,
    labels: [
      { t: 0.00, text: 'Start / Finish',    ox:  0.6, oy: 1.8 },
      { t: 0.07, text: 'T1–T4 Complex',     ox:  1.0, oy: 1.5 },
      { t: 0.48, text: 'Back Straight',     ox: -1.0, oy: 1.5 },
      { t: 0.75, text: 'T13–T16',           ox:  1.0, oy: 1.5 },
    ],
  },
  miami: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.43, end: 0.55 }],
    speedTrap: 0.96,
    labels: [
      { t: 0.00, text: 'Start / Finish',    ox:  0.6, oy: 1.8 },
      { t: 0.07, text: 'T1–T3',            ox:  1.0, oy: 1.5 },
      { t: 0.42, text: 'T11 Chicane',       ox: -1.0, oy: 1.5 },
      { t: 0.72, text: 'T17–T18',           ox:  1.0, oy: 1.5 },
    ],
  },
  imola: {
    drsZones: [{ start: 0.85, end: 0.97 }, { start: 0.47, end: 0.58 }],
    speedTrap: 0.91,
    labels: [
      { t: 0.00, text: 'Start / Finish',    ox:  0.6, oy: 1.8 },
      { t: 0.07, text: 'Tamburello',        ox:  1.0, oy: 1.5 },
      { t: 0.28, text: 'Tosa',              ox: -1.0, oy: 1.5 },
      { t: 0.55, text: 'Variante Alta',     ox:  1.0, oy: 1.5 },
      { t: 0.73, text: 'Rivazza',           ox: -1.0, oy: 1.5 },
    ],
  },
  monaco: {
    drsZones: [{ start: 0.90, end: 1.00 }],
    speedTrap: 0.52,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.08, text: 'Sainte Devote',      ox:  1.0, oy: 1.5 },
      { t: 0.20, text: 'Casino Square',      ox: -1.2, oy: 1.5 },
      { t: 0.30, text: 'Grand Hotel Hairpin',ox:  1.0, oy: 1.5 },
      { t: 0.50, text: 'Tunnel',             ox: -1.0, oy: 1.5 },
      { t: 0.82, text: 'La Rascasse',        ox:  1.0, oy: 1.5 },
    ],
  },
  montreal: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.42, end: 0.55 }],
    speedTrap: 0.97,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.10, text: 'Senna Chicane',      ox:  1.0, oy: 1.5 },
      { t: 0.48, text: 'Hairpin',            ox: -1.0, oy: 1.5 },
      { t: 0.87, text: 'Wall of Champions',  ox:  1.0, oy: 1.5 },
    ],
  },
  barcelona: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.43, end: 0.54 }],
    speedTrap: 0.97,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.06, text: 'T1 Braking Zone',    ox:  1.0, oy: 1.5 },
      { t: 0.18, text: 'T3 Repsol',          ox: -1.0, oy: 1.5 },
      { t: 0.55, text: 'T9',                 ox:  1.0, oy: 1.5 },
      { t: 0.70, text: 'La Caixa',           ox: -1.0, oy: 1.5 },
    ],
  },
  red_bull_ring: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.37, end: 0.52 }],
    speedTrap: 0.47,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.06, text: 'T1 Castrol',         ox:  1.0, oy: 1.5 },
      { t: 0.30, text: 'T3 Remus',           ox: -1.0, oy: 1.5 },
      { t: 0.55, text: 'T6 Rindt',           ox:  1.0, oy: 1.5 },
      { t: 0.78, text: 'T9–T10',             ox: -1.0, oy: 1.5 },
    ],
  },
  silverstone: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.42, end: 0.56 }],
    speedTrap: 0.50,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.07, text: 'Copse',              ox:  1.0, oy: 1.5 },
      { t: 0.18, text: 'Maggotts / Becketts',ox: -1.4, oy: 1.5 },
      { t: 0.52, text: 'Stowe',              ox:  1.0, oy: 1.5 },
      { t: 0.73, text: 'Club',               ox: -1.0, oy: 1.5 },
    ],
  },
  hungaroring: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.44, end: 0.56 }],
    speedTrap: 0.97,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.05, text: 'T1',                 ox:  1.0, oy: 1.5 },
      { t: 0.28, text: 'T4 Hairpin',         ox: -1.0, oy: 1.5 },
      { t: 0.62, text: 'T11',                ox:  1.0, oy: 1.5 },
    ],
  },
  spa: {
    drsZones: [{ start: 0.28, end: 0.38 }, { start: 0.93, end: 1.00 }],
    speedTrap: 0.345,
    labels: [
      { t: 0.00, text: 'Start / Finish',         ox:  0.5, oy: 2.2 },
      { t: 0.06, text: 'La Source',               ox: -1.4, oy: 2.0 },
      { t: 0.20, text: 'Eau Rouge / Raidillon',   ox:  1.2, oy: 3.8 },
      { t: 0.33, text: 'Kemmel Straight',         ox:  1.2, oy: 1.8 },
      { t: 0.52, text: 'Pouhon',                  ox: -1.2, oy: 1.8 },
      { t: 0.88, text: 'Bus Stop Chicane',         ox:  0.8, oy: 2.0 },
    ],
  },
  zandvoort: {
    drsZones: [{ start: 0.90, end: 1.00 }],
    speedTrap: 0.95,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.06, text: 'Tarzanbocht',        ox:  1.0, oy: 1.5 },
      { t: 0.40, text: 'Hugenholtzbocht',    ox: -1.2, oy: 1.5 },
      { t: 0.60, text: 'Arie Luyendijk',     ox:  1.0, oy: 1.5 },
    ],
  },
  monza: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.38, end: 0.55 }],
    speedTrap: 0.93,
    labels: [
      { t: 0.00, text: 'Start / Finish',        ox:  0.6, oy: 1.8 },
      { t: 0.07, text: 'Variante del Rettifilo', ox:  1.0, oy: 1.5 },
      { t: 0.15, text: 'Curva Grande',           ox: -1.0, oy: 1.5 },
      { t: 0.32, text: 'Lesmo 1 & 2',            ox:  1.0, oy: 1.5 },
      { t: 0.80, text: 'Parabolica',             ox: -1.0, oy: 1.5 },
    ],
  },
  baku: {
    drsZones: [{ start: 0.88, end: 1.00 }, { start: 0.33, end: 0.47 }],
    speedTrap: 0.95,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.07, text: 'T1 Braking Zone',    ox:  1.0, oy: 1.5 },
      { t: 0.40, text: 'Castle Section',     ox: -1.2, oy: 1.5 },
      { t: 0.62, text: 'Fountain',           ox:  1.0, oy: 1.5 },
    ],
  },
  singapore: {
    drsZones: [{ start: 0.88, end: 1.00 }, { start: 0.35, end: 0.48 }],
    speedTrap: 0.45,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.07, text: 'T1–T3',              ox:  1.0, oy: 1.5 },
      { t: 0.30, text: 'Anderson Bridge',    ox: -1.2, oy: 1.5 },
      { t: 0.50, text: 'T10 Hairpin',        ox:  1.0, oy: 1.5 },
    ],
  },
  cota: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.38, end: 0.52 }],
    speedTrap: 0.97,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.06, text: 'T1 Uphill',          ox:  1.0, oy: 1.5 },
      { t: 0.40, text: 'T12',                ox: -1.0, oy: 1.5 },
      { t: 0.60, text: 'T16 Hairpin',        ox:  1.0, oy: 1.5 },
      { t: 0.82, text: 'T20',                ox: -1.0, oy: 1.5 },
    ],
  },
  mexico_city: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.42, end: 0.55 }],
    speedTrap: 0.97,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.06, text: 'T1–T3 Peralta',      ox:  1.0, oy: 1.5 },
      { t: 0.30, text: 'Eses',               ox: -1.0, oy: 1.5 },
      { t: 0.55, text: 'Hairpin',            ox:  1.0, oy: 1.5 },
    ],
  },
  interlagos: {
    drsZones: [{ start: 0.88, end: 1.00 }, { start: 0.35, end: 0.50 }],
    speedTrap: 0.42,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.07, text: 'Senna S',            ox:  1.0, oy: 1.5 },
      { t: 0.30, text: 'Curva do Sol',       ox: -1.0, oy: 1.5 },
      { t: 0.55, text: 'Descida do Lago',    ox:  1.0, oy: 1.5 },
    ],
  },
  las_vegas: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.38, end: 0.55 }],
    speedTrap: 0.95,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.06, text: 'T1 Braking Zone',    ox:  1.0, oy: 1.5 },
      { t: 0.35, text: 'T5 Hairpin',         ox: -1.0, oy: 1.5 },
      { t: 0.72, text: 'Las Vegas Strip',    ox:  1.0, oy: 1.5 },
    ],
  },
  lusail: {
    drsZones: [{ start: 0.90, end: 1.00 }, { start: 0.33, end: 0.48 }],
    speedTrap: 0.36,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.06, text: 'T1',                 ox:  1.0, oy: 1.5 },
      { t: 0.55, text: 'T12',                ox: -1.0, oy: 1.5 },
      { t: 0.77, text: 'T16',                ox:  1.0, oy: 1.5 },
    ],
  },
  yas_marina: {
    drsZones: [{ start: 0.88, end: 1.00 }, { start: 0.35, end: 0.50 }],
    speedTrap: 0.95,
    labels: [
      { t: 0.00, text: 'Start / Finish',     ox:  0.6, oy: 1.8 },
      { t: 0.07, text: 'T1–T3',              ox:  1.0, oy: 1.5 },
      { t: 0.38, text: 'T8–T9',              ox: -1.0, oy: 1.5 },
      { t: 0.65, text: 'T17–T19',            ox:  1.0, oy: 1.5 },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────
   Sector colors — applied universally to ALL circuits
──────────────────────────────────────────────────────────────*/
const S1 = new THREE.Color('#ff1801');
const S2 = new THREE.Color('#1e90ff');
const S3 = new THREE.Color('#ffd700');
function sectorColor(t: number): THREE.Color {
  if (t < 0.333) return S1;
  if (t < 0.666) return S2;
  return S3;
}

/* ─────────────────────────────────────────────────────────────
   Elevation
──────────────────────────────────────────────────────────────*/
function getElevation(file: string, p: number): number {
  if (file === 'spa') {
    if (p > 0.05 && p < 0.25) return Math.sin(((p - 0.05) / 0.20) * (Math.PI / 2)) * 3;
    if (p >= 0.25 && p < 0.70) return 3 - Math.sin(((p - 0.25) / 0.45) * (Math.PI / 2)) * 3;
    return 0;
  }
  if (file === 'monaco' && p > 0.1 && p < 0.3)
    return Math.sin(((p - 0.1) / 0.2) * Math.PI) * 1.5;
  return Math.sin(p * Math.PI * 4) * 0.2;
}

/* ─────────────────────────────────────────────────────────────
   Pulsing Speed Trap Beacon
──────────────────────────────────────────────────────────────*/
function SpeedTrap({ position }: { position: THREE.Vector3 }) {
  const ringRef  = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 4) * 0.35;
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.9 - Math.sin(t * 4) * 0.4;
    }
    if (innerRef.current) innerRef.current.rotation.y = t * 2;
  });
  return (
    <group position={position}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.38, 32]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={innerRef} position={[0, 0.18, 0]}>
        <octahedronGeometry args={[0.13]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={4} />
      </mesh>
      <Html center distanceFactor={14} position={[0, 0.8, 0]}>
        <div style={{
          background: 'rgba(0,255,136,0.10)', border: '1px solid #00ff88',
          borderRadius: 6, padding: '3px 10px', color: '#00ff88',
          fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
          letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap',
          backdropFilter: 'blur(6px)', boxShadow: '0 0 14px #00ff8855',
        }}>⚡ Speed Trap</div>
      </Html>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   Animated DRS glow line (floats above track)
──────────────────────────────────────────────────────────────*/
function DrsLine({ points }: { points: THREE.Vector3[] }) {
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.opacity = 0.55 + Math.sin(clock.getElapsedTime() * 3) * 0.35;
  });
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  return (
    // @ts-ignore
    <line geometry={geo}>
      <lineBasicMaterial ref={matRef} color="#22ff44" transparent opacity={0.8} />
    </line>
  );
}

/* ─────────────────────────────────────────────────────────────
   DRS badge label
──────────────────────────────────────────────────────────────*/
function DrsLabel({ position }: { position: THREE.Vector3 }) {
  return (
    <Html center distanceFactor={18} position={[position.x, position.y + 0.9, position.z]} occlude={false}>
      <div style={{
        background: 'rgba(34,255,68,0.10)', border: '1px solid #22ff44',
        borderRadius: 5, padding: '2px 8px', color: '#22ff44',
        fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
        letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>DRS</div>
    </Html>
  );
}

/* ─────────────────────────────────────────────────────────────
   Floating corner label
──────────────────────────────────────────────────────────────*/
function TrackLabel({
  position, text, ox = 0, oy = 1.6,
}: { position: THREE.Vector3; text: string; ox?: number; oy?: number }) {
  return (
    <Html position={[position.x + ox, position.y + oy, position.z]}
      center distanceFactor={18} occlude={false}>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', bottom: -10, left: '50%',
          transform: 'translateX(-50%)', width: 4, height: 4,
          borderRadius: '50%', background: 'rgba(255,255,255,0.45)',
        }} />
        <div style={{
          background: 'rgba(8,8,12,0.90)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6, padding: '3px 10px', color: '#ddd',
          fontFamily: '"Inter","Arial",sans-serif', fontSize: 10,
          fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
          whiteSpace: 'nowrap', backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 14px #00000077', pointerEvents: 'none',
        }}>{text}</div>
      </div>
    </Html>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Track Model — sectors + overlays on ALL circuits
──────────────────────────────────────────────────────────────*/
function TrackModel({ geojson, circuitFile }: { geojson: GeoJSON; circuitFile: string }) {
  const cfg: CircuitConfig | undefined = CIRCUIT_CONFIGS[circuitFile];

  /* ── Build geometry ── */
  const { tubeGeo, tubeInner, curve } = useMemo(() => {
    const proj = d3.geoMercator().fitExtent([[-10, -10], [10, 10]], {
      type: 'FeatureCollection', features: geojson.features as any,
    });
    let sc: [number, number][] = [];
    geojson.features.forEach(f => {
      if (f.geometry.type === 'LineString')
        sc = sc.concat(f.geometry.coordinates.map(c => proj(c)!).filter(Boolean) as [number, number][]);
    });
    if (sc.length < 2) return { tubeGeo: null, tubeInner: null, curve: null };

    const pts = sc.map(([x, z], i) =>
      new THREE.Vector3(x, getElevation(circuitFile, i / (sc.length - 1)), z),
    );
    const c = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);

    const tubeSeg = sc.length * 2;
    const radSeg  = 12;

    /* outer — vertex-colored by sector */
    const outer = new THREE.TubeGeometry(c, tubeSeg, 0.16, radSeg, false);
    const colors: number[] = [];
    const col = new THREE.Color();
    for (let i = 0; i <= tubeSeg; i++) {
      col.copy(sectorColor(i / tubeSeg));
      for (let j = 0; j <= radSeg; j++) colors.push(col.r, col.g, col.b);
    }
    outer.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    /* inner dark core */
    const inner = new THREE.TubeGeometry(c, tubeSeg, 0.10, radSeg, false);

    return { tubeGeo: outer, tubeInner: inner, curve: c };
  }, [geojson, circuitFile]);

  /* ── Derived positions from curve ── */
  const drsLines = useMemo(() => {
    if (!curve || !cfg) return [];
    return cfg.drsZones.map(({ start, end }) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 60; i++) {
        const t = start + (i / 60) * (end - start);
        const p = curve.getPointAt(Math.min(t, 0.999));
        pts.push(new THREE.Vector3(p.x, p.y + 0.3, p.z));
      }
      return { pts, mid: curve.getPointAt(Math.min((start + end) / 2, 0.999)) };
    });
  }, [curve, cfg]);

  const speedTrapPos = useMemo(
    () => (curve && cfg ? curve.getPointAt(Math.min(cfg.speedTrap, 0.999)) : null),
    [curve, cfg],
  );

  const labelPositions = useMemo(() => {
    if (!curve || !cfg) return [];
    return cfg.labels.map(l => ({
      pos: curve.getPointAt(Math.min(l.t, 0.999)),
      text: l.text, ox: l.ox, oy: l.oy,
    }));
  }, [curve, cfg]);

  if (!tubeGeo) return null;
  const sfPos = curve!.getPointAt(0);

  return (
    <group>
      {/* ── Sector-colored outer tube ── */}
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial vertexColors />
      </mesh>

      {/* ── Dark inner core for neon depth ── */}
      <mesh geometry={tubeInner!}>
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>

      {/* ── DRS Zone lines + DRS badge ── */}
      {drsLines.map((drs, i) => (
        <group key={i}>
          <DrsLine points={drs.pts} />
          <DrsLabel position={drs.mid} />
        </group>
      ))}

      {/* ── Speed Trap beacon ── */}
      {speedTrapPos && <SpeedTrap position={speedTrapPos} />}

      {/* ── Corner / straight labels ── */}
      {labelPositions.map(l => (
        <TrackLabel key={l.text} position={l.pos} text={l.text} ox={l.ox} oy={l.oy} />
      ))}

      {/* ── Start / Finish disc (white ring) ── */}
      <mesh position={[sfPos.x, sfPos.y + 0.06, sfPos.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.30, 32]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   Sector legend HUD
──────────────────────────────────────────────────────────────*/
function SectorLegend({ hasDrs }: { hasDrs: boolean }) {
  return (
    <div style={{
      position: 'absolute', bottom: 10, left: 10, zIndex: 10,
      display: 'flex', flexDirection: 'column', gap: 5,
      pointerEvents: 'none',
    }}>
      {[
        { color: '#ff1801', label: 'Sector 1' },
        { color: '#1e90ff', label: 'Sector 2' },
        { color: '#ffd700', label: 'Sector 3' },
      ].map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 22, height: 4, borderRadius: 2, background: color, boxShadow: `0 0 8px ${color}bb` }} />
          <span style={{ color: '#999', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 }}>{label}</span>
        </div>
      ))}
      {hasDrs && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
          <div style={{ width: 22, height: 4, borderRadius: 2, background: '#22ff44', boxShadow: '0 0 8px #22ff4499' }} />
          <span style={{ color: '#999', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 }}>DRS Zone</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #00ff88', background: 'transparent' }} />
        <span style={{ color: '#999', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 }}>Speed Trap</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Root export
──────────────────────────────────────────────────────────────*/
export default function CircuitMap3D({ circuitId, height = 350 }: CircuitMap3DProps) {
  const [geojson, setGeojson] = useState<GeoJSON | null>(null);
  const [error,   setError  ] = useState(false);

  const filename = CIRCUIT_FILE_MAP[circuitId] ?? circuitId;
  const cfg      = CIRCUIT_CONFIGS[filename];
  const hasDrs   = (cfg?.drsZones?.length ?? 0) > 0;

  useEffect(() => {
    if (!circuitId) return;
    setGeojson(null); setError(false);
    fetch(`/circuits/${filename}.json`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setGeojson)
      .catch(() => setError(true));
  }, [filename, circuitId]);

  return (
    <div style={{ width: '100%', height, position: 'relative' }}
      className="rounded-xl overflow-hidden bg-[#07070a] border border-white/5">

      {/* Badge */}
      <div style={{
        position: 'absolute', top: 10, right: 12, zIndex: 10,
        background: 'rgba(10,10,14,0.85)', border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 6, padding: '3px 10px',
        fontFamily: 'monospace', fontSize: 10, color: '#555',
        letterSpacing: 2, textTransform: 'uppercase', pointerEvents: 'none',
      }}>3D · Interactive</div>

      {/* Legend */}
      {geojson && <SectorLegend hasDrs={hasDrs} />}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
          <span style={{ fontSize: 36 }}>🏁</span>
          <span style={{ color: '#555', fontFamily: 'monospace', fontSize: 12 }}>Layout unavailable</span>
        </div>
      )}

      {/* Spinner */}
      {!geojson && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 rounded-full border-2 border-[#E10600]/20 border-t-[#E10600] animate-spin" />
        </div>
      )}

      {/* Canvas */}
      {geojson && (
        <Canvas camera={{ position: [0, 10, 14], fov: 42 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}>
          <color attach="background" args={['#07070a']} />
          <ambientLight intensity={0.15} />
          <pointLight position={[0, 12, 0]} intensity={0.3} />

          <TrackModel geojson={geojson} circuitFile={filename} />

          <Grid infiniteGrid fadeDistance={30}
            sectionColor="#1e1e28" cellColor="#111118" position={[0, -0.65, 0]} />

          <EffectComposer>
            <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.8} intensity={2.2} mipmapBlur />
          </EffectComposer>

          <OrbitControls enablePan={false}
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={4} maxDistance={30}
            autoRotate autoRotateSpeed={0.7}
            enableDamping dampingFactor={0.07} />
        </Canvas>
      )}
    </div>
  );
}
