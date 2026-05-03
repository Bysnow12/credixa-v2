import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createToken } from '@/lib/auth'
import { z } from 'zod'

// 🔒 Evita errores en build en Vercel
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export async function POST(request: NextRequest) {
  try {
    // ✅ Import dinámico (evita problemas en build)
    const { db } = await import('@/lib/db')

    let body

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Body inválido' },
        { status: 400 }
      )
    }

    // ✅ Validación segura
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors?.[0]?.message || 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // ✅ Buscar usuario
    const usuario = await db.usuario.findUnique({
      where: { email: email.toLowerCase() },
      include: { empresa: true },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // 🔧 FIX: solo valida si "activo" existe
    if (usuario.activo !== undefined && !usuario.activo) {
      return NextResponse.json(
        { error: 'Cuenta desactivada' },
        { status: 403 }
      )
    }

    // ✅ Verificar password con protección
    let passwordValido = false

    try {
      passwordValido = await verifyPassword(
        password,
        usuario.password
      )
    } catch (err) {
      console.error('Error verificando password:', err)

      return NextResponse.json(
        { error: 'Error al validar credenciales' },
        { status: 500 }
      )
    }

    if (!passwordValido) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // ✅ Crear token
    let token

    try {
      token = await createToken({
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol as any,
        empresaId: usuario.empresaId || undefined,
        avatar: usuario.avatar || undefined,
      })
    } catch (err) {
      console.error('Error creando token:', err)

      return NextResponse.json(
        { error: 'Error generando sesión' },
        { status: 500 }
      )
    }

    // ✅ Respuesta final
    const response = NextResponse.json({
      success: true,
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol,
          avatar: usuario.avatar,
          empresaId: usuario.empresaId,
        },
        empresa: usuario.empresa,
      },
    })

    // 🍪 Cookie segura
    response.cookies.set('credixa-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response

  } catch (error: any) {
    console.error('🔥 Login error:', error)

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        debug:
          process.env.NODE_ENV !== 'production'
            ? error?.message
            : undefined,
      },
      { status: 500 }
    )
  }
}

// 🚫 Manejo de GET (evita crash)
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}