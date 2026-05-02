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


const CrownSinnetPreview = forwardRef<KnotPreviewHandle, Props>(function CrownSinnetPreview({ color1, color2, accessoryType }, ref) {
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
      const geometry = new THREE.TubeGeometry(curve, 48, radius, 10, false)
      const material = new THREE.MeshStandardMaterial({
        color: color as any,
        roughness: 0.85,
        metalness: 0.0,
      })
      group.add(new THREE.Mesh(geometry, material))
    }

    const c1 = color1 || '#d4a464'
    const c2 = color2 || '#ffffff'

    // --- GÉOMÉTRIE CONSTRUITE DIRECTEMENT EN HORIZONTAL ---
    // X = axe longitudinal (longueur du collier)
    // Y = axe vertical (hauteur)
    // Z = profondeur (avant/arrière)
    //
    // Crown Sinnet : 4 brins en spirale qui forment des losanges.
    // Vue de face : chevrons en V qui pointent alternativement haut et bas.
    // Chaque paire de brins se croise au centre du collier.

    const NUM_COLS = 16   // nombre de losanges sur la longueur
    const STEP_X = 0.44   // largeur d'un losange
    const HALF_Y = 0.58   // demi-hauteur d'un losange
    const Z_FRONT = 0.20  // profondeur avant
    const Z_BACK = -0.10  // profondeur arrière
    const totalW = NUM_COLS * STEP_X

    for (let i = 0; i < NUM_COLS; i++) {
      const xL = -totalW / 2 + i * STEP_X       // bord gauche du losange
      const xM = xL + STEP_X / 2                // centre du losange
      const xR = xL + STEP_X                    // bord droit du losange
      const even = i % 2 === 0

      // BRIN 1 (c1) : monte en diagonale ↗ (gauche-bas → droite-haut)
      // Alterne devant/derrière au croisement central
      makeTube([
        new THREE.Vector3(xL, -HALF_Y, even ? Z_BACK  : Z_FRONT),
        new THREE.Vector3(xM,  0,      even ? Z_FRONT : Z_BACK),   // croisement
        new THREE.Vector3(xR,  HALF_Y, even ? Z_BACK  : Z_FRONT),
      ], c1, 0.14)

      // BRIN 2 (c2) : descend en diagonale ↘ (gauche-haut → droite-bas)
      // Inverse du brin 1 au croisement
      makeTube([
        new THREE.Vector3(xL,  HALF_Y, even ? Z_FRONT : Z_BACK),
        new THREE.Vector3(xM,  0,      even ? Z_BACK  : Z_FRONT),  // croisement
        new THREE.Vector3(xR, -HALF_Y, even ? Z_FRONT : Z_BACK),
      ], c2, 0.14)
    }

    // Brins de bord supérieur et inférieur (courent sur toute la longueur)
    makeTube([
      new THREE.Vector3(-totalW / 2,  HALF_Y, 0),
      new THREE.Vector3( totalW / 2,  HALF_Y, 0),
    ], c1, 0.07)
    makeTube([
      new THREE.Vector3(-totalW / 2, -HALF_Y, 0),
      new THREE.Vector3( totalW / 2, -HALF_Y, 0),
    ], c2, 0.07)

    group.scale.set(1.1, 1.4, 1.1)
    scene.add(group)

    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      // Légère oscillation pour voir le relief
      group.rotation.x = Math.sin(Date.now() * 0.0005) * 0.12
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
          src={getRealImage(accessoryType, '/images/knots/crown-sinnet-real.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Crown Sinnet réel"
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

export default CrownSinnetPreview
