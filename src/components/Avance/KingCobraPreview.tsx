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


const KingCobraPreview = forwardRef<KnotPreviewHandle, Props>(function KingCobraPreview({ color1, color2, accessoryType }, ref) {
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

    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 1000)
    camera.position.set(0, 0, 11.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    currentMount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(3.5, 5.5, 8)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35)
    fillLight.position.set(-5, -2, 4)
    scene.add(fillLight)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.18)
    rimLight.position.set(0, -8, -4)
    scene.add(rimLight)

    const group = new THREE.Group()

    const makeTube = (points: THREE.Vector3[], color: string, radius = 0.235) => {
      const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
      const geometry = new THREE.TubeGeometry(curve, 96, radius, 26, false)
      const material = new THREE.MeshStandardMaterial({
        color: color as any,
        roughness: 0.85,
        metalness: 0.0,
      })
      group.add(new THREE.Mesh(geometry, material))
    }

    const secondary = color2 || color1
    const topY = 2.78
    const step = 0.62

    // --- COUCHE INTÉRIEURE (Cobra de base) ---
    // Brins centraux intérieurs
    makeTube([
      new THREE.Vector3(-0.16,  3.45, -0.36),
      new THREE.Vector3(-0.16, -3.55, -0.36),
    ], secondary, 0.14)
    makeTube([
      new THREE.Vector3(0.16,  3.45, -0.34),
      new THREE.Vector3(0.16, -3.55, -0.34),
    ], color1, 0.14)

    for (let i = 0; i < 10; i++) {
      const y = topY - i * step
      const even = i % 2 === 0
      const loopColor = even ? color1 : secondary
      const crossColor = even ? secondary : color1

      // Boucles intérieures (plus petites, en retrait)
      makeTube([
        new THREE.Vector3(-0.18, y + 0.20, -0.15),
        new THREE.Vector3(-0.38, y + 0.15,  0.08),
        new THREE.Vector3(-0.50, y,          0.16),
        new THREE.Vector3(-0.38, y - 0.15,  0.08),
        new THREE.Vector3(-0.18, y - 0.20, -0.15),
      ], loopColor, 0.18)

      makeTube([
        new THREE.Vector3(0.18, y + 0.20, -0.15),
        new THREE.Vector3(0.38, y + 0.15,  0.08),
        new THREE.Vector3(0.50, y,          0.16),
        new THREE.Vector3(0.38, y - 0.15,  0.08),
        new THREE.Vector3(0.18, y - 0.20, -0.15),
      ], loopColor, 0.18)

      // Brins croisés intérieurs
      makeTube([
        new THREE.Vector3(-0.50, y + 0.06,  0.06),
        new THREE.Vector3(-0.16, y + 0.03,  0.38),
        new THREE.Vector3( 0.00, y,          0.42),
        new THREE.Vector3( 0.16, y - 0.03,  0.38),
        new THREE.Vector3( 0.50, (y - step * 0.96) + 0.02, 0.10),
      ], crossColor, 0.19)

      makeTube([
        new THREE.Vector3( 0.50, y + 0.03, -0.22),
        new THREE.Vector3( 0.16, y + 0.00, -0.06),
        new THREE.Vector3( 0.00, y - 0.02,  0.08),
        new THREE.Vector3(-0.16, y - 0.04, -0.06),
        new THREE.Vector3(-0.50, (y - step * 0.96), -0.20),
      ], loopColor, 0.17)
    }

    // --- COUCHE EXTÉRIEURE (deuxième Cobra par-dessus) ---
    // Les boucles extérieures sont plus grandes et plus en avant (Z plus grand)
    // Elles enveloppent les boucles intérieures

    for (let i = 0; i < 9; i++) {
      // Décalage d'un demi-pas pour centrer entre les nœuds intérieurs
      const y = topY - (i + 0.5) * step
      const even = i % 2 === 0
      const loopColor = even ? secondary : color1
      const crossColor = even ? color1 : secondary

      // Boucles extérieures (plus grandes, plus en avant)
      makeTube([
        new THREE.Vector3(-0.20, y + 0.26, -0.05),
        new THREE.Vector3(-0.46, y + 0.20,  0.26),
        new THREE.Vector3(-0.64, y,          0.38),
        new THREE.Vector3(-0.46, y - 0.20,  0.26),
        new THREE.Vector3(-0.20, y - 0.26, -0.05),
      ], loopColor, 0.20)

      makeTube([
        new THREE.Vector3(0.20, y + 0.26, -0.05),
        new THREE.Vector3(0.46, y + 0.20,  0.26),
        new THREE.Vector3(0.64, y,          0.38),
        new THREE.Vector3(0.46, y - 0.20,  0.26),
        new THREE.Vector3(0.20, y - 0.26, -0.05),
      ], loopColor, 0.20)

      // Brins croisés extérieurs (au-dessus des intérieurs)
      makeTube([
        new THREE.Vector3(-0.56, y + 0.08,  0.18),
        new THREE.Vector3(-0.18, y + 0.04,  0.56),
        new THREE.Vector3( 0.00, y,          0.62),
        new THREE.Vector3( 0.18, y - 0.04,  0.56),
        new THREE.Vector3( 0.56, (y - step * 0.96) + 0.02, 0.20),
      ], crossColor, 0.21)

      makeTube([
        new THREE.Vector3( 0.56, y + 0.04, -0.14),
        new THREE.Vector3( 0.18, y + 0.00,  0.04),
        new THREE.Vector3( 0.00, y - 0.02,  0.18),
        new THREE.Vector3(-0.18, y - 0.04,  0.04),
        new THREE.Vector3(-0.56, (y - step * 0.96), -0.12),
      ], loopColor, 0.19)
    }

    group.rotation.z = Math.PI / 2
    group.position.set(0, 0, 0)
    group.scale.set(1.15, 1.15, 1.15)
    scene.add(group)

    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      group.rotation.x = Math.sin(Date.now() * 0.001) * 0.014
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
          src={getRealImage(accessoryType, '/images/knots/king-cobra-real.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="King Cobra réel"
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

export default KingCobraPreview
