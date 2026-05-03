// src/app/dashboard/prestamos/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Filter, Download, Eye, Edit, RefreshCw,
  ChevronLeft, ChevronRight, CreditCard, AlertTriangle,
  CheckCircle, Clock, TrendingDown, Calendar, User, DollarSign
} from 'lucide-react'
import { formatCurrency, formatDate, getEstadoPrestamoColor, getInitials } from '@/utils'

const mockPrestamos = Array.from({ length: 15 }, (_, i) => ({
  id: `${i + 1}`,
  codigo: `PRE-${String(i + 1).padStart(5, '0')}`,
  cliente: {
    nombre: ['María', 'Carlos', 'Ana', 'Pedro', 'Luisa', 'José', 'Carmen', 'Miguel', 'Rosa', 'Luis', 'Elena', 'Diego', 'Sofía', 'Rafael', 'Laura'][i],
    apellido: ['González', 'Rodríguez', 'Martínez', 'López', 'Fernández', 'García', 'Sánchez', 'Torres', 'Ramírez', 'Cruz', 'Flores', 'Morales', 'Jiménez', 'Ruiz', 'Díaz'][i],
    foto: null,
  },
  tipo: ['PRESTAMO_PERSONAL', 'VENTA_CREDITO', 'PRESTAMO_PERSONAL', 'HIPOTECARIO', 'PRESTAMO_PERSONAL'][i % 5] as any,
  estado: ['ACTIVO', 'ACTIVO', 'VENCIDO', 'PAGADO', 'ACTIVO', 'VENCIDO', 'ACTIVO', 'PAGADO', 'ACTIVO', 'ACTIVO', 'VENCIDO', 'PAGADO', 'ACTIVO', 'ACTIVO', 'VENCIDO'][i] as any,
  capital: [50000, 80000, 30000, 200000, 45000, 60000, 100000, 75000, 25000, 90000, 40000, 120000, 55000, 70000, 35000][i],
  interes: [10, 12, 15, 8, 10, 12, 10, 8, 15, 10, 12, 10, 15, 10, 12][i],
  montoCuota: [5500, 7467, 3163, 18000, 4950, 5600, 9167, 6750, 2588, 8250, 3800, 10900, 5271, 6417, 3267][i],
  saldoPendiente: [38500, 52268, 19000, 0, 31350, 28000, 64170, 0, 12500, 57750, 24000, 0, 36900, 44917, 22870][i],
  numeroCuotas: [12, 12, 10, 24, 12, 12, 12, 12, 10, 12, 10, 12, 12, 12, 10][i],
  cuotasPagadas: [7, 7, 6, 24, 7, 5, 7, 12, 5, 7, 6, 12, 7, 7, 6][i],
  frecuencia: ['MENSUAL', 'MENSUAL', 'SEMANAL', 'MENSUAL', 'QUINCENAL'][i % 5] as any,
  fechaDesembolso: new Date(2024, i % 12, (i * 2 + 1) % 28 + 1).toISOString(),
  fechaVencimiento: new Date(2025, (i + 1) % 12, (i * 2 + 1) % 28 + 1).toISOString(),
  moraAcumulada: [0, 0, 4500, 0, 0, 7200, 0, 0, 0, 0, 3600, 0, 0, 0, 2800][i],
}))

const tipoLabels: Record<string, string> = {
  PRESTAMO_PERSONAL: 'Personal',
  VENTA_CREDITO: 'Venta Crédito',
  HIPOTECARIO: 'Hipotecario',
  PRENDARIO: 'Prendario',
}

const frecuenciaLabels: Record<string, string> = {
  DIARIO: 'Diario',
  SEMANAL: 'Semanal',
  QUINCENAL: 'Quincenal',
  MENSUAL: 'Mensual',
}

export default function PrestamosPage() {
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('todos')

  const filtered = mockPrestamos.filter(p => {
    const matchSearch = search === '' ||
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      `${p.cliente.nombre} ${p.cliente.apellido}`.toLowerCase().includes(search.toLowerCase())
    const matchEstado = estado === 'todos' || p.estado === estado
    return matchSearch && matchEstado
  })

  const totalCartera = filtered.reduce((sum, p) => sum + p.saldoPendiente, 0)
  const totalMora = filtered.reduce((sum, p) => sum + p.moraAcumulada, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Préstamos</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} préstamos — Cartera: {formatCurrency(totalCartera)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <Download className="h-4 w-4" /> Exportar
          </button>
          <Link href="/dashboard/prestamos/nuevo" className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90">
            <Plus className="h-4 w-4" /> Nuevo Préstamo
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total activos', value: mockPrestamos.filter(p => p.estado === 'ACTIVO').length, sub: formatCurrency(mockPrestamos.filter(p => p.estado === 'ACTIVO').reduce((s, p) => s + p.saldoPendiente, 0)), color: 'text-blue-500' },
          { label: 'Vencidos', value: mockPrestamos.filter(p => p.estado === 'VENCIDO').length, sub: `Mora: ${formatCurrency(totalMora)}`, color: 'text-red-500' },
          { label: 'Pagados', value: mockPrestamos.filter(p => p.estado === 'PAGADO').length, sub: 'Completados', color: 'text-green-500' },
          { label: 'Cartera total', value: formatCurrency(totalCartera, ''), sub: 'Saldo pendiente', color: 'text-primary' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por código, cliente..."
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['todos', 'ACTIVO', 'VENCIDO', 'PAGADO', 'REFINANCIADO'].map((e) => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                estado === e ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'
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
                <th className="h-11 px-4 text-left">Código / Cliente</th>
                <th className="h-11 px-4 text-left hidden md:table-cell">Tipo</th>
                <th className="h-11 px-4 text-right hidden sm:table-cell">Capital</th>
                <th className="h-11 px-4 text-right hidden lg:table-cell">Cuota</th>
                <th className="h-11 px-4 text-right">Saldo</th>
                <th className="h-11 px-4 text-left hidden xl:table-cell">Progreso</th>
                <th className="h-11 px-4 text-center">Estado</th>
                <th className="h-11 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => {
                const estadoClass = getEstadoPrestamoColor(p.estado)
                const progreso = (p.cuotasPagadas / p.numeroCuotas) * 100
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-mono font-semibold text-primary">{p.codigo}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                            {getInitials(p.cliente.nombre, p.cliente.apellido)}
                          </div>
                          <span className="text-sm">{p.cliente.nombre} {p.cliente.apellido}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium">
                        {tipoLabels[p.tipo]}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">{frecuenciaLabels[p.frecuencia]}</p>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <p className="text-sm font-medium">{formatCurrency(p.capital)}</p>
                      <p className="text-xs text-muted-foreground">{p.interes}% interés</p>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <p className="text-sm font-medium">{formatCurrency(p.montoCuota)}</p>
                      <p className="text-xs text-muted-foreground">{p.cuotasPagadas}/{p.numeroCuotas} cuotas</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className={`text-sm font-semibold ${p.saldoPendiente === 0 ? 'text-green-500' : ''}`}>
                        {formatCurrency(p.saldoPendiente)}
                      </p>
                      {p.moraAcumulada > 0 && (
                        <p className="text-xs text-red-500">+{formatCurrency(p.moraAcumulada)} mora</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${p.estado === 'PAGADO' ? 'bg-green-500' : p.estado === 'VENCIDO' ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${progreso}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{progreso.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${estadoClass}`}>
                          {p.estado}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/prestamos/${p.id}`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Ver detalle">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link href={`/dashboard/cobros?prestamoId=${p.id}`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Registrar pago">
                          <DollarSign className="h-4 w-4" />
                        </Link>
                        {p.estado !== 'PAGADO' && (
                          <Link href={`/dashboard/prestamos/${p.id}?refinanciar=1`} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Refinanciar">
                            <RefreshCw className="h-4 w-4" />
                          </Link>
                        )}
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
            Mostrando {filtered.length} préstamos
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-1.5 hover:bg-accent transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-7 w-7 rounded-lg bg-primary text-primary-foreground text-xs font-medium">1</button>
            <button className="h-7 w-7 rounded-lg hover:bg-accent text-xs font-medium">2</button>
            <button className="rounded-lg p-1.5 hover:bg-accent transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
