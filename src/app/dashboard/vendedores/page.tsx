'use client'

import { useState } from 'react'
import {
  Plus, Search, Eye, Edit, MapPin, Phone,
  TrendingUp, Award, Users, DollarSign, Loader2,
  X, Save, CheckCircle, AlertCircle
} from 'lucide-react'
import { formatCurrency, getInitials } from '@/utils'

const mockVendedoresInit = [
  { id: '1', nombre: 'Juan', apellido: 'Pérez', email: 'juan@credixa.com', telefono: '809-555-0101', zona: 'Norte', ruta: 'Ruta A', comisionVenta: 2, comisionCobro: 1, activo: true, prestamos: 42, cobrado: 380000, comisiones: 19000, efectividad: 94 },
  { id: '2', nombre: 'Pedro', apellido: 'Gómez', email: 'pedro@credixa.com', telefono: '809-555-0102', zona: 'Sur', ruta: 'Ruta B', comisionVenta: 2, comisionCobro: 1, activo: true, prestamos: 38, cobrado: 310000, comisiones: 15500, efectividad: 89 },
  { id: '3', nombre: 'Carmen', apellido: 'Rosa', email: 'carmen@credixa.com', telefono: '809-555-0103', zona: 'Este', ruta: 'Ruta C', comisionVenta: 2.5, comisionCobro: 1.5, activo: true, prestamos: 31, cobrado: 265000, comisiones: 13250, efectividad: 86 },
  { id: '4', nombre: 'Luis', apellido: 'Torres', email: 'luis@credixa.com', telefono: '809-555-0104', zona: 'Oeste', ruta: 'Ruta D', comisionVenta: 2, comisionCobro: 1, activo: false, prestamos: 24, cobrado: 198000, comisiones: 9900, efectividad: 79 },
]

interface Vendedor { id: string; nombre: string; apellido: string; email: string; telefono: string; zona: string; ruta: string; comisionVenta: number; comisionCobro: number; activo: boolean; prestamos: number; cobrado: number; comisiones: number; efectividad: number }

function ModalVendedor({ vendedor, onClose, onSave }: { vendedor?: Vendedor | null; onClose: () => void; onSave: (v: Vendedor) => void }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(vendedor ? {
    nombre: vendedor.nombre, apellido: vendedor.apellido, email: vendedor.email,
    telefono: vendedor.telefono, zona: vendedor.zona, ruta: vendedor.ruta,
    comisionVenta: String(vendedor.comisionVenta), comisionCobro: String(vendedor.comisionCobro), password: ''
  } : { nombre: '', apellido: '', email: '', telefono: '', zona: '', ruta: '', comisionVenta: '2', comisionCobro: '1', password: '' })

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const ic = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre || !form.apellido || !form.email) { setError('Nombre, apellido y email son requeridos'); return }
    if (!vendedor && !form.password) { setError('La contraseña es requerida'); return }
    setLoading(true)
    setError('')
    // Simulamos guardado (funciona con o sin BD)
    await new Promise(r => setTimeout(r, 800))
    const nuevo: Vendedor = {
      id: vendedor?.id || String(Date.now()),
      nombre: form.nombre, apellido: form.apellido, email: form.email,
      telefono: form.telefono, zona: form.zona, ruta: form.ruta,
      comisionVenta: parseFloat(form.comisionVenta) || 2,
      comisionCobro: parseFloat(form.comisionCobro) || 1,
      activo: true, prestamos: vendedor?.prestamos || 0,
      cobrado: vendedor?.cobrado || 0, comisiones: vendedor?.comisiones || 0,
      efectividad: vendedor?.efectividad || 0,
    }
    setLoading(false)
    setSuccess(true)
    // También intenta guardar en API real
    fetch(`/api/vendedores${vendedor ? `/${vendedor.id}` : ''}`, {
      method: vendedor ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, comisionVenta: nuevo.comisionVenta, comisionCobro: nuevo.comisionCobro }),
    }).catch(() => {})
    setTimeout(() => { onSave(nuevo); onClose() }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-bold text-lg">{vendedor ? 'Editar Vendedor' : 'Nuevo Vendedor'}</h2>
            <p className="text-xs text-muted-foreground">{vendedor ? `${vendedor.nombre} ${vendedor.apellido}` : 'Agrega un nuevo miembro al equipo'}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors"><X className="h-5 w-5" /></button>
        </div>
        {success ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 mb-3">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <p className="font-semibold text-green-500">{vendedor ? 'Vendedor actualizado' : 'Vendedor creado'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre *</label>
                <input value={form.nombre} onChange={e => upd('nombre', e.target.value)} placeholder="Juan" required className={ic} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Apellido *</label>
                <input value={form.apellido} onChange={e => upd('apellido', e.target.value)} placeholder="Pérez" required className={ic} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email *</label>
              <input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="vendedor@empresa.com" required className={ic} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Teléfono</label>
                <input value={form.telefono} onChange={e => upd('telefono', e.target.value)} placeholder="809-555-0100" className={ic} />
              </div>
              {!vendedor && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Contraseña *</label>
                  <input type="password" value={form.password} onChange={e => upd('password', e.target.value)} placeholder="Mín. 6 caracteres" className={ic} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Zona</label>
                <input value={form.zona} onChange={e => upd('zona', e.target.value)} placeholder="Zona Norte" className={ic} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ruta</label>
                <input value={form.ruta} onChange={e => upd('ruta', e.target.value)} placeholder="Ruta A" className={ic} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Comisión venta (%)</label>
                <input type="number" value={form.comisionVenta} onChange={e => upd('comisionVenta', e.target.value)} min="0" max="100" step="0.5" className={ic} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Comisión cobro (%)</label>
                <input type="number" value={form.comisionCobro} onChange={e => upd('comisionCobro', e.target.value)} min="0" max="100" step="0.5" className={ic} />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 rounded-lg brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> {vendedor ? 'Actualizar' : 'Crear Vendedor'}</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function ModalPerfil({ vendedor, onClose }: { vendedor: Vendedor; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-lg">Perfil del Vendedor</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient text-xl font-bold text-white shadow">
              {getInitials(vendedor.nombre, vendedor.apellido)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{vendedor.nombre} {vendedor.apellido}</h3>
              <p className="text-sm text-muted-foreground">{vendedor.email}</p>
              <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${vendedor.activo ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                {vendedor.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Préstamos', value: vendedor.prestamos, color: 'text-primary' },
              { label: 'Efectividad', value: `${vendedor.efectividad}%`, color: 'text-green-500' },
              { label: 'Total cobrado', value: formatCurrency(vendedor.cobrado), color: 'text-blue-500' },
              { label: 'Comisiones', value: formatCurrency(vendedor.comisiones), color: 'text-orange-500' },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-muted/50 p-3 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded-xl border p-4 text-sm mb-4">
            {[
              { label: 'Teléfono', value: vendedor.telefono },
              { label: 'Zona', value: vendedor.zona },
              { label: 'Ruta', value: vendedor.ruta },
              { label: 'Com. venta', value: `${vendedor.comisionVenta}%` },
              { label: 'Com. cobro', value: `${vendedor.comisionCobro}%` },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value || '—'}</span>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  )
}

export default function VendedoresPage() {
  const [search, setSearch] = useState('')
  const [vendedores, setVendedores] = useState<Vendedor[]>(mockVendedoresInit)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Vendedor | null>(null)
  const [viendo, setViendo] = useState<Vendedor | null>(null)

  const filtered = vendedores.filter(v =>
    search === '' || `${v.nombre} ${v.apellido}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (v: Vendedor) => {
    setVendedores(prev => {
      const existe = prev.find(p => p.id === v.id)
      return existe ? prev.map(p => p.id === v.id ? v : p) : [...prev, v]
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendedores</h1>
          <p className="text-sm text-muted-foreground">Gestión de equipo de ventas y cobranza</p>
        </div>
        <button onClick={() => { setEditando(null); setShowModal(true) }} className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Plus className="h-4 w-4" /> Nuevo Vendedor
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total vendedores', value: vendedores.length, icon: Users, color: 'text-primary' },
          { label: 'Activos', value: vendedores.filter(v => v.activo).length, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Total cobrado', value: formatCurrency(vendedores.reduce((s, v) => s + v.cobrado, 0)), icon: DollarSign, color: 'text-blue-500' },
          { label: 'Comisiones', value: formatCurrency(vendedores.reduce((s, v) => s + v.comisiones, 0)), icon: Award, color: 'text-orange-500' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar vendedor..."
          className="h-10 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((v) => (
          <div key={v.id} className="rounded-xl border bg-card p-5 hover:shadow-md transition-all card-glow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-sm font-bold text-white shadow">
                  {getInitials(v.nombre, v.apellido)}
                </div>
                <div>
                  <p className="font-semibold">{v.nombre} {v.apellido}</p>
                  <p className="text-xs text-muted-foreground">{v.email}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${v.activo ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                {v.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-lg font-bold text-primary">{v.prestamos}</p>
                <p className="text-[10px] text-muted-foreground">Préstamos</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-lg font-bold text-green-500">{v.efectividad}%</p>
                <p className="text-[10px] text-muted-foreground">Efectividad</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cobrado este mes</span>
                <span className="font-semibold text-green-500">{formatCurrency(v.cobrado)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Comisiones ganadas</span>
                <span className="font-semibold text-orange-500">{formatCurrency(v.comisiones)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Zona</span>
                <span className="font-medium">{v.zona || '—'}{v.ruta ? ` — ${v.ruta}` : ''}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</span>
                <span className="font-medium">{v.telefono || '—'}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Meta mensual</span>
                <span className="font-medium">{v.efectividad}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${v.efectividad}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setViendo(v)} className="flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors flex items-center justify-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Ver perfil
              </button>
              <button onClick={() => { setEditando(v); setShowModal(true) }} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors" title="Editar">
                <Edit className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button onClick={() => { setEditando(null); setShowModal(true) }}
          className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-5 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-muted/30 transition-all min-h-[200px] group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Agregar vendedor</p>
        </button>
      </div>

      {showModal && <ModalVendedor vendedor={editando} onClose={() => { setShowModal(false); setEditando(null) }} onSave={handleSave} />}
      {viendo && <ModalPerfil vendedor={viendo} onClose={() => setViendo(null)} />}
    </div>
  )
}
