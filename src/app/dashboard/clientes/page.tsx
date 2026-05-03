// src/app/dashboard/clientes/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, Filter, Download, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Phone, MapPin, Star,
  AlertTriangle, CheckCircle, XCircle, Clock, Users
} from 'lucide-react'
import { formatCurrency, formatDate, getInitials, getEstadoClienteColor, getScoreLabel } from '@/utils'

// Mock data
const mockClientes = Array.from({ length: 12 }, (_, i) => ({
  id: `${i + 1}`,
  nombre: ['María', 'Carlos', 'Ana', 'Pedro', 'Luisa', 'José', 'Carmen', 'Miguel', 'Rosa', 'Luis', 'Elena', 'Diego'][i],
  apellido: ['González', 'Rodríguez', 'Martínez', 'López', 'Fernández', 'García', 'Sánchez', 'Torres', 'Ramírez', 'Cruz', 'Flores', 'Morales'][i],
  cedula: `001-${String(i + 1).padStart(7, '0')}-1`,
  telefono: `809-${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
  ciudad: ['Santo Domingo', 'Santiago', 'La Vega', 'San Pedro', 'La Romana'][i % 5],
  estado: ['ACTIVO', 'ACTIVO', 'ACTIVO', 'MOROSO', 'ACTIVO', 'ACTIVO', 'INACTIVO', 'ACTIVO', 'MOROSO', 'ACTIVO', 'ACTIVO', 'BLOQUEADO'][i] as any,
  scoreRiesgo: [92, 78, 95, 45, 88, 72, 60, 85, 38, 91, 76, 30][i],
  totalPrestado: [480000, 350000, 290000, 260000, 240000, 180000, 150000, 320000, 200000, 410000, 270000, 130000][i],
  totalPagado: [220000, 180000, 290000, 100000, 95000, 180000, 80000, 200000, 60000, 300000, 140000, 50000][i],
  saldoPendiente: [260000, 170000, 0, 160000, 145000, 0, 70000, 120000, 140000, 110000, 130000, 80000][i],
  prestamosActivos: [3, 2, 0, 1, 2, 0, 1, 2, 1, 2, 1, 1][i],
  createdAt: new Date(2024, i % 12, (i * 3 + 1) % 28 + 1).toISOString(),
}))

const estadoIcons: Record<string, React.ElementType> = {
  ACTIVO: CheckCircle,
  INACTIVO: Clock,
  BLOQUEADO: XCircle,
  MOROSO: AlertTriangle,
}

export default function ClientesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('todos')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = mockClientes.filter(c => {
    const matchSearch = search === '' ||
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
      c.cedula.includes(search) ||
      c.telefono.includes(search)
    const matchEstado = estado === 'todos' || c.estado === estado
    return matchSearch && matchEstado
  })

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

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
          <Link href="/dashboard/clientes/nuevo" className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: mockClientes.length, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'Activos', value: mockClientes.filter(c => c.estado === 'ACTIVO').length, color: 'text-green-500', bg: 'bg-green-500/5' },
          { label: 'Morosos', value: mockClientes.filter(c => c.estado === 'MOROSO').length, color: 'text-orange-500', bg: 'bg-orange-500/5' },
          { label: 'Bloqueados', value: mockClientes.filter(c => c.estado === 'BLOQUEADO').length, color: 'text-red-500', bg: 'bg-red-500/5' },
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
                estado === e
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border hover:bg-accent'
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
                <th className="h-11 w-10 px-4">
                  <input type="checkbox" className="rounded" />
                </th>
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
                const EstadoIcon = estadoIcons[cliente.estado]
                return (
                  <tr key={cliente.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cliente.id)}
                        onChange={() => toggleSelect(cliente.id)}
                        className="rounded"
                      />
                    </td>
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
                      <p className="text-sm font-semibold">{formatCurrency(cliente.saldoPendiente)}</p>
                      <p className="text-xs text-muted-foreground">
                        {cliente.prestamosActivos} préstamo{cliente.prestamosActivos !== 1 ? 's' : ''}
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
                        <Link href={`/dashboard/clientes/${cliente.id}`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Ver detalle">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/dashboard/clientes/${cliente.id}?edit=1`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => { if(confirm('¿Eliminar este cliente?')) alert('Cliente eliminado') }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Mostrando {filtered.length} de {mockClientes.length} clientes
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-50 transition-colors" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
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
            <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors" onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
