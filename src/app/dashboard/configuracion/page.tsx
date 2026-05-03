'use client'

import { useState } from 'react'
import {
  Building2, Palette, Bell, Shield, CreditCard,
  Receipt, Globe, Database, Save, Upload, CheckCircle
} from 'lucide-react'

const tabs = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'intereses', label: 'Intereses', icon: CreditCard },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'recibos', label: 'Recibos', icon: Receipt },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
]

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('empresa')
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    // Empresa
    nombreEmpresa: 'Mi Empresa de Créditos',
    rnc: '131-12345-6',
    direccion: 'Calle Principal #123, Santo Domingo',
    telefono: '809-555-0100',
    email: 'info@miempresa.com',
    moneda: 'DOP',
    simboloMoneda: 'RD$',
    // Intereses
    tasaInteresDefault: '10',
    moraDefault: '2',
    diasGraciaMora: '3',
    // Notificaciones
    whatsappActivo: false,
    emailActivo: false,
    alertaDiasCobro: '1',
    alertaMoraActiva: true,
    alertaVencimientoActiva: true,
    // Recibos
    reciboEncabezado: 'Gracias por su pago',
    reciboPie: 'Conserve este recibo como comprobante de pago',
    reciboLogoActivo: true,
  })

  const handleSave = async () => {
    setSaved(true)
    // Try to persist to API
    try {
      await fetch('/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
    } catch {}
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-sm text-muted-foreground">Personaliza el sistema según tus necesidades</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all ${saved ? 'bg-green-500' : 'brand-gradient hover:opacity-90'}`}
        >
          {saved ? <><CheckCircle className="h-4 w-4" /> Guardado</> : <><Save className="h-4 w-4" /> Guardar cambios</>}
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar tabs */}
        <div className="lg:w-52 shrink-0">
          <nav className="space-y-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-xl border bg-card p-6">
          {activeTab === 'empresa' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-lg">Información de la Empresa</h2>

              {/* Logo upload */}
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl brand-gradient text-2xl font-bold text-white">
                  C
                </div>
                <div>
                  <p className="text-sm font-medium">Logo de la empresa</p>
                  <p className="text-xs text-muted-foreground mb-2">PNG o JPG, máximo 2MB</p>
                  <button onClick={() => { const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange=()=>alert('Logo seleccionado: '+input.files?.[0]?.name+'\nEn producción se subirá al servidor.'); input.click() }} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Subir logo
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Nombre de la empresa', key: 'nombreEmpresa', type: 'text' },
                  { label: 'RNC / Registro', key: 'rnc', type: 'text' },
                  { label: 'Teléfono', key: 'telefono', type: 'tel' },
                  { label: 'Correo electrónico', key: 'email', type: 'email' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-sm font-medium">{f.label}</label>
                    <input
                      type={f.type}
                      value={(config as any)[f.key]}
                      onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Dirección</label>
                <input
                  value={config.direccion}
                  onChange={e => setConfig(c => ({ ...c, direccion: e.target.value }))}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Moneda</label>
                  <select
                    value={config.moneda}
                    onChange={e => setConfig(c => ({ ...c, moneda: e.target.value }))}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="DOP">Peso Dominicano (DOP)</option>
                    <option value="USD">Dólar americano (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="MXN">Peso Mexicano (MXN)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Símbolo de moneda</label>
                  <input
                    value={config.simboloMoneda}
                    onChange={e => setConfig(c => ({ ...c, simboloMoneda: e.target.value }))}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'intereses' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-lg">Configuración de Intereses y Mora</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Tasa de interés por defecto (%)', key: 'tasaInteresDefault', help: 'Porcentaje aplicado a nuevos préstamos' },
                  { label: 'Mora diaria por defecto (%)', key: 'moraDefault', help: 'Porcentaje de mora diaria sobre saldo vencido' },
                  { label: 'Días de gracia para mora', key: 'diasGraciaMora', help: 'Días antes de comenzar a calcular mora' },
                ].map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-sm font-medium">{f.label}</label>
                    <input
                      type="number"
                      value={(config as any)[f.key]}
                      onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
                      min="0"
                      step="0.1"
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <p className="text-xs text-muted-foreground">{f.help}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm font-medium text-primary mb-1">Ejemplo de cálculo</p>
                <p className="text-xs text-muted-foreground">
                  Préstamo de RD$ 100,000 a {config.tasaInteresDefault}% de interés = RD$ {(100000 * parseFloat(config.tasaInteresDefault || '0') / 100).toLocaleString()} de interés.
                  Si vence y tiene mora de {config.moraDefault}% diario, a los 10 días = RD$ {(100000 * parseFloat(config.moraDefault || '0') / 100 * 10).toLocaleString()} en mora.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-lg">Alertas y Notificaciones</h2>

              <div className="space-y-4">
                {[
                  { key: 'alertaMoraActiva', label: 'Alertas de clientes en mora', desc: 'Notificar cuando un cliente entra en mora' },
                  { key: 'alertaVencimientoActiva', label: 'Alertas de vencimiento', desc: 'Notificar antes del vencimiento de cuotas' },
                  { key: 'whatsappActivo', label: 'Recordatorios por WhatsApp', desc: 'Enviar mensajes automáticos por WhatsApp' },
                  { key: 'emailActivo', label: 'Notificaciones por email', desc: 'Enviar alertas al correo electrónico' },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => setConfig(c => ({ ...c, [n.key]: !(c as any)[n.key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(config as any)[n.key] ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${(config as any)[n.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Días de anticipación para alertas de cobro</label>
                <input
                  type="number"
                  value={config.alertaDiasCobro}
                  onChange={e => setConfig(c => ({ ...c, alertaDiasCobro: e.target.value }))}
                  min="1"
                  max="30"
                  className="h-10 w-40 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          )}

          {activeTab === 'recibos' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-lg">Configuración de Recibos</h2>

              {[
                { key: 'reciboLogoActivo', label: 'Mostrar logo en recibos' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between rounded-xl border p-4">
                  <p className="text-sm font-medium">{n.label}</p>
                  <button
                    onClick={() => setConfig(c => ({ ...c, [n.key]: !(c as any)[n.key] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(config as any)[n.key] ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${(config as any)[n.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}

              {[
                { label: 'Encabezado del recibo', key: 'reciboEncabezado' },
                { label: 'Pie del recibo', key: 'reciboPie' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-sm font-medium">{f.label}</label>
                  <textarea
                    value={(config as any)[f.key]}
                    onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'seguridad' || activeTab === 'apariencia') && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                {activeTab === 'seguridad' ? <Shield className="h-8 w-8 text-muted-foreground" /> : <Palette className="h-8 w-8 text-muted-foreground" />}
              </div>
              <h3 className="text-lg font-semibold">
                {activeTab === 'seguridad' ? 'Configuración de Seguridad' : 'Apariencia'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                {activeTab === 'seguridad'
                  ? 'Gestión de contraseñas, 2FA, sesiones activas y permisos por rol.'
                  : 'Personaliza colores, tipografía y el aspecto visual del sistema.'}
              </p>
              <span className="mt-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Próximamente</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
