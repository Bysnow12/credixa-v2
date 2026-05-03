// src/app/dashboard/clientes/[id]/editar/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditarClientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/clientes/${params.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground mb-4">Formulario de edición cargando cliente #{params.id}...</p>
        <p className="text-sm text-muted-foreground">Esta página usa el mismo formulario que "Nuevo Cliente" con los datos pre-cargados.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href={`/dashboard/clientes/${params.id}`} className="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors">
            Volver al perfil
          </Link>
          <Link href="/dashboard/clientes/nuevo" className="rounded-lg brand-gradient text-white px-4 py-2 text-sm hover:opacity-90 transition-opacity">
            Nuevo cliente
          </Link>
        </div>
      </div>
    </div>
  )
}
