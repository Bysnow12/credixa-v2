// src/app/api/productos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const productoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional(),
  categoriaId: z.string().optional(),
  codigo: z.string().optional(),
  precioContado: z.number().positive(),
  precioCredito: z.number().positive(),
  costo: z.number().optional(),
  stock: z.number().int().min(0).default(0),
  stockMinimo: z.number().int().min(0).default(5),
})

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  const productos = await db.producto.findMany({
    where: {
      empresaId: user!.empresaId!,
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { codigo: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: { categoria: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: productos })
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const data = productoSchema.parse(body)

    const producto = await db.producto.create({
      data: { ...data, empresaId: user!.empresaId!, activo: true },
      include: { categoria: true },
    })

    return NextResponse.json({ success: true, data: producto }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
