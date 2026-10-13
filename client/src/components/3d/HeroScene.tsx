import { Suspense, lazy, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

const Globe = lazy(() => import('./Globe').then(m => ({ default: m.Globe })));
const DestinationMarkers = lazy(() => import('./Globe').then(m => ({ default: m.DestinationMarkers })));
const FlightPaths = lazy(() => import('./Globe').then(m => ({ default: m.FlightPaths })));
const FloatingParticles = lazy(() => import('./Globe').then(m => ({ default: m.FloatingParticles })));
const AtmosphereGlow = lazy(() => import('./Globe').then(m => ({ default: m.AtmosphereGlow })));
const Aircraft = lazy(() => import('./Globe').then(m => ({ default: m.Aircraft })));

function HeroScene() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 0.4,
        y: (e.clientY / window.innerHeight - 0.5) * 0.4,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-900/40 border border-cyan-500/20 animate-pulse" />
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
    >
      {/* Cinematic lighting setup */}
      <ambientLight intensity={0.2} color="#a0c4e8" />

      {/* Key light — warm sunset from behind */}
      <directionalLight position={[-4, 2, -5]} intensity={1.5} color="#ff8c42" />

      {/* Fill light — cool white from front-right */}
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#e0f2fe" />

      {/* Rim light — cyan edge illumination */}
      <directionalLight position={[-3, -1, -3]} intensity={0.4} color="#0ea5e9" />

      {/* Accent — warm top */}
      <pointLight position={[3, 4, -2]} intensity={0.6} color="#f97316" distance={15} />

      {/* Accent — cool bottom */}
      <pointLight position={[-2, -3, 3]} intensity={0.3} color="#0ea5e9" distance={12} />

      {/* Globe group offset to center-right with mouse parallax */}
      <group position={[1.2, -0.1, 0]}>
        <group position={[mousePos.x * 0.15, -mousePos.y * 0.1, 0]}>
          <Suspense fallback={null}>
            <Globe />
            <AtmosphereGlow />
            <DestinationMarkers />
            <FlightPaths />
            <Aircraft />
          </Suspense>
        </group>
      </group>

      {/* Floating particles fill the scene */}
      <Suspense fallback={null}>
        <FloatingParticles />
      </Suspense>
    </Canvas>
  );
}

export default HeroScene;
