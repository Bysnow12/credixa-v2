// src/app/api/productos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const producto = await db.producto.update({
      where: { id: params.id, empresaId: user!.empresaId! },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        categoriaId: body.categoriaId,
        precioContado: parseFloat(body.precioContado),
        precioCredito: parseFloat(body.precioCredito),
        costo: body.costo ? parseFloat(body.costo) : null,
        stock: parseInt(body.stock) || 0,
        stockMinimo: parseInt(body.stockMinimo) || 5,
        activo: body.activo ?? true,
      },
      include: { categoria: true },
    })
    return NextResponse.json({ success: true, data: producto })
  } catch (err) {
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  await db.producto.update({
    where: { id: params.id, empresaId: user!.empresaId! },
    data: { activo: false },
  })
  return NextResponse.json({ success: true, message: 'Producto desactivado' })
}
