'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// ─── Scene data ───────────────────────────────────────────────────────────────

const NODES = [
  { id: 'orch',  label: 'Orchestrator',  pos: [-3.6, 0, 0]    as [number,number,number], color: '#8b5cf6', size: 0.44 },
  { id: 'sp-a',  label: 'Specialist A',  pos: [-0.4, 1.8, 0.4] as [number,number,number], color: '#3b82f6', size: 0.34 },
  { id: 'sp-b',  label: 'Specialist B',  pos: [-0.4,-1.8,-0.4] as [number,number,number], color: '#3b82f6', size: 0.34 },
  { id: 'crit',  label: 'Critic',        pos: [2.6, 0, 0]      as [number,number,number], color: '#f59e0b', size: 0.34 },
  { id: 'out',   label: 'Output',        pos: [5.2, 0, 0]      as [number,number,number], color: '#10b981', size: 0.20 },
]

const EDGES = [
  { from: 0, to: 1, delay: 0    },
  { from: 0, to: 2, delay: 0.45 },
  { from: 1, to: 3, delay: 0.9  },
  { from: 2, to: 3, delay: 1.35 },
  { from: 3, to: 4, delay: 1.8  },
]

// ─── Node ─────────────────────────────────────────────────────────────────────

function AgentNode({
  pos, color, size, label,
}: {
  pos: [number, number, number]
  color: string
  size: number
  label: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.4) * 0.045)
  })

  return (
    <group position={pos}>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.1}
          roughness={0.15}
          metalness={0.5}
        />
      </mesh>

      {/* Soft halo */}
      <mesh>
        <sphereGeometry args={[size * 1.55, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.1}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* HTML label below the node */}
      <group position={[0, -size - 0.28, 0]}>
        <Html center style={{ pointerEvents: 'none' }}>
          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: '9px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textShadow: `0 0 14px ${color}99`,
          }}>
            {label}
          </p>
        </Html>
      </group>
    </group>
  )
}

// ─── Flowing particle along an edge ───────────────────────────────────────────

function FlowParticle({
  from, to, delay, color,
}: {
  from: [number, number, number]
  to: [number, number, number]
  delay: number
  color: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [fx, fy, fz] = from
  const [tx, ty, tz] = to
  const startVec = useMemo(() => new THREE.Vector3(fx, fy, fz), [fx, fy, fz])
  const endVec   = useMemo(() => new THREE.Vector3(tx, ty, tz), [tx, ty, tz])
  const posVec   = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    // 2.2 second loop per particle, offset by delay
    const t = ((clock.elapsedTime * 0.45 - delay) % 1 + 1) % 1
    posVec.lerpVectors(startVec, endVec, t)
    meshRef.current.position.copy(posVec)
    // fade in/out near endpoints
    const opacity = Math.sin(t * Math.PI)
    ;(meshRef.current.material as THREE.MeshStandardMaterial).opacity = opacity
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.075, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={5}
        transparent
        opacity={1}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Full scene ────────────────────────────────────────────────────────────────

function Scene() {
  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 6, 6]} intensity={0.6} />

      {/* Edges — static dim lines */}
      {EDGES.map((edge, i) => {
        const a = NODES[edge.from]
        const b = NODES[edge.to]
        return (
          <group key={i}>
            <Line
              points={[
                new THREE.Vector3(...a.pos),
                new THREE.Vector3(...b.pos),
              ]}
              color={a.color}
              lineWidth={1.4}
              opacity={0.18}
              transparent
            />
            <FlowParticle
              from={a.pos}
              to={b.pos}
              delay={edge.delay}
              color={a.color}
            />
          </group>
        )
      })}

      {/* Nodes */}
      {NODES.map(n => (
        <AgentNode
          key={n.id}
          pos={n.pos}
          color={n.color}
          size={n.size}
          label={n.label}
        />
      ))}

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.45}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.72}
        minPolarAngle={Math.PI * 0.28}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.05}
          luminanceSmoothing={0.85}
          intensity={1.4}
        />
      </EffectComposer>
    </>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function AgentNetwork3D() {
  return (
    <div className="w-full" style={{ height: 380 }}>
      <Canvas
        camera={{ position: [0, 0, 10.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
