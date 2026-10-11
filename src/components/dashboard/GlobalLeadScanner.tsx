import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, CameraControls, Instances, Instance, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

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

import { Component, ReactNode } from 'react';

class GlobeErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err: any) { console.warn("PhotorealisticGlobe error (falling back):", err) }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const FallbackGlobe = () => (
  <group>
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial color="#050505" transparent opacity={0.95} roughness={0.8} metalness={0.2} />
    </mesh>
    <mesh>
      <sphereGeometry args={[2.02, 32, 32]} />
      <meshBasicMaterial color="#3b2b5c" wireframe transparent opacity={0.3} />
    </mesh>
  </group>
);

const PhotorealisticGlobe = () => {
  const earthRef = useRef<THREE.Group>(null);
  const [map, bumpMap, specularMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-water.png'
  ]);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group ref={earthRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={map} 
          bumpMap={bumpMap} 
          bumpScale={0.015} 
          specularMap={specularMap} 
          specular={new THREE.Color('grey')} 
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshBasicMaterial color="#4a90e2" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

const LeadMarkers = ({ leads }: { leads: Lead[] }) => {
  const vectors = useMemo(() => {
    return leads.map(l => latLngToVector3(l.lat, l.lng, 2.02));
  }, [leads]);

  if (vectors.length === 0) return null;

  return (
    <Instances limit={100} range={vectors.length}>
      <sphereGeometry args={[0.015, 16, 16]} />
      <meshBasicMaterial color="#ff3b3b" />
      {vectors.map((vec, i) => (
        <Instance key={i} position={vec} />
      ))}
    </Instances>
  );
};

const HUD = ({ leads }: { leads: Lead[] }) => {
  return (
    <Html fullscreen className="pointer-events-none w-full h-full flex flex-col justify-between p-8">
      <div className="flex justify-between items-start w-full">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-1"
        >
          <div className="text-white text-2xl font-bold tracking-[0.2em] drop-shadow-lg">GHOSTMARKET</div>
          <div className="text-primary font-mono text-sm tracking-widest drop-shadow-md">LEAD SCANNER</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right flex flex-col gap-1"
        >
          <div className="text-white text-2xl font-bold tracking-[0.2em] drop-shadow-lg">BRAZIL</div>
          <div className="text-textSecondary font-mono text-sm tracking-widest drop-shadow-md">GLOBAL</div>
        </motion.div>
      </div>

      <div className="w-full flex justify-center pb-16">
        <AnimatePresence mode="wait">
          {leads.length === 0 && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="text-primary font-mono text-lg uppercase tracking-widest drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                Scanneando Leads
              </div>
              <div className="text-white/60 font-mono text-sm uppercase tracking-widest">
                Leads Encontrado
              </div>
              <div className="text-white font-mono text-lg tracking-widest mt-1">
                Total: 0
              </div>
              <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-2 relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                  animate={{ 
                    left: ['-50%', '100%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ width: '50%' }}
                />
              </div>
            </motion.div>
          )}
          {leads.length > 0 && (
            <motion.div 
              key="zooming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2"
            >
               <div className="text-success font-mono text-xl uppercase tracking-widest drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]">
                 Scanner concluído
               </div>
               <div className="text-white font-mono text-lg tracking-wider">
                 Total: {leads.length}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Html>
  );
};

const Scene = ({ leads, onAnimationComplete }: Props) => {
  const controlsRef = useRef<any>(null);
  const [hasZoomed, setHasZoomed] = useState(false);
  
  useEffect(() => {
    if (leads.length > 0 && !hasZoomed) {
      setHasZoomed(true);
      
      let sumLat = 0;
      let sumLng = 0;
      leads.forEach(l => {
        sumLat += l.lat;
        sumLng += l.lng;
      });
      const centerLat = sumLat / leads.length;
      const centerLng = sumLng / leads.length;
      
      const targetPos = latLngToVector3(centerLat, centerLng, 2.0);
      const camPos = latLngToVector3(centerLat, centerLng, 2.2); // Closer zoom
      
      setTimeout(() => {
        if (controlsRef.current) {
          // Make transition slower and more dramatic
          controlsRef.current.smoothTime = 1.2;
          controlsRef.current.setLookAt(
            camPos.x, camPos.y, camPos.z,
            targetPos.x, targetPos.y, targetPos.z,
            true 
          ).then(() => {
            setTimeout(onAnimationComplete, 500);
          });
        }
      }, 2500); 
    }
  }, [leads, hasZoomed, onAnimationComplete]);

  return (
    <>
      <CameraControls 
        ref={controlsRef} 
        minDistance={2.1} 
        maxDistance={8}
        dollySpeed={0.5}
        smoothTime={0.4}
      />
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-10, -5, -10]} intensity={0.5} color="#4a90e2" />
      <pointLight position={[0, 0, 10]} intensity={0.5} color="#ffffff" />
      
      <Stars radius={300} depth={60} count={10000} factor={7} saturation={0} fade speed={1} />
      
      <GlobeErrorBoundary fallback={<FallbackGlobe />}>
        <Suspense fallback={<FallbackGlobe />}>
          <PhotorealisticGlobe />
        </Suspense>
      </GlobeErrorBoundary>
      
      <LeadMarkers leads={leads} />
      <HUD leads={leads} />
    </>
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
  } catch (e) {
    return false;
  }
};

class CanvasCatchBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) {
    console.warn("WebGL Canvas failed, falling back to 2D Radar:", err);
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
    }, 2800);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#030305] w-screen h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f133815_1px,transparent_1px),linear-gradient(to_bottom,#1f133815_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      {/* Radar rings */}
      <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-pulse" />
        <div className="absolute inset-8 rounded-full border border-purple-500/30" />
        <div className="absolute inset-16 rounded-full border border-purple-500/40" />
        <div className="absolute inset-24 rounded-full border border-purple-500/50" />
        
        {/* Sweep line */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-purple-400 origin-right translate-x-[-50%] shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
        </motion.div>

        {/* Center dot */}
        <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,1)] relative z-10" />

        {/* Radar blips */}
        {leads.slice(0, 10).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0.4], scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2 * i, duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            style={{
              top: `${20 + ((i * 37) % 60)}%`,
              left: `${20 + ((i * 53) % 60)}%`,
            }}
            className="absolute w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"
          />
        ))}
      </div>

      {/* HUD Info */}
      <div className="relative z-10 mt-8 text-center flex flex-col items-center">
        <div className="text-purple-400 font-mono text-xs uppercase tracking-widest mb-1">
          GHOSTMARKET // RADAR DE LEADS
        </div>
        <h2 className="text-2xl font-black text-white tracking-wide mb-2">
          Varredura em Andamento...
        </h2>
        <div className="text-purple-200/70 font-mono text-sm mb-4">
          Leads Encontrados: <span className="text-white font-bold">{leads.length}</span>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
          />
        </div>
      </div>
    </div>
  );
};

export const GlobalLeadScanner = ({ leads, onAnimationComplete }: Props) => {
  const [webGLOk] = useState(() => isWebGLSupported());

  if (!webGLOk) {
    return <RadarFallback2D leads={leads} onAnimationComplete={onAnimationComplete} />;
  }

  // Start facing Brazil (lat: -15, lng: -50)
  const startPos = latLngToVector3(-15, -50, 6.0);

  return (
    <CanvasCatchBoundary fallback={<RadarFallback2D leads={leads} onAnimationComplete={onAnimationComplete} />}>
      <div className="fixed inset-0 z-[100] bg-[#030305] w-screen h-screen flex flex-col overflow-hidden">
        <Canvas camera={{ position: [startPos.x, startPos.y, startPos.z], fov: 45 }}>
          <Scene leads={leads} onAnimationComplete={onAnimationComplete} />
        </Canvas>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(3,3,5,0.9)_100%)] z-[5]"></div>
      </div>
    </CanvasCatchBoundary>
  );
};
