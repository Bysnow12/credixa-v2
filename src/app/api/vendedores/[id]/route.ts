// src/app/api/vendedores/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const vendedor = await db.vendedor.findFirst({
    where: { id: params.id, empresaId: user!.empresaId! },
    include: {
      usuario: { select: { nombre: true, apellido: true, email: true, avatar: true, telefono: true } },
      _count: { select: { prestamos: true } },
    },
  })

  if (!vendedor) return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, data: vendedor })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()

    const vendedor = await db.vendedor.findFirst({
      where: { id: params.id, empresaId: user!.empresaId! },
    })
    if (!vendedor) return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 })

    // Update usuario info
    await db.usuario.update({
      where: { id: vendedor.usuarioId },
      data: {
        nombre: body.nombre,
        apellido: body.apellido,
        telefono: body.telefono,
      },
    })

    // Update vendedor info
    const updated = await db.vendedor.update({
      where: { id: params.id },
      data: {
        comisionVenta: parseFloat(body.comisionVenta) || 2,
        comisionCobro: parseFloat(body.comisionCobro) || 1,
        ruta: body.ruta,
        zona: body.zona,
        activo: body.activo ?? true,
      },
      include: {
        usuario: { select: { nombre: true, apellido: true, email: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error('Error updating vendedor:', err)
    return NextResponse.json({ error: 'Error al actualizar vendedor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const vendedor = await db.vendedor.findFirst({
    where: { id: params.id, empresaId: user!.empresaId! },
    include: { _count: { select: { prestamos: true } } },
  })

  if (!vendedor) return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 })

  if (vendedor._count.prestamos > 0) {
    // Deactivate instead of delete if has loans
    await db.vendedor.update({ where: { id: params.id }, data: { activo: false } })
    await db.usuario.update({ where: { id: vendedor.usuarioId }, data: { activo: false } })
    return NextResponse.json({ success: true, message: 'Vendedor desactivado' })
  }

  await db.vendedor.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true, message: 'Vendedor eliminado' })
}
