import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, CameraControls, Instances, Instance } from '@react-three/drei';
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

const Globe = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={earthRef as any}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="#050505" 
          transparent 
          opacity={0.95} 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[2.02, 32, 32]} />
        <meshBasicMaterial 
          color="#3b2b5c" 
          wireframe 
          transparent 
          opacity={0.3} 
        />
      </mesh>
    </group>
  );
};

const LeadMarkers = ({ leads }: { leads: Lead[] }) => {
  const vectors = useMemo(() => {
    return leads.map(l => latLngToVector3(l.lat, l.lng, 2.05));
  }, [leads]);

  if (vectors.length === 0) return null;

  return (
    <Instances limit={100} range={vectors.length}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshBasicMaterial color="#a78bfa" />
      {vectors.map((vec, i) => (
        <Instance key={i} position={vec} />
      ))}
    </Instances>
  );
};

const HUD = ({ leads, timeElapsed }: { leads: Lead[], timeElapsed: number }) => {
  return (
    <Html fullscreen className="pointer-events-none p-6 w-full h-full flex flex-col justify-between">
      <div className="flex justify-between items-start w-full">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-2"
        >
          <div className="text-white text-xl font-bold tracking-[0.2em]">GLOBAL LEAD SCANNER</div>
          <div className="flex items-center gap-2 text-primary font-mono text-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            {leads.length === 0 ? 'ESTABELECENDO CONEXÃO SATELITAL...' : 'SISTEMA OPERANTE / ALVOS DETECTADOS'}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right font-mono text-sm"
        >
          <div className="text-textSecondary mb-1">LEADS ENCONTRADOS</div>
          <div className="text-3xl text-white font-bold">{leads.length}</div>
          <div className="text-textSecondary mt-2">TEMPO: 00:{timeElapsed.toString().padStart(2, '0')}</div>
        </motion.div>
      </div>

      <div className="w-full flex justify-center pb-4">
        <AnimatePresence mode="wait">
          {leads.length === 0 && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-primary font-mono text-sm uppercase tracking-widest animate-pulse border border-primary/30 bg-primary/10 px-4 py-2 rounded-full">
                Varrendo perímetro geográfico...
              </div>
            </motion.div>
          )}
          {leads.length > 0 && (
            <motion.div 
              key="zooming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
               <div className="text-success font-mono text-sm uppercase tracking-widest border border-success/30 bg-success/10 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                Extração de inteligência em andamento. Aproximando...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Html>
  );
};

const Scene = ({ leads, onAnimationComplete, timeElapsed }: Props & { timeElapsed: number }) => {
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
      
      const targetPos = latLngToVector3(centerLat, centerLng, 2.05);
      const camPos = latLngToVector3(centerLat, centerLng, 2.5);
      
      setTimeout(() => {
        if (controlsRef.current) {
          controlsRef.current.setLookAt(
            camPos.x, camPos.y, camPos.z,
            targetPos.x, targetPos.y, targetPos.z,
            true 
          ).then(() => {
            setTimeout(onAnimationComplete, 1200);
          });
        }
      }, 3000); 
    }
  }, [leads, hasZoomed, onAnimationComplete]);

  return (
    <>
      <CameraControls 
        ref={controlsRef} 
        minDistance={2.5} 
        maxDistance={6}
        dollySpeed={0.5}
      />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
      
      <Globe />
      <LeadMarkers leads={leads} />
      <HUD leads={leads} timeElapsed={timeElapsed} />
    </>
  );
};

export const GlobalLeadScanner = ({ leads, onAnimationComplete }: Props) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[600px] relative bg-[#050505] rounded-xl overflow-hidden border border-[#222] shadow-[0_0_50px_rgba(139,92,246,0.15)]">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <Scene leads={leads} onAnimationComplete={onAnimationComplete} timeElapsed={timeElapsed} />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] z-[5]"></div>
      <div className="absolute bottom-0 w-full h-32 pointer-events-none bg-gradient-to-t from-black/80 to-transparent z-[6]"></div>
    </div>
  );
};
