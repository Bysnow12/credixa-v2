// src/app/api/caja/cierre/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { startOfDay, endOfDay } from 'date-fns'

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const body = await request.json()
  const { saldoInicial, notas, fecha } = body

  const diaFecha = fecha ? new Date(fecha) : new Date()
  const inicio = startOfDay(diaFecha)
  const fin = endOfDay(diaFecha)
  const empresaId = user!.empresaId!

  // Calcular totales del día
  const movimientos = await db.cajaMovimiento.findMany({
    where: { empresaId, fecha: { gte: inicio, lte: fin } },
  })

  const totalIngresos = movimientos
    .filter(m => m.monto > 0)
    .reduce((s, m) => s + m.monto, 0)

  const totalEgresos = Math.abs(
    movimientos
      .filter(m => m.tipo === 'EGRESO' || m.tipo === 'GASTO')
      .reduce((s, m) => s + m.monto, 0)
  )

  const totalRetiros = Math.abs(
    movimientos
      .filter(m => m.tipo === 'RETIRO')
      .reduce((s, m) => s + m.monto, 0)
  )

  const saldoFinal = (saldoInicial || 0) + totalIngresos - totalEgresos - totalRetiros

  const cierre = await db.cierreCaja.create({
    data: {
      empresaId,
      fechaInicio: inicio,
      fechaCierre: fin,
      saldoInicial: saldoInicial || 0,
      totalIngresos,
      totalEgresos,
      totalRetiros,
      saldoFinal,
      usuarioId: user!.id,
      notas,
    },
  })

  return NextResponse.json({
    success: true,
    data: cierre,
    message: 'Cierre de caja registrado exitosamente',
  })
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const cierres = await db.cierreCaja.findMany({
    where: { empresaId: user!.empresaId! },
    orderBy: { fechaCierre: 'desc' },
    take: 30,
  })

  return NextResponse.json({ success: true, data: cierres })
}
