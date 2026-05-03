// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  nombreEmpresa: z.string().min(2, 'Nombre de empresa requerido'),
  rnc: z.string().optional(),
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  telefono: z.string().optional(),
  plan: z.enum(['basic', 'professional', 'enterprise']).default('professional'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Verificar que el email no exista
    const existente = await db.usuario.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existente) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 400 })
    }

    const passwordHash = await hashPassword(data.password)

    // Crear empresa y usuario admin en una transacción
    const resultado = await db.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          nombre: data.nombreEmpresa,
          rnc: data.rnc,
          moneda: 'DOP',
          simboloMoneda: 'RD$',
          planActivo: data.plan,
          tasaInteresDefault: 10,
          moraDefault: 2,
          diasGraciaMora: 3,
        },
      })

      const usuario = await tx.usuario.create({
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email.toLowerCase(),
          password: passwordHash,
          rol: 'ADMIN',
          telefono: data.telefono,
          empresaId: empresa.id,
          activo: true,
        },
      })

      // Configuración inicial de la empresa
      await tx.configuracionEmpresa.create({
        data: {
          empresaId: empresa.id,
          reciboEncabezado: 'Gracias por su pago',
          reciboPie: `Conserve este recibo. ${data.nombreEmpresa}`,
          reciboLogoActivo: true,
          alertaDiasCobro: 2,
          alertaMoraActiva: true,
          alertaVencimientoActiva: true,
        },
      })

      // Notificación de bienvenida
      await tx.notificacion.create({
        data: {
          usuarioId: usuario.id,
          titulo: '¡Bienvenido a Credixa!',
          mensaje: `Tu cuenta está lista. Comienza creando tu primer cliente.`,
          tipo: 'success',
          url: '/dashboard/clientes/nuevo',
        },
      })

      return { empresa, usuario }
    })

    const token = await createToken({
      id: resultado.usuario.id,
      nombre: resultado.usuario.nombre,
      apellido: resultado.usuario.apellido,
      email: resultado.usuario.email,
      rol: 'ADMIN',
      empresaId: resultado.empresa.id,
    })

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        usuario: {
          id: resultado.usuario.id,
          nombre: resultado.usuario.nombre,
          apellido: resultado.usuario.apellido,
          email: resultado.usuario.email,
          rol: resultado.usuario.rol,
          empresaId: resultado.empresa.id,
        },
        empresa: resultado.empresa,
      },
    }, { status: 201 })

    response.cookies.set('credixa-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('Error en registro:', err)
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
  }
}
