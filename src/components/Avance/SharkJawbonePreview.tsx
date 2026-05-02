import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'

interface Props {
  color1: string
  color2: string
  accessoryType?: string
}

export interface KnotPreviewHandle {
  getSnapshot: () => string
}

function getRealImage(accessoryType?: string, defaultImg: string = ''): string {
  switch (accessoryType) {
    case 'LAISSE':  return '/images/accessoires/laisse-real.jpg'
    case 'POIGNEE': return '/images/accessoires/poignee-real.jpg'
    case 'HARNAIS': return '/images/accessoires/harnais-real.jpg'
    case 'JOUETS':  return '/images/accessoires/jouet-real.jpg'
    default:        return defaultImg
  }
}


const SharkJawbonePreview = forwardRef<KnotPreviewHandle, Props>(function SharkJawbonePreview({ color1, color2, accessoryType }, ref) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useImperativeHandle(ref, () => ({
    getSnapshot: () => rendererRef.current ? rendererRef.current.domElement.toDataURL('image/png') : ''
  }))

  useEffect(() => {
    if (!mountRef.current) return
    const currentMount = mountRef.current

    const width = 203
    const height = 140

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#ddd6cc')

    const camera = new THREE.PerspectiveCamera(20, width / height, 0.1, 200)
    camera.position.set(0, 0, 18)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    currentMount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(4, 8, 10)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35)
    fillLight.position.set(-5, -2, 4)
    scene.add(fillLight)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2)
    rimLight.position.set(0, -8, -4)
    scene.add(rimLight)

    const group = new THREE.Group()

    const makeTube = (points: THREE.Vector3[], color: string, radius = 0.11) => {
      const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
      const geometry = new THREE.TubeGeometry(curve, 48, radius, 12, false)
      const material = new THREE.MeshStandardMaterial({
        color: color as any,
        roughness: 0.85,
        metalness: 0.0,
      })
      group.add(new THREE.Mesh(geometry, material))
    }

    const c1 = color1 || '#556b2f'
    const c2 = color2 || '#c8a96e'

    // --- STRUCTURE SHARK JAWBONE ---
    // Brins c1 (vert) : 2 cordons longitudinaux sur les bords haut et bas
    // Brins c2 (beige) : grandes diagonales en zigzag qui traversent de haut en bas
    // Les diagonales forment des "dents de requin" très prononcées

    const totalW = 5.8
    const NUM_ZIGS = 18
    const STEP_X = totalW / (NUM_ZIGS - 1)
    const HALF_Y = 0.62
    const Z_FRONT = 0.26
    const Z_BACK = -0.08
    const Z_MID = 0.10

    // Brins longitudinaux de bord (c1)
    makeTube([
      new THREE.Vector3(-totalW / 2,  HALF_Y, Z_BACK),
      new THREE.Vector3( totalW / 2,  HALF_Y, Z_BACK),
    ], c1, 0.10)
    makeTube([
      new THREE.Vector3(-totalW / 2, -HALF_Y, Z_BACK),
      new THREE.Vector3( totalW / 2, -HALF_Y, Z_BACK),
    ], c1, 0.10)

    // Brins longitudinaux intermédiaires (c1) — fond
    makeTube([
      new THREE.Vector3(-totalW / 2, 0, Z_BACK * 1.5),
      new THREE.Vector3( totalW / 2, 0, Z_BACK * 1.5),
    ], c1, 0.07)

    // Diagonales zigzag (c2) — 2 séries décalées pour l'effet "mâchoire"
    for (let i = 0; i < NUM_ZIGS - 1; i++) {
      const xL = -totalW / 2 + i * STEP_X
      const xR = xL + STEP_X
      const even = i % 2 === 0

      // Diagonale principale : monte de bas-gauche vers haut-droite (ou inverse)
      if (even) {
        // Montante ↗
        makeTube([
          new THREE.Vector3(xL, -HALF_Y * 0.85, Z_MID),
          new THREE.Vector3((xL + xR) / 2, 0, Z_FRONT),
          new THREE.Vector3(xR,  HALF_Y * 0.85, Z_MID),
        ], c2, 0.16)
      } else {
        // Descendante ↘
        makeTube([
          new THREE.Vector3(xL,  HALF_Y * 0.85, Z_MID),
          new THREE.Vector3((xL + xR) / 2, 0, Z_FRONT),
          new THREE.Vector3(xR, -HALF_Y * 0.85, Z_MID),
        ], c2, 0.16)
      }
    }

    // Deuxième série de diagonales décalée (c2) — crée l'effet mâchoire croisée
    for (let i = 0; i < NUM_ZIGS - 1; i++) {
      const xL = -totalW / 2 + i * STEP_X + STEP_X * 0.5
      const xR = xL + STEP_X
      if (xR > totalW / 2) continue
      const even = i % 2 === 0

      if (even) {
        makeTube([
          new THREE.Vector3(xL,  HALF_Y * 0.75, Z_BACK * 0.5),
          new THREE.Vector3((xL + xR) / 2, 0, Z_MID * 0.8),
          new THREE.Vector3(xR, -HALF_Y * 0.75, Z_BACK * 0.5),
        ], c2, 0.14)
      } else {
        makeTube([
          new THREE.Vector3(xL, -HALF_Y * 0.75, Z_BACK * 0.5),
          new THREE.Vector3((xL + xR) / 2, 0, Z_MID * 0.8),
          new THREE.Vector3(xR,  HALF_Y * 0.75, Z_BACK * 0.5),
        ], c2, 0.14)
      }
    }

    group.scale.set(1.1, 1.35, 1.1)
    scene.add(group)

    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      group.rotation.x = Math.sin(Date.now() * 0.0005) * 0.10
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      rendererRef.current = null
      group.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose()
        if ((obj as THREE.Mesh).material) ((obj as THREE.Mesh).material as THREE.Material).dispose()
      })
      renderer.dispose()
      if (currentMount.contains(renderer.domElement)) currentMount.removeChild(renderer.domElement)
    }
  }, [color1, color2])

  return (
    <div style={{
      width: '406px',
      height: '140px',
      background: '#ddd6cc',
      borderRadius: '15px',
      overflow: 'hidden',
      display: 'flex',
    }}>
      {/* Colonne Gauche - 3D */}
      <div style={{ width: '203px', height: '100%', position: 'relative', borderRight: '1px solid rgba(255,255,255,0.3)' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          fontSize: '9px', fontWeight: 'bold', color: '#888',
          pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          Aperçu couleurs (3D)
        </span>
      </div>

      {/* Colonne Droite - Photo */}
      <div style={{ width: '203px', height: '100%', position: 'relative' }}>
        <img
          src={getRealImage(accessoryType, '/images/knots/shark-jawbone-real.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Shark Jawbone réel"
        />
        <span style={{
          position: 'absolute', top: '10px', left: '10px',
          fontSize: '9px', fontWeight: 'bold', color: '#fff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>
          Rendu réel
        </span>
      </div>
    </div>
  )
})

export default SharkJawbonePreview
