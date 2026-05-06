'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, User, Phone, MapPin, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ReferenciaForm { nombre: string; telefono: string; relacion: string; direccion: string }

export default function NuevoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'personal' | 'contacto' | 'referencias'>('personal')
  const [referencias, setReferencias] = useState<ReferenciaForm[]>([
    { nombre: '', telefono: '', relacion: '', direccion: '' }
  ])
  const [form, setForm] = useState({
    nombre: '', apellido: '', cedula: '', fechaNacimiento: '', genero: '',
    telefono: '', telefono2: '', email: '', whatsapp: '',
    direccion: '', ciudad: '', provincia: '',
    notasInternas: '',
  })

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const addReferencia = () => setReferencias(r => [...r, { nombre: '', telefono: '', relacion: '', direccion: '' }])
  const removeReferencia = (i: number) => setReferencias(r => r.filter((_, idx) => idx !== i))
  const updateRef = (i: number, field: string, value: string) =>
    setReferencias(r => r.map((ref, idx) => idx === i ? { ...ref, [field]: value } : ref))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const referenciasFiltradas = referencias.filter(r => r.nombre.trim() && r.telefono.trim())
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          referencias: referenciasFiltradas,
        }),
      })

      let data: any = {}
      try {
        data = await res.json()
      } catch {
        throw new Error('Error de conexión con el servidor')
      }

      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      router.push('/dashboard/clientes')
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
  const tabs = [
    { id: 'personal', label: 'Datos personales', icon: User },
    { id: 'contacto', label: 'Contacto y dirección', icon: Phone },
    { id: 'referencias', label: 'Referencias', icon: FileText },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clientes" className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Cliente</h1>
          <p className="text-sm text-muted-foreground">Completa los datos del nuevo cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex border-b mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-6">
          {tab === 'personal' && (
            <div className="space-y-4">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-primary" /> Información personal
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></label>
                  <input value={form.nombre} onChange={e => update('nombre', e.target.value)} required placeholder="Ej: María" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Apellido <span className="text-red-500">*</span></label>
                  <input value={form.apellido} onChange={e => update('apellido', e.target.value)} required placeholder="Ej: González" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cédula de identidad</label>
                  <input value={form.cedula} onChange={e => update('cedula', e.target.value)} placeholder="001-1234567-8" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Fecha de nacimiento</label>
                  <input type="date" value={form.fechaNacimiento} onChange={e => update('fechaNacimiento', e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Género</label>
                  <select value={form.genero} onChange={e => update('genero', e.target.value)} className={inputClass}>
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notas internas</label>
                <textarea
                  value={form.notasInternas}
                  onChange={e => update('notasInternas', e.target.value)}
                  rows={3}
                  placeholder="Observaciones privadas sobre este cliente..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          )}

          {tab === 'contacto' && (
            <div className="space-y-4">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4 text-primary" /> Contacto y dirección
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Teléfono principal <span className="text-red-500">*</span></label>
                  <input value={form.telefono} onChange={e => update('telefono', e.target.value)} required placeholder="809-555-1234" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Teléfono secundario</label>
                  <input value={form.telefono2} onChange={e => update('telefono2', e.target.value)} placeholder="829-555-5678" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">WhatsApp</label>
                  <input value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} placeholder="809-555-1234" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Correo electrónico</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="cliente@email.com" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Dirección
                </label>
                <input value={form.direccion} onChange={e => update('direccion', e.target.value)} placeholder="Calle Principal #123, Sector..." className={inputClass} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ciudad</label>
                  <input value={form.ciudad} onChange={e => update('ciudad', e.target.value)} placeholder="Santo Domingo" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Provincia</label>
                  <select value={form.provincia} onChange={e => update('provincia', e.target.value)} className={inputClass}>
                    <option value="">Seleccionar provincia</option>
                    {['Distrito Nacional', 'Santiago', 'La Vega', 'San Pedro de Macorís', 'La Romana', 'La Altagracia', 'Puerto Plata', 'San Francisco de Macorís', 'Barahona', 'Azua'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {tab === 'referencias' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Referencias personales
                  <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                </h2>
                <button type="button" onClick={addReferencia} className="flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary/20 transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Agregar referencia
                </button>
              </div>

              {referencias.map((ref, i) => (
                <div key={i} className="rounded-xl border bg-muted/30 p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Referencia {i + 1}</span>
                    <button type="button" onClick={() => removeReferencia(i)} className="rounded p-1 hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Nombre completo</label>
                      <input value={ref.nombre} onChange={e => updateRef(i, 'nombre', e.target.value)} placeholder="Nombre de la referencia" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Teléfono</label>
                      <input value={ref.telefono} onChange={e => updateRef(i, 'telefono', e.target.value)} placeholder="809-555-0000" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Relación</label>
                      <select value={ref.relacion} onChange={e => updateRef(i, 'relacion', e.target.value)} className={inputClass}>
                        <option value="">Seleccionar</option>
                        {['Familiar', 'Cónyuge', 'Amigo/a', 'Compañero de trabajo', 'Vecino/a', 'Otro'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Dirección (opcional)</label>
                      <input value={ref.direccion} onChange={e => updateRef(i, 'direccion', e.target.value)} placeholder="Dirección..." className={inputClass} />
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-xs text-muted-foreground text-center pt-2">
                Puedes guardar el cliente sin agregar referencias
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive mt-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Link href="/dashboard/clientes" className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
            Cancelar
          </Link>
          <div className="flex items-center gap-3">
            {tab !== 'referencias' && (
              <button
                type="button"
                onClick={() => setTab(tab === 'personal' ? 'contacto' : 'referencias')}
                className="rounded-lg bg-muted px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                Siguiente →
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg brand-gradient px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4" /> Guardar cliente</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}