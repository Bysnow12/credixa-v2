'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'

const planes = [
  { id: 'basic', label: 'Básico', precio: 'RD$ 2,500/mes', desc: 'Hasta 100 clientes' },
  { id: 'professional', label: 'Profesional', precio: 'RD$ 5,500/mes', desc: 'Clientes ilimitados', popular: true },
  { id: 'enterprise', label: 'Empresarial', precio: 'RD$ 12,000/mes', desc: 'Multi-empresa' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    // Empresa
    nombreEmpresa: '',
    rnc: '',
    // Usuario
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    // Plan
    plan: 'professional',
  })

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputClass = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) { setStep(s => s + 1); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrar')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold">Credixa</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {['Empresa', 'Tu cuenta', 'Plan'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {i < 2 && <div className={`h-0.5 w-8 sm:w-16 mx-1 rounded-full ${step > i + 1 ? 'bg-green-500' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <form onSubmit={handleSubmit}>
            {/* Paso 1 — Empresa */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Datos de tu empresa</h2>
                  <p className="text-sm text-muted-foreground mt-1">Información de tu negocio</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nombre de la empresa <span className="text-red-500">*</span></label>
                  <input value={form.nombreEmpresa} onChange={e => update('nombreEmpresa', e.target.value)} required
                    placeholder="Ej: FinanCorp RD" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">RNC (opcional)</label>
                  <input value={form.rnc} onChange={e => update('rnc', e.target.value)}
                    placeholder="131-12345-6" className={inputClass} />
                </div>
              </div>
            )}

            {/* Paso 2 — Usuario admin */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Crea tu cuenta de administrador</h2>
                  <p className="text-sm text-muted-foreground mt-1">Serás el dueño del sistema</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></label>
                    <input value={form.nombre} onChange={e => update('nombre', e.target.value)} required
                      placeholder="María" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Apellido <span className="text-red-500">*</span></label>
                    <input value={form.apellido} onChange={e => update('apellido', e.target.value)} required
                      placeholder="González" className={inputClass} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Correo electrónico <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required
                    placeholder="admin@empresa.com" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Teléfono</label>
                  <input value={form.telefono} onChange={e => update('telefono', e.target.value)}
                    placeholder="809-555-0100" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Contraseña <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password}
                      onChange={e => update('password', e.target.value)} required minLength={8}
                      placeholder="Mínimo 8 caracteres" className={`${inputClass} pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3 — Plan */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">Elige tu plan</h2>
                  <p className="text-sm text-muted-foreground mt-1">14 días gratis en todos los planes</p>
                </div>
                <div className="space-y-3">
                  {planes.map(plan => (
                    <label key={plan.id} className={`flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      form.plan === plan.id ? 'border-primary bg-primary/5' : 'hover:border-border/80'
                    }`}>
                      <input type="radio" name="plan" value={plan.id} checked={form.plan === plan.id}
                        onChange={e => update('plan', e.target.value)} className="sr-only" />
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        form.plan === plan.id ? 'border-primary' : 'border-muted-foreground'
                      }`}>
                        {form.plan === plan.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{plan.label}</span>
                          {plan.popular && <span className="rounded-full brand-gradient px-2 py-0.5 text-[10px] font-bold text-white">Popular</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{plan.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{plan.precio}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Sin tarjeta de crédito requerida. Cancela cuando quieras.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                  ← Atrás
                </button>
              ) : (
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Ya tengo cuenta
                </Link>
              )}
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 rounded-lg brand-gradient px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</>
                ) : step < 3 ? (
                  <>Siguiente <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>Crear cuenta gratis <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
