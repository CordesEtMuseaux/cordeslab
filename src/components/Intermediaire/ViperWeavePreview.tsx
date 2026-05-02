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


const ViperWeavePreview = forwardRef<KnotPreviewHandle, Props>(function ViperWeavePreview({ color1, color2, accessoryType }, ref) {
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

    // --- STRUCTURE VIPER WEAVE ---
    // Chevrons en V très serrés et réguliers — motif herringbone/épi de blé
    // Brins c1 et c2 alternent en diagonales montantes et descendantes
    // Plus plat que le Tressage Rond, section légèrement arrondie

    const totalW = 5.0
    const NUM_COLS = 16
    const STEP_X = totalW / (NUM_COLS - 1)
    const HALF_Y = 0.50
    const Z_FRONT = 0.20
    const Z_BACK = -0.08
    const Z_MID = 0.08

    // Brins de bord (c1)
    makeTube([
      new THREE.Vector3(-totalW / 2,  HALF_Y * 0.9, Z_BACK),
      new THREE.Vector3( totalW / 2,  HALF_Y * 0.9, Z_BACK),
    ], c1, 0.08)
    makeTube([
      new THREE.Vector3(-totalW / 2, -HALF_Y * 0.9, Z_BACK),
      new THREE.Vector3( totalW / 2, -HALF_Y * 0.9, Z_BACK),
    ], c1, 0.08)

    // Chevrons serrés — 3 rangées de diagonales
    for (let row = 0; row < 3; row++) {
      const yOffset = (row - 1) * HALF_Y * 0.55

      for (let i = 0; i < NUM_COLS - 1; i++) {
        const xL = -totalW / 2 + i * STEP_X
        const xR = xL + STEP_X
        const even = (i + row) % 2 === 0
        const col = even ? c2 : c1

        // Diagonale montante
        makeTube([
          new THREE.Vector3(xL, yOffset - HALF_Y * 0.28, even ? Z_MID : Z_FRONT * 0.5),
          new THREE.Vector3((xL + xR) / 2, yOffset, even ? Z_FRONT : Z_MID),
          new THREE.Vector3(xR, yOffset + HALF_Y * 0.28, even ? Z_MID : Z_FRONT * 0.5),
        ], col, 0.115)
      }
    }

    // Rangée de chevrons supplémentaire en avant (c2) — donne le relief
    for (let i = 0; i < NUM_COLS - 1; i++) {
      const xL = -totalW / 2 + i * STEP_X
      const xR = xL + STEP_X
      const even = i % 2 === 0

      makeTube([
        new THREE.Vector3(xL,  even ? -HALF_Y * 0.55 : HALF_Y * 0.55, Z_BACK * 0.3),
        new THREE.Vector3((xL + xR) / 2, 0, Z_FRONT * 0.8),
        new THREE.Vector3(xR,  even ? HALF_Y * 0.55 : -HALF_Y * 0.55, Z_BACK * 0.3),
      ], even ? c2 : c1, 0.115)
    }

    group.scale.set(1.1, 1.45, 1.1)
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
    <div style={{
      width: '406px',
      height: '140px',
      background: '#ddd6cc',
      borderRadius: '15px',
      overflow: 'hidden',
      display: 'flex',
    }}>
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
      <div style={{ width: '203px', height: '100%', position: 'relative' }}>
        <img
          src={getRealImage(accessoryType, '/images/knots/viper-weave-real.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Viper Weave réel"
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

export default ViperWeavePreview
