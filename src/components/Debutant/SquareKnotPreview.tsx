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


const SquareKnotPreview = forwardRef<KnotPreviewHandle, Props>(function SquareKnotPreview({ color1, color2, accessoryType }, ref) {
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

    // --- SQUARE KNOT ---
    // Damier de tuiles bombées alternant c1/c2
    // STEP_Y réduit pour que les rangées se touchent sans vide

    const totalW = 5.0
    const NUM_COLS = 10
    const NUM_ROWS = 3
    const STEP_X = totalW / (NUM_COLS - 1)
    const STEP_Y = 0.30          // réduit pour supprimer le vide vertical
    const HALF_Y_GRID = (NUM_ROWS - 1) * STEP_Y / 2
    const Z_FRONT = 0.20
    const Z_BACK = -0.06
    const TW = STEP_X * 0.54    // tuile légèrement plus large que le pas
    const TH = STEP_Y * 0.56    // tuile légèrement plus haute que le pas

    for (let row = 0; row < NUM_ROWS; row++) {
      const y = -HALF_Y_GRID + row * STEP_Y
      for (let col = 0; col < NUM_COLS; col++) {
        const x = -totalW / 2 + col * STEP_X
        const even = (row + col) % 2 === 0
        const color = even ? c2 : c1
        const z = even ? Z_FRONT : Z_BACK * 0.5

        makeTube([
          new THREE.Vector3(x - TW,  0,    z * 0.5),
          new THREE.Vector3(x - TW * 0.7, -TH, z * 0.8),
          new THREE.Vector3(x,       -TH * 1.1, z),
          new THREE.Vector3(x + TW * 0.7, -TH, z * 0.8),
          new THREE.Vector3(x + TW,  0,    z * 0.5),
          new THREE.Vector3(x + TW * 0.7,  TH, z * 0.8),
          new THREE.Vector3(x,        TH * 1.1, z),
          new THREE.Vector3(x - TW * 0.7,  TH, z * 0.8),
          new THREE.Vector3(x - TW,  0,    z * 0.5),
        ], color, 0.115)
      }
    }

    // Brins de liaison longitudinaux
    const edgeY = HALF_Y_GRID + STEP_Y * 0.56
    makeTube([new THREE.Vector3(-totalW/2,  edgeY, Z_BACK * 2), new THREE.Vector3(totalW/2,  edgeY, Z_BACK * 2)], c1, 0.07)
    makeTube([new THREE.Vector3(-totalW/2, -edgeY, Z_BACK * 2), new THREE.Vector3(totalW/2, -edgeY, Z_BACK * 2)], c1, 0.07)
    makeTube([new THREE.Vector3(-totalW/2,  0,      Z_BACK * 2), new THREE.Vector3(totalW/2,  0,      Z_BACK * 2)], c1, 0.06)

    group.scale.set(1.05, 1.9, 1.05)
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
        <img src={getRealImage(accessoryType, '/images/knots/square-knot-real.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Square Knot réel" />
        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px', fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rendu réel</span>
      </div>
    </div>
  )
})

export default SquareKnotPreview
