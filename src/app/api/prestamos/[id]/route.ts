// src/app/api/prestamos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { generarCodigo, calcularCuotas, calcularFechasCuotas } from '@/utils'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const prestamo = await db.prestamo.findFirst({
    where: { id: params.id, empresaId: user!.empresaId! },
    include: {
      cliente: {
        include: { referencias: true },
      },
      vendedor: {
        include: { usuario: { select: { nombre: true, apellido: true, avatar: true } } },
      },
      cuotas: { orderBy: { numero: 'asc' } },
      pagos: {
        orderBy: { fechaPago: 'desc' },
        include: {
          cobradoPor: { select: { nombre: true, apellido: true } },
        },
      },
      creadoPor: { select: { nombre: true, apellido: true } },
    },
  })

  if (!prestamo) {
    return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: prestamo })
}

// Refinanciar préstamo
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const { accion, interes, numeroCuotas, fechaPrimerPago, notas } = body

    if (accion !== 'refinanciar') {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

    const prestamoOriginal = await db.prestamo.findFirst({
      where: { id: params.id, empresaId: user!.empresaId! },
    })

    if (!prestamoOriginal) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
    }

    if (prestamoOriginal.estado === 'PAGADO') {
      return NextResponse.json({ error: 'No se puede refinanciar un préstamo pagado' }, { status: 400 })
    }

    const nuevoCapital = prestamoOriginal.saldoPendiente + prestamoOriginal.moraAcumulada
    const { montoCuota, montoTotal, montoInteres } = calcularCuotas(nuevoCapital, interes, numeroCuotas)
    const fechasPago = calcularFechasCuotas(new Date(fechaPrimerPago), numeroCuotas, prestamoOriginal.frecuencia)
    const fechaVencimiento = fechasPago[fechasPago.length - 1]

    const resultado = await db.$transaction(async (tx) => {
      // Marcar el préstamo original como refinanciado
      await tx.prestamo.update({
        where: { id: params.id },
        data: { estado: 'REFINANCIADO' },
      })

      // Crear nuevo préstamo refinanciado
      const nuevoPrestamo = await tx.prestamo.create({
        data: {
          codigo: generarCodigo('REF'),
          empresaId: user!.empresaId!,
          clienteId: prestamoOriginal.clienteId,
          vendedorId: prestamoOriginal.vendedorId,
          creadoPorId: user!.id,
          tipo: prestamoOriginal.tipo,
          estado: 'ACTIVO',
          capital: nuevoCapital,
          interes,
          tipoInteres: 'FIJO',
          montoInteres,
          montoTotal,
          montoPagado: 0,
          saldoPendiente: montoTotal,
          tasaMora: prestamoOriginal.tasaMora,
          moraAcumulada: 0,
          frecuencia: prestamoOriginal.frecuencia,
          numeroCuotas,
          montoCuota,
          cuotasPagadas: 0,
          cuotasPendientes: numeroCuotas,
          fechaDesembolso: new Date(),
          fechaPrimerPago: new Date(fechaPrimerPago),
          fechaVencimiento,
          prestamoOriginalId: params.id,
          notas: notas || `Refinanciación del préstamo ${prestamoOriginal.codigo}`,
        },
      })

      // Crear cuotas del nuevo préstamo
      await tx.cuota.createMany({
        data: fechasPago.map((fecha, idx) => ({
          prestamoId: nuevoPrestamo.id,
          numero: idx + 1,
          monto: montoCuota,
          montoPagado: 0,
          saldo: montoCuota,
          fechaVence: fecha,
          estado: 'PENDIENTE',
        })),
      })

      return nuevoPrestamo
    })

    return NextResponse.json({
      success: true,
      data: resultado,
      message: 'Préstamo refinanciado exitosamente',
    })
  } catch (err) {
    console.error('Error refinanciando:', err)
    return NextResponse.json({ error: 'Error al refinanciar préstamo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const prestamo = await db.prestamo.findFirst({
    where: { id: params.id, empresaId: user!.empresaId! },
    include: { _count: { select: { pagos: true } } },
  })

  if (!prestamo) {
    return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
  }

  if (prestamo._count.pagos > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar un préstamo con pagos registrados. Cancélelo en su lugar.' },
      { status: 400 }
    )
  }

  await db.prestamo.update({
    where: { id: params.id },
    data: { estado: 'CANCELADO' },
  })

  return NextResponse.json({ success: true, message: 'Préstamo cancelado' })
}
