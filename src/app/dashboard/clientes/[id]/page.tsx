'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Phone, MapPin, CreditCard, DollarSign, Clock,
  Edit, Plus, FileText, Star, MessageCircle, AlertTriangle,
  CheckCircle, TrendingUp, Calendar
} from 'lucide-react'
import { formatCurrency, formatDate, getEstadoPrestamoColor, getScoreLabel, getInitials } from '@/utils'

// Mock data para demo
const mockCliente = {
  id: '1',
  nombre: 'María',
  apellido: 'González',
  cedula: '001-1234567-1',
  telefono: '809-555-1001',
  telefono2: '829-555-2001',
  whatsapp: '809-555-1001',
  email: 'maria@email.com',
  direccion: 'Calle Principal #123, Los Jardines',
  ciudad: 'Santo Domingo',
  provincia: 'Distrito Nacional',
  estado: 'ACTIVO' as const,
  scoreRiesgo: 92,
  notasInternas: 'Clienta puntual, siempre paga antes del vencimiento.',
  createdAt: '2024-01-15',
  referencias: [
    { id: '1', nombre: 'Juan González', telefono: '809-555-9001', relacion: 'Esposo' },
    { id: '2', nombre: 'Rosa Pérez', telefono: '809-555-9002', relacion: 'Familiar' },
  ],
  prestamos: [
    { id: '1', codigo: 'PRE-00001', tipo: 'PRESTAMO_PERSONAL', estado: 'ACTIVO', capital: 50000, saldoPendiente: 38500, montoCuota: 5500, cuotasPagadas: 7, numeroCuotas: 12, fechaVencimiento: '2025-01-15', moraAcumulada: 0 },
    { id: '2', codigo: 'PRE-00008', tipo: 'VENTA_CREDITO', estado: 'PAGADO', capital: 45000, saldoPendiente: 0, montoCuota: 4500, cuotasPagadas: 10, numeroCuotas: 10, fechaVencimiento: '2024-10-15', moraAcumulada: 0, descripcion: 'TV Samsung 55"' },
  ],
}

export default function ClienteDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [tab, setTab] = useState<'prestamos' | 'referencias' | 'documentos'>('prestamos')
  const c = mockCliente
  const score = getScoreLabel(c.scoreRiesgo)

  const totalPrestado = c.prestamos.reduce((s, p) => s + p.capital, 0)
  const totalPendiente = c.prestamos.reduce((s, p) => s + p.saldoPendiente, 0)
  const totalPagado = totalPrestado - totalPendiente

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clientes" className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Ficha del Cliente</h1>
            <p className="text-sm text-muted-foreground">Detalle completo y historial</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open(`https://wa.me/${c.telefono.replace(/[^0-9]/g,'')}?text=Hola%20${encodeURIComponent(c.nombre)}`, '_blank')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors">
            <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp
          </button>
          <Link href={`/dashboard/prestamos/nuevo?clienteId=${c.id}`} className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> Nuevo préstamo
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl brand-gradient text-2xl font-bold text-white shadow-lg">
              {getInitials(c.nombre, c.apellido)}
            </div>
            <h2 className="text-xl font-bold">{c.nombre} {c.apellido}</h2>
            <p className="text-sm text-muted-foreground">{c.cedula}</p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                c.estado === 'ACTIVO' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
              }`}>
                {c.estado}
              </span>
            </div>

            {/* Score */}
            <div className="mt-4 rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-2">Score de Riesgo</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${c.scoreRiesgo}%`, background: score.color }} />
                </div>
                <span className="text-sm font-bold" style={{ color: score.color }}>{c.scoreRiesgo}</span>
              </div>
              <p className="text-xs font-medium" style={{ color: score.color }}>{score.label}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <Link href={`/dashboard/clientes/${c.id}/editar`} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors">
                <Edit className="h-3.5 w-3.5" /> Editar
              </Link>
              <button className="flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors">
                <FileText className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Información de contacto</h3>
            {[
              { icon: Phone, label: 'Teléfono', value: c.telefono },
              { icon: Phone, label: 'Teléfono 2', value: c.telefono2 },
              { icon: MessageCircle, label: 'WhatsApp', value: c.whatsapp },
              { icon: MapPin, label: 'Ciudad', value: `${c.ciudad}, ${c.provincia}` },
              { icon: MapPin, label: 'Dirección', value: c.direccion },
            ].filter(item => item.value).map(item => (
              <div key={item.label} className="flex gap-2 text-sm">
                <item.icon className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {c.notasInternas && (
            <div className="rounded-xl border bg-yellow-500/5 border-yellow-500/20 p-4">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1.5">📝 Notas internas</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.notasInternas}</p>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Financial summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total prestado', value: formatCurrency(totalPrestado), icon: CreditCard, color: 'text-primary' },
              { label: 'Total pagado', value: formatCurrency(totalPagado), icon: CheckCircle, color: 'text-green-500' },
              { label: 'Saldo pendiente', value: formatCurrency(totalPendiente), icon: Clock, color: totalPendiente > 0 ? 'text-orange-500' : 'text-green-500' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border bg-card p-3 text-center">
                <s.icon className={`h-5 w-5 mx-auto mb-1.5 ${s.color}`} />
                <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex border-b">
              {[
                { id: 'prestamos', label: `Préstamos (${c.prestamos.length})` },
                { id: 'referencias', label: `Referencias (${c.referencias.length})` },
                { id: 'documentos', label: 'Documentos' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {tab === 'prestamos' && (
                <div className="space-y-3">
                  {c.prestamos.map(p => {
                    const estadoClass = getEstadoPrestamoColor(p.estado)
                    const progreso = (p.cuotasPagadas / p.numeroCuotas) * 100
                    return (
                      <div key={p.id} className="rounded-xl border p-4 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs font-mono font-bold text-primary">{p.codigo}</p>
                            <p className="text-sm font-medium mt-0.5">{p.descripcion || (p.tipo === 'PRESTAMO_PERSONAL' ? 'Préstamo Personal' : 'Venta a Crédito')}</p>
                          </div>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${estadoClass}`}>
                            {p.estado}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center mb-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Capital</p>
                            <p className="text-sm font-semibold">{formatCurrency(p.capital)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Cuota</p>
                            <p className="text-sm font-semibold">{formatCurrency(p.montoCuota)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Saldo</p>
                            <p className={`text-sm font-semibold ${p.saldoPendiente === 0 ? 'text-green-500' : 'text-orange-500'}`}>
                              {formatCurrency(p.saldoPendiente)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${p.estado === 'PAGADO' ? 'bg-green-500' : 'bg-primary'}`}
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {p.cuotasPagadas}/{p.numeroCuotas} cuotas
                          </span>
                        </div>
                        {p.estado !== 'PAGADO' && (
                          <div className="mt-3 flex gap-2">
                            <Link href={`/dashboard/cobros?prestamoId=${p.id}`} className="flex-1 text-center rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/20 transition-colors">
                              Registrar pago
                            </Link>
                            <Link href={`/dashboard/prestamos/${p.id}`} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
                              Ver detalle
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {tab === 'referencias' && (
                <div className="space-y-3">
                  {c.referencias.map(r => (
                    <div key={r.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {r.nombre.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.nombre}</p>
                        <p className="text-xs text-muted-foreground">{r.relacion} · {r.telefono}</p>
                      </div>
                      <a href={`tel:${r.telefono}`} title={`Llamar a ${r.nombre}`} className="rounded-lg p-2 hover:bg-accent transition-colors text-muted-foreground">
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'documentos' && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Sin documentos adjuntos</p>
                  <p className="text-xs text-muted-foreground mb-4">Adjunta cédula, contratos y otros documentos</p>
                  <button onClick={() => { const input = document.createElement('input'); input.type='file'; input.accept='image/*,.pdf'; input.onchange=()=>alert('Documento adjuntado: '+input.files?.[0]?.name); input.click() }} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium hover:bg-accent transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Subir documento
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
