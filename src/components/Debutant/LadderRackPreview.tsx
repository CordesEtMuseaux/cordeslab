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


const LadderRackPreview = forwardRef<KnotPreviewHandle, Props>(function LadderRackPreview({ color1, color2, accessoryType }, ref) {
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
      const geometry = new THREE.TubeGeometry(curve, 32, radius, 12, false)
      const material = new THREE.MeshStandardMaterial({ color: color as any, roughness: 0.85, metalness: 0.0 })
      group.add(new THREE.Mesh(geometry, material))
    }

    const c1 = color1 || '#556b2f'
    const c2 = color2 || '#c8a96e'

    const totalW = 5.0
    const NUM_BARS = 13       // plus de barres pour combler les jours
    const STEP_X = totalW / (NUM_BARS - 1)
    const HALF_Y = 0.48
    const Z_FRONT = 0.22
    const Z_BACK = -0.08

    // Brins longitudinaux épais (c1) — haut et bas
    makeTube([new THREE.Vector3(-totalW/2,  HALF_Y, Z_BACK), new THREE.Vector3(totalW/2,  HALF_Y, Z_BACK)], c1, 0.13)
    makeTube([new THREE.Vector3(-totalW/2, -HALF_Y, Z_BACK), new THREE.Vector3(totalW/2, -HALF_Y, Z_BACK)], c1, 0.13)

    // Brins intermédiaires (c1) — renforcent le fond
    makeTube([new THREE.Vector3(-totalW/2, 0, Z_BACK * 1.5), new THREE.Vector3(totalW/2, 0, Z_BACK * 1.5)], c1, 0.08)

    for (let i = 0; i < NUM_BARS; i++) {
      const x = -totalW / 2 + i * STEP_X
      const even = i % 2 === 0

      // Barre verticale (c2) — plus épaisse pour combler les jours
      makeTube([
        new THREE.Vector3(x,  HALF_Y * 0.82, even ? Z_FRONT : Z_FRONT * 0.6),
        new THREE.Vector3(x,  HALF_Y * 0.3,  even ? Z_FRONT * 1.1 : Z_FRONT * 0.7),
        new THREE.Vector3(x,  0,             even ? Z_FRONT * 1.1 : Z_FRONT * 0.7),
        new THREE.Vector3(x, -HALF_Y * 0.3,  even ? Z_FRONT * 1.1 : Z_FRONT * 0.7),
        new THREE.Vector3(x, -HALF_Y * 0.82, even ? Z_FRONT : Z_FRONT * 0.6),
      ], c2, 0.13)

      // Connexion haut entre barres consécutives
      if (i < NUM_BARS - 1) {
        const xNext = x + STEP_X
        makeTube([
          new THREE.Vector3(x,      HALF_Y * 0.88, even ? Z_BACK * 0.3 : Z_FRONT * 0.2),
          new THREE.Vector3((x + xNext) / 2, HALF_Y * 0.92, even ? Z_FRONT * 0.2 : Z_BACK * 0.3),
          new THREE.Vector3(xNext,  HALF_Y * 0.88, even ? Z_BACK * 0.3 : Z_FRONT * 0.2),
        ], c1, 0.10)

        // Connexion bas
        makeTube([
          new THREE.Vector3(x,      -HALF_Y * 0.88, even ? Z_FRONT * 0.2 : Z_BACK * 0.3),
          new THREE.Vector3((x + xNext) / 2, -HALF_Y * 0.92, even ? Z_BACK * 0.3 : Z_FRONT * 0.2),
          new THREE.Vector3(xNext,  -HALF_Y * 0.88, even ? Z_FRONT * 0.2 : Z_BACK * 0.3),
        ], c1, 0.10)
      }
    }

    group.scale.set(1.0, 1.28, 1.0)
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
        <img src={getRealImage(accessoryType, '/images/knots/ladder-rack-real.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Ladder Rack réel" />
        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px', fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rendu réel</span>
      </div>
    </div>
  )
})

export default LadderRackPreview
