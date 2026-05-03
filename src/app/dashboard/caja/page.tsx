'use client'

import { useState } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import {
  Plus, Download, TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, ArrowDownRight, Lock, RefreshCw,
  DollarSign, Receipt, ChevronLeft, ChevronRight,
  Calendar, Filter
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const mockMovimientos = [
  { id: '1', tipo: 'INGRESO', concepto: 'Cobro préstamo PRE-00001 - María González', monto: 8500, fecha: new Date(2025, 3, 28, 9, 15).toISOString(), usuario: 'Juan Pérez' },
  { id: '2', tipo: 'EGRESO', concepto: 'Desembolso préstamo PRE-00022 - Carlos Rodríguez', monto: -80000, fecha: new Date(2025, 3, 28, 10, 30).toISOString(), usuario: 'Admin' },
  { id: '3', tipo: 'INGRESO', concepto: 'Cobro préstamo PRE-00004 - Ana Martínez', monto: 15000, fecha: new Date(2025, 3, 28, 11, 0).toISOString(), usuario: 'Juan Pérez' },
  { id: '4', tipo: 'GASTO', concepto: 'Gastos operativos - Papelería', monto: -2500, fecha: new Date(2025, 3, 28, 11, 45).toISOString(), usuario: 'Admin' },
  { id: '5', tipo: 'INGRESO', concepto: 'Cobro préstamo PRE-00007 - Pedro López', monto: 6200, fecha: new Date(2025, 3, 28, 14, 0).toISOString(), usuario: 'Juan Pérez' },
  { id: '6', tipo: 'RETIRO', concepto: 'Retiro de capital - Socio', monto: -50000, fecha: new Date(2025, 3, 28, 15, 30).toISOString(), usuario: 'Admin' },
  { id: '7', tipo: 'INGRESO', concepto: 'Cobro préstamo PRE-00010 - Luisa Fernández', monto: 9800, fecha: new Date(2025, 3, 28, 16, 0).toISOString(), usuario: 'Pedro Gómez' },
  { id: '8', tipo: 'EGRESO', concepto: 'Desembolso préstamo PRE-00023 - José García', monto: -45000, fecha: new Date(2025, 3, 27, 9, 0).toISOString(), usuario: 'Admin' },
]

const semanalData = [
  { dia: 'Lun', ingresos: 45000, egresos: 120000 },
  { dia: 'Mar', ingresos: 62000, egresos: 80000 },
  { dia: 'Mié', ingresos: 38000, egresos: 45000 },
  { dia: 'Jue', ingresos: 71000, egresos: 90000 },
  { dia: 'Vie', ingresos: 55000, egresos: 60000 },
  { dia: 'Sáb', ingresos: 29000, egresos: 30000 },
  { dia: 'Dom', ingresos: 12000, egresos: 0 },
]

const tipoConfig: Record<string, { label: string; color: string; icon: React.ElementType; textColor: string }> = {
  INGRESO: { label: 'Ingreso', color: 'bg-green-500/10 text-green-500', icon: ArrowDownRight, textColor: 'text-green-500' },
  EGRESO: { label: 'Egreso', color: 'bg-red-500/10 text-red-500', icon: ArrowUpRight, textColor: 'text-red-500' },
  GASTO: { label: 'Gasto', color: 'bg-orange-500/10 text-orange-500', icon: TrendingDown, textColor: 'text-orange-500' },
  RETIRO: { label: 'Retiro', color: 'bg-purple-500/10 text-purple-500', icon: TrendingDown, textColor: 'text-purple-500' },
  DEPOSITO: { label: 'Depósito', color: 'bg-blue-500/10 text-blue-500', icon: ArrowDownRight, textColor: 'text-blue-500' },
}

export default function CajaPage() {
  const [tab, setTab] = useState<'hoy' | 'semana' | 'mes'>('hoy')
  const [showCierre, setShowCierre] = useState(false)
  const [showNuevoMov, setShowNuevoMov] = useState(false)
  const [loadingMov, setLoadingMov] = useState(false)
  const [formMov, setFormMov] = useState({ tipo: 'INGRESO', concepto: '', monto: '', referencia: '', fecha: new Date().toISOString().split('T')[0] })

  const ingresos = mockMovimientos.filter(m => m.monto > 0).reduce((s, m) => s + m.monto, 0)
  const egresos = Math.abs(mockMovimientos.filter(m => m.monto < 0).reduce((s, m) => s + m.monto, 0))
  const balance = ingresos - egresos

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Caja y Movimientos</h1>
          <p className="text-sm text-muted-foreground">Control de flujo de efectivo</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <Download className="h-4 w-4" /> Exportar
          </button>
          <button
            onClick={() => setShowCierre(true)}
            className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-500 hover:bg-orange-500/20 transition-colors"
          >
            <Lock className="h-4 w-4" /> Cerrar Caja
          </button>
          <button onClick={() => setShowNuevoMov(true)} className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90">
            <Plus className="h-4 w-4" /> Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Ingresos del día</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10">
              <ArrowDownRight className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-500">{formatCurrency(ingresos)}</p>
          <p className="text-xs text-muted-foreground mt-1">{mockMovimientos.filter(m => m.monto > 0).length} transacciones</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Egresos del día</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
              <ArrowUpRight className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(egresos)}</p>
          <p className="text-xs text-muted-foreground mt-1">{mockMovimientos.filter(m => m.monto < 0).length} transacciones</p>
        </div>

        <div className={`rounded-xl border p-5 ${balance >= 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Balance neto</p>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${balance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <Wallet className={`h-5 w-5 ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Saldo de caja hoy</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Flujo semanal</h3>
            <p className="text-xs text-muted-foreground">Ingresos vs Egresos</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-green-500 inline-block" /> Ingresos</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500 inline-block" /> Egresos</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={semanalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: 12 }}
              formatter={(v: any) => [formatCurrency(v), '']}
            />
            <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Movements table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Movimientos de hoy</h3>
          <div className="flex items-center gap-1">
            {(['hoy', 'semana', 'mes'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              >
                {t === 'hoy' ? 'Hoy' : t === 'semana' ? 'Esta semana' : 'Este mes'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y">
          {mockMovimientos.map(mov => {
            const cfg = tipoConfig[mov.tipo] || tipoConfig.INGRESO
            const Icon = cfg.icon
            return (
              <div key={mov.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{mov.concepto}</p>
                  <p className="text-xs text-muted-foreground">{mov.usuario} · {formatDateTime(mov.fecha)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${cfg.textColor}`}>
                    {mov.monto > 0 ? '+' : ''}{formatCurrency(mov.monto)}
                  </p>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cierre de caja modal */}
      {showNuevoMov && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">Nuevo Movimiento de Caja</h2>
              <button onClick={() => setShowNuevoMov(false)} className="rounded-lg p-1.5 hover:bg-accent transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); if (!formMov.concepto || !formMov.monto) return; setLoadingMov(true); await new Promise(r => setTimeout(r,700)); setLoadingMov(false); setShowNuevoMov(false); alert(`Movimiento de ${formMov.tipo} por RD$ ${parseFloat(formMov.monto).toLocaleString()} registrado`) }} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de movimiento</label>
                <select value={formMov.tipo} onChange={e => setFormMov(f => ({...f, tipo: e.target.value}))} className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50">
                  {['INGRESO','EGRESO','RETIRO','DEPOSITO','GASTO'].map(t => <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Concepto *</label>
                <input value={formMov.concepto} onChange={e => setFormMov(f => ({...f, concepto: e.target.value}))} required placeholder="Descripción del movimiento" className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Monto (RD$) *</label>
                  <input type="number" value={formMov.monto} onChange={e => setFormMov(f => ({...f, monto: e.target.value}))} required min="1" step="0.01" placeholder="0.00" className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Fecha</label>
                  <input type="date" value={formMov.fecha} onChange={e => setFormMov(f => ({...f, fecha: e.target.value}))} className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Referencia (opcional)</label>
                <input value={formMov.referencia} onChange={e => setFormMov(f => ({...f, referencia: e.target.value}))} placeholder="Número de referencia..." className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowNuevoMov(false)} className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">Cancelar</button>
                <button type="submit" disabled={loadingMov} className="flex-1 flex items-center justify-center gap-2 rounded-lg brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70">
                  {loadingMov ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> Registrar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                <Lock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-bold">Cerrar Caja</h2>
                <p className="text-xs text-muted-foreground">Resumen del día</p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-muted/50 p-4 mb-5">
              {[
                { label: 'Saldo inicial', value: formatCurrency(200000) },
                { label: 'Total ingresos', value: formatCurrency(ingresos), color: 'text-green-500' },
                { label: 'Total egresos', value: formatCurrency(egresos), color: 'text-red-500' },
                { label: 'Saldo final', value: formatCurrency(200000 + balance), color: balance >= 0 ? 'text-green-500' : 'text-red-500' },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-semibold ${row.color || ''}`}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCierre(false)} className="flex-1 rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors">
                Cancelar
              </button>
              <button className="flex-1 rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold hover:bg-orange-600 transition-colors">
                Confirmar cierre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
