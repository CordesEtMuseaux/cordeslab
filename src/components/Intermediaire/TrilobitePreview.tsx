import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'

interface Props {
  color1: string // Couleur des bords (ex: '#d4a464' beige/tan)
  color2: string // Couleur du centre (ex: '#f5f0e8' blanc cassé)
  accessoryType?: string
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

export interface KnotPreviewHandle {
  getSnapshot: () => string
}

const TrilobitePreview = forwardRef<KnotPreviewHandle, Props>(function TrilobitePreview({ color1, color2, accessoryType }, ref) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  useImperativeHandle(ref, () => ({
    getSnapshot: () => rendererRef.current ? rendererRef.current.domElement.toDataURL('image/png') : ''
  }))

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const W = 203
    const H = 140

    // --- SCÈNE & CAMÉRA ---
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#ddd6cc')

    // FOV étroit pour aplatir la perspective (effet "téléobjectif")
    const camera = new THREE.PerspectiveCamera(18, W / H, 0.1, 200)
    camera.position.set(0, 0, 20)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // --- ÉCLAIRAGE ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0)
    sunLight.position.set(4, 8, 10)
    scene.add(sunLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-6, -3, 5)
    scene.add(fillLight)

    // Lumière de contour pour faire ressortir le relief des brins
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2)
    rimLight.position.set(0, -10, -5)
    scene.add(rimLight)

    // --- MATÉRIAUX ---
    const mat1 = new THREE.MeshStandardMaterial({
      color: (color1 || '#d4a464') as any,
      roughness: 0.75,
      metalness: 0.05,
    })
    const mat2 = new THREE.MeshStandardMaterial({
      color: (color2 || '#f5f0e8') as any,
      roughness: 0.75,
      metalness: 0.05,
    })

    // --- CONSTRUCTION DU NŒUD TRILOBITE ---
    const group = new THREE.Group()

    const NUM_ROWS = 12        // Nombre de rangées de tressage
    // STEP_Y = hauteur exacte d'une courbe de bord (de y à y+STEP_Y)
    // Les courbes vont de y+0 à y+STEP_Y, donc la rangée suivante repart pile là où
    // la précédente s'est arrêtée → plus aucun vide.
    const STEP_Y = 0.50
    const totalHeight = NUM_ROWS * STEP_Y
    const TUBE_RADIUS_EDGE = 0.095
    const TUBE_RADIUS_CENTER = 0.08
    const TUBE_SEGMENTS = 12
    const CURVE_SEGMENTS = 14

    for (let i = 0; i < NUM_ROWS; i++) {
      // Chaque rangée démarre exactement là où la précédente finit
      const yStart = totalHeight / 2 - i * STEP_Y
      const yEnd   = yStart - STEP_Y
      const yMid   = (yStart + yEnd) / 2
      const even   = i % 2 === 0

      // ---- BRINS DE BORD (Couleur 1) ----
      // Les courbes partent de yStart et arrivent à yEnd (= début de la rangée suivante)
      // → continuité parfaite, zéro vide.

      const leftEdgeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.30, yStart, 0),
        new THREE.Vector3(-0.56, yMid + 0.06, even ? 0.18 : 0.02),
        new THREE.Vector3(-0.56, yMid - 0.06, even ? 0.02 : 0.18),
        new THREE.Vector3(-0.30, yEnd,   0),
      ])

      const rightEdgeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.30, yStart, 0),
        new THREE.Vector3(0.56, yMid + 0.06, even ? 0.02 : 0.18),
        new THREE.Vector3(0.56, yMid - 0.06, even ? 0.18 : 0.02),
        new THREE.Vector3(0.30, yEnd,   0),
      ])

      group.add(new THREE.Mesh(
        new THREE.TubeGeometry(leftEdgeCurve, CURVE_SEGMENTS, TUBE_RADIUS_EDGE, TUBE_SEGMENTS, false),
        mat1
      ))
      group.add(new THREE.Mesh(
        new THREE.TubeGeometry(rightEdgeCurve, CURVE_SEGMENTS, TUBE_RADIUS_EDGE, TUBE_SEGMENTS, false),
        mat1
      ))

      // ---- BRINS CENTRAUX EN X (Couleur 2) ----
      const crossAMid = even ? 0.12 : -0.12

      const crossCurveA = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.26, yStart, even ? 0.12 : -0.12),
        new THREE.Vector3(-0.08, yMid,   crossAMid * 0.3),
        new THREE.Vector3( 0.08, yMid,  -crossAMid * 0.3),
        new THREE.Vector3( 0.26, yEnd,   even ? -0.12 : 0.12),
      ])

      const crossCurveB = new THREE.CatmullRomCurve3([
        new THREE.Vector3( 0.26, yStart, even ? -0.12 : 0.12),
        new THREE.Vector3( 0.08, yMid,  -crossAMid * 0.3),
        new THREE.Vector3(-0.08, yMid,   crossAMid * 0.3),
        new THREE.Vector3(-0.26, yEnd,   even ? 0.12 : -0.12),
      ])

      group.add(new THREE.Mesh(
        new THREE.TubeGeometry(crossCurveA, CURVE_SEGMENTS, TUBE_RADIUS_CENTER, TUBE_SEGMENTS, false),
        mat2
      ))
      group.add(new THREE.Mesh(
        new THREE.TubeGeometry(crossCurveB, CURVE_SEGMENTS, TUBE_RADIUS_CENTER, TUBE_SEGMENTS, false),
        mat2
      ))
    }

    // ---- BARRES HORIZONTALES DE CONNEXION (haut et bas) ----
    const topY = totalHeight / 2
    const botY = totalHeight / 2 - NUM_ROWS * STEP_Y

    const topBarCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.28, topY, 0),
      new THREE.Vector3(0,     topY + 0.06, 0.05),
      new THREE.Vector3(0.28,  topY, 0),
    ])
    const botBarCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.28, botY, 0),
      new THREE.Vector3(0,     botY - 0.06, 0.05),
      new THREE.Vector3(0.28,  botY, 0),
    ])

    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(topBarCurve, 8, TUBE_RADIUS_EDGE, TUBE_SEGMENTS, false),
      mat1
    ))
    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(botBarCurve, 8, TUBE_RADIUS_EDGE, TUBE_SEGMENTS, false),
      mat1
    ))

    // --- ORIENTATION FINALE ---
    // On couche le nœud horizontalement pour l'affichage dans le panel 203×140
    group.rotation.z = -Math.PI / 2
    group.scale.set(1.4, 1.4, 1.4)
    scene.add(group)

    // --- ANIMATION ---
    let frameId: number
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      // Légère oscillation pour apprécier le relief 3D
      group.rotation.x = Math.sin(Date.now() * 0.0005) * 0.08
      renderer.render(scene, camera)
    }
    animate()

    // --- NETTOYAGE ---
    return () => {
      cancelAnimationFrame(frameId)
      rendererRef.current = null

      // Libération de toutes les géométries et matériaux créés
      group.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose()
      })
      mat1.dispose()
      mat2.dispose()
      renderer.dispose()

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
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

      {/* PANEL GAUCHE : Rendu 3D dynamique */}
      <div style={{
        width: '203px',
        height: '100%',
        position: 'relative',
        borderRight: '1px solid rgba(255,255,255,0.3)',
      }}>
        <div style={{ width: '100%', height: '100%' }} ref={mountRef} />
        <span style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          fontSize: '9px',
          fontWeight: 'bold',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Aperçu couleur (3D)
        </span>
      </div>

      {/* PANEL DROITE : Photo réelle statique */}
      <div style={{ width: '203px', height: '100%', position: 'relative' }}>
        <img
          src={getRealImage(accessoryType, '/images/knots/trilobite-real.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Rendu réel Trilobite"
        />
        <span style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          fontSize: '9px',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Rendu réel
        </span>
      </div>

    </div>
  )
})

export default TrilobitePreview
