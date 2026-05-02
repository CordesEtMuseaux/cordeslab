import React, { useMemo, type CSSProperties } from 'react'
import CobraPreview from './Debutant/CobraPreview'
import FishtailPreview from './Debutant/FishtailPreview'

type NecklacePreviewProps = {
  knotId: string
  knotLabel?: string
  primaryColor: string
  secondaryColor?: string
  difficultyLabel?: string
  thickness?: number
  width?: number
  className?: string
}

type PreviewCommonProps = {
  primaryColor: string
  secondaryColor?: string
  svgId: string
}

type KnotConfig = {
  name: string
  preview: (props: PreviewCommonProps) => JSX.Element
  mode: 'card' | 'svg'
}

const KNOT_CONFIGS: Record<string, KnotConfig> = {
  cobra: {
    name: 'Cobra',
    mode: 'card',
    preview: (props) => <CobraPhotorealisticPreview {...props} />,
  },
  fishtail: {
    name: 'Fishtail',
    mode: 'card',
    preview: (props) => (
      <FishtailPhotorealisticPreview
        primaryColor={props.primaryColor}
        secondaryColor={props.secondaryColor}
        svgId={props.svgId}
      />
    ),
  },
  trilobite: {
    name: 'Trilobite',
    mode: 'svg',
    preview: (props) => <TrilobiteInlinePreview {...props} />,
  },
  'crownSinnet': {
    name: 'Crown Sinnet',
    mode: 'svg',
    preview: (props) => <CrownSinnetInlinePreview {...props} />,
  },
}

export default function NecklacePreview({
  knotId,
  knotLabel,
  primaryColor,
  secondaryColor,
  difficultyLabel,
  thickness,
  width,
  className,
}: NecklacePreviewProps) {
  const svgId = useMemo(
    () => `necklace-preview-${Math.random().toString(36).slice(2, 9)}`,
    []
  )

  const normalizedId = normalizeSlug(knotId)
  const config = KNOT_CONFIGS[normalizedId] ?? KNOT_CONFIGS.cobra
  const title = knotLabel || config.name
  const isCardPreview = config.mode === 'card'

  return (
    <aside style={styles.wrapper} className={className}>
      <div style={styles.headerArea}>
        <div style={styles.overlayTitle}>{title}</div>
        <div style={styles.overlayBadges}>
          {difficultyLabel ? (
            <div style={styles.badge}>
              Difficulté <strong>{difficultyLabel}</strong>
            </div>
          ) : null}

          {typeof thickness === 'number' ? (
            <div style={styles.badge}>
              Épaisseur <strong>{thickness} cm</strong>
            </div>
          ) : null}

          {typeof width === 'number' ? (
            <div style={styles.badge}>
              Largeur <strong>{width} cm</strong>
            </div>
          ) : null}
        </div>
      </div>

      <div style={styles.stage}>
        <div style={styles.previewCard}>
          {isCardPreview ? (
            config.preview({
              primaryColor,
              secondaryColor,
              svgId,
            })
          ) : (
            <svg
              viewBox="0 0 420 520"
              style={styles.svg}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id={`${svgId}-softShadow`} x="-30%" y="-30%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.14" />
                </filter>

                <filter id={`${svgId}-mainShadow`} x="-40%" y="-40%" width="220%" height="220%">
                  <feDropShadow dx="1.5" dy="2" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.16" />
                  <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.14" />
                </filter>

                <linearGradient id={`${svgId}-cordGradientA`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={lighten(primaryColor, 20)} />
                  <stop offset="50%" stopColor={primaryColor} />
                  <stop offset="100%" stopColor={darken(primaryColor, 18)} />
                </linearGradient>

                <linearGradient id={`${svgId}-cordGradientB`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={lighten(secondaryColor || primaryColor, 18)} />
                  <stop offset="50%" stopColor={secondaryColor || primaryColor} />
                  <stop offset="100%" stopColor={darken(secondaryColor || primaryColor, 16)} />
                </linearGradient>

                <linearGradient id={`${svgId}-highlightA`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
                  <stop offset="40%" stopColor="rgba(255,255,255,0.10)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>

                <linearGradient id={`${svgId}-highlightB`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
                  <stop offset="40%" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>

                <pattern
                  id={`${svgId}-cordTextureA`}
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                  patternTransform="rotate(33)"
                >
                  <rect width="10" height="10" fill="transparent" />
                  <path d="M -3 5 L 5 -3 M 2 10 L 10 2" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round" />
                  <path d="M -1 7 L 7 -1 M 4 12 L 12 4" stroke="rgba(0,0,0,0.10)" strokeWidth="0.9" strokeLinecap="round" />
                </pattern>

                <pattern
                  id={`${svgId}-cordTextureB`}
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                  patternTransform="rotate(33)"
                >
                  <rect width="10" height="10" fill="transparent" />
                  <path d="M -3 5 L 5 -3 M 2 10 L 10 2" stroke="rgba(255,255,255,0.06)" strokeWidth="0.9" strokeLinecap="round" />
                  <path d="M -1 7 L 7 -1 M 4 12 L 12 4" stroke="rgba(0,0,0,0.13)" strokeWidth="1" strokeLinecap="round" />
                </pattern>
              </defs>

              <rect x="22" y="22" width="376" height="476" rx="22" fill="#f7f2e9" />
              <rect x="36" y="36" width="348" height="448" rx="18" fill="#efe8dc" />

              {config.preview({
                primaryColor,
                secondaryColor,
                svgId,
              })}
            </svg>
          )}
        </div>
      </div>
    </aside>
  )
}

function CobraPhotorealisticPreview({ primaryColor, secondaryColor }: PreviewCommonProps) {
  return (
    <div
      style={{
        width: '300px',
        height: '450px',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
        background: '#f4f1eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CobraPreview color1={primaryColor} color2={secondaryColor || primaryColor} />
    </div>
  )
}

function FishtailPhotorealisticPreview({ primaryColor, secondaryColor }: PreviewCommonProps) {
  return (
    <div
      style={{
        width: '300px',
        height: '450px',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
        background: '#f4f1eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FishtailPreview color1={primaryColor} color2={secondaryColor || primaryColor} />
    </div>
  )
}

function TrilobiteInlinePreview({ primaryColor, secondaryColor }: PreviewCommonProps) {
  const colorA = primaryColor
  const colorB = secondaryColor || primaryColor
  const leftX = 108
  const centerX = 210
  const rightX = 312
  const top = 84
  const rows = 12
  const step = 28

  return (
    <g>
      {Array.from({ length: rows }).map((_, i) => {
        const y = top + i * step
        const centerY = y + 11

        return (
          <g key={`trilobite-${i}`}>
            <ellipse cx={leftX} cy={y} rx={34} ry={13} fill={colorA} opacity="0.96" />
            <ellipse cx={centerX} cy={centerY} rx={34} ry={13} fill={colorB} opacity="0.96" />
            <ellipse cx={rightX} cy={y} rx={34} ry={13} fill={colorA} opacity="0.96" />

            <path
              d={`M ${leftX + 22} ${y} C ${leftX + 42} ${y - 10}, ${centerX - 42} ${centerY - 2}, ${centerX - 18} ${centerY}`}
              fill="none"
              stroke={colorA}
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d={`M ${centerX + 18} ${centerY} C ${centerX + 42} ${centerY + 2}, ${rightX - 42} ${y + 10}, ${rightX - 22} ${y}`}
              fill="none"
              stroke={colorB}
              strokeWidth="10"
              strokeLinecap="round"
            />
          </g>
        )
      })}
    </g>
  )
}

function CrownSinnetInlinePreview({ primaryColor, secondaryColor }: PreviewCommonProps) {
  const colorA = primaryColor
  const colorB = secondaryColor || primaryColor
  const centerX = 210
  const top = 92
  const rows = 12
  const step = 24

  return (
    <g>
      <path d={`M ${centerX - 14} ${top - 18} L ${centerX - 14} ${top + rows * step}`} stroke={colorA} strokeWidth="10" strokeLinecap="round" />
      <path d={`M ${centerX + 14} ${top - 18} L ${centerX + 14} ${top + rows * step}`} stroke={colorB} strokeWidth="10" strokeLinecap="round" />

      {Array.from({ length: rows }).map((_, i) => {
        const y = top + i * step
        const fill = i % 2 === 0 ? colorA : colorB

        return (
          <g key={`crown-${i}`}>
            <ellipse cx={centerX} cy={y} rx={28} ry={12} fill={fill} opacity="0.96" />
          </g>
        )
      })}

      <path
        d={`M ${centerX - 28} ${top + rows * step - 4} C ${centerX - 18} ${top + rows * step + 16}, ${centerX - 4} ${top + rows * step + 22}, ${centerX} ${top + rows * step + 22} C ${centerX + 4} ${top + rows * step + 22}, ${centerX + 18} ${top + rows * step + 16}, ${centerX + 28} ${top + rows * step - 4}`}
        fill="none"
        stroke={colorA}
        strokeWidth="12"
        strokeLinecap="round"
      />
    </g>
  )
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value))
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const safe =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized

  const isValidHex = /^[0-9a-fA-F]{6}$/.test(safe)

  if (!isValidHex) {
    return { r: 128, g: 128, b: 128 }
  }

  const num = parseInt(safe, 16)

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgbToCss(r: number, g: number, b: number) {
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`
}

function lighten(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToCss(r + amount, g + amount, b + amount)
}

function darken(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToCss(r - amount, g - amount, b - amount)
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 760,
    height: '100%',
    background: '#d8d0c3',
    borderRadius: 14,
    overflow: 'hidden',
  },
  headerArea: {
    padding: '18px 20px 0',
  },
  stage: {
    position: 'relative',
    minHeight: 680,
    padding: 20,
  },
  previewCard: {
    background: '#e5dccd',
    borderRadius: 16,
    padding: 14,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
    minHeight: 620,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: '100%',
    maxWidth: 420,
    height: 'auto',
    display: 'block',
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#ffffff',
    textShadow: '0 2px 10px rgba(0,0,0,0.35)',
    lineHeight: 1.05,
    marginBottom: 12,
  },
  overlayBadges: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    background: 'rgba(255,255,255,0.94)',
    color: '#444',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    whiteSpace: 'nowrap',
  },
}
