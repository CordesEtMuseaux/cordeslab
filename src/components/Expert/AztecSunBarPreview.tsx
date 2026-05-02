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


const AztecSunBarPreview = forwardRef<KnotPreviewHandle, Props>(function AztecSunBarPreview({ color1, color2, accessoryType }, ref) {
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

    const makeTube = (points: THREE.Vector3[], color: string, radius = 0.10) => {
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

    // --- STRUCTURE AZTEC SUN BAR ---
    // Motif répété de "soleils" : 6 pétales ovales bombés (c2)
    // sur fond de brins longitudinaux (c1)
    // Chaque soleil = 3 pétales haut + 3 pétales bas qui se croisent au centre

    const NUM_SUNS = 7
    const STEP_X = 0.95
    const totalW = (NUM_SUNS - 1) * STEP_X
    const PETAL_H = 0.42   // demi-hauteur d'un pétale
    const PETAL_W = 0.28   // demi-largeur d'un pétale
    const Z_FRONT = 0.28
    const Z_BACK = -0.08

    // Brins longitudinaux de fond (c1) — 3 rangées
    for (let row = -1; row <= 1; row++) {
      makeTube([
        new THREE.Vector3(-totalW / 2 - 0.4, row * 0.38, Z_BACK),
        new THREE.Vector3( totalW / 2 + 0.4, row * 0.38, Z_BACK),
      ], c1, 0.09)
    }

    // Soleils répétés
    for (let s = 0; s < NUM_SUNS; s++) {
      const cx = -totalW / 2 + s * STEP_X

      // --- 6 PÉTALES PAR SOLEIL ---
      // Pétale haut-gauche (↖)
      makeTube([
        new THREE.Vector3(cx,           0,        Z_BACK),
        new THREE.Vector3(cx - PETAL_W * 0.6, PETAL_H * 0.6, Z_FRONT * 0.7),
        new THREE.Vector3(cx - PETAL_W, PETAL_H,  Z_FRONT),
        new THREE.Vector3(cx - PETAL_W * 0.6, PETAL_H * 1.2, Z_FRONT * 0.5),
        new THREE.Vector3(cx,           PETAL_H * 0.9, Z_BACK * 0.5),
      ], c2, 0.115)

      // Pétale haut (↑)
      makeTube([
        new THREE.Vector3(cx,           0,         Z_BACK),
        new THREE.Vector3(cx,           PETAL_H * 0.7, Z_FRONT),
        new THREE.Vector3(cx,           PETAL_H * 1.3, Z_FRONT * 0.8),
        new THREE.Vector3(cx,           PETAL_H * 0.9, Z_BACK * 0.3),
      ], c2, 0.115)

      // Pétale haut-droite (↗)
      makeTube([
        new THREE.Vector3(cx,           0,        Z_BACK),
        new THREE.Vector3(cx + PETAL_W * 0.6, PETAL_H * 0.6, Z_FRONT * 0.7),
        new THREE.Vector3(cx + PETAL_W, PETAL_H,  Z_FRONT),
        new THREE.Vector3(cx + PETAL_W * 0.6, PETAL_H * 1.2, Z_FRONT * 0.5),
        new THREE.Vector3(cx,           PETAL_H * 0.9, Z_BACK * 0.5),
      ], c2, 0.115)

      // Pétale bas-gauche (↙)
      makeTube([
        new THREE.Vector3(cx,            0,         Z_BACK),
        new THREE.Vector3(cx - PETAL_W * 0.6, -PETAL_H * 0.6, Z_FRONT * 0.7),
        new THREE.Vector3(cx - PETAL_W, -PETAL_H,   Z_FRONT),
        new THREE.Vector3(cx - PETAL_W * 0.6, -PETAL_H * 1.2, Z_FRONT * 0.5),
        new THREE.Vector3(cx,            -PETAL_H * 0.9, Z_BACK * 0.5),
      ], c2, 0.115)

      // Pétale bas (↓)
      makeTube([
        new THREE.Vector3(cx,            0,          Z_BACK),
        new THREE.Vector3(cx,           -PETAL_H * 0.7, Z_FRONT),
        new THREE.Vector3(cx,           -PETAL_H * 1.3, Z_FRONT * 0.8),
        new THREE.Vector3(cx,           -PETAL_H * 0.9, Z_BACK * 0.3),
      ], c2, 0.115)

      // Pétale bas-droite (↘)
      makeTube([
        new THREE.Vector3(cx,            0,         Z_BACK),
        new THREE.Vector3(cx + PETAL_W * 0.6, -PETAL_H * 0.6, Z_FRONT * 0.7),
        new THREE.Vector3(cx + PETAL_W, -PETAL_H,   Z_FRONT),
        new THREE.Vector3(cx + PETAL_W * 0.6, -PETAL_H * 1.2, Z_FRONT * 0.5),
        new THREE.Vector3(cx,            -PETAL_H * 0.9, Z_BACK * 0.5),
      ], c2, 0.115)

      // Point central (petit nœud au centre du soleil)
      const sphereGeo = new THREE.SphereGeometry(0.10, 10, 10)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: c2 as any, roughness: 0.85, metalness: 0.0
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(cx, 0, Z_FRONT * 0.3)
      group.add(sphere)
    }

    group.scale.set(1.05, 1.15, 1.05)
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
          src={getRealImage(accessoryType, '/images/knots/aztec-sun-bar-real.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Aztec Sun Bar réel"
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

export default AztecSunBarPreview
