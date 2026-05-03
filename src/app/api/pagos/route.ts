// src/app/api/pagos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { generarCodigo, diasMora, calcularMora } from '@/utils'
import { z } from 'zod'

const pagoSchema = z.object({
  prestamoId: z.string(),
  monto: z.number().positive(),
  metodoPago: z.enum(['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO']),
  referencia: z.string().optional(),
  notas: z.string().optional(),
  fechaPago: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const prestamoId = searchParams.get('prestamoId')
  const skip = (page - 1) * limit

  const where: any = {
    prestamo: { empresaId: user!.empresaId },
    ...(prestamoId && { prestamoId }),
  }

  const [pagos, total] = await Promise.all([
    db.pago.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fechaPago: 'desc' },
      include: {
        prestamo: {
          include: {
            cliente: { select: { nombre: true, apellido: true, foto: true } },
          },
        },
        cobradoPor: { select: { nombre: true, apellido: true } },
      },
    }),
    db.pago.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: pagos,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const data = pagoSchema.parse(body)

    const prestamo = await db.prestamo.findFirst({
      where: { id: data.prestamoId, empresaId: user!.empresaId! },
      include: {
        cuotas: { where: { estado: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDA'] } }, orderBy: { numero: 'asc' } },
        vendedor: true,
      },
    })

    if (!prestamo) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
    }

    if (prestamo.estado === 'PAGADO') {
      return NextResponse.json({ error: 'Este préstamo ya está pagado' }, { status: 400 })
    }

    if (data.monto > prestamo.saldoPendiente + prestamo.moraAcumulada + 1) {
      return NextResponse.json({ error: 'El pago excede el saldo pendiente' }, { status: 400 })
    }

    // Calcular mora actual
    const diasMoraActual = diasMora(prestamo.fechaVencimiento)
    const moraCalculada = calcularMora(prestamo.saldoPendiente, prestamo.tasaMora, diasMoraActual)
    const moraTotal = prestamo.moraAcumulada + moraCalculada

    // Distribuir pago: primero mora, luego capital+interes
    let montoRestante = data.monto
    let montoMora = 0
    let montoCapital = 0
    let montoInteres = 0

    if (moraTotal > 0 && montoRestante > 0) {
      montoMora = Math.min(moraTotal, montoRestante)
      montoRestante -= montoMora
    }

    // Distribuir el resto proporcionalmente entre capital e interés
    const ratio = prestamo.capital / prestamo.montoTotal
    montoCapital = montoRestante * ratio
    montoInteres = montoRestante * (1 - ratio)

    const nuevaMontoPagado = prestamo.montoPagado + montoRestante
    const nuevoSaldo = prestamo.saldoPendiente - montoRestante

    const esCompletamentePagado = nuevoSaldo <= 0.01

    const pago = await db.$transaction(async (tx) => {
      // Crear el pago
      const p = await tx.pago.create({
        data: {
          codigo: generarCodigo('PAG'),
          prestamoId: data.prestamoId,
          cobradoPorId: user!.id,
          monto: data.monto,
          montoCapital,
          montoInteres,
          montoMora,
          metodoPago: data.metodoPago,
          referencia: data.referencia,
          notas: data.notas,
          fechaPago: data.fechaPago ? new Date(data.fechaPago) : new Date(),
        },
      })

      // Actualizar préstamo
      await tx.prestamo.update({
        where: { id: data.prestamoId },
        data: {
          montoPagado: nuevaMontoPagado,
          saldoPendiente: Math.max(0, nuevoSaldo),
          moraAcumulada: Math.max(0, moraTotal - montoMora),
          cuotasPagadas: { increment: montoRestante >= prestamo.montoCuota ? 1 : 0 },
          cuotasPendientes: { decrement: montoRestante >= prestamo.montoCuota ? 1 : 0 },
          fechaUltimoPago: new Date(),
          estado: esCompletamentePagado ? 'PAGADO' : prestamo.estado,
        },
      })

      // Actualizar cuotas (aplicar pago a las cuotas pendientes)
      let montoParaCuotas = montoRestante
      for (const cuota of prestamo.cuotas) {
        if (montoParaCuotas <= 0) break
        const saldoCuota = cuota.saldo
        const pagoEnCuota = Math.min(saldoCuota, montoParaCuotas)
        const nuevaSaldoCuota = saldoCuota - pagoEnCuota
        await tx.cuota.update({
          where: { id: cuota.id },
          data: {
            montoPagado: { increment: pagoEnCuota },
            saldo: nuevaSaldoCuota,
            estado: nuevaSaldoCuota <= 0.01 ? 'PAGADA' : 'PARCIAL',
            fechaPago: nuevaSaldoCuota <= 0.01 ? new Date() : undefined,
          },
        })
        montoParaCuotas -= pagoEnCuota
      }

      // Registrar en caja
      await tx.cajaMovimiento.create({
        data: {
          empresaId: user!.empresaId!,
          tipo: 'INGRESO',
          concepto: `Cobro préstamo - Pago ${p.codigo}`,
          monto: data.monto,
          referencia: p.id,
          usuarioId: user!.id,
        },
      })

      // Comisión de cobro
      if (prestamo.vendedor && prestamo.vendedor.comisionCobro > 0) {
        await tx.comision.create({
          data: {
            vendedorId: prestamo.vendedor.id,
            pagoId: p.id,
            tipo: 'cobro',
            monto: montoRestante * (prestamo.vendedor.comisionCobro / 100),
            porcentaje: prestamo.vendedor.comisionCobro,
          },
        })
      }

      return p
    })

    return NextResponse.json({
      success: true,
      data: pago,
      message: esCompletamentePagado ? '¡Préstamo pagado completamente!' : 'Pago registrado exitosamente',
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('Error creating pago:', err)
    return NextResponse.json({ error: 'Error al registrar pago' }, { status: 500 })
  }
}
