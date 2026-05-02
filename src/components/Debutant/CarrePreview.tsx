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


const CarrePreview = forwardRef<KnotPreviewHandle, Props>(function CarrePreview({ color1, color2, accessoryType }, ref) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useImperativeHandle(ref, () => ({
    getSnapshot: () => rendererRef.current ? rendererRef.current.domElement.toDataURL('image/png') : ''
  }))

  useEffect(() => {
    if (!mountRef.current) return
    const currentMount = mountRef.current
    const width = 203, height = 140

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
      const material = new THREE.MeshStandardMaterial({ color: color as any, roughness: 0.85, metalness: 0.0 })
      group.add(new THREE.Mesh(geometry, material))
    }

    const c1 = color1 || '#556b2f'
    const c2 = color2 || '#c8a96e'

    // --- CARRÉ ---
    // c1 = 3 brins longitudinaux parallèles (courent sur toute la longueur)
    // c2 = anneaux larges et bombés qui s'enroulent autour des 3 brins
    // Les anneaux sont plus espaces que le Mad Max, laissant bien voir c1

    const totalW = 5.0
    const NUM_RIBS = 10
    const STEP_X = totalW / (NUM_RIBS - 1)
    const BRIN_Y = [-0.30, 0, 0.30]
    const Z_BRINS = 0.05
    const Z_RIB_FRONT = 0.30
    const Z_RIB_BACK = -0.05

    // 3 brins longitudinaux (c1) — bien visibles
    BRIN_Y.forEach((y) => {
      makeTube([
        new THREE.Vector3(-totalW / 2, y, Z_BRINS),
        new THREE.Vector3( totalW / 2, y, Z_BRINS),
      ], c1, 0.125)
    })

    // Anneaux (c2) — larges et bombés, espacés pour laisser voir c1
    for (let i = 0; i < NUM_RIBS; i++) {
      const x = -totalW / 2 + i * STEP_X
      const even = i % 2 === 0

      // Côté gauche de l'anneau
      makeTube([
        new THREE.Vector3(x - 0.10, -0.48, Z_RIB_BACK),
        new THREE.Vector3(x - 0.16, -0.20, even ? Z_RIB_FRONT : Z_RIB_FRONT * 0.5),
        new THREE.Vector3(x - 0.16,  0.00, even ? Z_RIB_FRONT * 1.1 : Z_RIB_FRONT * 0.6),
        new THREE.Vector3(x - 0.16,  0.20, even ? Z_RIB_FRONT : Z_RIB_FRONT * 0.5),
        new THREE.Vector3(x - 0.10,  0.48, Z_RIB_BACK),
      ], c2, 0.115)

      // Côté droit de l'anneau
      makeTube([
        new THREE.Vector3(x + 0.10, -0.48, Z_RIB_BACK),
        new THREE.Vector3(x + 0.16, -0.20, even ? Z_RIB_FRONT * 0.5 : Z_RIB_FRONT),
        new THREE.Vector3(x + 0.16,  0.00, even ? Z_RIB_FRONT * 0.6 : Z_RIB_FRONT * 1.1),
        new THREE.Vector3(x + 0.16,  0.20, even ? Z_RIB_FRONT * 0.5 : Z_RIB_FRONT),
        new THREE.Vector3(x + 0.10,  0.48, Z_RIB_BACK),
      ], c2, 0.115)

      // Fermeture haut de l'anneau
      makeTube([
        new THREE.Vector3(x - 0.12,  0.46, Z_RIB_BACK * 0.5),
        new THREE.Vector3(x,          0.52, even ? Z_RIB_FRONT * 0.4 : Z_RIB_FRONT * 0.2),
        new THREE.Vector3(x + 0.12,  0.46, Z_RIB_BACK * 0.5),
      ], c2, 0.10)

      // Fermeture bas de l'anneau
      makeTube([
        new THREE.Vector3(x - 0.12, -0.46, Z_RIB_BACK * 0.5),
        new THREE.Vector3(x,         -0.52, even ? Z_RIB_FRONT * 0.2 : Z_RIB_FRONT * 0.4),
        new THREE.Vector3(x + 0.12, -0.46, Z_RIB_BACK * 0.5),
      ], c2, 0.10)
    }

    group.scale.set(1.05, 1.25, 1.05)
    scene.add(group)

    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      group.rotation.x = Math.sin(Date.now() * 0.0005) * 0.08
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
    <div style={{ width: '406px', height: '140px', background: '#ddd6cc', borderRadius: '15px', overflow: 'hidden', display: 'flex' }}>
      <div style={{ width: '203px', height: '100%', position: 'relative', borderRight: '1px solid rgba(255,255,255,0.3)' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px', fontWeight: 'bold', color: '#888', pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aperçu couleurs (3D)</span>
      </div>
      <div style={{ width: '203px', height: '100%', position: 'relative' }}>
        <img src={getRealImage(accessoryType, '/images/knots/carre-real.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Carré réel" />
        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px', fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rendu réel</span>
      </div>
    </div>
  )
})

export default CarrePreview
