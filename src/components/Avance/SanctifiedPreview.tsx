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


const SanctifiedPreview = forwardRef<KnotPreviewHandle, Props>(function SanctifiedPreview({ color1, color2, accessoryType }, ref) {
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

    // --- STRUCTURE SANCTIFIED ---
    // Vue de face :
    // - c1 (vert) : boucles rondes sur bord haut ET bas + brins verticaux centraux
    // - c2 (beige) : brins diagonaux en X qui passent à travers les boucles
    //
    // Différence avec Crown Sinnet : boucles de bord bien distinctes et
    // brins diagonaux c2 très visibles qui forment des X nets

    const NUM_COLS = 13
    const STEP_X = 0.54
    const HALF_Y = 0.58    // demi-hauteur totale
    const LOOP_R = 0.32
        // rayon des boucles de bord
    const Z_FRONT = 0.24
    const Z_BACK = -0.12
    const totalW = NUM_COLS * STEP_X

    for (let i = 0; i < NUM_COLS; i++) {
      const xC = -totalW / 2 + i * STEP_X + STEP_X / 2
      const even = i % 2 === 0

      // BOUCLE DE BORD HAUT (c1) — arrondie, bien visible
      makeTube([
        new THREE.Vector3(xC - LOOP_R * 0.8, HALF_Y * 0.55, Z_BACK),
        new THREE.Vector3(xC - LOOP_R,        HALF_Y * 0.80, even ? Z_FRONT * 0.6 : Z_FRONT * 0.3),
        new THREE.Vector3(xC,                 HALF_Y,        even ? Z_FRONT : Z_FRONT * 0.7),
        new THREE.Vector3(xC + LOOP_R,        HALF_Y * 0.80, even ? Z_FRONT * 0.6 : Z_FRONT * 0.3),
        new THREE.Vector3(xC + LOOP_R * 0.8, HALF_Y * 0.55, Z_BACK),
      ], c1, 0.115)

      // BOUCLE DE BORD BAS (c1) — symétrique
      makeTube([
        new THREE.Vector3(xC - LOOP_R * 0.8, -HALF_Y * 0.55, Z_BACK),
        new THREE.Vector3(xC - LOOP_R,        -HALF_Y * 0.80, even ? Z_FRONT * 0.3 : Z_FRONT * 0.6),
        new THREE.Vector3(xC,                 -HALF_Y,        even ? Z_FRONT * 0.7 : Z_FRONT),
        new THREE.Vector3(xC + LOOP_R,        -HALF_Y * 0.80, even ? Z_FRONT * 0.3 : Z_FRONT * 0.6),
        new THREE.Vector3(xC + LOOP_R * 0.8, -HALF_Y * 0.55, Z_BACK),
      ], c1, 0.115)

      // BRIN VERTICAL CENTRAL (c1) — relie boucle haut à boucle bas
      makeTube([
        new THREE.Vector3(xC, HALF_Y * 0.50, Z_BACK * 0.5),
        new THREE.Vector3(xC, 0,             Z_BACK),
        new THREE.Vector3(xC, -HALF_Y * 0.50, Z_BACK * 0.5),
      ], c1, 0.09)
    }

    // BRINS DIAGONAUX (c2) — forment les X entre les boucles
    for (let i = 0; i < NUM_COLS - 1; i++) {
      const xL = -totalW / 2 + i * STEP_X + STEP_X / 2
      const xR = xL + STEP_X
      const even = i % 2 === 0

      // Diagonal ↗ (bas-gauche → haut-droite)
      makeTube([
        new THREE.Vector3(xL, -HALF_Y * 0.45, even ? Z_FRONT * 0.5 : Z_BACK * 0.3),
        new THREE.Vector3((xL + xR) / 2, 0,   even ? Z_FRONT * 0.8 : Z_FRONT * 0.4),
        new THREE.Vector3(xR,  HALF_Y * 0.45, even ? Z_FRONT * 0.5 : Z_BACK * 0.3),
      ], c2, 0.115)

      // Diagonal ↘ (haut-gauche → bas-droite)
      makeTube([
        new THREE.Vector3(xL,  HALF_Y * 0.45, even ? Z_BACK * 0.3 : Z_FRONT * 0.5),
        new THREE.Vector3((xL + xR) / 2, 0,   even ? Z_FRONT * 0.4 : Z_FRONT * 0.8),
        new THREE.Vector3(xR, -HALF_Y * 0.45, even ? Z_BACK * 0.3 : Z_FRONT * 0.5),
      ], c2, 0.115)
    }

    group.scale.set(1.1, 1.2, 1.1)
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
          src={getRealImage(accessoryType, '/images/knots/sanctified-real.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Sanctified réel"
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

export default SanctifiedPreview
