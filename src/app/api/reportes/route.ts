// src/app/api/reportes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo') || 'financiero'
  const fechaInicio = searchParams.get('fechaInicio')
  const fechaFin = searchParams.get('fechaFin')
  const empresaId = user!.empresaId!

  const desde = fechaInicio ? new Date(fechaInicio) : startOfMonth(subMonths(new Date(), 5))
  const hasta = fechaFin ? new Date(fechaFin) : endOfDay(new Date())

  if (tipo === 'mora') {
    const prestamosVencidos = await db.prestamo.findMany({
      where: {
        empresaId,
        estado: 'VENCIDO',
        fechaVencimiento: { lte: new Date() },
      },
      include: {
        cliente: { select: { nombre: true, apellido: true, telefono: true, cedula: true } },
        vendedor: { include: { usuario: { select: { nombre: true, apellido: true } } } },
      },
      orderBy: { fechaVencimiento: 'asc' },
    })

    const { differenceInDays } = await import('date-fns')
    const reporte = prestamosVencidos.map(p => ({
      codigo: p.codigo,
      cliente: `${p.cliente.nombre} ${p.cliente.apellido}`,
      cedula: p.cliente.cedula,
      telefono: p.cliente.telefono,
      saldoPendiente: p.saldoPendiente,
      moraAcumulada: p.moraAcumulada,
      diasMora: differenceInDays(new Date(), p.fechaVencimiento),
      vendedor: p.vendedor ? `${p.vendedor.usuario.nombre} ${p.vendedor.usuario.apellido}` : 'N/A',
      fechaVencimiento: p.fechaVencimiento,
    }))

    return NextResponse.json({ success: true, data: reporte, tipo: 'mora' })
  }

  if (tipo === 'financiero') {
    // Métricas del período
    const cartera = await db.prestamo.aggregate({
      where: { empresaId, estado: { in: ['ACTIVO', 'VENCIDO'] } },
      _sum: { saldoPendiente: true, capital: true, montoPagado: true, moraAcumulada: true },
      _count: { id: true },
    })

    const cobradoPeriodo = await db.pago.aggregate({
      where: {
        prestamo: { empresaId },
        fechaPago: { gte: desde, lte: hasta },
      },
      _sum: { monto: true, montoMora: true },
      _count: { id: true },
    })

    const nuevasPeriodo = await db.prestamo.aggregate({
      where: {
        empresaId,
        fechaDesembolso: { gte: desde, lte: hasta },
      },
      _sum: { capital: true },
      _count: { id: true },
    })

    // Tendencia mensual
    const tendenciaMensual = []
    for (let i = 5; i >= 0; i--) {
      const fecha = subMonths(new Date(), i)
      const [prest, cobros] = await Promise.all([
        db.prestamo.aggregate({
          where: { empresaId, fechaDesembolso: { gte: startOfMonth(fecha), lte: endOfMonth(fecha) } },
          _sum: { capital: true },
          _count: { id: true },
        }),
        db.pago.aggregate({
          where: { prestamo: { empresaId }, fechaPago: { gte: startOfMonth(fecha), lte: endOfMonth(fecha) } },
          _sum: { monto: true },
          _count: { id: true },
        }),
      ])

      tendenciaMensual.push({
        mes: fecha.toLocaleDateString('es-DO', { month: 'short', year: '2-digit' }),
        prestado: prest._sum.capital || 0,
        cobrado: cobros._sum.monto || 0,
        numPrestamos: prest._count.id,
        numCobros: cobros._count.id,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        resumen: {
          carteraTotal: cartera._sum.saldoPendiente || 0,
          capitalTotal: cartera._sum.capital || 0,
          cobradoTotal: cartera._sum.montoPagado || 0,
          moraTotal: cartera._sum.moraAcumulada || 0,
          prestamosActivos: cartera._count.id,
          cobradoPeriodo: cobradoPeriodo._sum.monto || 0,
          cobrosPeriodo: cobradoPeriodo._count.id,
          nuevaColocacion: nuevasPeriodo._sum.capital || 0,
          nuevasPeriodo: nuevasPeriodo._count.id,
        },
        tendenciaMensual,
      },
      tipo: 'financiero',
    })
  }

  if (tipo === 'clientes') {
    const [total, activos, morosos, inactivos] = await Promise.all([
      db.cliente.count({ where: { empresaId } }),
      db.cliente.count({ where: { empresaId, estado: 'ACTIVO' } }),
      db.cliente.count({ where: { empresaId, estado: 'MOROSO' } }),
      db.cliente.count({ where: { empresaId, estado: 'INACTIVO' } }),
    ])

    const topClientes = await db.prestamo.groupBy({
      by: ['clienteId'],
      where: { empresaId },
      _sum: { capital: true, montoPagado: true },
      orderBy: { _sum: { capital: 'desc' } },
      take: 10,
    })

    const topClientesDetalle = await Promise.all(
      topClientes.map(async tc => {
        const c = await db.cliente.findUnique({
          where: { id: tc.clienteId },
          select: { nombre: true, apellido: true, cedula: true, telefono: true, estado: true, scoreRiesgo: true },
        })
        return { ...c, totalPrestado: tc._sum.capital || 0, totalPagado: tc._sum.montoPagado || 0 }
      })
    )

    return NextResponse.json({
      success: true,
      data: { resumen: { total, activos, morosos, inactivos }, topClientes: topClientesDetalle },
      tipo: 'clientes',
    })
  }

  if (tipo === 'vendedores') {
    const vendedores = await db.vendedor.findMany({
      where: { empresaId },
      include: {
        usuario: { select: { nombre: true, apellido: true, email: true } },
        prestamos: {
          where: { fechaDesembolso: { gte: desde, lte: hasta } },
          select: { capital: true, montoPagado: true },
        },
        comisiones: {
          where: { createdAt: { gte: desde, lte: hasta } },
          select: { monto: true, tipo: true },
        },
      },
    })

    const reporte = vendedores.map(v => ({
      id: v.id,
      nombre: `${v.usuario.nombre} ${v.usuario.apellido}`,
      email: v.usuario.email,
      zona: v.zona,
      ruta: v.ruta,
      comisionVenta: v.comisionVenta,
      comisionCobro: v.comisionCobro,
      totalPrestamos: v.prestamos.length,
      totalColocado: v.prestamos.reduce((s, p) => s + p.capital, 0),
      totalCobrado: v.prestamos.reduce((s, p) => s + p.montoPagado, 0),
      comisionesGanadas: v.comisiones.reduce((s, c) => s + c.monto, 0),
      activo: v.activo,
    }))

    return NextResponse.json({ success: true, data: reporte, tipo: 'vendedores' })
  }

  return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
}
