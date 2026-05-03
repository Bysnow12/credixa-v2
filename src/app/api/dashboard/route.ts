// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const empresaId = user!.empresaId
  if (!empresaId) {
    return NextResponse.json({ error: 'Sin empresa asignada' }, { status: 403 })
  }

  const hoy = new Date()
  const inicioDia = startOfDay(hoy)
  const finDia = endOfDay(hoy)

  // Total cartera (suma de saldos pendientes activos)
  const cartera = await db.prestamo.aggregate({
    where: { empresaId, estado: { in: ['ACTIVO', 'VENCIDO'] } },
    _sum: { saldoPendiente: true, capital: true, montoPagado: true },
    _count: { id: true },
  })

  // Clientes morosos
  const clientesMorosos = await db.prestamo.groupBy({
    by: ['clienteId'],
    where: { empresaId, estado: 'VENCIDO' },
  })

  // Pagos hoy
  const pagosHoy = await db.pago.aggregate({
    where: {
      prestamo: { empresaId },
      fechaPago: { gte: inicioDia, lte: finDia },
    },
    _sum: { monto: true },
    _count: { id: true },
  })

  // Nuevos préstamos hoy
  const prestamosHoy = await db.prestamo.aggregate({
    where: {
      empresaId,
      fechaDesembolso: { gte: inicioDia, lte: finDia },
    },
    _sum: { capital: true },
    _count: { id: true },
  })

  // Total clientes activos
  const clientesActivos = await db.cliente.count({
    where: { empresaId, estado: 'ACTIVO' },
  })

  // Gráfica mensual - últimos 6 meses
  const graficaMensual = []
  for (let i = 5; i >= 0; i--) {
    const fecha = subMonths(hoy, i)
    const inicio = startOfMonth(fecha)
    const fin = endOfMonth(fecha)

    const prestadoMes = await db.prestamo.aggregate({
      where: { empresaId, fechaDesembolso: { gte: inicio, lte: fin } },
      _sum: { capital: true },
    })

    const cobradoMes = await db.pago.aggregate({
      where: { prestamo: { empresaId }, fechaPago: { gte: inicio, lte: fin } },
      _sum: { monto: true },
    })

    const moraMes = await db.prestamo.aggregate({
      where: { empresaId, fechaDesembolso: { gte: inicio, lte: fin } },
      _sum: { moraAcumulada: true },
    })

    graficaMensual.push({
      mes: fecha.toLocaleDateString('es-DO', { month: 'short', year: '2-digit' }),
      prestado: prestadoMes._sum.capital || 0,
      cobrado: cobradoMes._sum.monto || 0,
      mora: moraMes._sum.moraAcumulada || 0,
    })
  }

  // Top 5 clientes
  const topClientesRaw = await db.prestamo.groupBy({
    by: ['clienteId'],
    where: { empresaId },
    _sum: { montoPagado: true, capital: true },
    _count: { id: true },
    orderBy: { _sum: { capital: 'desc' } },
    take: 5,
  })

  const topClientes = await Promise.all(
    topClientesRaw.map(async (tc) => {
      const cliente = await db.cliente.findUnique({
        where: { id: tc.clienteId },
        select: { id: true, nombre: true, apellido: true, foto: true },
      })
      return {
        ...cliente,
        totalPrestado: tc._sum.capital || 0,
        totalPagado: tc._sum.montoPagado || 0,
        prestamosActivos: tc._count.id,
      }
    })
  )

  // Top vendedores
  const topVendedoresRaw = await db.prestamo.groupBy({
    by: ['vendedorId'],
    where: { empresaId, vendedorId: { not: null } },
    _sum: { capital: true, montoPagado: true },
    _count: { id: true },
    orderBy: { _sum: { capital: 'desc' } },
    take: 5,
  })

  const topVendedores = await Promise.all(
    topVendedoresRaw.filter(v => v.vendedorId).map(async (tv) => {
      const vendedor = await db.vendedor.findUnique({
        where: { id: tv.vendedorId! },
        include: { usuario: { select: { nombre: true, apellido: true, avatar: true } } },
      })
      return {
        id: vendedor?.id,
        nombre: vendedor?.usuario.nombre,
        apellido: vendedor?.usuario.apellido,
        avatar: vendedor?.usuario.avatar,
        totalVentas: tv._sum.capital || 0,
        totalCobrado: tv._sum.montoPagado || 0,
        comisiones: (tv._sum.capital || 0) * ((vendedor?.comisionVenta || 0) / 100),
      }
    })
  )

  // Últimos movimientos
  const ultimosPagos = await db.pago.findMany({
    where: { prestamo: { empresaId } },
    include: {
      prestamo: {
        include: {
          cliente: { select: { nombre: true, apellido: true } },
        },
      },
      cobradoPor: { select: { nombre: true, apellido: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const ultimosMovimientos = ultimosPagos.map((p) => ({
    id: p.id,
    tipo: 'COBRO',
    descripcion: `Pago de ${p.prestamo.cliente.nombre} ${p.prestamo.cliente.apellido}`,
    monto: p.monto,
    fecha: p.fechaPago,
    cliente: `${p.prestamo.cliente.nombre} ${p.prestamo.cliente.apellido}`,
    vendedor: `${p.cobradoPor.nombre} ${p.cobradoPor.apellido}`,
  }))

  // Balance caja hoy
  const cajahoy = await db.cajaMovimiento.aggregate({
    where: {
      empresaId,
      fecha: { gte: inicioDia, lte: finDia },
    },
    _sum: { monto: true },
  })

  const totalCartera = cartera._sum.saldoPendiente || 0
  const totalPrestado = cartera._sum.capital || 0
  const totalCobrado = cartera._sum.montoPagado || 0
  const prestamosActivos = cartera._count.id || 0

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        totalCartera,
        totalPrestado,
        totalCobrado,
        pagosPendientes: totalCartera,
        clientesMorosos: clientesMorosos.length,
        ventasHoy: prestamosHoy._count.id || 0,
        ingresosHoy: pagosHoy._sum.monto || 0,
        balanceGeneral: cajahoy._sum.monto || 0,
        clientesActivos,
        prestamosActivos,
        tasaMorosidad: prestamosActivos > 0
          ? Math.round((clientesMorosos.length / prestamosActivos) * 100)
          : 0,
        cobranzaEfectividad: totalPrestado > 0
          ? Math.round((totalCobrado / totalPrestado) * 100)
          : 0,
        capitalHoy: prestamosHoy._sum.capital || 0,
      },
      graficaMensual,
      topClientes,
      topVendedores,
      ultimosMovimientos,
    },
  })
}
