// src/app/api/notificaciones/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const notificaciones = await db.notificacion.findMany({
    where: { usuarioId: user!.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const noLeidas = notificaciones.filter(n => !n.leida).length

  return NextResponse.json({ success: true, data: notificaciones, noLeidas })
}

export async function PATCH(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const body = await request.json()
  const { id, marcarTodas } = body

  if (marcarTodas) {
    await db.notificacion.updateMany({
      where: { usuarioId: user!.id, leida: false },
      data: { leida: true },
    })
  } else if (id) {
    await db.notificacion.update({
      where: { id, usuarioId: user!.id },
      data: { leida: true },
    })
  }

  return NextResponse.json({ success: true })
}
