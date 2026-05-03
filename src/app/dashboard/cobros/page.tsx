'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Download, Eye, Printer, Filter,
  ChevronLeft, ChevronRight, CheckCircle2, Clock,
  DollarSign, TrendingUp, Wallet, CreditCard,
  Phone, MessageCircle, Loader2
} from 'lucide-react'
import { formatCurrency, formatDateTime, getInitials } from '@/utils'

const mockCobros = Array.from({ length: 12 }, (_, i) => ({
  id: `${i + 1}`,
  codigo: `PAG-${String(i + 1).padStart(5, '0')}`,
  prestamoCodigo: `PRE-${String((i % 5) + 1).padStart(5, '0')}`,
  cliente: {
    nombre: ['María', 'Carlos', 'Ana', 'Pedro', 'Luisa', 'José', 'Carmen', 'Miguel', 'Rosa', 'Luis', 'Elena', 'Diego'][i],
    apellido: ['González', 'Rodríguez', 'Martínez', 'López', 'Fernández', 'García', 'Sánchez', 'Torres', 'Ramírez', 'Cruz', 'Flores', 'Morales'][i],
    telefono: '809-555-0' + String(i + 1).padStart(3, '0'),
  },
  monto: [8500, 12000, 6200, 15000, 9800, 7400, 11000, 5500, 18000, 8200, 13500, 6800][i],
  montoCapital: [7200, 10100, 5200, 12600, 8300, 6200, 9200, 4600, 15200, 6900, 11400, 5700][i],
  montoInteres: [1000, 1500, 800, 1800, 1200, 900, 1400, 700, 2200, 1000, 1700, 800][i],
  montoMora: [300, 400, 200, 600, 300, 300, 400, 200, 600, 300, 400, 300][i],
  metodoPago: ['EFECTIVO', 'TRANSFERENCIA', 'EFECTIVO', 'TARJETA', 'EFECTIVO', 'TRANSFERENCIA', 'EFECTIVO', 'EFECTIVO', 'TRANSFERENCIA', 'EFECTIVO', 'TARJETA', 'EFECTIVO'][i] as any,
  cobradoPor: { nombre: 'Juan', apellido: 'Pérez' },
  fechaPago: new Date(2025, 3, 28 - i, 10 + i).toISOString(),
  reciboGenerado: i % 3 !== 0,
}))

const metodoPagoLabel: Record<string, { label: string; color: string }> = {
  EFECTIVO: { label: 'Efectivo', color: 'bg-green-500/10 text-green-500' },
  TRANSFERENCIA: { label: 'Transferencia', color: 'bg-blue-500/10 text-blue-500' },
  TARJETA: { label: 'Tarjeta', color: 'bg-purple-500/10 text-purple-500' },
  CHEQUE: { label: 'Cheque', color: 'bg-yellow-500/10 text-yellow-500' },
}

export default function CobrosPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formPago, setFormPago] = useState({
    prestamoId: '',
    monto: '',
    metodoPago: 'EFECTIVO',
    referencia: '',
    notas: '',
    fechaPago: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)

  const totalHoy = mockCobros.slice(0, 6).reduce((s, c) => s + c.monto, 0)
  const totalMora = mockCobros.reduce((s, c) => s + c.montoMora, 0)

  const filtered = mockCobros.filter(c =>
    search === '' ||
    c.codigo.includes(search) ||
    `${c.cliente.nombre} ${c.cliente.apellido}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleRegistrarPago = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formPago.prestamoId || !formPago.monto) { alert('Código de préstamo y monto son requeridos'); return }
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1000)) // simulate API
      setShowModal(false)
      alert(`Pago de RD$ ${parseFloat(formPago.monto).toLocaleString()} registrado exitosamente`)
      setFormPago({ prestamoId: '', monto: '', metodoPago: 'EFECTIVO', referencia: '', notas: '', fechaPago: new Date().toISOString().split('T')[0] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cobros y Pagos</h1>
          <p className="text-sm text-muted-foreground">Registro y gestión de recaudos</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <Download className="h-4 w-4" /> Exportar
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Registrar Cobro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Cobrado hoy', value: formatCurrency(totalHoy), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Cobros del mes', value: formatCurrency(2840000), icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Mora cobrada', value: formatCurrency(totalMora), icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Total cobros hoy', value: '6', icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cobro o cliente..."
          className="h-10 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="h-11 px-4 text-left">Comprobante</th>
                <th className="h-11 px-4 text-left">Cliente</th>
                <th className="h-11 px-4 text-right">Monto</th>
                <th className="h-11 px-4 text-left hidden md:table-cell">Desglose</th>
                <th className="h-11 px-4 text-center hidden sm:table-cell">Método</th>
                <th className="h-11 px-4 text-left hidden lg:table-cell">Cobrador</th>
                <th className="h-11 px-4 text-left hidden xl:table-cell">Fecha</th>
                <th className="h-11 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(cobro => (
                <tr key={cobro.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono font-semibold text-primary">{cobro.codigo}</p>
                    <p className="text-xs text-muted-foreground">{cobro.prestamoCodigo}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full brand-gradient text-[10px] font-bold text-white">
                        {getInitials(cobro.cliente.nombre, cobro.cliente.apellido)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cobro.cliente.nombre} {cobro.cliente.apellido}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />{cobro.cliente.telefono}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-semibold text-green-500">+{formatCurrency(cobro.monto)}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      <p>Capital: {formatCurrency(cobro.montoCapital)}</p>
                      <p>Interés: {formatCurrency(cobro.montoInteres)}</p>
                      {cobro.montoMora > 0 && <p className="text-orange-500">Mora: {formatCurrency(cobro.montoMora)}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex justify-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${metodoPagoLabel[cobro.metodoPago]?.color || 'bg-muted'}`}>
                        {metodoPagoLabel[cobro.metodoPago]?.label || cobro.metodoPago}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-xs">{cobro.cobradoPor.nombre} {cobro.cobradoPor.apellido}</p>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <p className="text-xs text-muted-foreground">{formatDateTime(cobro.fechaPago)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Imprimir recibo">
                        <Printer className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-green-500/10 hover:text-green-500 transition-colors" title="Enviar WhatsApp">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">Mostrando {filtered.length} cobros</p>
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-1.5 hover:bg-accent transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <button className="h-7 w-7 rounded-lg bg-primary text-primary-foreground text-xs">1</button>
            <button className="h-7 w-7 rounded-lg hover:bg-accent text-xs">2</button>
            <button className="rounded-lg p-1.5 hover:bg-accent transition-colors"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Modal - Registrar Cobro */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold">Registrar Cobro</h2>
                <p className="text-sm text-muted-foreground">Registra un abono o pago completo</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-accent transition-colors">
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <form onSubmit={handleRegistrarPago} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Código de Préstamo</label>
                <input
                  value={formPago.prestamoId}
                  onChange={e => setFormPago(f => ({ ...f, prestamoId: e.target.value }))}
                  placeholder="PRE-00001"
                  required
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Monto a cobrar (RD$)</label>
                <input
                  type="number"
                  value={formPago.monto}
                  onChange={e => setFormPago(f => ({ ...f, monto: e.target.value }))}
                  placeholder="0.00"
                  required
                  min="1"
                  step="0.01"
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Método de pago</label>
                  <select
                    value={formPago.metodoPago}
                    onChange={e => setFormPago(f => ({ ...f, metodoPago: e.target.value }))}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE'].map(m => (
                      <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Fecha de pago</label>
                  <input
                    type="date"
                    value={formPago.fechaPago}
                    onChange={e => setFormPago(f => ({ ...f, fechaPago: e.target.value }))}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {formPago.metodoPago !== 'EFECTIVO' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Referencia / Número de confirmación</label>
                  <input
                    value={formPago.referencia}
                    onChange={e => setFormPago(f => ({ ...f, referencia: e.target.value }))}
                    placeholder="Número de transferencia..."
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notas (opcional)</label>
                <textarea
                  value={formPago.notas}
                  onChange={e => setFormPago(f => ({ ...f, notas: e.target.value }))}
                  rows={2}
                  placeholder="Observaciones del cobro..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : 'Registrar Cobro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
