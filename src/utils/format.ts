import type { UnitDisplay } from '../shared/types'

export function formatCmToUnit(cm: number, unit: UnitDisplay): { main: string; secondary: string } {
  const meters = cm / 100
  if (unit === 'cm') {
    const main = `${pretty(cm)} cm`
    const secondary = `(${meters.toFixed(2)} m)`
    return { main, secondary }
  }
  const main = `${meters.toFixed(2)} m`
  const secondary = `(${pretty(cm)} cm)`
  return { main, secondary }
}

function pretty(x: number): string {
  const r = Math.round(x * 10) / 10
  if (Math.abs(r - Math.round(r)) < 1e-9) return String(Math.round(r))
  return String(r)
}
