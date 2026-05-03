// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'
const bcrypt = require('bcryptjs')
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { SessionUser } from '@/types'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET as string
)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY)
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  const cookieToken = request.cookies.get('credixa-token')?.value
  return cookieToken || null
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('credixa-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return { user: null, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }
  const user = await verifyToken(token)
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Token inválido' }, { status: 401 }) }
  }
  return { user, error: null }
}

export function requireRole(user: SessionUser, roles: string[]) {
  if (!roles.includes(user.rol)) {
    return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
  }
  return null
}

export const ROLES_JERARQUIA = {
  SUPERADMIN: 5,
  ADMIN: 4,
  EMPRESA: 3,
  SUPERVISOR: 2,
  SOCIO: 2,
  VENDEDOR: 1,
}

export function tienePermiso(userRol: string, rolRequerido: string): boolean {
  return (ROLES_JERARQUIA[userRol as keyof typeof ROLES_JERARQUIA] || 0) >=
    (ROLES_JERARQUIA[rolRequerido as keyof typeof ROLES_JERARQUIA] || 0)
}
