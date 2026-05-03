// src/utils/index.ts
import { format, differenceInDays, parseISO, addDays, addWeeks, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import type { FrecuenciaPago } from '@/types'

export function formatCurrency(amount: number, symbol = 'RD$'): string {
  return `${symbol} ${new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

export function formatDate(date: string | Date): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'a las' HH:mm", { locale: es })
}

export function formatDateShort(date: string | Date): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy', { locale: es })
}

export function diasMora(fechaVencimiento: string | Date): number {
  const hoy = new Date()
  const vence = typeof fechaVencimiento === 'string' ? parseISO(fechaVencimiento) : fechaVencimiento
  const dias = differenceInDays(hoy, vence)
  return Math.max(0, dias)
}

export function calcularMora(saldo: number, tasaMora: number, diasMoraNum: number): number {
  if (diasMoraNum <= 0) return 0
  return (saldo * (tasaMora / 100)) * diasMoraNum
}

export function calcularCuotas(
  capital: number,
  interes: number,
  numeroCuotas: number
): { montoCuota: number; montoTotal: number; montoInteres: number } {
  const montoInteres = capital * (interes / 100)
  const montoTotal = capital + montoInteres
  const montoCuota = montoTotal / numeroCuotas
  return {
    montoCuota: Math.round(montoCuota * 100) / 100,
    montoTotal: Math.round(montoTotal * 100) / 100,
    montoInteres: Math.round(montoInteres * 100) / 100,
  }
}

export function calcularFechasCuotas(
  fechaPrimerPago: Date,
  numeroCuotas: number,
  frecuencia: FrecuenciaPago
): Date[] {
  const fechas: Date[] = []
  let fecha = new Date(fechaPrimerPago)

  for (let i = 0; i < numeroCuotas; i++) {
    fechas.push(new Date(fecha))
    switch (frecuencia) {
      case 'DIARIO':
        fecha = addDays(fecha, 1)
        break
      case 'SEMANAL':
        fecha = addWeeks(fecha, 1)
        break
      case 'QUINCENAL':
        fecha = addDays(fecha, 15)
        break
      case 'MENSUAL':
        fecha = addMonths(fecha, 1)
        break
      default:
        fecha = addMonths(fecha, 1)
    }
  }
  return fechas
}

export function generarCodigo(prefijo: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefijo}-${timestamp}-${random}`
}

export function calcularScoreRiesgo(
  prestamosActivos: number,
  diasMoraPromedio: number,
  pagosPuntuales: number,
  totalPagos: number
): number {
  let score = 100
  // Penalizar por mora
  if (diasMoraPromedio > 30) score -= 30
  else if (diasMoraPromedio > 15) score -= 20
  else if (diasMoraPromedio > 7) score -= 10
  // Penalizar por múltiples préstamos activos
  if (prestamosActivos > 3) score -= 15
  else if (prestamosActivos > 1) score -= 5
  // Bonificar por pagos puntuales
  if (totalPagos > 0) {
    const tasaPuntualidad = pagosPuntuales / totalPagos
    if (tasaPuntualidad > 0.9) score += 10
    else if (tasaPuntualidad < 0.7) score -= 20
  }
  return Math.max(0, Math.min(100, score))
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excelente', color: '#22c55e' }
  if (score >= 60) return { label: 'Bueno', color: '#84cc16' }
  if (score >= 40) return { label: 'Regular', color: '#f59e0b' }
  if (score >= 20) return { label: 'Alto riesgo', color: '#f97316' }
  return { label: 'Crítico', color: '#ef4444' }
}

export function getEstadoPrestamoColor(estado: string): string {
  const colores: Record<string, string> = {
    ACTIVO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    PAGADO: 'bg-green-500/10 text-green-400 border-green-500/20',
    VENCIDO: 'bg-red-500/10 text-red-400 border-red-500/20',
    REFINANCIADO: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    CASTIGADO: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    CANCELADO: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  }
  return colores[estado] || 'bg-gray-500/10 text-gray-400'
}

export function getEstadoClienteColor(estado: string): string {
  const colores: Record<string, string> = {
    ACTIVO: 'bg-green-500/10 text-green-400 border-green-500/20',
    INACTIVO: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    BLOQUEADO: 'bg-red-500/10 text-red-400 border-red-500/20',
    MOROSO: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }
  return colores[estado] || 'bg-gray-500/10 text-gray-400'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function getInitials(nombre: string, apellido?: string): string {
  const first = nombre?.charAt(0)?.toUpperCase() || ''
  const last = apellido?.charAt(0)?.toUpperCase() || ''
  return first + last
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
