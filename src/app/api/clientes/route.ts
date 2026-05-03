// src/app/api/clientes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const clienteSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  cedula: z.string().optional(),
  telefono: z.string().min(1, 'Teléfono requerido'),
  telefono2: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  provincia: z.string().optional(),
  notasInternas: z.string().optional(),
  referencias: z.array(z.object({
    nombre: z.string(),
    telefono: z.string(),
    relacion: z.string().optional(),
    direccion: z.string().optional(),
  })).optional(),
})

// GET - Listar clientes
export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const estado = searchParams.get('estado') || undefined
  const skip = (page - 1) * limit

  const where: any = {
    empresaId: user!.empresaId,
    ...(search && {
      OR: [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { cedula: { contains: search } },
        { telefono: { contains: search } },
      ],
    }),
    ...(estado && { estado }),
  }

  const [clientes, total] = await Promise.all([
    db.cliente.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { prestamos: true } },
        prestamos: {
          where: { estado: { in: ['ACTIVO', 'VENCIDO'] } },
          select: { saldoPendiente: true, capital: true, montoPagado: true },
        },
      },
    }),
    db.cliente.count({ where }),
  ])

  const clientesConStats = clientes.map((c) => ({
    ...c,
    totalPrestado: c.prestamos.reduce((sum, p) => sum + p.capital, 0),
    totalPagado: c.prestamos.reduce((sum, p) => sum + p.montoPagado, 0),
    saldoPendiente: c.prestamos.reduce((sum, p) => sum + p.saldoPendiente, 0),
    prestamos: undefined,
  }))

  return NextResponse.json({
    success: true,
    data: clientesConStats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

// POST - Crear cliente
export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const { referencias, ...clienteData } = clienteSchema.parse(body)

    const cliente = await db.cliente.create({
      data: {
        ...clienteData,
        empresaId: user!.empresaId!,
        email: clienteData.email || undefined,
        ...(referencias && {
          referencias: {
            create: referencias,
          },
        }),
      },
      include: { referencias: true },
    })

    return NextResponse.json({ success: true, data: cliente }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('Error creating cliente:', err)
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
  }
}
