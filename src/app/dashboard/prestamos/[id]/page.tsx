'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, DollarSign, RefreshCw, FileText, MessageCircle,
  CheckCircle2, Clock, AlertTriangle, XCircle, Printer,
  Calendar, User, TrendingUp, Loader2, ChevronDown
} from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime, getInitials, getEstadoPrestamoColor } from '@/utils'

// ─── Mock data ─────────────────────────────────────────────────
const mockPrestamo = {
  id: '1',
  codigo: 'PRE-00001',
  tipo: 'PRESTAMO_PERSONAL',
  estado: 'ACTIVO',
  capital: 50000,
  interes: 10,
  montoInteres: 5000,
  montoTotal: 55000,
  montoPagado: 38500,
  saldoPendiente: 16500,
  tasaMora: 2,
  moraAcumulada: 0,
  frecuencia: 'MENSUAL',
  numeroCuotas: 12,
  montoCuota: 4583.33,
  cuotasPagadas: 7,
  cuotasPendientes: 5,
  fechaDesembolso: '2024-05-15',
  fechaPrimerPago: '2024-06-15',
  fechaVencimiento: '2025-05-15',
  fechaUltimoPago: '2024-11-15',
  notas: 'Cliente confiable, primer préstamo.',
  cliente: {
    id: 'c1',
    nombre: 'María',
    apellido: 'González',
    cedula: '001-1234567-1',
    telefono: '809-555-1001',
    scoreRiesgo: 92,
    estado: 'ACTIVO',
  },
  vendedor: {
    id: 'v1',
    usuario: { nombre: 'Juan', apellido: 'Pérez' },
    zona: 'Zona Norte',
  },
  creadoPor: { nombre: 'Admin', apellido: 'Principal' },
  cuotas: Array.from({ length: 12 }, (_, i) => ({
    id: `cuota-${i + 1}`,
    numero: i + 1,
    monto: 4583.33,
    montoPagado: i < 7 ? 4583.33 : 0,
    saldo: i < 7 ? 0 : 4583.33,
    fechaVence: new Date(2024, 5 + i, 15).toISOString(),
    fechaPago: i < 7 ? new Date(2024, 5 + i, 13).toISOString() : null,
    estado: i < 7 ? 'PAGADA' : i === 7 ? 'PENDIENTE' : 'PENDIENTE',
    mora: 0,
  })),
  pagos: Array.from({ length: 7 }, (_, i) => ({
    id: `pago-${i + 1}`,
    codigo: `PAG-${String(i + 1).padStart(5, '0')}`,
    monto: 4583.33,
    montoCapital: 3800,
    montoInteres: 583.33,
    montoMora: 0,
    metodoPago: i % 2 === 0 ? 'EFECTIVO' : 'TRANSFERENCIA',
    fechaPago: new Date(2024, 5 + i, 13).toISOString(),
    cobradoPor: { nombre: 'Juan', apellido: 'Pérez' },
    reciboGenerado: true,
  })),
}

const cuotaEstadoConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PAGADA: { label: 'Pagada', color: 'text-green-500 bg-green-500/10', icon: CheckCircle2 },
  PENDIENTE: { label: 'Pendiente', color: 'text-blue-500 bg-blue-500/10', icon: Clock },
  VENCIDA: { label: 'Vencida', color: 'text-red-500 bg-red-500/10', icon: AlertTriangle },
  PARCIAL: { label: 'Parcial', color: 'text-yellow-500 bg-yellow-500/10', icon: Clock },
}

const metodoPagoLabel: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  CHEQUE: 'Cheque',
}

// ─── Modales ────────────────────────────────────────────────────
function ModalPago({ prestamo, onClose }: { prestamo: typeof mockPrestamo; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    monto: String(prestamo.montoCuota.toFixed(2)),
    metodoPago: 'EFECTIVO',
    referencia: '',
    notas: '',
    fechaPago: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1000))
      // Also try real API
      fetch('/api/pagos', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ prestamoId: prestamo.id, monto: parseFloat(form.monto), metodoPago: form.metodoPago, referencia: form.referencia, notas: form.notas, fechaPago: form.fechaPago }) }).catch(()=>{})
      setSuccess(true)
      setTimeout(onClose, 1500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-bold text-lg">Registrar Pago</h2>
            <p className="text-xs text-muted-foreground">{prestamo.codigo} · Saldo: {formatCurrency(prestamo.saldoPendiente)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors text-xl leading-none">×</button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 mb-3">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
            <p className="font-semibold text-green-500">¡Pago registrado!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Resumen rápido */}
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Cuota</p>
                <p className="font-bold">{formatCurrency(prestamo.montoCuota)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mora</p>
                <p className="font-bold text-orange-500">{formatCurrency(prestamo.moraAcumulada)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Saldo</p>
                <p className="font-bold text-primary">{formatCurrency(prestamo.saldoPendiente)}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Monto a pagar (RD$)</label>
              <input
                type="number"
                value={form.monto}
                onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                required min="1" step="0.01"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Cuota exacta', val: prestamo.montoCuota },
                  { label: 'Saldo total', val: prestamo.saldoPendiente },
                ].map(b => (
                  <button key={b.label} type="button" onClick={() => setForm(f => ({ ...f, monto: b.val.toFixed(2) }))}
                    className="rounded-md bg-primary/10 text-primary px-2.5 py-1 text-xs hover:bg-primary/20 transition-colors">
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Método</label>
                <select value={form.metodoPago} onChange={e => setForm(f => ({ ...f, metodoPago: e.target.value }))}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50">
                  {['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE'].map(m => (
                    <option key={m} value={m}>{metodoPagoLabel[m]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Fecha</label>
                <input type="date" value={form.fechaPago} onChange={e => setForm(f => ({ ...f, fechaPago: e.target.value }))}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            {form.metodoPago !== 'EFECTIVO' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nº de referencia / confirmación</label>
                <input value={form.referencia} onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
                  placeholder="Ej: TRF-123456"
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notas (opcional)</label>
              <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                rows={2} placeholder="Observaciones..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</> : 'Confirmar pago'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function ModalRefinanciar({ prestamo, onClose }: { prestamo: typeof mockPrestamo; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    interes: '10',
    numeroCuotas: '12',
    fechaPrimerPago: '',
    notas: '',
  })

  const nuevoCapital = prestamo.saldoPendiente + prestamo.moraAcumulada
  const montoInteres = nuevoCapital * (parseFloat(form.interes) / 100)
  const montoTotal = nuevoCapital + montoInteres
  const montoCuota = montoTotal / parseInt(form.numeroCuotas || '1')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1000))
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-bold text-lg">Refinanciar Préstamo</h2>
            <p className="text-xs text-muted-foreground">Nuevo capital: {formatCurrency(nuevoCapital)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 p-3 text-sm">
            <p className="font-medium text-orange-500 mb-1">⚠️ Préstamo actual</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <span>Saldo pendiente:</span><span className="font-medium text-foreground">{formatCurrency(prestamo.saldoPendiente)}</span>
              <span>Mora acumulada:</span><span className="font-medium text-orange-500">{formatCurrency(prestamo.moraAcumulada)}</span>
              <span>Nuevo capital:</span><span className="font-bold text-foreground">{formatCurrency(nuevoCapital)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nuevo interés (%)</label>
              <input type="number" value={form.interes} onChange={e => setForm(f => ({ ...f, interes: e.target.value }))}
                min="0" max="100" step="0.1" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Número de cuotas</label>
              <input type="number" value={form.numeroCuotas} onChange={e => setForm(f => ({ ...f, numeroCuotas: e.target.value }))}
                min="1" max="360" required className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha primer pago</label>
            <input type="date" value={form.fechaPrimerPago} onChange={e => setForm(f => ({ ...f, fechaPrimerPago: e.target.value }))}
              required className={inputClass} />
          </div>

          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-center">
            <p className="text-xs text-muted-foreground">Nueva cuota mensual</p>
            <p className="text-2xl font-extrabold text-primary">{formatCurrency(montoCuota)}</p>
            <p className="text-xs text-muted-foreground">× {form.numeroCuotas} cuotas · Total: {formatCurrency(montoTotal)}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notas de refinanciación</label>
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              rows={2} placeholder="Motivo de la refinanciación..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-orange-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-orange-600 disabled:opacity-70">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</> : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────
export default function PrestamoDetallePage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<'cuotas' | 'pagos'>('cuotas')
  const [showPago, setShowPago] = useState(false)
  const [showRefinanciar, setShowRefinanciar] = useState(false)
  const p = mockPrestamo
  const estadoClass = getEstadoPrestamoColor(p.estado)
  const progreso = (p.cuotasPagadas / p.numeroCuotas) * 100

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/prestamos"
            className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono">{p.codigo}</h1>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${estadoClass}`}>
                {p.estado}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {p.tipo === 'PRESTAMO_PERSONAL' ? 'Préstamo Personal' : 'Venta a Crédito'} · {p.frecuencia.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors">
            <Printer className="h-4 w-4" /> Recibo
          </button>
          <button onClick={() => window.open(`https://wa.me/${p.cliente.telefono.replace(/[^0-9]/g,'')}?text=Hola%20${encodeURIComponent(p.cliente.nombre)},%20su%20saldo%20pendiente%20es%20de%20RD%24${p.saldoPendiente.toLocaleString()}.%20Gracias.`, '_blank')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors">
            <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp
          </button>
          {p.estado !== 'PAGADO' && (
            <>
              <button onClick={() => setShowRefinanciar(true)}
                className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-500 px-3 py-2 text-sm font-medium hover:bg-orange-500/20 transition-colors">
                <RefreshCw className="h-4 w-4" /> Refinanciar
              </button>
              <button onClick={() => setShowPago(true)}
                className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                <DollarSign className="h-4 w-4" /> Registrar Pago
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Cliente */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cliente</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white">
                {getInitials(p.cliente.nombre, p.cliente.apellido)}
              </div>
              <div>
                <p className="font-semibold">{p.cliente.nombre} {p.cliente.apellido}</p>
                <p className="text-xs text-muted-foreground">{p.cliente.cedula}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono</span>
                <span>{p.cliente.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score riesgo</span>
                <span className="font-semibold text-green-500">{p.cliente.scoreRiesgo}/100</span>
              </div>
            </div>
            <Link href={`/dashboard/clientes/${p.cliente.id}`}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors w-full">
              <User className="h-3 w-3" /> Ver ficha completa
            </Link>
          </div>

          {/* Condiciones */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Condiciones</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Capital', val: formatCurrency(p.capital) },
                { label: 'Interés', val: `${p.interes}%` },
                { label: 'Monto interés', val: formatCurrency(p.montoInteres) },
                { label: 'Total a pagar', val: formatCurrency(p.montoTotal), bold: true },
                { label: 'Cuota', val: formatCurrency(p.montoCuota) },
                { label: 'Frecuencia', val: p.frecuencia.toLowerCase() },
                { label: 'Mora diaria', val: `${p.tasaMora}%` },
              ].map(row => (
                <div key={row.label} className="flex justify-between border-b border-dashed pb-1.5 last:border-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={row.bold ? 'font-bold text-primary' : 'font-medium'}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fechas</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Desembolso', val: formatDate(p.fechaDesembolso) },
                { label: 'Primer pago', val: formatDate(p.fechaPrimerPago) },
                { label: 'Vencimiento', val: formatDate(p.fechaVencimiento) },
                { label: 'Último pago', val: p.fechaUltimoPago ? formatDate(p.fechaUltimoPago) : '—' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {row.label}
                  </span>
                  <span className="font-medium">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vendedor */}
          {p.vendedor && (
            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Vendedor</h3>
              <p className="text-sm font-medium">{p.vendedor.usuario.nombre} {p.vendedor.usuario.apellido}</p>
              <p className="text-xs text-muted-foreground">{p.vendedor.zona}</p>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress card */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Estado de la Cartera</h3>
              <span className="text-sm text-muted-foreground">{p.cuotasPagadas} de {p.numeroCuotas} cuotas</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Pagado', val: formatCurrency(p.montoPagado), color: 'text-green-500' },
                { label: 'Pendiente', val: formatCurrency(p.saldoPendiente), color: 'text-orange-500' },
                { label: 'Mora', val: formatCurrency(p.moraAcumulada), color: p.moraAcumulada > 0 ? 'text-red-500' : 'text-muted-foreground' },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-muted/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
                  <p className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progreso de pago</span>
                <span className="font-semibold text-foreground">{progreso.toFixed(0)}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${p.estado === 'PAGADO' ? 'bg-green-500' : p.estado === 'VENCIDO' ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tabs: cuotas / pagos */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex border-b">
              {[
                { id: 'cuotas', label: `Plan de Cuotas (${p.numeroCuotas})` },
                { id: 'pagos', label: `Historial de Pagos (${p.pagos.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'cuotas' && (
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="h-10 px-4 text-left">Nº</th>
                      <th className="h-10 px-4 text-right">Monto</th>
                      <th className="h-10 px-4 text-right hidden sm:table-cell">Pagado</th>
                      <th className="h-10 px-4 text-right hidden md:table-cell">Saldo</th>
                      <th className="h-10 px-4 text-left">Vencimiento</th>
                      <th className="h-10 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {p.cuotas.map(c => {
                      const cfg = cuotaEstadoConfig[c.estado] || cuotaEstadoConfig.PENDIENTE
                      const Icon = cfg.icon
                      return (
                        <tr key={c.id} className={`hover:bg-muted/30 transition-colors ${c.estado === 'PAGADA' ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                              {c.numero}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-sm font-medium">{formatCurrency(c.monto)}</td>
                          <td className="px-4 py-2.5 text-right text-sm text-green-500 hidden sm:table-cell">
                            {c.montoPagado > 0 ? formatCurrency(c.montoPagado) : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right text-sm hidden md:table-cell">
                            {c.saldo > 0 ? <span className="text-orange-500">{formatCurrency(c.saldo)}</span> : <span className="text-green-500">$0</span>}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(c.fechaVence)}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.color}`}>
                                <Icon className="h-3 w-3" /> {cfg.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'pagos' && (
              <div className="divide-y">
                {p.pagos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Sin pagos registrados</p>
                  </div>
                ) : (
                  p.pagos.map(pago => (
                    <div key={pago.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono font-bold text-primary">{pago.codigo}</p>
                          <span className={`text-[10px] rounded-full px-2 py-0.5 ${
                            pago.metodoPago === 'EFECTIVO' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>{metodoPagoLabel[pago.metodoPago]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(pago.fechaPago)} · {pago.cobradoPor.nombre} {pago.cobradoPor.apellido}
                        </p>
                        <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                          <span>Capital: {formatCurrency(pago.montoCapital)}</span>
                          <span>Interés: {formatCurrency(pago.montoInteres)}</span>
                          {pago.montoMora > 0 && <span className="text-orange-500">Mora: {formatCurrency(pago.montoMora)}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-green-500">+{formatCurrency(pago.monto)}</p>
                        <button onClick={() => window.print()} className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors" title="Imprimir recibo">
                          <Printer className="h-3 w-3" /> Recibo
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notas */}
          {p.notas && (
            <div className="rounded-xl border bg-yellow-500/5 border-yellow-500/20 p-4">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">📝 Notas</p>
              <p className="text-sm text-muted-foreground">{p.notas}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showPago && <ModalPago prestamo={p} onClose={() => setShowPago(false)} />}
      {showRefinanciar && <ModalRefinanciar prestamo={p} onClose={() => setShowRefinanciar(false)} />}
    </div>
  )
}
