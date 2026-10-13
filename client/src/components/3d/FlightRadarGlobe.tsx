import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { NormalizedFlight } from '../../types/flights';
import { getDestination } from '../../data/destinations';

// ─── Lat/Lng to 3D Cartesian coordinates on sphere ────────────────
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// ─── Reusable Procedural High-Res Earth Texture ───────────────────
function createHighResEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep midnight navy ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, '#05132d');
  oceanGrad.addColorStop(0.2, '#081a3d');
  oceanGrad.addColorStop(0.5, '#0a214d');
  oceanGrad.addColorStop(0.8, '#081a3d');
  oceanGrad.addColorStop(1, '#05132d');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Ocean bathymetric depth textures
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 1024;
    const r = 30 + Math.random() * 90;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(12, 35, 78, 0.35)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const s = 2; // scale factor
  const continentColor = '#132e4d';
  const continentHighlight = '#1a3d66';
  const coastlineColor = 'rgba(34, 211, 238, 0.35)';

  const drawPolygon = (points: [number, number][]) => {
    ctx.beginPath();
    const [sx, sy] = points[0];
    ctx.moveTo(sx * s, sy * s);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] * s, points[i][1] * s);
    }
    ctx.closePath();
    ctx.fillStyle = continentColor;
    ctx.fill();

    ctx.strokeStyle = coastlineColor;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = continentHighlight;
    ctx.globalAlpha = 0.4;
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // Africa
  drawPolygon([
    [525, 120], [550, 100], [565, 105], [575, 120], [580, 140],
    [585, 170], [580, 200], [575, 230], [565, 260], [555, 280],
    [540, 290], [520, 285], [510, 260], [505, 230], [508, 200],
    [510, 170], [515, 140],
  ]);

  // Europe
  drawPolygon([
    [490, 75], [510, 60], [540, 55], [560, 60], [575, 70],
    [580, 85], [570, 100], [555, 105], [535, 100], [515, 95],
    [500, 90], [490, 82],
  ]);

  // Asia
  drawPolygon([
    [575, 55], [620, 45], [680, 50], [740, 60], [780, 75],
    [800, 100], [810, 130], [790, 150], [760, 160], [730, 155],
    [700, 145], [670, 130], [640, 110], [610, 95], [590, 80],
    [580, 65],
  ]);

  // India
  drawPolygon([
    [640, 110], [660, 105], [675, 115], [680, 135], [670, 155],
    [655, 165], [640, 160], [635, 145], [632, 125],
  ]);

  // North America
  drawPolygon([
    [160, 55], [200, 45], [250, 50], [290, 60], [310, 75],
    [315, 100], [300, 120], [280, 135], [260, 140], [230, 135],
    [200, 125], [180, 110], [165, 90], [155, 70],
  ]);

  // South America
  drawPolygon([
    [280, 155], [300, 150], [315, 160], [320, 185], [315, 220],
    [305, 260], [290, 285], [275, 295], [265, 280], [260, 250],
    [262, 220], [265, 190], [270, 165],
  ]);

  // Australia
  drawPolygon([
    [780, 220], [810, 210], [835, 215], [845, 235], [840, 255],
    [825, 265], [800, 260], [785, 250], [778, 235],
  ]);

  // City night lights
  const majorCities = [
    [654, 130], [648, 125], [660, 140], [640, 135], [672, 150],
    [510, 75], [530, 70], [545, 80], [555, 72], [760, 75],
    [770, 85], [740, 70], [590, 108], [600, 112], [220, 90],
    [240, 85], [260, 100], [200, 95], [270, 110], [295, 200],
    [810, 240], [720, 140], [740, 150],
  ];

  majorCities.forEach(([cx, cy]) => {
    const x = cx * s;
    const y = cy * s;
    const glowRadius = 5 + Math.random() * 4;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius * s);
    glow.addColorStop(0, 'rgba(34, 211, 238, 0.9)');
    glow.addColorStop(0.3, 'rgba(6, 182, 212, 0.4)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(x - glowRadius * s, y - glowRadius * s, glowRadius * 2 * s, glowRadius * 2 * s);
  });

  // Subtle longitude / latitude radar grid
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < 2048; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y < 1024; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ─── Atmospheric Glow Shader ──────────────────────────────────────
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    fresnel = pow(fresnel, 2.8) * 1.4;
    vec3 color = mix(vec3(0.04, 0.72, 0.96), vec3(0.25, 0.85, 1.0), fresnel);
    gl_FragColor = vec4(color, fresnel * 0.75);
  }
`;

// ─── Aircraft 3D Marker Component ─────────────────────────────────
interface AircraftMarkerProps {
  flight: NormalizedFlight & { coordinates: { latitude: number; longitude: number } };
  isSelected: boolean;
  onSelect: (flight: NormalizedFlight) => void;
  globeRadius: number;
}

function AircraftMarker({ flight, isSelected, onSelect, globeRadius }: AircraftMarkerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Compute position just above globe surface, scaled slightly by altitude if available
  const altitudeOffset = flight.altitude ? Math.min(flight.altitude / 80000, 0.18) : 0.04;
  const radius = globeRadius + (flight.isGround ? 0.02 : altitudeOffset);

  const targetPos = useMemo(() => {
    if (!flight.coordinates) return new THREE.Vector3(0, 0, 0);
    return latLngToVector3(flight.coordinates.latitude, flight.coordinates.longitude, radius);
  }, [flight.coordinates, radius]);

  // Smooth position interpolation between updates
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos, 0.12);

      // Orient aircraft according to heading
      if (flight.heading !== null && flight.heading !== undefined) {
        meshRef.current.rotation.z = -(flight.heading * Math.PI) / 180;
      }
    }
  });

  const blipColor = isSelected
    ? '#f59e0b' // Amber when selected
    : flight.isGround
    ? '#10b981' // Green on ground
    : '#00f0ff'; // Cyan airborne

  return (
    <group
      ref={meshRef}
      position={[targetPos.x, targetPos.y, targetPos.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(flight);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      scale={isSelected ? 1.6 : hovered ? 1.3 : 1.0}
    >
      {/* Directional Aircraft Shape */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.024, 0.07, 4]} />
        <meshStandardMaterial
          color={blipColor}
          emissive={blipColor}
          emissiveIntensity={isSelected ? 3.5 : hovered ? 2.5 : 1.8}
          toneMapped={false}
        />
      </mesh>

      {/* Pulsing Aura Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.035, 0.05, 16]} />
        <meshBasicMaterial
          color={blipColor}
          transparent
          opacity={isSelected ? 0.8 : hovered ? 0.6 : 0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Selected Indicator Beacon */}
      {isSelected && (
        <pointLight color="#f59e0b" intensity={2} distance={0.5} />
      )}
    </group>
  );
}

// ─── Great Circle Route Arc for Selected Flight ───────────────────
function SelectedFlightRoute({
  flight,
  globeRadius,
}: {
  flight: NormalizedFlight;
  globeRadius: number;
}) {
  const points = useMemo(() => {
    if (!flight.coordinates) return [];
    // If departure airport coordinates are known, draw from departure to current, and to arrival
    const current = latLngToVector3(
      flight.coordinates.latitude,
      flight.coordinates.longitude,
      globeRadius + 0.05
    );

    let originPos: THREE.Vector3 | null = null;
    let destPos: THREE.Vector3 | null = null;

    if (flight.departure?.iataCode) {
      const depInfo = getDestination(flight.departure.iataCode);
      if (depInfo && depInfo.id !== 'default') {
        originPos = latLngToVector3(depInfo.coordinates.lat, depInfo.coordinates.lng, globeRadius + 0.03);
      }
    }

    if (flight.arrival?.iataCode) {
      const arrInfo = getDestination(flight.arrival.iataCode);
      if (arrInfo && arrInfo.id !== 'default') {
        destPos = latLngToVector3(arrInfo.coordinates.lat, arrInfo.coordinates.lng, globeRadius + 0.03);
      }
    }

    const segments: THREE.Vector3[] = [];

    // Great circle helper
    const buildArc = (start: THREE.Vector3, end: THREE.Vector3) => {
      const dist = start.distanceTo(end);
      const arcHeight = Math.min(0.15 + dist * 0.12, 0.5);
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(globeRadius + arcHeight);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(40);
    };

    if (originPos) {
      segments.push(...buildArc(originPos, current));
    }
    if (destPos) {
      segments.push(...buildArc(current, destPos));
    }

    return segments;
  }, [flight, globeRadius]);

  if (points.length < 2) return null;

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineDashedMaterial
        color="#f59e0b"
        dashSize={0.08}
        gapSize={0.04}
        linewidth={2}
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </line>
  );
}

// ─── Main 3D Globe Component ──────────────────────────────────────
interface FlightRadarGlobeProps {
  flights: NormalizedFlight[];
  selectedFlight: NormalizedFlight | null;
  onSelectFlight: (flight: NormalizedFlight) => void;
  autoRotate: boolean;
}

export function FlightRadarGlobe({
  flights,
  selectedFlight,
  onSelectFlight,
  autoRotate,
}: FlightRadarGlobeProps) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const globeRadius = 2.0;

  const globeTexture = useMemo(() => createHighResEarthTexture(), []);

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    []
  );

  // Slow rotation of the globe and its child aircraft markers
  useFrame((_, delta) => {
    if (globeGroupRef.current && autoRotate) {
      globeGroupRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={globeGroupRef}>
      {/* 3D Earth Mesh */}
      <mesh>
        <sphereGeometry args={[globeRadius, 64, 64]} />
        <meshPhongMaterial
          map={globeTexture}
          shininess={30}
          specular={new THREE.Color('#104070')}
          transparent
          opacity={0.98}
        />
      </mesh>

      {/* Atmospheric Rim Glow */}
      <mesh scale={[1.06, 1.06, 1.06]}>
        <sphereGeometry args={[globeRadius, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>

      {/* Outer subtle glow */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[globeRadius, 32, 32]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Live Aircraft Markers pinned to rotating globe (only flights with valid coordinates) */}
      {flights
        .filter(
          (f): f is NormalizedFlight & { coordinates: { latitude: number; longitude: number } } =>
            Boolean(f.coordinates && typeof f.coordinates.latitude === 'number' && typeof f.coordinates.longitude === 'number')
        )
        .map((flight) => (
          <AircraftMarker
            key={flight.id}
            flight={flight}
            isSelected={selectedFlight?.id === flight.id}
            onSelect={onSelectFlight}
            globeRadius={globeRadius}
          />
        ))}

      {/* Selected Flight Great Circle Route (only if coordinates exist) */}
      {selectedFlight && selectedFlight.coordinates && (
        <SelectedFlightRoute
          flight={selectedFlight}
          globeRadius={globeRadius}
        />
      )}
    </group>
  );
}

// ─── Scene Container Canvas ───────────────────────────────────────
interface RadarCanvasProps {
  flights: NormalizedFlight[];
  selectedFlight: NormalizedFlight | null;
  onSelectFlight: (flight: NormalizedFlight) => void;
  autoRotate: boolean;
}

export default function FlightRadarCanvas({
  flights,
  selectedFlight,
  onSelectFlight,
  autoRotate,
}: RadarCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 45 }}
      dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      style={{ width: '100%', height: '100%' }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
    >
      <ambientLight intensity={0.3} color="#a6ccf5" />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -2, -5]} intensity={0.5} color="#0284c7" />
      <pointLight position={[0, 4, 2]} intensity={0.4} color="#38bdf8" distance={10} />

      <FlightRadarGlobe
        flights={flights}
        selectedFlight={selectedFlight}
        onSelectFlight={onSelectFlight}
        autoRotate={autoRotate}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={2.3}
        maxDistance={6.5}
        rotateSpeed={0.65}
      />
    </Canvas>
  );
}
