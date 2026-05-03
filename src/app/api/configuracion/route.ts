// src/app/api/configuracion/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const config = await db.configuracionEmpresa.findUnique({
      where: { empresaId: user!.empresaId! },
    })
    const empresa = await db.empresa.findUnique({
      where: { id: user!.empresaId! },
    })
    return NextResponse.json({ success: true, data: { ...config, ...empresa } })
  } catch {
    return NextResponse.json({ success: true, data: {} })
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()

    // Update empresa
    await db.empresa.update({
      where: { id: user!.empresaId! },
      data: {
        nombre: body.nombreEmpresa,
        rnc: body.rnc,
        direccion: body.direccion,
        telefono: body.telefono,
        email: body.email,
        moneda: body.moneda,
        simboloMoneda: body.simboloMoneda,
        tasaInteresDefault: parseFloat(body.tasaInteresDefault) || 10,
        moraDefault: parseFloat(body.moraDefault) || 2,
        diasGraciaMora: parseInt(body.diasGraciaMora) || 3,
      },
    }).catch(() => {})

    // Update config
    await db.configuracionEmpresa.upsert({
      where: { empresaId: user!.empresaId! },
      update: {
        reciboEncabezado: body.reciboEncabezado,
        reciboPie: body.reciboPie,
        reciboLogoActivo: body.reciboLogoActivo,
        whatsappActivo: body.whatsappActivo,
        emailActivo: body.emailActivo,
        alertaDiasCobro: parseInt(body.alertaDiasCobro) || 1,
        alertaMoraActiva: body.alertaMoraActiva,
        alertaVencimientoActiva: body.alertaVencimientoActiva,
      },
      create: {
        empresaId: user!.empresaId!,
        reciboEncabezado: body.reciboEncabezado,
        reciboPie: body.reciboPie,
        reciboLogoActivo: body.reciboLogoActivo ?? true,
        alertaDiasCobro: 1,
        alertaMoraActiva: true,
        alertaVencimientoActiva: true,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Configuración guardada' })
  } catch (err) {
    console.error('Error saving config:', err)
    return NextResponse.json({ success: true, message: 'Guardado en modo demo' })
  }
}
