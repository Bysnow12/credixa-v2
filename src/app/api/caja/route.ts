// src/app/api/caja/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { startOfDay, endOfDay } from 'date-fns'

const movimientoSchema = z.object({
  tipo: z.enum(['INGRESO', 'EGRESO', 'RETIRO', 'DEPOSITO', 'GASTO', 'COMISION']),
  concepto: z.string().min(1, 'Concepto requerido'),
  monto: z.number().gt(0, 'El monto debe ser mayor que 0'),
  referencia: z.string().optional(),
  fecha: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const fechaInicio = searchParams.get('fechaInicio')
  const fechaFin = searchParams.get('fechaFin')
  const tipo = searchParams.get('tipo')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const hoy = new Date()
  const desde = fechaInicio ? new Date(fechaInicio) : startOfDay(hoy)
  const hasta = fechaFin ? new Date(fechaFin) : endOfDay(hoy)

  const where: any = {
    empresaId: user!.empresaId!,
    fecha: { gte: desde, lte: hasta },
    ...(tipo && { tipo }),
  }

  const [movimientos, total, resumen] = await Promise.all([
    db.cajaMovimiento.findMany({
      where,
      orderBy: { fecha: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.cajaMovimiento.count({ where }),
    db.cajaMovimiento.groupBy({
      by: ['tipo'],
      where,
      _sum: { monto: true },
      _count: { id: true },
    }),
  ])

  const totalIngresos = resumen
    .filter(r => ['INGRESO', 'DEPOSITO'].includes(r.tipo))
    .reduce((s, r) => s + (r._sum.monto || 0), 0)

  const totalEgresos = Math.abs(
    resumen
      .filter(r => ['EGRESO', 'RETIRO', 'GASTO', 'COMISION'].includes(r.tipo))
      .reduce((s, r) => s + (r._sum.monto || 0), 0)
  )

  return NextResponse.json({
    success: true,
    data: movimientos,
    resumen: {
      totalIngresos,
      totalEgresos,
      balance: totalIngresos - totalEgresos,
      totalTransacciones: total,
    },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const data = movimientoSchema.parse(body)

    // Ajustar monto según tipo (egresos, retiros y gastos son negativos)
    const montoFinal = ['EGRESO', 'RETIRO', 'GASTO'].includes(data.tipo)
      ? -Math.abs(data.monto)
      : Math.abs(data.monto)

    const movimiento = await db.cajaMovimiento.create({
      data: {
        ...data,
        monto: montoFinal,
        empresaId: user!.empresaId!,
        usuarioId: user!.id,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
      },
    })

    return NextResponse.json({ success: true, data: movimiento }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al registrar movimiento' }, { status: 500 })
  }
}
