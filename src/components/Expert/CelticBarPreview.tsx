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


const CelticBarPreview = forwardRef<KnotPreviewHandle, Props>(function CelticBarPreview({ color1, color2, accessoryType }, ref) {
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
      const geometry = new THREE.TubeGeometry(curve, 96, radius, 12, false)
      const material = new THREE.MeshStandardMaterial({
        color: color as any,
        roughness: 0.85,
        metalness: 0.0,
      })
      group.add(new THREE.Mesh(geometry, material))
    }

    const c1 = color1 || '#556b2f'
    const c2 = color2 || '#c8a96e'

    // --- STRUCTURE CELTIC BAR ---
    // 2 brins longitudinaux c1 (bords haut/bas)
    // 4 brins sinusoïdaux c2 qui s'entrelacent en ondulant de gauche à droite
    // Les brins se croisent en alternant devant/derrière = motif tressé celtique

    const totalW = 5.8
    const NUM_PTS = 30   // points par brin pour une courbe lisse
    const AMPLITUDE = 0.45  // hauteur des ondulations
    const Z_FRONT = 0.22
    const Z_BACK = -0.10

    // Brins de bord (c1) — fixes, horizontaux
    makeTube([
      new THREE.Vector3(-totalW / 2,  0.55, Z_BACK * 0.5),
      new THREE.Vector3( totalW / 2,  0.55, Z_BACK * 0.5),
    ], c1, 0.11)
    makeTube([
      new THREE.Vector3(-totalW / 2, -0.55, Z_BACK * 0.5),
      new THREE.Vector3( totalW / 2, -0.55, Z_BACK * 0.5),
    ], c1, 0.11)

    // Brins verticaux de remplissage (c1) — donnent le fond vert
    for (let i = 0; i <= 8; i++) {
      const x = -totalW / 2 + i * (totalW / 8)
      makeTube([
        new THREE.Vector3(x,  0.50, Z_BACK),
        new THREE.Vector3(x, -0.50, Z_BACK),
      ], c1, 0.07)
    }

    // --- 4 BRINS SINUSOÏDAUX ENTRELACÉS (c2) ---
    // Chaque brin fait une ondulation sinusoïdale
    // Les 4 brins sont décalés de phase pour créer le tressage celtique
    // Phase : 0, π/2, π, 3π/2 → ils se croisent 2 par 2

    const FREQ = 2.5   // fréquence des ondulations
    const offsets = [
      { yBase:  0.28, phase: 0,           zPhase: 0    },
      { yBase:  0.10, phase: Math.PI,      zPhase: 1    },
      { yBase: -0.10, phase: 0,            zPhase: 2    },
      { yBase: -0.28, phase: Math.PI,      zPhase: 3    },
    ]

    offsets.forEach(({ yBase, phase, zPhase }) => {
      const pts: THREE.Vector3[] = []
      for (let j = 0; j <= NUM_PTS; j++) {
        const t = j / NUM_PTS
        const x = -totalW / 2 + t * totalW
        const angle = t * Math.PI * FREQ * 2 + phase

        // Ondulation Y
        const y = yBase + Math.sin(angle) * AMPLITUDE

        // Profondeur Z : alterne devant/derrière selon la phase
        // Les croisements se font quand sin(angle) ≈ 0
        const zCycle = Math.cos(angle + zPhase * Math.PI * 0.5)
        const z = zCycle > 0 ? Z_FRONT : Z_BACK

        pts.push(new THREE.Vector3(x, y, z))
      }
      makeTube(pts, c2, 0.125)
    })

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
          src={getRealImage(accessoryType, '/images/knots/celtic-bar-real.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Celtic Bar réel"
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

export default CelticBarPreview
