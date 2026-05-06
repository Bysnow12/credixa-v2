import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { generarCodigo, calcularCuotas, calcularFechasCuotas } from '@/utils'

const prestamoSchema = z.object({
  clienteId: z.string(),
  vendedorId: z.string().optional(),
  tipo: z.enum(['PRESTAMO_PERSONAL', 'VENTA_CREDITO', 'HIPOTECARIO', 'PRENDARIO']),
  capital: z.number().positive('El capital debe ser mayor a 0'),
  interes: z.number().min(0),
  frecuencia: z.enum(['DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'PERSONALIZADO']),
  numeroCuotas: z.number().int().positive(),
  fechaDesembolso: z.string(),
  fechaPrimerPago: z.string(),
  tasaMora: z.number().min(0).optional(),
  descripcion: z.string().optional(),
  notas: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const estado = searchParams.get('estado') || undefined
  const clienteId = searchParams.get('clienteId') || undefined
  const skip = (page - 1) * limit

  const where: any = {
    empresaId: user!.empresaId,
    ...(estado && { estado }),
    ...(clienteId && { clienteId }),
    ...(search && {
      OR: [
        { codigo: { contains: search, mode: 'insensitive' } },
        { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
        { cliente: { apellido: { contains: search, mode: 'insensitive' } } },
        { cliente: { cedula: { contains: search } } },
      ],
    }),
  }

  const [prestamos, total] = await Promise.all([
    db.prestamo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: {
          // ✅ Eliminado "foto" que no existe en el schema
          select: { id: true, nombre: true, apellido: true, telefono: true },
        },
        vendedor: {
          include: {
            usuario: { select: { nombre: true, apellido: true } },
          },
        },
      },
    }),
    db.prestamo.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: prestamos,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const data = prestamoSchema.parse(body)

    const { montoCuota, montoTotal, montoInteres } = calcularCuotas(
      data.capital,
      data.interes,
      data.numeroCuotas
    )

    const fechaPrimerPago = new Date(data.fechaPrimerPago)
    const fechasCuotas = calcularFechasCuotas(fechaPrimerPago, data.numeroCuotas, data.frecuencia)
    const fechaVencimiento = fechasCuotas[fechasCuotas.length - 1]

    const empresa = await db.empresa.findUnique({ where: { id: user!.empresaId! } })

    const prestamo = await db.$transaction(async (tx) => {
      const p = await tx.prestamo.create({
        data: {
          codigo: generarCodigo('PRE'),
          empresaId: user!.empresaId!,
          clienteId: data.clienteId,
          vendedorId: data.vendedorId,
          creadoPorId: user!.id,
          tipo: data.tipo,
          capital: data.capital,
          interes: data.interes,
          montoInteres,
          montoTotal,
          montoPagado: 0,
          saldoPendiente: montoTotal,
          tasaMora: data.tasaMora ?? empresa?.moraDefault ?? 2,
          frecuencia: data.frecuencia,
          numeroCuotas: data.numeroCuotas,
          montoCuota,
          cuotasPagadas: 0,
          cuotasPendientes: data.numeroCuotas,
          fechaDesembolso: new Date(data.fechaDesembolso),
          fechaPrimerPago,
          fechaVencimiento,
          descripcion: data.descripcion,
          notas: data.notas,
        },
      })

      await tx.cuota.createMany({
        data: fechasCuotas.map((fecha, idx) => ({
          prestamoId: p.id,
          numero: idx + 1,
          monto: montoCuota,
          montoPagado: 0,
          saldo: montoCuota,
          fechaVence: fecha,
          estado: 'PENDIENTE',
        })),
      })

      await tx.cajaMovimiento.create({
        data: {
          empresaId: user!.empresaId!,
          tipo: 'EGRESO',
          concepto: `Desembolso préstamo ${p.codigo}`,
          monto: -data.capital,
          referencia: p.id,
          usuarioId: user!.id,
        },
      })

      if (data.vendedorId) {
        const vendedor = await tx.vendedor.findUnique({ where: { id: data.vendedorId } })
        if (vendedor && vendedor.comisionVenta > 0) {
          await tx.comision.create({
            data: {
              vendedorId: data.vendedorId,
              prestamoId: p.id,
              tipo: 'venta',
              monto: data.capital * (vendedor.comisionVenta / 100),
              porcentaje: vendedor.comisionVenta,
            },
          })
        }
      }

      return p
    })

    const prestamoCompleto = await db.prestamo.findUnique({
      where: { id: prestamo.id },
      include: {
        cliente: true,
        cuotas: { orderBy: { numero: 'asc' } },
      },
    })

    return NextResponse.json({ success: true, data: prestamoCompleto }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('Error creating prestamo:', err)
    return NextResponse.json({ error: 'Error al crear préstamo' }, { status: 500 })
  }
}
