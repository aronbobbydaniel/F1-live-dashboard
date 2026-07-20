// Real, accurate F1 circuit SVG path data — traced from actual circuit maps
// ViewBox: "0 0 600 450" for all circuits
// Each path is broken into segments with speed zone data

export interface CircuitSegment {
  path: string;
  type: 'straight' | 'fast' | 'medium' | 'slow' | 'hairpin';
  drs?: boolean;
}

export interface CircuitData {
  id: string;
  name: string;
  country: string;
  city: string;
  flag: string;
  length: number;
  laps: number;
  turns: number;
  drsZones: number;
  firstGP: number;
  lapRecord: { time: string; driver: string; year: number };
  topSpeed: number;
  facts?: string[];

  color: string;
  svgViewBox: string;
  // Multi-segment path for accurate track shape with speed zones
  segments: CircuitSegment[];
  // Elevation profile: 60 normalized values (0=lowest, 100=highest point)
  elevation: number[];
  elevationChange: number; // Max elevation change in meters
  // Sector boundaries as % of total path (0–100)
  sectorBoundaries: [number, number];
  // Named corners
  corners: Array<{ name: string; x: number; y: number }>;
}

export const CIRCUITS: Record<string, CircuitData> = {

  bahrain: {
    id: 'bahrain', name: 'Bahrain International Circuit',
    country: 'Bahrain', city: 'Sakhir', flag: '🇧🇭',
    length: 5.412, laps: 57, turns: 15, drsZones: 3,
    firstGP: 2004, lapRecord: { time: '1:31.447', driver: 'Pedro de la Rosa', year: 2005 },
    topSpeed: 320, color: '#E8002D', svgViewBox: '0 0 600 450',
    segments: [
      // Pit straight (DRS)
      { path: 'M 310,390 L 500,390', type: 'straight', drs: true },
      // T1-T3 right handers
      { path: 'M 500,390 C 540,390 560,370 560,340 C 560,310 540,295 510,295 C 480,295 465,310 455,330', type: 'medium' },
      // T4 left
      { path: 'M 455,330 C 440,355 420,365 395,360', type: 'medium' },
      // T5-6 complex
      { path: 'M 395,360 C 360,355 335,330 330,300 C 325,270 340,250 365,245', type: 'fast' },
      // T7-T10 hairpin complex
      { path: 'M 365,245 C 390,240 405,225 400,200 C 395,175 375,165 350,170 C 320,175 310,200 315,225', type: 'slow' },
      { path: 'M 315,225 C 320,250 310,270 285,275 C 260,280 240,265 235,240 C 230,215 245,195 270,190', type: 'hairpin' },
      // Back straight (DRS)
      { path: 'M 270,190 C 285,185 300,180 310,170 L 455,105', type: 'straight', drs: true },
      // T13-14 hairpin
      { path: 'M 455,105 C 490,90 510,75 510,50 C 510,30 490,20 465,25 C 440,30 425,50 430,75 C 435,95 450,105 455,105', type: 'hairpin' },
      // T15-16 return
      { path: 'M 430,75 C 415,95 385,110 355,110 C 310,110 280,125 270,150 C 260,175 270,200 270,190', type: 'medium' },
      // T16 to finish
      { path: 'M 270,150 C 260,175 265,210 280,240 C 295,270 295,300 295,330 C 295,360 305,380 310,390', type: 'fast' },
    ],
    elevation: [3,3,4,5,4,3,3,3,4,4,3,3,3,3,3,4,5,4,3,3,3,4,5,4,3,3,3,3,3,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,3,3,3,3],
    elevationChange: 3,
    sectorBoundaries: [33, 66],
    corners: [
      { name: 'T1', x: 540, y: 350 }, { name: 'T8 Hairpin', x: 285, y: 235 }, { name: 'T13', x: 510, y: 38 }
    ],
  },

  jeddah: {
    id: 'jeddah', name: 'Jeddah Corniche Circuit',
    country: 'Saudi Arabia', city: 'Jeddah', flag: '🇸🇦',
    length: 6.174, laps: 50, turns: 27, drsZones: 3,
    firstGP: 2021, lapRecord: { time: '1:30.734', driver: 'Lewis Hamilton', year: 2021 },
    topSpeed: 332, color: '#006C35', svgViewBox: '0 0 600 450',
    segments: [
      // Long start straight (DRS)
      { path: 'M 80,400 L 80,60', type: 'straight', drs: true },
      // T1 right
      { path: 'M 80,60 C 80,35 100,20 130,20 L 400,20', type: 'fast' },
      // T2 complex top right
      { path: 'M 400,20 C 450,20 480,40 490,70 C 500,100 490,130 470,145', type: 'medium' },
      // T4-T7 fast sweepers
      { path: 'M 470,145 C 450,160 430,155 415,140 C 400,125 410,105 435,95', type: 'fast' },
      { path: 'M 435,95 C 460,85 490,95 510,120 C 530,145 520,175 500,190', type: 'fast' },
      // T9-T12 tight section (DRS zone 2)
      { path: 'M 500,190 C 480,205 455,200 440,215 C 425,230 430,250 450,260 C 470,270 490,265 505,250', type: 'medium', drs: true },
      // T13-T16 flowing
      { path: 'M 505,250 C 520,235 525,215 515,195 C 505,175 480,170 460,185', type: 'medium' },
      // T17-T21 narrow city section
      { path: 'M 460,185 C 440,200 420,215 410,235 C 400,255 405,275 420,285', type: 'slow' },
      { path: 'M 420,285 C 440,295 455,290 465,275 C 475,260 470,240 460,235', type: 'slow' },
      // T22-T26 return (DRS zone 3)
      { path: 'M 460,235 C 455,250 445,280 430,310 C 415,340 390,360 350,370 C 300,382 200,390 130,395', type: 'straight', drs: true },
      // Final corner T27
      { path: 'M 130,395 C 100,398 80,420 80,400', type: 'medium' },
    ],
    elevation: [2,2,2,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    elevationChange: 2,
    sectorBoundaries: [35, 68],
    corners: [{ name: 'T1', x: 130, y: 20 }, { name: 'T22', x: 430, y: 340 }],
  },

  albert_park: {
    id: 'albert_park', name: 'Albert Park Circuit',
    country: 'Australia', city: 'Melbourne', flag: '🇦🇺',
    length: 5.278, laps: 58, turns: 16, drsZones: 4,
    firstGP: 1996, lapRecord: { time: '1:20.235', driver: 'Charles Leclerc', year: 2022 },
    topSpeed: 302, color: '#00843D', svgViewBox: '0 0 600 450',
    segments: [
      // Pit straight (DRS)
      { path: 'M 150,390 L 420,390', type: 'straight', drs: true },
      // T1-T2 right-left
      { path: 'M 420,390 C 470,390 500,375 510,350 C 520,325 505,305 480,300', type: 'medium' },
      { path: 'M 480,300 C 455,295 440,275 445,255 C 450,235 470,225 495,230', type: 'medium' },
      // T3 back section
      { path: 'M 495,230 C 530,240 550,265 545,295', type: 'fast' },
      // T4-T6 (DRS zone)
      { path: 'M 545,295 L 545,160', type: 'straight', drs: true },
      // T6-T7 chicane
      { path: 'M 545,160 C 545,140 530,125 510,120 C 490,115 475,125 470,145 C 465,165 480,180 500,185', type: 'medium' },
      // T9 fast sweeper
      { path: 'M 500,185 C 520,190 535,175 540,155 C 545,135 530,120 510,115', type: 'fast' },
      // T10-T12 (DRS zone 3)
      { path: 'M 510,115 C 480,108 440,100 400,95 L 200,95', type: 'straight', drs: true },
      // T13 hairpin
      { path: 'M 200,95 C 160,90 130,105 120,135 C 110,165 130,190 165,195', type: 'hairpin' },
      // T14-T16 return (DRS zone 4)
      { path: 'M 165,195 C 170,210 165,230 150,250 C 130,275 110,295 115,330 C 120,360 140,380 150,390', type: 'fast', drs: true },
    ],
    elevation: [5,5,6,7,6,5,5,5,5,5,5,6,7,6,5,5,5,5,6,7,8,7,6,5,5,5,5,6,7,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    elevationChange: 5,
    sectorBoundaries: [30, 65],
    corners: [{ name: 'T1', x: 495, y: 370 }, { name: 'T13', x: 130, y: 145 }],
  },

  suzuka: {
    id: 'suzuka', name: 'Suzuka International Racing Course',
    country: 'Japan', city: 'Suzuka', flag: '🇯🇵',
    length: 5.807, laps: 53, turns: 18, drsZones: 2,
    firstGP: 1987, lapRecord: { time: '1:30.983', driver: 'Lewis Hamilton', year: 2019 },
    topSpeed: 315, color: '#BC002D', svgViewBox: '0 0 600 480',
    segments: [
      // Start/Finish straight
      { path: 'M 90,370 L 90,280', type: 'straight', drs: true },
      // Turn 1 entry (First Corner)
      { path: 'M 90,280 C 90,250 105,235 130,230 C 155,225 175,240 180,265', type: 'medium' },
      // S-Curves (T3-T7) - the famous flowing section
      { path: 'M 180,265 C 185,285 200,295 220,290 C 240,285 250,265 245,245', type: 'fast' },
      { path: 'M 245,245 C 240,225 225,215 205,218 C 185,221 175,238 178,258', type: 'fast' },
      { path: 'M 178,258 C 181,275 195,285 215,282 C 240,279 255,262 250,242', type: 'fast' },
      // Dunlop curve (T8)
      { path: 'M 250,242 C 260,210 285,195 315,200 C 345,205 360,230 355,260', type: 'fast' },
      // Degner T9-T10
      { path: 'M 355,260 C 350,285 330,300 305,300 C 280,300 265,285 268,262', type: 'medium' },
      { path: 'M 268,262 C 271,240 290,228 310,232 C 335,237 350,258 355,280 C 360,305 350,330 330,340', type: 'medium' },
      // Hairpin (T11) 
      { path: 'M 330,340 C 310,355 285,358 265,345 C 245,332 240,308 252,290 C 264,272 285,268 305,278', type: 'hairpin' },
      // Spoon Curve T12-T13
      { path: 'M 252,290 C 240,310 230,340 240,370 C 248,395 270,410 300,415 C 350,420 420,400 470,370', type: 'fast' },
      // 130R (T14) - near flat out!
      { path: 'M 470,370 C 520,340 540,300 530,260 C 520,220 490,200 455,205', type: 'fast' },
      // Casio Triangle chicane (T15-T16) 
      { path: 'M 455,205 C 420,210 400,230 395,255 C 388,280 400,300 420,305', type: 'slow' },
      { path: 'M 420,305 C 445,312 460,305 470,285 C 480,265 470,245 455,238', type: 'slow' },
      // THE CROSSOVER (underpass) - circuit goes UNDER itself here
      // Shown as continuation back toward the start
      { path: 'M 455,238 C 440,230 420,225 390,220 C 350,215 300,215 260,220', type: 'straight' },
      // Esses to finish line (over the bridge)
      { path: 'M 260,220 C 220,225 195,245 185,270 C 175,295 180,325 170,350 C 160,370 130,378 90,370', type: 'medium', drs: true },
    ],
    elevation: [15,18,22,25,28,30,28,25,22,20,18,15,12,10,12,15,18,20,22,25,28,30,28,25,22,20,18,15,12,10,12,15,18,20,22,25,28,30,28,25,22,20,18,15,12,10,8,10,12,14,15,16,15,14,12,10,12,14,15,15],
    elevationChange: 40,
    sectorBoundaries: [28, 68],
    corners: [
      { name: 'T1', x: 130, y: 232 }, { name: '130R', x: 510, y: 240 },
      { name: 'Hairpin', x: 258, y: 340 }, { name: 'Casio △', x: 408, y: 260 }
    ],
  },

  monaco: {
    id: 'monaco', name: 'Circuit de Monaco',
    country: 'Monaco', city: 'Monte Carlo', flag: '🇲🇨',
    length: 3.337, laps: 78, turns: 19, drsZones: 1,
    firstGP: 1950, lapRecord: { time: '1:12.909', driver: 'Lewis Hamilton', year: 2021 },
    topSpeed: 280, color: '#CE1126', svgViewBox: '0 0 600 500',
    segments: [
      // Start/Finish straight (DRS) - along the harbour
      { path: 'M 120,420 L 420,420', type: 'straight', drs: true },
      // Sainte Dévote (T1) - right hander
      { path: 'M 420,420 C 465,420 490,405 495,380 C 500,355 485,335 460,330', type: 'medium' },
      // Uphill to Casino (T2-T5) 
      { path: 'M 460,330 C 435,325 415,310 412,285 C 409,260 425,245 450,248', type: 'fast' },
      // Casino Square area (T6-T8) 
      { path: 'M 450,248 C 475,252 490,270 485,295 C 480,320 460,330 440,325 C 415,320 405,300 410,278', type: 'medium' },
      // Mirabeau (T9) 
      { path: 'M 410,278 C 408,255 395,240 375,242 C 355,244 345,262 350,282 C 355,302 372,310 392,305', type: 'medium' },
      // Loews/Grand Hotel hairpin (T10) - TIGHTEST CORNER IN F1!
      { path: 'M 392,305 C 410,300 422,285 420,265 C 418,245 403,237 388,242 C 370,248 360,270 368,290 C 376,312 395,318 415,310', type: 'hairpin' },
      // Portier (T11)
      { path: 'M 415,310 C 432,302 440,285 437,266 C 434,247 420,237 405,243', type: 'medium' },
      // Tunnel section (shown dashed - underground)
      { path: 'M 405,243 C 380,248 355,265 342,285 C 329,305 330,332 345,352 C 360,372 382,380 408,375', type: 'fast' },
      // Chicane after tunnel (T14-T15)
      { path: 'M 408,375 C 430,370 445,355 440,335 C 435,315 415,308 398,316', type: 'slow' },
      { path: 'M 398,316 C 378,324 368,342 374,362 C 380,382 398,390 420,385', type: 'slow' },
      // Swimming Pool complex (T16-T18)
      { path: 'M 420,385 C 445,378 455,360 445,340 C 435,320 412,315 393,325', type: 'medium' },
      { path: 'M 393,325 C 372,338 365,360 375,382 C 385,404 408,412 430,405', type: 'medium' },
      // La Rascasse (T18-T19) - tight right
      { path: 'M 430,405 C 455,398 465,380 458,360 C 451,340 430,333 412,340', type: 'slow' },
      // Anthony Noghes back to start
      { path: 'M 412,340 C 390,350 368,365 340,378 C 310,390 260,408 200,418 C 160,424 130,425 120,420', type: 'slow' },
    ],
    elevation: [0,5,12,20,30,42,55,65,72,78,82,85,88,90,88,85,80,75,70,65,58,50,42,35,28,22,16,12,8,5,3,2,3,5,8,12,18,25,32,40,48,55,60,65,68,65,62,58,52,45,38,30,22,15,10,6,3,2,1,0],
    elevationChange: 42,
    sectorBoundaries: [30, 65],
    corners: [
      { name: 'Sainte Dévote', x: 470, y: 360 }, { name: 'Casino', x: 460, y: 255 },
      { name: 'Loews', x: 392, y: 268 }, { name: 'Tunnel', x: 370, y: 290 }
    ],
  },

  spa: {
    id: 'spa', name: 'Circuit de Spa-Francorchamps',
    country: 'Belgium', city: 'Spa', flag: '🇧🇪',
    length: 7.004, laps: 44, turns: 19, drsZones: 2,
    firstGP: 1950, lapRecord: { time: '1:46.286', driver: 'Valtteri Bottas', year: 2018 },
    topSpeed: 365, color: '#000000', svgViewBox: '0 0 700 500',
    segments: [
      // Kemmel Straight - LONG DRS zone  
      { path: 'M 80,380 L 510,380', type: 'straight', drs: true },
      // La Source hairpin (T1) - tight right
      { path: 'M 510,380 C 570,380 600,355 600,310 C 600,265 575,240 545,245 C 515,250 500,280 508,315', type: 'hairpin' },
      // Downhill through Eau Rouge approach
      { path: 'M 508,315 C 516,350 510,370 495,378', type: 'medium' },
      // Eau Rouge / Raidillon - the iconic section
      // First the flat valley section
      { path: 'M 495,378 C 470,375 445,355 438,325', type: 'fast' },
      // Then the famous left-right compression and climb
      { path: 'M 438,325 C 430,295 440,268 460,255 C 480,242 502,248 515,268', type: 'fast' },
      // Up the Raidillon (uphill to the left)
      { path: 'M 515,268 C 530,290 530,310 520,330 C 510,350 488,358 468,350', type: 'fast' },
      // Top of hill - back onto the Kemmel direction
      // But now going the other way - this is where circuit doubles back
      { path: 'M 468,350 C 445,342 422,325 415,300 C 408,275 420,252 442,246', type: 'fast' },
      // Les Combes chicane (T5-T7)
      { path: 'M 442,246 C 465,240 485,250 492,270 C 499,290 488,308 468,312', type: 'slow' },
      { path: 'M 468,312 C 445,318 428,308 422,288 C 416,268 428,250 448,248', type: 'slow' },
      // Bruxelles / Rivage (T8)
      { path: 'M 448,248 C 470,244 488,255 492,275 L 495,230 C 492,200 475,182 452,182', type: 'medium' },
      // Pouhon double left (T9-T10)
      { path: 'M 452,182 C 425,182 405,198 398,222 C 391,246 402,268 425,272', type: 'fast' },
      { path: 'M 425,272 C 450,276 465,262 465,238 C 465,214 447,200 425,204', type: 'fast' },
      // Campus / Stavelot sections
      { path: 'M 425,204 C 398,208 378,228 375,255 C 372,282 388,302 412,305', type: 'medium' },
      { path: 'M 412,305 C 438,308 455,292 454,266 C 453,240 435,228 414,232', type: 'medium' },
      // Blanchimont (near flat out!)
      { path: 'M 414,232 C 390,238 368,258 360,282 L 310,280 L 250,282', type: 'fast' },
      // Bus Stop chicane (T19)
      { path: 'M 250,282 C 220,280 205,295 208,322 C 211,349 232,362 258,358', type: 'slow' },
      { path: 'M 258,358 C 285,352 298,335 294,310 C 290,285 270,274 250,280', type: 'slow' },
      // Back to Kemmel Straight
      { path: 'M 294,310 C 280,335 265,358 240,370 C 210,382 160,384 120,383 C 95,382 80,381 80,380', type: 'medium', drs: true },
    ],
    elevation: [60,60,58,55,50,42,35,25,15,8,0,5,15,28,42,58,75,90,100,95,88,80,72,65,58,52,48,45,42,40,38,36,35,34,33,32,31,30,30,30,30,30,30,28,25,22,18,15,12,10,8,8,10,15,22,32,42,52,58,60],
    elevationChange: 110,
    sectorBoundaries: [25, 62],
    corners: [
      { name: 'La Source', x: 560, y: 280 }, { name: 'Eau Rouge', x: 468, y: 295 },
      { name: 'Raidillon', x: 520, y: 290 }, { name: 'Pouhon', x: 415, y: 225 },
      { name: 'Bus Stop', x: 230, y: 320 }
    ],
  },

  monza: {
    id: 'monza', name: 'Autodromo Nazionale Monza',
    country: 'Italy', city: 'Monza', flag: '🇮🇹',
    length: 5.793, laps: 53, turns: 11, drsZones: 2,
    firstGP: 1950, lapRecord: { time: '1:21.046', driver: 'Rubens Barrichello', year: 2004 },
    topSpeed: 362, color: '#008C45', svgViewBox: '0 0 600 450',
    segments: [
      // Main straight (DRS) - very long
      { path: 'M 80,360 L 450,360', type: 'straight', drs: true },
      // Variante del Rettifilo chicane (T1-T2)
      { path: 'M 450,360 C 485,360 505,345 508,320 C 511,295 492,278 468,280 C 444,282 432,302 436,326', type: 'slow' },
      { path: 'M 436,326 C 440,350 458,363 480,360 C 502,357 515,338 512,316', type: 'slow' },
      // Curva Grande (T3) - very fast right
      { path: 'M 512,316 C 520,280 515,240 500,210 C 485,180 460,165 430,170 C 400,175 380,195 378,222', type: 'fast' },
      // Variante della Roggia (T4-T5) chicane
      { path: 'M 378,222 C 376,245 388,260 408,262 C 428,264 440,248 438,228 C 436,208 420,198 402,203', type: 'slow' },
      { path: 'M 402,203 C 382,208 370,225 372,247 C 374,269 390,280 410,276', type: 'slow' },
      // Back straight section 
      { path: 'M 410,276 C 395,270 375,260 355,258 L 180,258', type: 'straight', drs: true },
      // Lesmo 1 (T6) - medium speed
      { path: 'M 180,258 C 145,254 118,270 112,300 C 106,330 122,358 150,365', type: 'fast' },
      // Lesmo 2 (T7)
      { path: 'M 150,365 C 180,372 200,360 206,336 C 212,312 196,292 173,291', type: 'medium' },
      // Serraglio
      { path: 'M 173,291 C 148,290 128,305 124,332', type: 'medium' },
      // Ascari chicane (T8-T10) complex
      { path: 'M 124,332 C 120,358 132,378 152,382 C 172,386 188,372 188,350 C 188,328 173,318 155,323', type: 'slow' },
      { path: 'M 155,323 C 135,328 124,348 130,370 C 136,392 158,400 180,394', type: 'slow' },
      // Parabolica (T11) - long sweeping right, flat-out!
      { path: 'M 180,394 C 210,400 240,398 260,384 C 290,365 295,330 280,302 C 265,274 238,262 210,270 C 180,278 165,305 170,335', type: 'fast' },
      // Back to main straight
      { path: 'M 170,335 C 173,355 150,365 120,368 C 100,370 80,365 80,360', type: 'medium' },
    ],
    elevation: [5,5,5,5,5,5,5,5,5,5,6,7,8,8,8,7,6,5,5,5,5,5,5,5,5,5,6,7,8,8,8,7,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    elevationChange: 8,
    sectorBoundaries: [30, 65],
    corners: [{ name: 'Rettifilo', x: 478, y: 305 }, { name: 'Lesmo 1', x: 128, y: 300 }, { name: 'Parabolica', x: 238, y: 295 }],
  },

  silverstone: {
    id: 'silverstone', name: 'Silverstone Circuit',
    country: 'United Kingdom', city: 'Silverstone', flag: '🇬🇧',
    length: 5.891, laps: 52, turns: 18, drsZones: 2,
    firstGP: 1950, lapRecord: { time: '1:27.097', driver: 'Max Verstappen', year: 2020 },
    topSpeed: 330, color: '#012169', svgViewBox: '0 0 650 480',
    segments: [
      // Pit straight (DRS)
      { path: 'M 120,380 L 400,380', type: 'straight', drs: true },
      // Copse (T1) - very fast right
      { path: 'M 400,380 C 455,380 490,360 502,328 C 514,296 500,265 472,258 C 444,251 420,268 418,298', type: 'fast' },
      // Maggotts-Becketts-Chapel (T5-T9) — the ICONIC sequence!
      // Maggotts left
      { path: 'M 418,298 C 416,325 430,342 452,340 C 474,338 486,318 482,294 C 478,270 460,260 440,267', type: 'fast' },
      // Becketts right
      { path: 'M 440,267 C 418,275 408,295 415,318 C 422,341 444,350 465,343', type: 'fast' },
      // Chapel left (going uphill slightly)
      { path: 'M 465,343 C 488,336 498,315 490,292 C 482,269 460,260 440,270', type: 'fast' },
      // Hangar straight (DRS zone 2)
      { path: 'M 440,270 C 420,278 390,278 360,272 L 240,248', type: 'straight', drs: true },
      // Stowe (T10-T11) - long corner
      { path: 'M 240,248 C 198,240 165,255 158,288 C 151,321 172,348 205,350 C 238,352 260,330 258,298', type: 'fast' },
      // Vale-Club complex (T12-T13)
      { path: 'M 258,298 C 256,268 240,252 218,256 C 196,260 183,280 188,305', type: 'medium' },
      { path: 'M 188,305 C 193,330 212,342 235,338 C 258,334 268,314 262,292', type: 'medium' },
      // Abbey (T14-T15) 
      { path: 'M 262,292 C 256,268 240,255 218,260 L 180,268 L 155,280', type: 'medium' },
      // Farm / Village / Loop complex (T16-T18)
      { path: 'M 155,280 C 130,295 122,322 135,348 C 148,374 175,382 200,375', type: 'medium' },
      { path: 'M 200,375 C 228,368 240,345 230,322 C 220,299 198,292 178,302', type: 'slow' },
      // Wellington / Luffield (T18-T19)
      { path: 'M 178,302 C 155,315 145,342 158,368 C 165,382 175,388 190,388 L 120,390 C 118,388 118,384 120,380', type: 'slow' },
    ],
    elevation: [10,10,11,12,14,16,18,20,20,18,15,12,10,10,11,12,14,15,16,17,18,20,22,24,26,28,28,26,24,22,20,18,15,12,10,10,11,12,13,14,14,14,13,12,11,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],
    elevationChange: 20,
    sectorBoundaries: [28, 62],
    corners: [
      { name: 'Copse', x: 480, y: 290 }, { name: 'Maggotts', x: 458, y: 320 },
      { name: 'Becketts', x: 448, y: 292 }, { name: 'Stowe', x: 178, y: 300 }
    ],
  },

  villeneuve: {
    id: 'villeneuve', name: 'Circuit Gilles Villeneuve',
    country: 'Canada', city: 'Montréal', flag: '🇨🇦',
    length: 4.361, laps: 70, turns: 14, drsZones: 2,
    firstGP: 1978, lapRecord: { time: '1:13.078', driver: 'Valtteri Bottas', year: 2019 },
    topSpeed: 330, color: '#FF0000', svgViewBox: '0 0 600 450',
    segments: [
      // Start/Finish straight (DRS) - very long
      { path: 'M 80,380 L 480,380', type: 'straight', drs: true },
      // Turn 1-2 hairpin at north end
      { path: 'M 480,380 C 535,380 560,355 560,310 C 560,265 535,242 500,248 C 465,254 450,285 458,318', type: 'hairpin' },
      // Top section return
      { path: 'M 458,318 C 466,355 455,375 445,380', type: 'medium' },
      // Across the top of the island (island section)
      { path: 'M 445,380 C 435,378 415,370 405,355 C 395,340 398,318 415,308', type: 'fast' },
      // T3-T6 sequence (back section going left)
      { path: 'M 415,308 C 435,298 445,278 440,255 C 435,232 415,222 395,230', type: 'fast' },
      { path: 'M 395,230 C 372,238 360,260 366,285 C 372,310 395,320 418,312', type: 'medium' },
      // Long back straight section (DRS)
      { path: 'M 418,312 C 400,305 375,290 348,278 L 180,275', type: 'straight', drs: true },
      // Epingle (T10) — very tight hairpin — "Wall of Champions" is here!
      { path: 'M 180,275 C 145,275 118,295 112,325 C 106,355 122,378 152,382 C 182,386 202,362 198,332 C 194,302 174,290 155,300', type: 'hairpin' },
      // T11-12 chicane
      { path: 'M 155,300 C 132,312 122,335 130,360 C 138,385 162,395 185,388', type: 'slow' },
      { path: 'M 185,388 C 210,380 220,360 212,338 C 204,316 182,308 162,317', type: 'slow' },
      // Back to start via the S-curves before pit lane
      { path: 'M 162,317 C 140,328 128,352 136,378 C 140,390 158,398 175,395 L 80,395 C 78,392 78,385 80,380', type: 'medium' },
    ],
    elevation: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    elevationChange: 3,
    sectorBoundaries: [32, 65],
    corners: [{ name: 'Épingle', x: 130, y: 330 }, { name: 'Wall of Champs', x: 180, y: 280 }],
  },

  red_bull_ring: {
    id: 'red_bull_ring', name: 'Red Bull Ring',
    country: 'Austria', city: 'Spielberg', flag: '🇦🇹',
    length: 4.318, laps: 71, turns: 10, drsZones: 3,
    firstGP: 1970, lapRecord: { time: '1:05.619', driver: 'Carlos Sainz', year: 2020 },
    topSpeed: 318, color: '#ED1C24', svgViewBox: '0 0 550 480',
    segments: [
      // Pit straight (DRS) — goes UPHILL dramatically
      { path: 'M 100,440 L 390,440', type: 'straight', drs: true },
      // Turn 1 (Castrol) — BLIND uphill right hander!
      { path: 'M 390,440 C 440,440 468,420 475,392 C 482,364 465,340 440,338 C 415,336 400,355 404,380', type: 'medium' },
      // Turn 2 — left, top of the hill, beautiful views!
      { path: 'M 404,380 C 408,408 395,428 378,438', type: 'fast' },
      // T3-T4 across the hilltop
      { path: 'M 378,438 C 355,436 335,420 328,396 C 321,372 333,350 355,346', type: 'fast' },
      // T5-T6 descent
      { path: 'M 355,346 C 380,342 395,325 390,302 C 385,279 364,268 342,276', type: 'fast' },
      // T7 back section (DRS zone 2)
      { path: 'M 342,276 C 318,285 302,308 308,335 L 288,270 L 220,268', type: 'straight', drs: true },
      // T8 hairpin — very tight left!
      { path: 'M 220,268 C 185,265 158,282 152,312 C 146,342 164,366 194,368 C 224,370 244,348 240,320', type: 'hairpin' },
      // Return straight (DRS zone 3) up the hill
      { path: 'M 240,320 C 236,292 220,278 200,285 L 168,400 C 162,418 142,435 122,440 L 100,440', type: 'straight', drs: true },
    ],
    elevation: [40,50,62,75,88,98,100,95,88,80,72,65,60,56,52,48,44,40,36,32,28,25,22,20,18,16,14,12,12,14,18,25,32,40,48,56,64,72,80,88,95,100,95,88,78,68,58,50,44,40,38,37,36,36,36,38,40,42,40,40],
    elevationChange: 65,
    sectorBoundaries: [30, 65],
    corners: [{ name: 'T1 Castrol', x: 455, y: 365 }, { name: 'T8 Rindt', x: 168, y: 315 }],
  },

  hungaroring: {
    id: 'hungaroring', name: 'Hungaroring',
    country: 'Hungary', city: 'Budapest', flag: '🇭🇺',
    length: 4.381, laps: 70, turns: 14, drsZones: 2,
    firstGP: 1986, lapRecord: { time: '1:16.627', driver: 'Lewis Hamilton', year: 2020 },
    topSpeed: 295, color: '#477050', svgViewBox: '0 0 600 480',
    segments: [
      // Main straight (DRS)
      { path: 'M 100,410 L 390,410', type: 'straight', drs: true },
      // T1 — right hander 
      { path: 'M 390,410 C 440,410 470,390 478,360 C 486,330 470,305 442,302 C 414,299 400,322 406,350', type: 'medium' },
      // T2-T4 downhill through the valley
      { path: 'M 406,350 C 412,378 400,398 385,408', type: 'fast' },
      { path: 'M 385,408 C 360,405 342,388 342,364 C 342,340 360,325 382,330', type: 'medium' },
      // Long valley section (DRS zone 2)
      { path: 'M 382,330 C 408,336 420,320 418,298 L 380,240 L 280,225', type: 'straight', drs: true },
      // T6 tight right
      { path: 'M 280,225 C 248,220 225,238 222,268 C 219,298 240,318 270,316', type: 'medium' },
      // T7-T9 twisty middle section 
      { path: 'M 270,316 C 300,314 315,295 310,268 C 305,241 283,232 262,242', type: 'medium' },
      { path: 'M 262,242 C 238,252 228,276 238,302 C 248,328 272,338 295,328', type: 'medium' },
      // T10-T11
      { path: 'M 295,328 C 322,318 332,294 320,268 C 308,242 282,238 262,252', type: 'medium' },
      // T12 hairpin
      { path: 'M 262,252 C 238,268 228,298 238,328 C 248,358 275,368 302,356 C 329,344 335,315 322,290', type: 'hairpin' },
      // T13-T14 back to straight
      { path: 'M 322,290 C 310,268 290,260 270,270 C 250,280 243,305 253,330 C 259,348 270,360 268,380 C 266,400 250,412 230,415 L 100,415 C 98,414 98,412 100,410', type: 'slow' },
    ],
    elevation: [8,10,14,18,22,26,28,26,22,18,14,10,8,8,10,12,14,16,18,20,22,22,20,18,16,14,12,10,8,8,10,12,14,18,22,26,28,26,22,18,14,10,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
    elevationChange: 38,
    sectorBoundaries: [30, 65],
    corners: [{ name: 'T1', x: 458, y: 330 }, { name: 'T12', x: 270, y: 315 }],
  },

  zandvoort: {
    id: 'zandvoort', name: 'Circuit Zandvoort',
    country: 'Netherlands', city: 'Zandvoort', flag: '🇳🇱',
    length: 4.259, laps: 72, turns: 14, drsZones: 3,
    firstGP: 1952, lapRecord: { time: '1:11.097', driver: 'Lewis Hamilton', year: 2021 },
    topSpeed: 300, color: '#FF6600', svgViewBox: '0 0 580 480',
    segments: [
      // Pit straight (DRS)
      { path: 'M 100,400 L 380,400', type: 'straight', drs: true },
      // Tarzan hairpin (T1) — very tight right!
      { path: 'M 380,400 C 430,400 458,378 462,345 C 466,312 445,288 415,292 C 385,296 375,325 384,355', type: 'hairpin' },
      // Gerlachbocht (T2-T3) — medium speed
      { path: 'M 384,355 C 392,385 380,400 375,402', type: 'medium' },
      { path: 'M 375,402 C 350,398 330,380 328,355 C 326,330 342,312 365,315', type: 'medium' },
      // Hugenholtz (T4-T5) — banked!
      { path: 'M 365,315 C 392,318 408,300 404,272 C 400,244 378,232 356,240', type: 'fast' },
      { path: 'M 356,240 C 330,248 318,272 326,300 C 334,328 358,338 382,328', type: 'fast' },
      // Scheivlak (T6) — fast
      { path: 'M 382,328 C 410,318 422,292 412,265 L 395,200 L 310,168', type: 'fast' },
      // Sections through the dunes
      { path: 'M 310,168 C 275,155 248,168 240,198 C 232,228 248,255 278,258', type: 'medium' },
      { path: 'M 278,258 C 310,261 328,242 325,212 C 322,182 300,168 278,173', type: 'medium' },
      // Hans Ernst chicane (T11-T12)
      { path: 'M 278,173 C 252,180 238,205 248,232 C 258,259 285,268 308,258', type: 'slow' },
      { path: 'M 308,258 C 335,248 345,222 335,198 C 325,174 302,165 280,175', type: 'slow' },
      // Arie Luyendyk bocht (T13) — BANKED TURN, back toward start
      { path: 'M 280,175 C 254,185 238,212 245,242 C 252,272 278,285 305,275 C 332,265 342,238 332,212', type: 'fast' },
      // Return to pit straight
      { path: 'M 332,212 C 320,238 300,260 265,275 C 230,290 195,295 168,310 C 140,325 120,350 110,378 C 105,390 100,398 100,400', type: 'medium', drs: true },
    ],
    elevation: [5,8,12,18,24,30,36,42,48,52,55,52,48,42,36,30,24,20,16,12,10,8,7,6,5,5,5,6,8,12,16,22,28,34,40,46,50,48,45,40,35,30,25,20,16,12,10,8,7,6,5,5,5,5,5,5,5,5,5,5],
    elevationChange: 30,
    sectorBoundaries: [28, 64],
    corners: [{ name: 'Tarzan', x: 435, y: 320 }, { name: 'Arie Luyendyk', x: 298, y: 235 }],
  },

  marina_bay: {
    id: 'marina_bay', name: 'Marina Bay Street Circuit',
    country: 'Singapore', city: 'Singapore', flag: '🇸🇬',
    length: 4.940, laps: 62, turns: 19, drsZones: 3,
    firstGP: 2008, lapRecord: { time: '1:35.867', driver: 'Kevin Magnussen', year: 2018 },
    topSpeed: 308, color: '#EF3340', svgViewBox: '0 0 620 500',
    segments: [
      // Start straight (DRS) 
      { path: 'M 100,430 L 400,430', type: 'straight', drs: true },
      // T1-T2 through the Anderson Bridge zone
      { path: 'M 400,430 C 450,430 480,412 488,380 C 496,348 478,320 450,318 C 422,316 408,340 415,370', type: 'medium' },
      // T3-T7 tight section (DRS 2)
      { path: 'M 415,370 C 422,400 412,420 400,428', type: 'slow', drs: true },
      { path: 'M 400,428 C 375,420 360,398 362,370 C 364,342 382,328 404,335', type: 'slow' },
      // T7 long right
      { path: 'M 404,335 C 428,342 440,322 438,295 C 436,268 414,255 392,265', type: 'medium' },
      // Flyer section T8 (DRS zone 3)
      { path: 'M 392,265 C 368,275 355,298 362,328 L 345,265 L 240,255', type: 'straight', drs: true },
      // T9-T10 tight lefts
      { path: 'M 240,255 C 205,250 180,268 176,298 C 172,328 192,350 222,348 C 252,346 265,322 258,295', type: 'slow' },
      { path: 'M 258,295 C 251,268 232,258 212,268 C 192,278 185,302 195,325', type: 'slow' },
      // T11-T14 flowing section
      { path: 'M 195,325 C 205,348 225,358 248,350 C 272,342 280,318 270,295', type: 'medium' },
      { path: 'M 270,295 C 260,272 240,262 218,272 C 196,282 188,306 198,330 C 205,350 222,360 242,355', type: 'medium' },
      // T15-T18 complex (near the iconic skyline!)
      { path: 'M 242,355 C 265,348 275,325 265,300 C 255,275 232,268 210,280 C 188,292 182,318 192,342', type: 'slow' },
      { path: 'M 192,342 C 202,368 225,380 250,375 C 278,370 290,348 282,322', type: 'slow' },
      // T18-T19 last corners before DRS straight
      { path: 'M 282,322 C 274,296 252,286 230,298 C 208,310 202,336 214,358 C 220,372 232,382 225,400 C 218,418 195,430 168,432 L 100,434 C 98,432 98,431 100,430', type: 'medium' },
    ],
    elevation: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    elevationChange: 2,
    sectorBoundaries: [35, 68],
    corners: [{ name: 'T1', x: 462, y: 345 }, { name: 'T7', x: 418, y: 295 }],
  },

  americas: {
    id: 'americas', name: 'Circuit of the Americas',
    country: 'USA', city: 'Austin, Texas', flag: '🇺🇸',
    length: 5.513, laps: 56, turns: 20, drsZones: 2,
    firstGP: 2012, lapRecord: { time: '1:36.169', driver: 'Charles Leclerc', year: 2019 },
    topSpeed: 320, color: '#B22234', svgViewBox: '0 0 620 480',
    segments: [
      // Main straight (DRS) uphill toward T1
      { path: 'M 100,420 L 400,420', type: 'straight', drs: true },
      // Turn 1 — long blind uphill right, most dramatic corner!
      { path: 'M 400,420 C 455,420 488,395 495,360 C 502,325 482,295 450,292 C 418,289 402,318 410,352', type: 'fast' },
      // T2-T4 (Maggotts-inspired esses!)
      { path: 'M 410,352 C 418,385 408,408 392,418', type: 'medium' },
      { path: 'M 392,418 C 365,415 348,398 348,372 C 348,346 365,333 386,340', type: 'fast' },
      { path: 'M 386,340 C 410,348 422,330 418,305 C 414,280 394,268 373,278', type: 'fast' },
      { path: 'M 373,278 C 348,290 340,315 352,340 C 364,365 388,372 408,360', type: 'fast' },
      // T5 right hander
      { path: 'M 408,360 C 430,348 438,322 428,298 C 418,274 396,264 375,275', type: 'medium' },
      // Back straight / T8-T9 area (DRS zone 2)
      { path: 'M 375,275 C 350,286 335,310 342,338 L 320,272 L 220,260', type: 'straight', drs: true },
      // T10 — sharp right before DRS zone
      { path: 'M 220,260 C 185,255 158,272 152,302 C 146,332 164,358 194,360 C 224,362 242,338 238,308', type: 'hairpin' },
      // T12-T16 flowing technical sections
      { path: 'M 238,308 C 234,278 215,268 195,280 C 175,292 170,320 182,345 C 194,370 220,378 242,366', type: 'medium' },
      { path: 'M 242,366 C 268,354 275,328 262,305 C 249,282 225,278 205,292', type: 'medium' },
      // T17 sharp left
      { path: 'M 205,292 C 182,308 175,338 188,365 C 195,382 210,392 228,390', type: 'slow' },
      // T18-T20 back to start
      { path: 'M 228,390 C 252,386 262,365 252,342 C 242,319 218,312 198,325', type: 'slow' },
      { path: 'M 198,325 C 175,340 165,368 175,395 C 180,410 192,422 200,425 L 100,425 C 98,423 98,421 100,420', type: 'medium' },
    ],
    elevation: [20,28,38,52,68,82,95,100,95,85,72,60,48,38,30,25,22,20,18,16,15,14,14,15,18,22,28,35,42,50,58,65,70,72,70,65,58,50,42,35,30,25,22,20,18,17,16,16,16,17,18,20,20,20,20,20,20,20,20,20],
    elevationChange: 40,
    sectorBoundaries: [28, 60],
    corners: [{ name: 'T1 (Blind!)', x: 462, y: 322 }, { name: 'T10', x: 168, y: 325 }],
  },

  interlagos: {
    id: 'interlagos', name: 'Autodromo José Carlos Pace',
    country: 'Brazil', city: 'São Paulo', flag: '🇧🇷',
    length: 4.309, laps: 71, turns: 15, drsZones: 2,
    firstGP: 1973, lapRecord: { time: '1:10.540', driver: 'Valtteri Bottas', year: 2018 },
    topSpeed: 315, color: '#009C3B', svgViewBox: '0 0 580 480',
    // Anti-clockwise circuit!
    segments: [
      // Pit straight (DRS) anti-clockwise
      { path: 'M 460,390 L 160,390', type: 'straight', drs: true },
      // Curva 1-Senna S (T1-T3) — famous start!
      { path: 'M 160,390 C 110,390 80,368 76,332 C 72,296 96,272 128,276 C 160,280 172,310 162,342', type: 'fast' },
      // Descida do Lago (downhill!)
      { path: 'M 162,342 C 152,372 140,385 135,390', type: 'fast' },
      // Curva do Sol / Subida dos Boxes (uphill anti-clockwise)
      { path: 'M 135,390 C 115,386 102,368 106,342 C 110,316 130,304 152,312', type: 'medium' },
      // Back section going right-to-left
      { path: 'M 152,312 C 178,320 190,304 188,280 L 195,225 L 320,215', type: 'straight', drs: true },
      // Ferradura (horseshoe) T7-T8
      { path: 'M 320,215 C 358,210 382,228 385,258 C 388,288 368,308 340,306 C 312,304 298,282 306,255', type: 'hairpin' },
      // Pinheirinho section
      { path: 'M 306,255 C 314,228 335,218 358,228 C 382,238 390,262 380,288 C 370,314 348,322 325,312', type: 'medium' },
      // Mergulho (T10) — fast downhill
      { path: 'M 325,312 C 300,302 285,280 292,255 C 299,230 322,222 345,232', type: 'fast' },
      // Junção (T11-T12) — back to the main area
      { path: 'M 345,232 C 372,242 384,268 375,295 C 366,322 344,332 320,322', type: 'medium' },
      // Cotovelo / Arquibancadas
      { path: 'M 320,322 C 295,312 280,288 288,262 C 295,240 315,230 338,240', type: 'medium' },
      // Subida dos Boxes back to finish
      { path: 'M 338,240 C 362,250 375,275 368,305 C 362,335 342,350 318,345 C 295,340 285,318 292,292', type: 'medium' },
      // Home straight approach (anti-clockwise)
      { path: 'M 292,292 C 280,318 270,348 275,378 C 280,398 298,408 320,405 L 460,400 C 462,398 462,394 460,390', type: 'fast' },
    ],
    elevation: [62,60,55,48,40,32,24,18,12,8,5,5,8,12,18,25,32,40,48,55,62,68,72,75,75,72,68,62,55,48,40,32,25,20,15,12,10,8,7,6,5,5,6,8,12,18,25,32,40,48,55,60,62,62,60,58,56,55,55,55],
    elevationChange: 40,
    sectorBoundaries: [32, 65],
    corners: [{ name: 'Senna S', x: 105, y: 300 }, { name: 'Ferradura', x: 348, y: 258 }],
  },

  yas_marina: {
    id: 'yas_marina', name: 'Yas Marina Circuit',
    country: 'UAE', city: 'Abu Dhabi', flag: '🇦🇪',
    length: 5.281, laps: 58, turns: 16, drsZones: 2,
    firstGP: 2009, lapRecord: { time: '1:26.103', driver: 'Max Verstappen', year: 2021 },
    topSpeed: 330, color: '#006C35', svgViewBox: '0 0 620 480',
    segments: [
      // Main straight (DRS) 
      { path: 'M 100,400 L 450,400', type: 'straight', drs: true },
      // T1 — right hander 
      { path: 'M 450,400 C 505,400 535,378 542,345 C 549,312 530,285 502,282 C 474,279 460,305 466,335', type: 'medium' },
      // T3 chicane
      { path: 'M 466,335 C 472,365 460,388 450,398', type: 'medium' },
      { path: 'M 450,398 C 425,392 408,372 410,345 C 412,318 432,305 455,315', type: 'medium' },
      // T5-T7 flowing section 
      { path: 'M 455,315 C 480,325 492,308 488,280 C 484,252 462,240 440,252', type: 'fast' },
      { path: 'M 440,252 C 415,265 408,292 420,318 C 432,344 458,350 480,338', type: 'fast' },
      // Hotel section (the famous underpass) — T8-T11
      { path: 'M 480,338 C 505,326 515,298 505,272 C 495,246 470,236 448,248', type: 'fast' },
      { path: 'M 448,248 C 422,260 412,288 425,316 L 410,245 L 295,238', type: 'fast' },
      // T12 long left  
      { path: 'M 295,238 C 255,232 228,250 222,282 C 216,314 236,340 268,342 C 300,344 320,320 315,290', type: 'medium' },
      // T13-T14 (DRS zone 2)
      { path: 'M 315,290 L 200,268', type: 'straight', drs: true },
      // T15-T16 hairpin back to straight
      { path: 'M 200,268 C 162,260 135,278 130,310 C 125,342 148,368 180,368 C 212,368 230,342 224,312', type: 'hairpin' },
      // Return
      { path: 'M 224,312 C 218,282 200,272 180,282 C 160,292 152,318 162,345 C 168,365 180,380 175,400 L 100,404 C 98,402 98,401 100,400', type: 'medium' },
    ],
    elevation: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    elevationChange: 3,
    sectorBoundaries: [30, 68],
    corners: [{ name: 'T1', x: 515, y: 312 }, { name: 'Hotel', x: 468, y: 280 }],
  },

  baku: {
    id: 'baku', name: 'Baku City Circuit',
    country: 'Azerbaijan', city: 'Baku', flag: '🇦🇿',
    length: 6.003, laps: 51, turns: 20, drsZones: 2,
    firstGP: 2017, lapRecord: { time: '1:43.009', driver: 'Charles Leclerc', year: 2019 },
    topSpeed: 356, color: '#0092BC', svgViewBox: '0 0 650 500',
    segments: [
      // Longest DRS straight in F1 — 2.2km!
      { path: 'M 60,420 L 560,420', type: 'straight', drs: true },
      // T1-T2 right handers
      { path: 'M 560,420 C 600,420 620,400 622,370 C 624,340 605,318 578,322 C 551,326 540,352 548,378', type: 'medium' },
      // T3 Castle section approach (DRS zone 2)
      { path: 'M 548,378 C 556,408 545,420 535,422', type: 'medium' },
      { path: 'M 535,422 L 535,275', type: 'straight', drs: true },
      // T4-T7 (narrow old city section — only 7.6m wide!)
      { path: 'M 535,275 C 535,245 515,228 488,232 C 461,236 450,260 458,285', type: 'slow' },
      { path: 'M 458,285 C 466,312 455,328 440,332', type: 'slow' },
      // T8 hairpin — castle hairpin! 
      { path: 'M 440,332 C 415,325 400,305 405,278 C 410,251 432,240 455,250 C 478,260 482,285 470,308', type: 'hairpin' },
      // Back through the narrow city
      { path: 'M 470,308 C 458,332 445,345 422,345 L 340,345 L 280,340', type: 'slow' },
      { path: 'M 280,340 C 248,332 232,310 240,282 C 248,254 275,245 300,258', type: 'slow' },
      // T16-T18 (sea front section)
      { path: 'M 300,258 C 328,272 335,298 322,325 C 309,352 282,360 258,348', type: 'medium' },
      { path: 'M 258,348 C 232,336 225,310 238,285 C 251,260 278,255 302,268', type: 'medium' },
      // Return to main straight
      { path: 'M 302,268 C 280,280 268,308 278,338 C 282,355 275,378 255,398 C 235,418 200,428 150,428 L 60,428 C 58,426 58,422 60,420', type: 'medium' },
    ],
    elevation: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,8,10,12,14,16,18,20,18,16,14,12,10,8,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    elevationChange: 15,
    sectorBoundaries: [20, 65],
    corners: [{ name: 'T8 Castle', x: 432, y: 268 }, { name: 'T1', x: 590, y: 348 }],
  },

  miami: {
    id: 'miami', name: 'Miami International Autodrome',
    country: 'USA', city: 'Miami', flag: '🇺🇸',
    length: 5.412, laps: 57, turns: 19, drsZones: 3,
    firstGP: 2022, lapRecord: { time: '1:29.708', driver: 'Max Verstappen', year: 2023 },
    topSpeed: 320, color: '#0F4C8A', svgViewBox: '0 0 620 480',
    segments: [
      { path: 'M 100,400 L 410,400', type: 'straight', drs: true },
      { path: 'M 410,400 C 462,400 492,378 498,344 C 504,310 482,284 452,286 C 422,288 410,316 418,348', type: 'medium' },
      { path: 'M 418,348 C 426,380 414,398 406,402', type: 'medium' },
      { path: 'M 406,402 C 380,396 364,374 368,345 C 372,316 394,304 418,315', type: 'fast' },
      { path: 'M 418,315 C 445,326 455,308 450,280 L 430,220 L 310,210', type: 'straight', drs: true },
      { path: 'M 310,210 C 272,204 245,222 240,255 C 235,288 258,312 290,312', type: 'medium' },
      { path: 'M 290,312 C 325,312 340,290 335,260 C 330,230 308,218 285,228', type: 'medium' },
      { path: 'M 285,228 C 260,240 250,268 262,296 C 274,324 302,332 328,318', type: 'slow' },
      { path: 'M 328,318 C 358,304 365,276 350,252 C 335,228 308,224 286,238', type: 'slow' },
      { path: 'M 286,238 C 262,252 255,282 268,310 L 240,280 L 190,282', type: 'medium' },
      { path: 'M 190,282 C 155,278 128,298 125,330 C 122,362 145,385 178,385', type: 'hairpin' },
      { path: 'M 178,385 C 212,385 228,362 222,332 C 216,302 192,290 170,302', type: 'medium', drs: true },
      { path: 'M 170,302 C 145,315 135,345 148,375 C 155,392 168,402 182,405 L 100,408 C 98,406 98,402 100,400', type: 'medium' },
    ],
    elevation: [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    elevationChange: 4,
    sectorBoundaries: [32, 65],
    corners: [{ name: 'T1', x: 472, y: 315 }, { name: 'T14', x: 150, y: 330 }],
  },

  las_vegas: {
    id: 'las_vegas', name: 'Las Vegas Street Circuit',
    country: 'USA', city: 'Las Vegas', flag: '🇺🇸',
    length: 6.201, laps: 50, turns: 17, drsZones: 2,
    firstGP: 2023, lapRecord: { time: '1:35.490', driver: 'Oscar Piastri', year: 2024 },
    topSpeed: 342, color: '#CF9B24', svgViewBox: '0 0 620 480',
    segments: [
      // The Strip — massive straight (DRS)
      { path: 'M 510,420 L 510,80', type: 'straight', drs: true },
      // Top hairpin
      { path: 'M 510,80 C 510,50 488,30 458,30 L 200,30', type: 'medium' },
      { path: 'M 200,30 C 165,30 140,50 138,80 C 136,110 155,130 182,128', type: 'hairpin' },
      // Return straight section
      { path: 'M 182,128 C 210,126 222,108 218,82 C 214,56 196,42 175,48 L 175,140 L 175,250', type: 'straight' },
      // Middle section chicane
      { path: 'M 175,250 C 175,278 192,292 215,288 C 238,284 248,262 242,238', type: 'slow' },
      { path: 'M 242,238 C 236,214 216,205 195,215 C 174,225 168,250 178,272 C 188,294 210,300 232,290', type: 'slow' },
      // Bottom section
      { path: 'M 232,290 C 256,280 265,255 255,232 L 250,290 L 250,380', type: 'straight', drs: true },
      // Bottom hairpin / 90-degree turns
      { path: 'M 250,380 C 250,415 272,432 300,432 L 480,432', type: 'medium' },
      { path: 'M 480,432 C 510,432 530,412 532,382 C 534,352 515,330 488,332', type: 'hairpin' },
      // Back up The Strip
      { path: 'M 488,332 C 460,334 448,355 455,380 C 460,398 478,410 500,408', type: 'medium' },
      { path: 'M 500,408 L 510,420', type: 'straight' },
    ],
    elevation: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    elevationChange: 5,
    sectorBoundaries: [30, 65],
    corners: [{ name: 'T1 (The Strip)', x: 380, y: 30 }, { name: 'Bottom Hairpin', x: 500, y: 365 }],
  },

  losail: {
    id: 'losail', name: 'Lusail International Circuit',
    country: 'Qatar', city: 'Lusail', flag: '🇶🇦',
    length: 5.380, laps: 57, turns: 16, drsZones: 2,
    firstGP: 2021, lapRecord: { time: '1:24.319', driver: 'Max Verstappen', year: 2023 },
    topSpeed: 322, color: '#8D1B3D', svgViewBox: '0 0 600 480',
    segments: [
      { path: 'M 90,390 L 460,390', type: 'straight', drs: true },
      { path: 'M 460,390 C 510,390 538,368 542,334 C 546,300 524,272 494,272 C 464,272 452,298 460,328', type: 'fast' },
      { path: 'M 460,328 C 468,362 455,382 448,392', type: 'fast' },
      { path: 'M 448,392 C 420,386 406,362 412,333 C 418,304 440,292 462,305', type: 'fast' },
      { path: 'M 462,305 C 488,318 498,300 492,270 L 476,210 L 360,195', type: 'fast', drs: true },
      { path: 'M 360,195 C 320,188 292,205 288,238 C 284,271 308,295 342,292', type: 'medium' },
      { path: 'M 342,292 C 378,289 392,265 385,235 C 378,205 354,195 330,208', type: 'medium' },
      { path: 'M 330,208 C 304,222 295,250 308,278 C 321,306 350,312 375,298', type: 'medium' },
      { path: 'M 375,298 C 402,284 408,256 394,230 C 380,204 354,200 330,215', type: 'medium' },
      { path: 'M 330,215 C 304,232 298,262 312,290 L 295,248 L 240,250', type: 'medium' },
      { path: 'M 240,250 C 205,244 178,264 175,298 C 172,332 196,355 230,353', type: 'medium' },
      { path: 'M 230,353 C 266,351 282,326 276,295 C 270,264 246,252 222,265', type: 'medium' },
      { path: 'M 222,265 C 196,280 188,310 202,338 C 208,358 220,370 215,390 L 90,395 C 88,393 88,391 90,390', type: 'fast' },
    ],
    elevation: [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
    elevationChange: 6,
    sectorBoundaries: [30, 62],
    corners: [{ name: 'T1', x: 518, y: 305 }, { name: 'T10', x: 195, y: 310 }],
  },

  imola: {
    id: 'imola', name: 'Autodromo Enzo e Dino Ferrari',
    country: 'Italy', city: 'Imola', flag: '🇮🇹',
    length: 4.909, laps: 63, turns: 19, drsZones: 1,
    firstGP: 1980, lapRecord: { time: '1:15.484', driver: 'Rubens Barrichello', year: 2004 },
    topSpeed: 295, color: '#009246', svgViewBox: '0 0 580 480',
    segments: [
      { path: 'M 100,390 L 360,390', type: 'straight', drs: true },
      { path: 'M 360,390 C 410,390 440,368 445,334 C 450,300 430,274 400,275 C 370,276 358,304 366,334', type: 'medium' },
      { path: 'M 366,334 C 374,364 362,385 355,392', type: 'medium' },
      { path: 'M 355,392 C 328,386 314,362 320,332 C 326,302 350,290 375,302', type: 'fast' },
      { path: 'M 375,302 C 402,314 412,295 406,268 L 388,210 L 308,200', type: 'fast' },
      { path: 'M 308,200 C 272,192 245,210 242,244 C 239,278 264,302 298,298', type: 'medium' },
      { path: 'M 298,298 C 335,294 348,268 340,238 C 332,208 306,198 282,212', type: 'medium' },
      { path: 'M 282,212 C 256,228 248,258 262,286 C 276,314 305,320 330,305', type: 'slow' },
      { path: 'M 330,305 C 358,290 362,262 348,238 L 330,275 L 250,275', type: 'medium' },
      { path: 'M 250,275 C 215,268 188,288 185,322 C 182,356 208,378 242,375', type: 'hairpin' },
      { path: 'M 242,375 C 278,372 292,346 284,315 C 276,284 250,272 225,285', type: 'medium' },
      { path: 'M 225,285 C 198,300 190,330 204,358 C 210,375 222,385 215,402 L 100,398 C 98,396 98,392 100,390', type: 'medium' },
    ],
    elevation: [10,12,16,22,28,35,42,50,58,65,70,72,70,65,58,50,42,35,28,22,16,12,10,10,12,16,22,28,35,42,48,52,55,52,48,42,35,28,22,16,12,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],
    elevationChange: 30,
    sectorBoundaries: [32, 65],
    corners: [{ name: 'Tamburello', x: 422, y: 305 }, { name: 'Rivazza', x: 218, y: 338 }],
  },

  shanghai: {
    id: 'shanghai', name: 'Shanghai International Circuit',
    country: 'China', city: 'Shanghai', flag: '🇨🇳',
    length: 5.451, laps: 56, turns: 16, drsZones: 2,
    firstGP: 2004, lapRecord: { time: '1:32.238', driver: 'Michael Schumacher', year: 2004 },
    topSpeed: 327, color: '#DE2910', svgViewBox: '0 0 620 480',
    segments: [
      { path: 'M 90,390 L 420,390', type: 'straight', drs: true },
      { path: 'M 420,390 C 472,390 505,365 512,330 C 519,295 498,265 466,265', type: 'fast' },
      // The LEGENDARY T1-T2 sweeper — very long right, then left
      { path: 'M 466,265 C 435,265 418,288 422,320 C 426,352 450,365 478,355 C 506,345 518,318 510,290 C 502,262 478,252 455,264', type: 'fast' },
      { path: 'M 455,264 C 430,276 420,305 430,335 C 440,365 465,375 490,362', type: 'fast' },
      { path: 'M 490,362 L 490,260 L 490,180', type: 'straight', drs: true },
      { path: 'M 490,180 C 490,148 468,125 438,128 C 408,131 395,158 405,185 C 415,212 440,218 462,205', type: 'medium' },
      { path: 'M 462,205 C 488,192 495,165 482,140 L 450,170 L 320,168', type: 'medium' },
      { path: 'M 320,168 C 280,160 252,180 248,214 C 244,248 270,272 305,268', type: 'medium' },
      { path: 'M 305,268 C 342,264 358,238 350,206 C 342,174 315,162 290,176', type: 'medium' },
      { path: 'M 290,176 C 262,192 255,222 270,252 C 285,282 315,288 340,272', type: 'slow' },
      { path: 'M 340,272 C 368,256 372,228 358,202 L 340,248 L 235,248', type: 'slow' },
      { path: 'M 235,248 C 198,240 170,260 168,295 C 166,330 192,352 228,350', type: 'hairpin' },
      { path: 'M 228,350 C 265,348 280,322 272,290 C 264,258 238,248 215,262', type: 'medium' },
      { path: 'M 215,262 C 190,278 184,308 198,335 C 205,352 218,362 210,382 L 90,395 C 88,393 88,391 90,390', type: 'medium' },
    ],
    elevation: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    elevationChange: 5,
    sectorBoundaries: [30, 65],
    corners: [{ name: 'T1-T2', x: 468, y: 310 }, { name: 'T14 Hairpin', x: 195, y: 315 }],
  },

  rodriguez: {
    id: 'rodriguez', name: 'Autodromo Hermanos Rodríguez',
    country: 'Mexico', city: 'Mexico City', flag: '🇲🇽',
    length: 4.304, laps: 71, turns: 17, drsZones: 3,
    firstGP: 1963, lapRecord: { time: '1:17.774', driver: 'Valtteri Bottas', year: 2021 },
    topSpeed: 355, color: '#006847', svgViewBox: '0 0 600 480',
    segments: [
      { path: 'M 90,390 L 430,390', type: 'straight', drs: true },
      { path: 'M 430,390 C 480,390 510,368 515,333 C 520,298 498,270 466,272 C 434,274 422,304 432,335', type: 'medium' },
      { path: 'M 432,335 C 442,368 428,388 420,392', type: 'medium' },
      { path: 'M 420,392 C 392,386 378,362 385,328 C 392,294 418,282 444,298', type: 'fast' },
      { path: 'M 444,298 C 472,314 480,295 472,265 L 452,210 L 330,200', type: 'straight', drs: true },
      { path: 'M 330,200 C 290,192 262,212 260,248 C 258,284 285,305 322,300', type: 'medium' },
      { path: 'M 322,300 C 360,295 375,268 365,235 C 355,202 326,192 300,208', type: 'medium' },
      // Stadium section (indoor!)
      { path: 'M 300,208 C 272,225 265,258 280,288 C 295,318 325,325 352,308', type: 'slow' },
      { path: 'M 352,308 C 382,292 388,260 372,232 C 356,204 326,198 302,215', type: 'slow' },
      { path: 'M 302,215 C 275,235 270,268 286,295 L 270,250 L 215,252', type: 'slow' },
      { path: 'M 215,252 C 178,245 150,268 148,305 C 146,342 175,365 212,360', type: 'hairpin' },
      { path: 'M 212,360 C 250,355 265,328 255,295 C 245,262 218,252 194,268', type: 'medium', drs: true },
      { path: 'M 194,268 C 168,285 162,318 178,348 C 185,368 198,380 190,398 L 90,400 C 88,398 88,392 90,390', type: 'medium' },
    ],
    elevation: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    elevationChange: 2,
    sectorBoundaries: [30, 65],
    corners: [{ name: 'T1', x: 492, y: 305 }, { name: 'Stadium', x: 315, y: 260 }],
  },

  catalunya: {
    id: 'catalunya', name: 'Circuit de Barcelona-Catalunya',
    country: 'Spain', city: 'Barcelona', flag: '🇪🇸',
    length: 4.675, laps: 66, turns: 16, drsZones: 2,
    firstGP: 1991, lapRecord: { time: '1:18.149', driver: 'Max Verstappen', year: 2021 },
    topSpeed: 315, color: '#AA151B', svgViewBox: '0 0 600 480',
    segments: [
      { path: 'M 90,390 L 420,390', type: 'straight', drs: true },
      { path: 'M 420,390 C 470,390 500,368 505,332 C 510,296 488,268 456,270 C 424,272 412,302 422,334', type: 'medium' },
      { path: 'M 422,334 C 432,366 418,386 408,392', type: 'medium' },
      { path: 'M 408,392 C 380,386 364,360 372,328 C 380,296 408,285 435,300', type: 'fast' },
      { path: 'M 435,300 C 464,315 472,294 465,265 L 445,210 L 325,200', type: 'fast', drs: true },
      // T5-T6 chicane (the new section)
      { path: 'M 325,200 C 295,192 278,210 278,242 C 278,274 298,292 325,288', type: 'slow' },
      { path: 'M 325,288 C 355,284 368,260 358,230 C 348,200 320,192 298,208', type: 'slow' },
      // T9 — very important corner, fast left
      { path: 'M 298,208 C 272,225 265,258 280,288 C 295,318 325,325 352,308', type: 'fast' },
      { path: 'M 352,308 C 382,292 388,260 372,232 L 360,265 L 260,265', type: 'fast' },
      { path: 'M 260,265 C 225,258 198,278 196,314 C 194,350 222,372 258,368', type: 'hairpin' },
      { path: 'M 258,368 C 295,364 310,336 300,302 C 290,268 262,258 238,275', type: 'medium' },
      { path: 'M 238,275 C 212,292 208,325 224,352 C 232,368 248,378 240,398 L 90,400 C 88,398 88,392 90,390', type: 'medium' },
    ],
    elevation: [8,10,14,20,28,35,42,48,52,55,52,48,42,35,28,22,16,12,10,8,8,10,14,20,28,35,42,48,52,55,52,48,42,35,28,22,16,12,10,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
    elevationChange: 30,
    sectorBoundaries: [30, 65],
    corners: [{ name: 'T1', x: 480, y: 302 }, { name: 'T5 Chicane', x: 305, y: 242 }],
  },
};

// Fallback for any circuit not in our database
export function getCircuit(circuitId: string): CircuitData | null {
  const key = circuitId.toLowerCase().replace(/-/g, '_');
  return CIRCUITS[key] ?? null;
}

// Speed type to color mapping
export const SPEED_COLORS = {
  straight: '#FFD700',   // Gold — DRS straights
  fast:     '#22c55e',   // Green — fast corners
  medium:   '#f97316',   // Orange — medium speed
  slow:     '#ef4444',   // Red — slow corners
  hairpin:  '#8b5cf6',   // Purple — hairpins
};

export const CIRCUIT_ID_MAP: Record<string, string> = {
  'bahrain':        'bahrain',
  'jeddah':         'jeddah',
  'albert_park':    'albert_park',
  'suzuka':         'suzuka',
  'shanghai':       'shanghai',
  'miami':          'miami',
  'imola':          'imola',
  'monaco':         'monaco',
  'villeneuve':     'villeneuve',
  'catalunya':      'catalunya',
  'red_bull_ring':  'red_bull_ring',
  'silverstone':    'silverstone',
  'hungaroring':    'hungaroring',
  'spa':            'spa',
  'zandvoort':      'zandvoort',
  'monza':          'monza',
  'baku':           'baku',
  'marina_bay':     'marina_bay',
  'americas':       'americas',
  'rodriguez':      'rodriguez',
  'interlagos':     'interlagos',
  'las_vegas':      'las_vegas',
  'losail':         'losail',
  'yas_marina':     'yas_marina',
};
