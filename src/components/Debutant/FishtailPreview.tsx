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


const FishtailPreview = forwardRef<KnotPreviewHandle, Props>(function FishtailPreview({ color1, color2, accessoryType }, ref) {
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
      const material = new THREE.MeshStandardMaterial({
        color: color as any,
        roughness: 0.85,
        metalness: 0.0
      })
      group.add(new THREE.Mesh(geometry, material))
    }

    const c1 = color1 || '#556b2f'
    const c2 = color2 || '#c8a96e'

    // --- FISHTAIL ---
    // Le nœud Fishtail (queue de poisson) alterne des brins c1 et c2
    // qui se croisent en diagonale, formant un motif en chevrons / arêtes de poisson.
    // Deux brins centraux (âme) courent horizontalement,
    // et les brins de tressage passent par-dessus en alternance gauche/droite.

    const totalW = 5.2
    const NUM_PAIRS = 11      // nombre de paires de brins
    const STEP_X = totalW / (NUM_PAIRS - 1)
    const TOP_Y = 0.42
    const BOT_Y = -0.42
    const MID_Y = 0.0
    const Z_BACK = -0.05
    const Z_FRONT = 0.28
    const Z_MID = 0.12

    // -- Âme centrale (2 brins longitudinaux, c1) --
    // Ils courent d'un bout à l'autre, légèrement décalés en Y
    const CORE_Y = [-0.10, 0.10]
    CORE_Y.forEach((cy) => {
      makeTube([
        new THREE.Vector3(-totalW / 2, cy, Z_BACK),
        new THREE.Vector3( totalW / 2, cy, Z_BACK),
      ], c1, 0.10)
    })

    // -- Brins de tressage diagonaux --
    // Chaque paire : un brin venant du haut-gauche vers bas-droite (c1)
    //                un brin venant du bas-gauche vers haut-droite (c2)
    // Ils se croisent au centre en alternant qui passe devant.
    for (let i = 0; i < NUM_PAIRS; i++) {
      const cx = -totalW / 2 + i * STEP_X
      const even = i % 2 === 0

      // Brin descendant (c1) : haut → milieu → bas, légèrement décalé en X
      const zFrontDesc = even ? Z_FRONT : Z_MID
      const zBackDesc  = even ? Z_MID   : Z_FRONT
      makeTube([
        new THREE.Vector3(cx - 0.22, TOP_Y,  Z_BACK * 0.5),
        new THREE.Vector3(cx - 0.08, MID_Y + 0.08, zFrontDesc),
        new THREE.Vector3(cx + 0.00, MID_Y,  zFrontDesc * 1.05),
        new THREE.Vector3(cx + 0.08, MID_Y - 0.08, zBackDesc),
        new THREE.Vector3(cx + 0.22, BOT_Y,  Z_BACK * 0.5),
      ], c1, 0.105)

      // Brin montant (c2) : bas → milieu → haut
      const zFrontAsc = even ? Z_MID   : Z_FRONT
      const zBackAsc  = even ? Z_FRONT : Z_MID
      makeTube([
        new THREE.Vector3(cx - 0.22, BOT_Y,  Z_BACK * 0.5),
        new THREE.Vector3(cx - 0.08, MID_Y - 0.08, zFrontAsc),
        new THREE.Vector3(cx + 0.00, MID_Y,  zFrontAsc * 1.05),
        new THREE.Vector3(cx + 0.08, MID_Y + 0.08, zBackAsc),
        new THREE.Vector3(cx + 0.22, TOP_Y,  Z_BACK * 0.5),
      ], c2, 0.105)

      // Petit nœud de selle au croisement (alternance c1/c2 devant)
      // Réhaussement visuel au centre du croisement
      const crossColor = even ? c1 : c2
      makeTube([
        new THREE.Vector3(cx - 0.04, MID_Y + 0.04, Z_FRONT * 0.9),
        new THREE.Vector3(cx,         MID_Y,          Z_FRONT * 1.1),
        new THREE.Vector3(cx + 0.04, MID_Y - 0.04, Z_FRONT * 0.9),
      ], crossColor, 0.095)
    }

    // -- Bords latéraux (fermeture du tressage) --
    // Petites boucles aux extrémités gauche et droite
    const EDGE_X_L = -totalW / 2 - 0.18
    const EDGE_X_R =  totalW / 2 + 0.18
    ;[EDGE_X_L, EDGE_X_R].forEach((ex, side) => {
      makeTube([
        new THREE.Vector3(ex,         TOP_Y * 0.9,  Z_BACK),
        new THREE.Vector3(ex + (side === 0 ? -0.10 : 0.10), MID_Y, Z_MID * 0.6),
        new THREE.Vector3(ex,         BOT_Y * 0.9,  Z_BACK),
      ], side === 0 ? c2 : c1, 0.095)
    })

    group.scale.set(1.05, 1.30, 1.05)
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
        <img src={getRealImage(accessoryType, '/images/knots/fishtail-real.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Fishtail réel" />
        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px', fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rendu réel</span>
      </div>
    </div>
  )
})

export default FishtailPreview
