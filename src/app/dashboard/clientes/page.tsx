'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Filter, Download, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Phone, MapPin,
  AlertTriangle, CheckCircle, XCircle, Clock
} from 'lucide-react'
import { formatCurrency, formatDate, getInitials, getEstadoClienteColor, getScoreLabel } from '@/utils'

const estadoIcons: Record<string, React.ElementType> = {
  ACTIVO: CheckCircle,
  INACTIVO: Clock,
  BLOQUEADO: XCircle,
  MOROSO: AlertTriangle,
}

export default function ClientesPage() {
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('todos')
  const [page, setPage] = useState(1)
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(data => setClientes(data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = clientes.filter(c => {
    const matchSearch = search === '' ||
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.cedula || '').includes(search) ||
      (c.telefono || '').includes(search)
    const matchEstado = estado === 'todos' || c.estado === estado
    return matchSearch && matchEstado
  })

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setClientes(prev => prev.filter(c => c.id !== id))
      } else {
        alert(data.error || 'No se pudo eliminar el cliente')
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground text-sm">Cargando clientes...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} clientes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <Download className="h-4 w-4" /> Exportar
          </button>
          <Link
            href="/dashboard/clientes/nuevo"
            className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: clientes.length, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'Activos', value: clientes.filter(c => c.estado === 'ACTIVO').length, color: 'text-green-500', bg: 'bg-green-500/5' },
          { label: 'Morosos', value: clientes.filter(c => c.estado === 'MOROSO').length, color: 'text-orange-500', bg: 'bg-orange-500/5' },
          { label: 'Bloqueados', value: clientes.filter(c => c.estado === 'BLOQUEADO').length, color: 'text-red-500', bg: 'bg-red-500/5' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 ${s.bg}`}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {['todos', 'ACTIVO', 'MOROSO', 'INACTIVO', 'BLOQUEADO'].map((e) => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                estado === e ? 'bg-primary text-primary-foreground shadow-sm' : 'border hover:bg-accent'
              }`}
            >
              {e === 'todos' ? 'Todos' : e.charAt(0) + e.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="h-11 px-4 text-left">Cliente</th>
                <th className="h-11 px-4 text-left hidden md:table-cell">Contacto</th>
                <th className="h-11 px-4 text-left hidden lg:table-cell">Score</th>
                <th className="h-11 px-4 text-right hidden sm:table-cell">Saldo</th>
                <th className="h-11 px-4 text-center">Estado</th>
                <th className="h-11 px-4 text-left hidden xl:table-cell">Registro</th>
                <th className="h-11 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((cliente) => {
                const score = getScoreLabel(cliente.scoreRiesgo)
                const estadoClass = getEstadoClienteColor(cliente.estado)
                const EstadoIcon = estadoIcons[cliente.estado] || CheckCircle
                const prestamosActivos = cliente._count?.prestamos ?? cliente.prestamosActivos ?? 0
                return (
                  <tr key={cliente.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white">
                          {getInitials(cliente.nombre, cliente.apellido)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{cliente.nombre} {cliente.apellido}</p>
                          <p className="text-xs text-muted-foreground">{cliente.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-0.5">
                        <p className="text-xs flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {cliente.telefono}
                        </p>
                        <p className="text-xs flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {cliente.ciudad}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${cliente.scoreRiesgo}%`, background: score.color }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: score.color }}>
                          {cliente.scoreRiesgo}
                        </span>
                        <span className="text-xs text-muted-foreground">{score.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <p className="text-sm font-semibold">{formatCurrency(cliente.saldoPendiente ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {prestamosActivos} préstamo{prestamosActivos !== 1 ? 's' : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${estadoClass}`}>
                          <EstadoIcon className="h-3 w-3" />
                          {cliente.estado}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <p className="text-xs text-muted-foreground">{formatDate(cliente.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/clientes/${cliente.id}`}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/clientes/${cliente.id}?edit=1`}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          disabled={deletingId === cliente.id}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No se encontraron clientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Mostrando {filtered.length} de {clientes.length} clientes
          </p>
          <div className="flex items-center gap-1">
            <button
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-50 transition-colors"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[1, 2, 3].map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${
                  page === p ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}