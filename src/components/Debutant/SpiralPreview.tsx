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


const SpiralPreview = forwardRef<KnotPreviewHandle, Props>(function SpiralPreview({ color1, color2, accessoryType }, ref) {
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

    const group = new THREE.Group()
    const makeTube = (points: THREE.Vector3[], color: string, radius = 0.13) => {
      const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
      const geometry = new THREE.TubeGeometry(curve, 96, radius, 12, false)
      const material = new THREE.MeshStandardMaterial({ color: color as any, roughness: 0.85, metalness: 0.0 })
      group.add(new THREE.Mesh(geometry, material))
    }

    const c1 = color1 || '#556b2f'
    const c2 = color2 || '#c8a96e'
    const totalW = 5.0
    const NUM_PTS = 60
    const HALF_Y = 0.45
    const Z_AMP = 0.22
    const FREQ = 5.5  // tours de spirale

    // Brin central (c1) — droit
    makeTube([
      new THREE.Vector3(-totalW / 2, 0, -0.05),
      new THREE.Vector3( totalW / 2, 0, -0.05),
    ], c1, 0.12)

    // Brin spiralé (c2) — s'enroule autour du brin central
    const pts: THREE.Vector3[] = []
    for (let j = 0; j <= NUM_PTS; j++) {
      const t = j / NUM_PTS
      const x = -totalW / 2 + t * totalW
      const angle = t * Math.PI * 2 * FREQ
      const y = Math.sin(angle) * HALF_Y
      const z = Math.cos(angle) * Z_AMP
      pts.push(new THREE.Vector3(x, y, z))
    }
    makeTube(pts, c2, 0.13)

    // Deuxième brin spiralé (c1) décalé de π — donne l'effet tressé
    const pts2: THREE.Vector3[] = []
    for (let j = 0; j <= NUM_PTS; j++) {
      const t = j / NUM_PTS
      const x = -totalW / 2 + t * totalW
      const angle = t * Math.PI * 2 * FREQ + Math.PI
      const y = Math.sin(angle) * HALF_Y
      const z = Math.cos(angle) * Z_AMP
      pts2.push(new THREE.Vector3(x, y, z))
    }
    makeTube(pts2, c1, 0.13)

    group.scale.set(1.05, 1.3, 1.05)
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
        <img src={getRealImage(accessoryType, '/images/knots/spiral-real.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Spiral réel" />
        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px', fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rendu réel</span>
      </div>
    </div>
  )
})

export default SpiralPreview
