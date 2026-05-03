// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  const usuario = await db.usuario.findUnique({
    where: { id: user!.id },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      rol: true,
      activo: true,
      avatar: true,
      telefono: true,
      empresaId: true,
      empresa: {
        select: {
          id: true,
          nombre: true,
          logo: true,
          moneda: true,
          simboloMoneda: true,
          colorPrimario: true,
          colorSecundario: true,
          tasaInteresDefault: true,
          moraDefault: true,
          diasGraciaMora: true,
        },
      },
    },
  })

  if (!usuario) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: usuario })
}
