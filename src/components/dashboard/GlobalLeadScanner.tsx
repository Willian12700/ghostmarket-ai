import { useRef, useEffect, useState, useMemo, Suspense, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Activity, SkipForward, CheckCircle2, Globe2, ShieldCheck } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  leads: Lead[];
  onAnimationComplete: () => void;
}

const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

class GlobeErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.warn("TacticalGlobe error (falling back):", err); }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Atmosphere Fresnel Shader for crisp outer rim glow (Stripe / GitHub style)
const AtmosphereHalo = () => {
  const shaderArgs = useMemo(() => ({
    uniforms: {
      c: { value: 0.65 },
      p: { value: 4.2 },
      glowColor: { value: new THREE.Color('#6366f1') },
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float c;
      uniform float p;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
        gl_FragColor = vec4(glowColor, clamp(intensity, 0.0, 0.85));
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  }), []);

  return (
    <mesh scale={[1.16, 1.16, 1.16]}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial attach="material" args={[shaderArgs]} />
    </mesh>
  );
};

// Rotating Orbital Telemetry Rings around the globe
const OrbitalRings = () => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.18;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.12;
    if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 0.22;
  });

  return (
    <group>
      {/* Primary inclined orbital ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2.3, 0.25, 0]}>
        <torusGeometry args={[2.42, 0.0035, 16, 160]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.35} />
      </mesh>
      {/* Secondary counter-rotating ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 1.7, -0.35, 0]}>
        <torusGeometry args={[2.62, 0.0025, 16, 160]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.22} />
      </mesh>
      {/* Equatorial subtle ring */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.22, 0.002, 16, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>
    </group>
  );
};

const FallbackGlobe = () => (
  <group>
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial color="#07080d" roughness={0.6} metalness={0.4} />
    </mesh>
    <mesh>
      <sphereGeometry args={[2.01, 36, 36]} />
      <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.15} />
    </mesh>
    <AtmosphereHalo />
    <OrbitalRings />
  </group>
);

const TacticalNightGlobe = ({ hasLockedTarget }: { hasLockedTarget: boolean }) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const scanBandRef = useRef<THREE.Mesh>(null);

  const [nightMap, bumpMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
  ]);

  useFrame((state, delta) => {
    if (globeGroupRef.current && !hasLockedTarget) {
      globeGroupRef.current.rotation.y += delta * 0.08;
    }
    if (scanBandRef.current) {
      const t = state.clock.getElapsedTime();
      scanBandRef.current.position.y = Math.sin(t * 1.6) * 1.75;
      const scale = Math.sqrt(Math.max(0.1, 4.02 - scanBandRef.current.position.y ** 2));
      scanBandRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group>
      <group ref={globeGroupRef}>
        {/* Core Dark Night Earth */}
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            map={nightMap}
            bumpMap={bumpMap}
            bumpScale={0.025}
            roughness={0.65}
            metalness={0.25}
            emissiveMap={nightMap}
            emissive={new THREE.Color('#818cf8')}
            emissiveIntensity={0.45}
          />
        </mesh>

        {/* Subtle Geodesic Tactical Grid Overlay */}
        <mesh>
          <sphereGeometry args={[2.008, 36, 24]} />
          <meshBasicMaterial
            color="#6366f1"
            wireframe
            transparent
            opacity={0.07}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Inner atmospheric sheen */}
        <mesh>
          <sphereGeometry args={[2.015, 64, 64]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Horizontal Laser Scan Plane sweeping latitude */}
      <mesh ref={scanBandRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.015, 64]} />
        <meshBasicMaterial
          color="#10b981"
          side={THREE.DoubleSide}
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <AtmosphereHalo />
      <OrbitalRings />
    </group>
  );
};

// Glowing Beacons + Vertical Light Pillars + Pulsing Radar Rings on Brazil Target Coordinates
const LeadMarkers = ({ leads }: { leads: Lead[] }) => {
  const pulseRef = useRef<THREE.Group>(null);

  const markerData = useMemo(() => {
    return leads.slice(0, 40).map((l, idx) => {
      // Slight deterministic spread if multiple leads share city center coordinates
      const jitterLat = l.lat + ((idx % 5) - 2) * 0.18;
      const jitterLng = l.lng + ((Math.floor(idx / 5) % 5) - 2) * 0.18;
      const surfacePos = latLngToVector3(jitterLat, jitterLng, 2.015);
      const topPos = latLngToVector3(jitterLat, jitterLng, 2.12 + (idx % 3) * 0.04);
      const normal = surfacePos.clone().normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal
      );
      const ringQuaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal
      );
      return { surfacePos, topPos, quaternion, ringQuaternion };
    });
  }, [leads]);

  useFrame((state) => {
    if (pulseRef.current) {
      const t = state.clock.getElapsedTime();
      const s = 1 + (t % 1.2) * 1.8;
      pulseRef.current.children.forEach((child, i) => {
        const phase = ((t + i * 0.15) % 1.4) / 1.4;
        const scale = 0.6 + phase * 2.5;
        child.scale.set(scale, scale, 1);
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) mat.opacity = (1 - phase) * 0.8;
      });
      void s;
    }
  });

  if (markerData.length === 0) return null;

  return (
    <group>
      {/* Core glowing emerald/cyan points and vertical satellite spikes */}
      {markerData.map((m, i) => (
        <group key={i}>
          {/* Glowing surface dot */}
          <mesh position={m.surfacePos}>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshBasicMaterial color={i === 0 ? '#10b981' : '#38bdf8'} />
          </mesh>
          {/* Vertical telemetry beam */}
          <mesh
            position={m.surfacePos.clone().lerp(m.topPos, 0.5)}
            quaternion={m.quaternion}
          >
            <cylinderGeometry args={[0.0025, 0.006, 0.14, 8]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? '#10b981' : '#818cf8'}
              transparent
              opacity={0.75}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}

      {/* Expanding target lock rings on surface */}
      <group ref={pulseRef}>
        {markerData.slice(0, 12).map((m, i) => (
          <mesh key={i} position={m.surfacePos} quaternion={m.ringQuaternion}>
            <ringGeometry args={[0.02, 0.032, 24]} />
            <meshBasicMaterial
              color="#10b981"
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Scene = ({ leads, onAnimationComplete }: Props) => {
  const controlsRef = useRef<any>(null);
  const hasZoomedRef = useRef(false);
  const onCompleteRef = useRef(onAnimationComplete);
  onCompleteRef.current = onAnimationComplete;

  useEffect(() => {
    if (leads.length > 0 && !hasZoomedRef.current) {
      hasZoomedRef.current = true;

      let sumLat = 0;
      let sumLng = 0;
      leads.forEach(l => {
        sumLat += l.lat;
        sumLng += l.lng;
      });
      const centerLat = sumLat / leads.length;
      const centerLng = sumLng / leads.length;

      const targetPos = latLngToVector3(centerLat, centerLng, 2.0);
      // Keep camera at crisp orbital altitude (3.35 instead of 2.2) so texture never pixelates
      const camPos = latLngToVector3(centerLat - 4, centerLng + 6, 3.35);

      const zoomTimer = setTimeout(() => {
        if (controlsRef.current) {
          controlsRef.current.smoothTime = 0.85;
          controlsRef.current
            .setLookAt(
              camPos.x, camPos.y, camPos.z,
              targetPos.x, targetPos.y, targetPos.z,
              true
            )
            .catch(() => {});
        }
      }, 450);

      // Guaranteed completion timer so the screen never hangs at 100%
      const finishTimer = setTimeout(() => {
        onCompleteRef.current();
      }, 2100);

      return () => {
        clearTimeout(zoomTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [leads.length]);

  return (
    <>
      <CameraControls
        ref={controlsRef}
        minDistance={2.8}
        maxDistance={7.5}
        dollySpeed={0.4}
        smoothTime={0.6}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 6, 8]} intensity={1.8} color="#e0e7ff" />
      <directionalLight position={[-8, -5, -8]} intensity={0.9} color="#4f46e5" />
      <pointLight position={[0, 4, 6]} intensity={0.8} color="#10b981" />

      <Stars radius={220} depth={60} count={3500} factor={4} saturation={0} fade speed={0.6} />

      <GlobeErrorBoundary fallback={<FallbackGlobe />}>
        <Suspense fallback={<FallbackGlobe />}>
          <TacticalNightGlobe hasLockedTarget={leads.length > 0} />
        </Suspense>
      </GlobeErrorBoundary>

      <LeadMarkers leads={leads} />
    </>
  );
};

// Executive Tactical HUD Overlay (DOM layer over Canvas)
const TacticalHUDOverlay = ({ leads, onSkip }: { leads: Lead[]; onSkip: () => void }) => {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (leads.length > 0) {
      setProgress(100);
      return;
    }
    const interval = setInterval(() => {
      setProgress(prev => (prev < 88 ? prev + Math.floor(Math.random() * 9) + 3 : prev));
    }, 220);
    return () => clearInterval(interval);
  }, [leads.length]);

  const coords = useMemo(() => {
    if (leads.length === 0) return { lat: '-15.7938° S', lng: '-47.8827° W' };
    const lat = leads[0].lat.toFixed(4);
    const lng = leads[0].lng.toFixed(4);
    return { lat: `${lat}° S`, lng: `${lng}° W` };
  }, [leads]);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Top Executive Bar */}
      <div className="flex items-start justify-between gap-4 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3.5 bg-zinc-950/80 backdrop-blur-md border border-white/[0.08] px-4 py-2.5 rounded-xl shadow-2xl"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-white uppercase">
                GhostAI Orbital Telemetry
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SAT-LINK ACTIVE
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              COORDS: {coords.lat} // {coords.lng} • GOOGLE PLACES ENGINE
            </div>
          </div>
        </motion.div>

        {/* Skip Animation Action Button */}
        <motion.button
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onSkip}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium transition-all shadow-lg cursor-pointer"
        >
          <span>Pular Animação</span>
          <SkipForward className="w-3.5 h-3.5 text-zinc-400" />
        </motion.button>
      </div>

      {/* Center Reticle Target Sight (subtle) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-white/[0.04] flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-dashed border-indigo-500/15 animate-[spin_25s_linear_infinite]" />
          <Crosshair className="w-5 h-5 text-white/15 absolute" />
        </div>
      </div>

      {/* Bottom Telemetry Console & Live Feed */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
        {/* Live Extracted Leads Feed when found */}
        <AnimatePresence>
          {leads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
            >
              {leads.slice(0, 3).map((lead, idx) => (
                <motion.div
                  key={lead.id || idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-zinc-950/85 backdrop-blur-md border border-emerald-500/25 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-white truncate">{lead.name}</div>
                    <div className="text-[10px] font-mono text-emerald-400/80 truncate">
                      ALVO IDENTIFICADO • {lead.lat.toFixed(2)}, {lead.lng.toFixed(2)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Progress Bar Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950/85 backdrop-blur-xl border border-white/[0.09] rounded-2xl p-4 sm:p-5 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              {leads.length === 0 ? (
                <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-sm font-semibold text-white tracking-tight">
                {leads.length === 0
                  ? 'Rastreando empresas e auditando presença digital...'
                  : `${leads.length} empresas mapeadas com sucesso — Sincronizando dossiê`}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-zinc-400">
                ALVOS: <strong className="text-white">{leads.length}</strong>
              </span>
              <span className="text-emerald-400 font-semibold">{progress}%</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full"
              initial={{ width: '10%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const isWebGLSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

class CanvasCatchBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) {
    console.warn("WebGL Canvas failed, falling back to 2D Tactical Radar:", err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const RadarFallback2D = ({ leads, onAnimationComplete }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] w-screen h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_65%)]" />

      <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-white/[0.07]" />
        <div className="absolute inset-10 rounded-full border border-white/[0.06]" />
        <div className="absolute inset-20 rounded-full border border-emerald-500/20" />
        <div className="absolute inset-28 rounded-full border border-indigo-500/25" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-emerald-400 origin-right translate-x-[-50%]" />
        </motion.div>

        <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.9)] relative z-10" />

        {leads.slice(0, 10).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0.5], scale: [0, 1.2, 1] }}
            transition={{ delay: 0.12 * i, duration: 1.2, repeat: Infinity }}
            style={{
              top: `${22 + ((i * 37) % 56)}%`,
              left: `${22 + ((i * 53) % 56)}%`,
            }}
            className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]"
          />
        ))}
      </div>

      <TacticalHUDOverlay leads={leads} onSkip={onAnimationComplete} />
    </div>
  );
};

export const GlobalLeadScanner = ({ leads, onAnimationComplete }: Props) => {
  const [webGLOk] = useState(() => isWebGLSupported());

  if (!webGLOk) {
    return <RadarFallback2D leads={leads} onAnimationComplete={onAnimationComplete} />;
  }

  // Start facing South America / Brazil at an executive orbital distance
  const startPos = latLngToVector3(-14, -48, 5.2);

  return (
    <CanvasCatchBoundary fallback={<RadarFallback2D leads={leads} onAnimationComplete={onAnimationComplete} />}>
      <div className="fixed inset-0 z-[100] bg-[#06070a] w-screen h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12)_0%,transparent_60%)] pointer-events-none" />
        <Canvas camera={{ position: [startPos.x, startPos.y, startPos.z], fov: 42 }}>
          <Scene leads={leads} onAnimationComplete={onAnimationComplete} />
        </Canvas>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,7,10,0.88)_100%)] z-10" />
        <TacticalHUDOverlay leads={leads} onSkip={onAnimationComplete} />
      </div>
    </CanvasCatchBoundary>
  );
};
