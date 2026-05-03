// src/app/api/vendedores/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const vendedorSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  telefono: z.string().optional(),
  comisionVenta: z.number().min(0).max(100).default(2),
  comisionCobro: z.number().min(0).max(100).default(1),
  ruta: z.string().optional(),
  zona: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const vendedores = await db.vendedor.findMany({
    where: { empresaId: user!.empresaId! },
    include: {
      usuario: {
        select: { nombre: true, apellido: true, email: true, avatar: true, telefono: true, activo: true },
      },
      _count: { select: { prestamos: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Enriquecer con stats
  const vendedoresConStats = await Promise.all(
    vendedores.map(async (v) => {
      const stats = await db.prestamo.aggregate({
        where: { vendedorId: v.id, empresaId: user!.empresaId! },
        _sum: { capital: true, montoPagado: true },
        _count: { id: true },
      })

      const comisionesSum = await db.comision.aggregate({
        where: { vendedorId: v.id },
        _sum: { monto: true },
      })

      return {
        ...v,
        totalVentas: stats._sum.capital || 0,
        totalCobrado: stats._sum.montoPagado || 0,
        totalPrestamos: stats._count.id,
        comisionesGanadas: comisionesSum._sum.monto || 0,
      }
    })
  )

  return NextResponse.json({ success: true, data: vendedoresConStats })
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const data = vendedorSchema.parse(body)

    const passwordHash = await bcrypt.hash(data.password || 'vendedor123', 12)

    const resultado = await db.$transaction(async (tx) => {
      const nuevoUsuario = await tx.usuario.create({
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          password: passwordHash,
          rol: 'VENDEDOR',
          telefono: data.telefono,
          empresaId: user!.empresaId!,
        },
      })

      const vendedor = await tx.vendedor.create({
        data: {
          usuarioId: nuevoUsuario.id,
          empresaId: user!.empresaId!,
          comisionVenta: data.comisionVenta,
          comisionCobro: data.comisionCobro,
          ruta: data.ruta,
          zona: data.zona,
        },
        include: {
          usuario: { select: { nombre: true, apellido: true, email: true } },
        },
      })

      return vendedor
    })

    return NextResponse.json({ success: true, data: resultado }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('Error creando vendedor:', err)
    return NextResponse.json({ error: 'Error al crear vendedor' }, { status: 500 })
  }
}
