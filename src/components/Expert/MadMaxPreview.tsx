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


const MadMaxPreview = forwardRef<KnotPreviewHandle, Props>(function MadMaxPreview({ color1, color2, accessoryType }, ref) {
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

    // --- STRUCTURE MAD MAX ---
    // 3 brins longitudinaux parallèles (c2) qui courent sur toute la longueur
    // Des anneaux/côtes horizontaux (c1) s'enroulent autour des 3 brins
    // à intervalles réguliers — comme des nervures de serrage

    const totalW = 4.2
    const NUM_RIBS = 12       // nombre d'anneaux de serrage
    const STEP_X = totalW / (NUM_RIBS - 1)
    const BRIN_Y = [-0.30, 0, 0.30]   // positions Y des 3 brins longitudinaux
    const Z_BRINS = 0.10              // légère profondeur des brins
    const Z_RIB_FRONT = 0.28          // les anneaux sont devant
    const Z_RIB_BACK = -0.06

    // --- 3 BRINS LONGITUDINAUX (c2) ---
    BRIN_Y.forEach((y) => {
      makeTube([
        new THREE.Vector3(-totalW / 2, y, Z_BRINS),
        new THREE.Vector3( totalW / 2, y, Z_BRINS),
      ], c2, 0.115)
    })

    // --- ANNEAUX DE SERRAGE (c1) ---
    // Chaque anneau entoure les 3 brins en formant une boucle verticale
    for (let i = 0; i < NUM_RIBS; i++) {
      const x = -totalW / 2 + i * STEP_X
      const even = i % 2 === 0

      // Boucle gauche de l'anneau (monte du bas vers le haut, côté gauche)
      makeTube([
        new THREE.Vector3(x - 0.08, -0.42, Z_RIB_BACK),
        new THREE.Vector3(x - 0.12, -0.15, even ? Z_RIB_FRONT : Z_RIB_FRONT * 0.6),
        new THREE.Vector3(x - 0.10,  0.00, even ? Z_RIB_FRONT : Z_RIB_FRONT * 0.5),
        new THREE.Vector3(x - 0.12,  0.15, even ? Z_RIB_FRONT : Z_RIB_FRONT * 0.6),
        new THREE.Vector3(x - 0.08,  0.42, Z_RIB_BACK),
      ], c1, 0.09)

      // Boucle droite de l'anneau (symétrique)
      makeTube([
        new THREE.Vector3(x + 0.08, -0.42, Z_RIB_BACK),
        new THREE.Vector3(x + 0.12, -0.15, even ? Z_RIB_FRONT * 0.6 : Z_RIB_FRONT),
        new THREE.Vector3(x + 0.10,  0.00, even ? Z_RIB_FRONT * 0.5 : Z_RIB_FRONT),
        new THREE.Vector3(x + 0.12,  0.15, even ? Z_RIB_FRONT * 0.6 : Z_RIB_FRONT),
        new THREE.Vector3(x + 0.08,  0.42, Z_RIB_BACK),
      ], c1, 0.09)

      // Barre horizontale de fermeture de l'anneau (devant les brins)
      makeTube([
        new THREE.Vector3(x - 0.10, -0.42, Z_RIB_BACK * 0.5),
        new THREE.Vector3(x,        -0.46, Z_RIB_FRONT * 0.4),
        new THREE.Vector3(x + 0.10, -0.42, Z_RIB_BACK * 0.5),
      ], c1, 0.08)
      makeTube([
        new THREE.Vector3(x - 0.10,  0.42, Z_RIB_BACK * 0.5),
        new THREE.Vector3(x,         0.46, Z_RIB_FRONT * 0.4),
        new THREE.Vector3(x + 0.10,  0.42, Z_RIB_BACK * 0.5),
      ], c1, 0.08)
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
          src={getRealImage(accessoryType, '/images/knots/mad-max-real.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Mad Max réel"
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

export default MadMaxPreview
