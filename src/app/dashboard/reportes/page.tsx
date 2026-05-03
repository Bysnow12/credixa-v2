'use client'

import { useState } from 'react'
import {
  Download, FileText, FileSpreadsheet, Calendar,
  TrendingUp, Users, AlertTriangle, BarChart2,
  RefreshCw, Filter, ChevronDown
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'

const moraData = [
  { rango: '1-7 días', cantidad: 12, monto: 145000, color: '#f59e0b' },
  { rango: '8-15 días', cantidad: 8, monto: 98000, color: '#f97316' },
  { rango: '16-30 días', cantidad: 6, monto: 76000, color: '#ef4444' },
  { rango: '+30 días', cantidad: 4, monto: 52000, color: '#dc2626' },
]

const carteraEdad = [
  { name: 'Al día', value: 65, color: '#22c55e' },
  { name: '1-15 días', value: 18, color: '#f59e0b' },
  { name: '16-30 días', value: 10, color: '#f97316' },
  { name: '+30 días', value: 7, color: '#ef4444' },
]

const mensualCompleto = [
  { mes: 'Nov', cartera: 3200000, cobrado: 420000, mora: 65000, nuevos: 680000 },
  { mes: 'Dic', cartera: 3800000, cobrado: 540000, mora: 82000, nuevos: 920000 },
  { mes: 'Ene', cartera: 4100000, cobrado: 490000, mora: 71000, nuevos: 750000 },
  { mes: 'Feb', cartera: 4600000, cobrado: 620000, mora: 95000, nuevos: 1100000 },
  { mes: 'Mar', cartera: 4900000, cobrado: 710000, mora: 88000, nuevos: 980000 },
  { mes: 'Abr', cartera: 4850000, cobrado: 830000, mora: 73000, nuevos: 1240000 },
]

const vendedoresData = [
  { nombre: 'Juan Pérez', prestamos: 42, cobrado: 380000, comisiones: 19000, efectividad: 94 },
  { nombre: 'Pedro Gómez', prestamos: 38, cobrado: 310000, comisiones: 15500, efectividad: 89 },
  { nombre: 'Carmen Rosa', prestamos: 31, cobrado: 265000, comisiones: 13250, efectividad: 86 },
  { nombre: 'Luis Torres', prestamos: 24, cobrado: 198000, comisiones: 9900, efectividad: 79 },
]

const COLORS_MORA = ['#f59e0b', '#f97316', '#ef4444', '#dc2626']

const reportTypes = [
  { id: 'mora', label: 'Reporte de Mora', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'clientes', label: 'Reporte de Clientes', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'vendedores', label: 'Reporte Vendedores', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'financiero', label: 'Reporte Financiero', icon: BarChart2, color: 'text-primary', bg: 'bg-primary/10' },
]

export default function ReportesPage() {
  const [activeReport, setActiveReport] = useState('financiero')
  const [fechaInicio, setFechaInicio] = useState('2025-01-01')
  const [fechaFin, setFechaFin] = useState('2025-04-28')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes Avanzados</h1>
          <p className="text-sm text-muted-foreground">Análisis completo de tu cartera</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const data = [
                { Reporte: activeReport, Periodo: `${fechaInicio} al ${fechaFin}`, Generado: new Date().toLocaleString('es-DO') }
              ]
              const csv = Object.keys(data[0]).join(',') + '\n' + data.map(r => Object.values(r).join(',')).join('\n')
              const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
              a.download = `reporte_${activeReport}_${fechaInicio}.csv`; a.click()
            }}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <FileSpreadsheet className="h-4 w-4 text-green-600" /> Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <FileText className="h-4 w-4 text-red-500" /> PDF
          </button>
          <button
            onClick={() => { window.location.reload() }}
            className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </button>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Período:</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          <span className="text-muted-foreground text-sm">hasta</span>
          <input
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-1 ml-auto">
          {['Hoy', '7d', '30d', '90d', 'Año'].map(r => (
            <button key={r} className="rounded-lg px-3 py-1.5 text-xs font-medium border hover:bg-accent transition-colors">
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {reportTypes.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
              activeReport === r.id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'bg-card hover:bg-accent'
            }`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${r.bg}`}>
              <r.icon className={`h-4 w-4 ${r.color}`} />
            </div>
            <span className="text-sm font-medium leading-tight">{r.label}</span>
          </button>
        ))}
      </div>

      {/* Report content */}
      {activeReport === 'financiero' && (
        <div className="grid gap-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Cartera total', value: formatCurrency(4850000), sub: '+4.1% vs mes ant.' },
              { label: 'Cobrado en período', value: formatCurrency(3610000), sub: '74.4% recuperado' },
              { label: 'Mora total', value: formatCurrency(371000), sub: '7.6% de cartera' },
              { label: 'Nuevas colocaciones', value: formatCurrency(5670000), sub: '6 meses acumulado' },
            ].map(k => (
              <div key={k.label} className="rounded-xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-xl font-bold mt-1">{k.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Tendencia mensual */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold mb-4">Tendencia de Cartera</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mensualCompleto}>
                  <defs>
                    <linearGradient id="gradCartera" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(243 75% 59%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(243 75% 59%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: any) => [formatCurrency(v), '']} contentStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="cartera" name="Cartera" stroke="hsl(243 75% 59%)" fill="url(#gradCartera)" strokeWidth={2} />
                  <Bar dataKey="cobrado" name="Cobrado" fill="#22c55e" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Cartera por edad */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold mb-4">Cartera por Antigüedad</h3>
              <div className="flex items-center justify-center mb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={carteraEdad} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {carteraEdad.map((e, idx) => (
                        <Cell key={idx} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {carteraEdad.map(e => (
                  <div key={e.name} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: e.color }} />
                    <span className="text-muted-foreground">{e.name}</span>
                    <span className="font-semibold ml-auto">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'mora' && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-4">
            {moraData.map(m => (
              <div key={m.rango} className="rounded-xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">{m.rango}</p>
                <p className="text-xl font-bold mt-1" style={{ color: m.color }}>{m.cantidad} clientes</p>
                <p className="text-sm font-medium text-muted-foreground">{formatCurrency(m.monto)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-4">Distribución de Mora por Rangos</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={moraData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="rango" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any, name: string) => name === 'monto' ? [formatCurrency(v), 'Monto'] : [v, 'Clientes']} />
                <Bar dataKey="cantidad" name="Clientes" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mora table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Detalle de Clientes en Mora</h3>
            </div>
            <table className="w-full data-table">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="h-10 px-4 text-left">Cliente</th>
                  <th className="h-10 px-4 text-left">Préstamo</th>
                  <th className="h-10 px-4 text-right">Saldo</th>
                  <th className="h-10 px-4 text-right">Mora</th>
                  <th className="h-10 px-4 text-right">Días</th>
                  <th className="h-10 px-4 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { cliente: 'Pedro López', prestamo: 'PRE-00004', saldo: 160000, mora: 9600, dias: 12 },
                  { cliente: 'Rosa Ramírez', prestamo: 'PRE-00009', saldo: 140000, mora: 18200, dias: 26 },
                  { cliente: 'José García', prestamo: 'PRE-00012', saldo: 88000, mora: 5280, dias: 6 },
                  { cliente: 'Luis Cruz', prestamo: 'PRE-00007', saldo: 70000, mora: 8400, dias: 18 },
                ].map(row => (
                  <tr key={row.prestamo} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{row.cliente}</td>
                    <td className="px-4 py-3 text-xs font-mono text-primary">{row.prestamo}</td>
                    <td className="px-4 py-3 text-right text-sm">{formatCurrency(row.saldo)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-red-500">{formatCurrency(row.mora)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${row.dias > 15 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {row.dias}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => alert(`Gestionando mora del cliente ${row.cliente}`)} className="text-xs text-primary hover:underline">Gestionar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'vendedores' && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Rendimiento por Vendedor</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="h-10 px-4 text-left">Vendedor</th>
                    <th className="h-10 px-4 text-right">Préstamos</th>
                    <th className="h-10 px-4 text-right">Cobrado</th>
                    <th className="h-10 px-4 text-right">Comisiones</th>
                    <th className="h-10 px-4 text-center">Efectividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vendedoresData.map(v => (
                    <tr key={v.nombre} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{v.nombre}</td>
                      <td className="px-4 py-3 text-right text-sm">{v.prestamos}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-green-500">{formatCurrency(v.cobrado)}</td>
                      <td className="px-4 py-3 text-right text-sm">{formatCurrency(v.comisiones)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${v.efectividad}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-primary">{v.efectividad}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-4">Cobros por Vendedor</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vendedoresData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v: any) => [formatCurrency(v), 'Cobrado']} />
                <Bar dataKey="cobrado" name="Cobrado" fill="hsl(243 75% 59%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReport === 'clientes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Total clientes', value: '384', color: 'text-foreground' },
              { label: 'Activos', value: '284', color: 'text-green-500' },
              { label: 'Morosos', value: '23', color: 'text-orange-500' },
              { label: 'Score promedio', value: '74/100', color: 'text-primary' },
            ].map(k => (
              <div key={k.label} className="rounded-xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-4">Nuevos clientes por mes</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[
                { mes: 'Nov', nuevos: 28 }, { mes: 'Dic', nuevos: 35 }, { mes: 'Ene', nuevos: 22 },
                { mes: 'Feb', nuevos: 41 }, { mes: 'Mar', nuevos: 37 }, { mes: 'Abr', nuevos: 48 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="nuevos" name="Nuevos clientes" fill="hsl(243 75% 59%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
