// src/app/api/clientes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { id } = await params  // ← await aquí

  const cliente = await db.cliente.findFirst({
    where: { id, empresaId: user!.empresaId! },
    include: {
      referencias: true,
      documentos: true,
      prestamos: {
        orderBy: { createdAt: 'desc' },
        include: {
          pagos: { orderBy: { fechaPago: 'desc' }, take: 5 },
          vendedor: {
            include: { usuario: { select: { nombre: true, apellido: true } } },
          },
        },
      },
    },
  })

  if (!cliente) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: cliente })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { id } = await params  // ← await aquí

  try {
    const body = await request.json()

    const cliente = await db.cliente.update({
      where: { id, empresaId: user!.empresaId! },
      data: {
        nombre: body.nombre,
        apellido: body.apellido,
        cedula: body.cedula,
        telefono: body.telefono,
        telefono2: body.telefono2,
        email: body.email || null,
        whatsapp: body.whatsapp,
        direccion: body.direccion,
        ciudad: body.ciudad,
        provincia: body.provincia,
        notasInternas: body.notasInternas,
        estado: body.estado,
      },
    })

    return NextResponse.json({ success: true, data: cliente })
  } catch (err) {
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const { id } = await params  // ← await aquí

  const prestamosActivos = await db.prestamo.count({
    where: { clienteId: id, estado: { in: ['ACTIVO', 'VENCIDO'] } },
  })

  if (prestamosActivos > 0) {
    return NextResponse.json(
      { error: 'No se puede eliminar un cliente con préstamos activos' },
      { status: 400 }
    )
  }

  await db.cliente.delete({
    where: { id, empresaId: user!.empresaId! },
  })

  return NextResponse.json({ success: true, message: 'Cliente eliminado' })
}