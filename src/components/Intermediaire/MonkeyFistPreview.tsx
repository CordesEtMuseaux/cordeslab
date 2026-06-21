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

// Monkey Fist : nœud "boule" formé de 3 passes de boucles enroulées
// autour de 3 axes perpendiculaires (approximation stylisée, pas une
// reconstruction topologique exacte du tressage réel).
const MonkeyFistPreview = forwardRef<KnotPreviewHandle, Props>(function MonkeyFistPreview({ color1, color2, accessoryType }, ref) {
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
    const makeLoop = (points: THREE.Vector3[], color: string, radius = 0.15) => {
      const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal')
      const geometry = new THREE.TubeGeometry(curve, 64, radius, 10, true)
      const material = new THREE.MeshStandardMaterial({ color: color as any, roughness: 0.85, metalness: 0.0 })
      group.add(new THREE.Mesh(geometry, material))
    }

    const c1 = color1 || '#8B5E34'
    const c2 = color2 || '#F1E3C6'

    // 3 jeux de 3 boucles parallèles, un jeu par axe (x, y, z),
    // pour évoquer les passes successives autour de la boule.
    const R = 1.55
    const SEGS = 40
    const offsets = [-0.30, 0, 0.30]
    const axisColor: Record<'x' | 'y' | 'z', string> = { x: c1, y: c2, z: c1 }

    const axes: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z']
    axes.forEach((axis) => {
      offsets.forEach((offset) => {
        const pts: THREE.Vector3[] = []
        for (let i = 0; i < SEGS; i++) {
          const t = (i / SEGS) * Math.PI * 2
          let x = 0, y = 0, z = 0
          if (axis === 'z') { x = R * Math.cos(t); y = R * Math.sin(t); z = offset }
          if (axis === 'x') { y = R * Math.cos(t); z = R * Math.sin(t); x = offset }
          if (axis === 'y') { x = R * Math.cos(t); z = R * Math.sin(t); y = offset }
          pts.push(new THREE.Vector3(x, y, z))
        }
        makeLoop(pts, axisColor[axis], 0.16)
      })
    })

    scene.add(group)

    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      group.rotation.x = Math.sin(Date.now() * 0.0004) * 0.35
      group.rotation.y = Date.now() * 0.00015
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
        <img src={getRealImage(accessoryType, '/images/knots/monkey-fist-real.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Monkey Fist réel" />
        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px', fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rendu réel</span>
      </div>
    </div>
  )
})

export default MonkeyFistPreview
