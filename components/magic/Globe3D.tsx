"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { getCoordinates } from "@/lib/utils";

// Polyfill for unstable_act if needed
if (typeof window !== 'undefined' && !(window as any).React?.unstable_act) {
  (window as any).React = (window as any).React || {};
  (window as any).React.unstable_act = (fn: () => void) => fn();
}

interface Globe3DProps {
  destination?: string;
  onDestinationChange?: (destination: string) => void;
}

// Convert lat/lon to 3D coordinates on sphere
function latLonToVector3(lat: number, lon: number, radius: number = 2.1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Globe({ destination }: { destination?: string }) {
  const globeRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const destinationMarkerRef = useRef<THREE.Mesh>(null);
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [isFlying, setIsFlying] = useState(false);

  // Load Earth texture using drei's useTexture hook
  // Since this component is dynamically imported with ssr: false, it's safe to call hooks
  const [earthTexture, earthNormal] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'
  ]);

  useEffect(() => {
    if (destination) {
      const coords = getCoordinates(destination);
      if (coords) {
        const pos = latLonToVector3(coords[0], coords[1]);
        setTargetPosition(pos);
        setIsFlying(true);
      }
    }
  }, [destination]);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
    
    if (groupRef.current && destination) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      groupRef.current.scale.set(scale, scale, scale);
    }

    // Animate camera to destination
    if (isFlying && targetPosition && state.camera) {
      const target = new THREE.Vector3(
        targetPosition.x * 1.5,
        targetPosition.y * 1.5,
        targetPosition.z * 1.5 + 3
      );
      state.camera.position.lerp(target, 0.05);
      
      const lookAt = targetPosition.clone();
      state.camera.lookAt(lookAt);
      
      if (state.camera.position.distanceTo(target) < 0.1) {
        setIsFlying(false);
      }
    }

    // Animate destination marker
    if (destinationMarkerRef.current && targetPosition) {
      destinationMarkerRef.current.position.copy(targetPosition);
      destinationMarkerRef.current.rotation.y += 0.02;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      destinationMarkerRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Earth Globe with Real Texture */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          normalMap={earthNormal}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          metalness={0.1}
          roughness={0.9}
          emissive={destination ? "#8b5cf6" : "#6366f1"}
          emissiveIntensity={destination ? 0.15 : 0.05}
        />
      </mesh>
      
      {/* Atmospheric Glow */}
      <mesh>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial
          transparent
          opacity={0.2}
          color="#87CEEB"
          emissive="#87CEEB"
          emissiveIntensity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Destination Marker */}
      {targetPosition && (
        <mesh ref={destinationMarkerRef} position={targetPosition}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#ff006e"
            emissive="#ff006e"
            emissiveIntensity={1.5}
          />
          {/* Glowing ring */}
          <mesh position={[0, 0, 0]}>
            <ringGeometry args={[0.2, 0.25, 32]} />
            <meshStandardMaterial
              color="#ff006e"
              emissive="#ff006e"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        </mesh>
      )}
    </group>
  );
}

function Particles() {
  const particles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const color = new THREE.Color();
      color.setHSL(0.7 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors };
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
      pointsRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2000}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={2000}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

export default function Globe3D({ destination, onDestinationChange }: Globe3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="bg-transparent"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <Particles />
        <Globe destination={destination} />
        <Stars radius={5} depth={50} count={1000} factor={4} fade speed={1} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!destination}
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI - Math.PI / 3}
        />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
