// src/app/api/pagos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const pago = await db.pago.findFirst({
    where: { id: params.id, prestamo: { empresaId: user!.empresaId! } },
    include: {
      prestamo: {
        include: {
          cliente: true,
          empresa: true,
        },
      },
      cobradoPor: { select: { nombre: true, apellido: true, email: true } },
    },
  })

  if (!pago) {
    return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: pago })
}

// Marcar recibo como generado
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const body = await request.json()

  const pago = await db.pago.update({
    where: { id: params.id },
    data: {
      reciboGenerado: true,
      reciboUrl: body.reciboUrl,
    },
  })

  return NextResponse.json({ success: true, data: pago })
}
