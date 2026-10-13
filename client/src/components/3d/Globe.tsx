import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Coordinate Utility ───────────────────────────────────
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// ─── Destination Data ─────────────────────────────────────
export const destinations = [
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867, color: '#0ea5e9' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, color: '#06b6d4' },
  { name: 'Goa', lat: 15.2993, lng: 74.124, color: '#14b8a6' },
  { name: 'Delhi', lat: 28.6139, lng: 77.209, color: '#0ea5e9' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, color: '#f59e0b' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, color: '#10b981' },
  { name: 'London', lat: 51.5074, lng: -0.1278, color: '#8b5cf6' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, color: '#ef4444' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, color: '#06b6d4' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, color: '#14b8a6' },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, color: '#f59e0b' },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, color: '#10b981' },
];

export const flightRoutes = [
  { from: destinations[0], to: destinations[4] }, // Hyderabad -> Dubai
  { from: destinations[1], to: destinations[6] }, // Mumbai -> London
  { from: destinations[3], to: destinations[7] }, // Delhi -> Tokyo
  { from: destinations[2], to: destinations[5] }, // Goa -> Singapore
  { from: destinations[8], to: destinations[4] }, // Bengaluru -> Dubai
];

// ─── Procedural Earth Texture Generator ───────────────────
function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, '#071a3e');
  oceanGrad.addColorStop(0.3, '#0a1e4a');
  oceanGrad.addColorStop(0.5, '#0c2255');
  oceanGrad.addColorStop(0.7, '#0a1e4a');
  oceanGrad.addColorStop(1, '#071a3e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Ocean depth variation
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 1024;
    const r = 20 + Math.random() * 80;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(8, 30, 70, ${0.1 + Math.random() * 0.15})`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Continent data (simplified polygonal shapes positioned on equirectangular projection)
  const continentColor = '#1a3a5c';
  const continentHighlight = '#1f4570';
  const coastlineColor = 'rgba(14, 165, 233, 0.15)';

  const drawContinent = (paths: [number, number][][], scale = 1) => {
    paths.forEach(points => {
      ctx.beginPath();
      const [sx, sy] = points[0];
      ctx.moveTo(sx * scale, sy * scale);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0] * scale, points[i][1] * scale);
      }
      ctx.closePath();
      ctx.fillStyle = continentColor;
      ctx.fill();
      ctx.strokeStyle = coastlineColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner highlight
      ctx.fillStyle = continentHighlight;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  };

  const s = 2; // scale factor for 2048-wide

  // Africa
  drawContinent([
    [[525, 120], [550, 100], [565, 105], [575, 120], [580, 140],
     [585, 170], [580, 200], [575, 230], [565, 260], [555, 280],
     [540, 290], [520, 285], [510, 260], [505, 230], [508, 200],
     [510, 170], [515, 140]].map(([x, y]) => [x * s, y * s]) as [number, number][]
  ]);

  // Europe
  drawContinent([
    [[490, 75], [510, 60], [540, 55], [560, 60], [575, 70],
     [580, 85], [570, 100], [555, 105], [535, 100], [515, 95],
     [500, 90], [490, 82]].map(([x, y]) => [x * s, y * s]) as [number, number][]
  ]);

  // Asia
  drawContinent([
    [[575, 55], [620, 45], [680, 50], [740, 60], [780, 75],
     [800, 100], [810, 130], [790, 150], [760, 160], [730, 155],
     [700, 145], [670, 130], [640, 110], [610, 95], [590, 80],
     [580, 65]].map(([x, y]) => [x * s, y * s]) as [number, number][]
  ]);

  // India subcontinent
  drawContinent([
    [[640, 110], [660, 105], [675, 115], [680, 135], [670, 155],
     [655, 165], [640, 160], [635, 145], [632, 125]].map(([x, y]) => [x * s, y * s]) as [number, number][]
  ]);

  // North America
  drawContinent([
    [[160, 55], [200, 45], [250, 50], [290, 60], [310, 75],
     [315, 100], [300, 120], [280, 135], [260, 140], [230, 135],
     [200, 125], [180, 110], [165, 90], [155, 70]].map(([x, y]) => [x * s, y * s]) as [number, number][]
  ]);

  // South America
  drawContinent([
    [[280, 155], [300, 150], [315, 160], [320, 185], [315, 220],
     [305, 260], [290, 285], [275, 295], [265, 280], [260, 250],
     [262, 220], [265, 190], [270, 165]].map(([x, y]) => [x * s, y * s]) as [number, number][]
  ]);

  // Australia
  drawContinent([
    [[780, 220], [810, 210], [835, 215], [845, 235], [840, 255],
     [825, 265], [800, 260], [785, 250], [778, 235]].map(([x, y]) => [x * s, y * s]) as [number, number][]
  ]);

  // Antarctica
  drawContinent([
    [[100, 470], [300, 465], [500, 468], [700, 465], [900, 470],
     [950, 485], [900, 500], [700, 505], [500, 508], [300, 505],
     [100, 500], [50, 485]].map(([x, y]) => [x * s, y * s]) as [number, number][]
  ]);

  // City lights (small glowing dots on continents)
  const cityPositions = [
    // India
    [654, 130], [648, 125], [660, 140], [640, 135], [672, 150], [665, 120],
    // Europe
    [510, 75], [530, 70], [545, 80], [555, 72], [520, 82],
    // East Asia
    [760, 75], [770, 85], [740, 70], [730, 80],
    // Middle East
    [590, 108], [600, 112],
    // North America
    [220, 90], [240, 85], [260, 100], [200, 95], [270, 110],
    // South America
    [295, 200], [300, 230], [285, 250],
    // Australia
    [810, 240], [825, 250],
    // Africa
    [540, 180], [530, 200], [560, 240],
    // Southeast Asia
    [720, 140], [740, 150], [760, 145],
  ];

  cityPositions.forEach(([cx, cy]) => {
    const x = cx * s;
    const y = cy * s;
    const glowRadius = 4 + Math.random() * 6;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius * s);
    glow.addColorStop(0, 'rgba(14, 165, 233, 0.7)');
    glow.addColorStop(0.4, 'rgba(14, 165, 233, 0.3)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(x - glowRadius * s, y - glowRadius * s, glowRadius * 2 * s, glowRadius * 2 * s);
  });

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.04)';
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

// ─── Globe Component ──────────────────────────────────────
export function Globe() {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.06;
    }
  });

  const globeTexture = useMemo(() => createEarthTexture(), []);

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial
        map={globeTexture}
        shininess={25}
        specular={new THREE.Color('#1a4a7a')}
        transparent
        opacity={0.97}
      />
    </mesh>
  );
}

// ─── Atmosphere Glow ──────────────────────────────────────
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
    fresnel = pow(fresnel, 3.0) * 1.2;
    vec3 color = mix(vec3(0.055, 0.647, 0.914), vec3(0.4, 0.7, 1.0), fresnel);
    gl_FragColor = vec4(color, fresnel * 0.6);
  }
`;

export function AtmosphereGlow() {
  const shaderMaterial = useMemo(
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

  return (
    <>
      {/* Inner glow */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[2, 64, 64]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>
      {/* Outer subtle glow */}
      <mesh scale={[1.18, 1.18, 1.18]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// ─── Destination Markers ──────────────────────────────────
export function DestinationMarkers() {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef(0);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
    pulseRef.current += delta;
  });

  return (
    <group ref={groupRef}>
      {destinations.map((dest, i) => {
        const pos = latLngToVector3(dest.lat, dest.lng, 2.03);
        return (
          <group key={i} position={[pos.x, pos.y, pos.z]}>
            {/* Core dot */}
            <mesh>
              <sphereGeometry args={[0.022, 16, 16]} />
              <meshStandardMaterial
                color={dest.color}
                emissive={dest.color}
                emissiveIntensity={3}
                toneMapped={false}
              />
            </mesh>
            {/* Inner ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.028, 0.042, 32]} />
              <meshBasicMaterial
                color={dest.color}
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {/* Outer pulse ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.05, 0.06, 32]} />
              <meshBasicMaterial
                color={dest.color}
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Flight Paths ─────────────────────────────────────────
export function FlightPaths() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  const createGreatCircleCurve = useCallback(
    (
      fromLat: number,
      fromLng: number,
      toLat: number,
      toLng: number,
      radius: number,
      segments = 64
    ) => {
      const start = latLngToVector3(fromLat, fromLng, radius);
      const end = latLngToVector3(toLat, toLng, radius);
      const dist = start.distanceTo(end);
      const arcHeight = 0.3 + dist * 0.15;

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(radius + arcHeight);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(segments);
    },
    []
  );

  const routeData = useMemo(() => {
    const lineMaterial = new THREE.LineBasicMaterial({
      color: '#0ea5e9',
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    return flightRoutes.map((route) => {
      const points = createGreatCircleCurve(
        route.from.lat,
        route.from.lng,
        route.to.lat,
        route.to.lng,
        2.03
      );
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineObj = new THREE.Line(geometry, lineMaterial);
      return { points, geometry, lineObj };
    });
  }, [createGreatCircleCurve]);

  return (
    <group ref={groupRef}>
      {routeData.map((data, i) => (
        <group key={i}>
          {/* Main flight path line */}
          <primitive object={data.lineObj} />
          {/* Animated particle along the route */}
          <FlightParticle points={data.points} speed={0.08 + i * 0.02} color="#0ea5e9" />
        </group>
      ))}
    </group>
  );
}

// ─── Animated Flight Particle ─────────────────────────────
function FlightParticle({
  points,
  speed,
  color,
}: {
  points: THREE.Vector3[];
  speed: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(Math.random());

  useFrame((_, delta) => {
    if (meshRef.current && points.length > 1) {
      progressRef.current = (progressRef.current + delta * speed) % 1;
      const idx = progressRef.current * (points.length - 1);
      const i = Math.floor(idx);
      const t = idx - i;
      const p1 = points[Math.min(i, points.length - 1)];
      const p2 = points[Math.min(i + 1, points.length - 1)];
      meshRef.current.position.lerpVectors(p1, p2, t);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.018, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.9}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ─── Floating Particles ───────────────────────────────────
export function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 500;

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 3.5 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = 0.005 + Math.random() * 0.015;
    }
    return [pos, sz];
  }, []);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.008;
      particlesRef.current.rotation.x += delta * 0.003;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#38bdf8"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Aircraft ─────────────────────────────────────────────
export function Aircraft() {
  const groupRef = useRef<THREE.Group>(null);
  const parentRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);

  // Aircraft follows first route (Hyderabad -> Dubai)
  const routePoints = useMemo(() => {
    const route = flightRoutes[0];
    const start = latLngToVector3(route.from.lat, route.from.lng, 2.15);
    const end = latLngToVector3(route.to.lat, route.to.lng, 2.15);
    const dist = start.distanceTo(end);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(2.15 + 0.3 + dist * 0.15);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(100);
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current && parentRef.current && routePoints.length > 1) {
      // Parent group rotates with globe
      parentRef.current.rotation.y += delta * 0.06;

      progressRef.current = (progressRef.current + delta * 0.04) % 1;
      const idx = progressRef.current * (routePoints.length - 1);
      const i = Math.floor(idx);
      const t = idx - i;
      const p1 = routePoints[Math.min(i, routePoints.length - 1)];
      const p2 = routePoints[Math.min(i + 1, routePoints.length - 1)];

      const pos = new THREE.Vector3().lerpVectors(p1, p2, t);
      groupRef.current.position.copy(pos);

      // Orient aircraft along the direction of travel
      const nextIdx = Math.min(i + 2, routePoints.length - 1);
      const lookTarget = routePoints[nextIdx];
      if (lookTarget) {
        groupRef.current.lookAt(lookTarget);
      }
    }
  });

  return (
    <group ref={parentRef}>
      <group ref={groupRef} scale={[0.15, 0.15, 0.15]}>
        {/* Simplified aircraft shape using primitives */}
        {/* Fuselage */}
        <mesh rotation={[0, Math.PI, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.5, 8]} />
          <meshStandardMaterial
            color="#e0e7ef"
            emissive="#38bdf8"
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        {/* Wings */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.02, 0.6, 0.15]} />
          <meshStandardMaterial
            color="#cbd5e1"
            emissive="#0ea5e9"
            emissiveIntensity={0.2}
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
        {/* Tail fin */}
        <mesh position={[0, 0.05, 0.22]}>
          <boxGeometry args={[0.015, 0.12, 0.06]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0ea5e9"
            emissiveIntensity={0.5}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
        {/* Engine glow */}
        <pointLight position={[0, 0, 0.3]} color="#0ea5e9" intensity={0.5} distance={1} />
      </group>
    </group>
  );
}
