'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, EyeOff, Zap, Shield, TrendingUp,
  Users, CreditCard, Wallet, ArrowRight, Loader2
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let loggedIn = false
      // Try real API
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const text = await res.text()
        let data: any = {}
        try { data = JSON.parse(text) } catch {}
        if (res.ok && data.success) {
          loggedIn = true
        } else if (!res.ok && data.error) {
          throw new Error(data.error)
        }
      } catch (apiErr: any) {
        if (apiErr.message && !apiErr.message.includes('fetch') && !apiErr.message.includes('HTML') && !apiErr.message.includes('JSON')) {
          throw apiErr
        }
      }

      if (!loggedIn) {
        // Demo mode - accept any email+password with min 6 chars
        const validDemos: Record<string, string> = {
          'admin@credixa.com': 'admin123',
          'admin@empresa.com': 'admin123',
          'juan@credixa.com': 'vendedor123',
          'pedro@credixa.com': 'vendedor123',
          'carmen@credixa.com': 'vendedor123',
          'supervisor@credixa.com': 'admin123',
        }
        const isDemoValid = validDemos[form.email] === form.password ||
          (form.email.includes('@') && form.password.length >= 6)
        if (!isDemoValid) throw new Error('Credenciales incorrectas')
        document.cookie = 'credixa-demo=1;path=/;max-age=86400;samesite=lax'
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = (role: string) => {
    const demos: Record<string, { email: string; password: string }> = {
      // 🔥 FIX CREDENCIALES
      admin: { email: 'admin@credixa.com', password: '12345678' },
      vendedor: { email: 'vendedor@credixa.com', password: '12345678' },
    }
    setForm(demos[role])
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden brand-gradient flex-col justify-between p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white blur-2xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Credixa</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Gestiona tu cartera<br />de créditos con<br />
              <span className="text-white/70">precisión total</span>
            </h2>
            <p className="mt-4 text-white/70 text-lg leading-relaxed">
              La plataforma más completa para prestamistas y negocios que venden a crédito.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: 'Clientes gestionados', value: '+2,400' },
              { icon: CreditCard, label: 'Préstamos activos', value: '+8,600' },
              { icon: Wallet, label: 'Recuperado', value: 'RD$ 48M' },
              { icon: TrendingUp, label: 'Efect. cobranza', value: '94.2%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 backdrop-blur p-4 border border-white/20">
                <stat.icon className="h-5 w-5 text-white/70 mb-2" />
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative z-10">
          <div className="rounded-xl bg-white/10 border border-white/20 p-5 backdrop-blur">
            <p className="text-white/90 text-sm italic leading-relaxed">
              "Credixa transformó completamente cómo gestionamos nuestra cartera de créditos. 
              Recuperamos un 30% más en los primeros 3 meses."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                RG
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Roberto García</p>
                <p className="text-xs text-white/60">Director, FinanCorp RD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Credixa</span>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Bienvenido de vuelta</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Demo access buttons */}
          <div className="mb-6 rounded-xl border border-dashed bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Acceso Demo
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => demoLogin('admin')}
                className="flex-1 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => demoLogin('vendedor')}
                className="flex-1 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-accent transition-colors"
              >
                Demo Vendedor
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@credixa.com"
                required
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Contraseña</label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border" />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Mantener sesión iniciada
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg brand-gradient text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Ingresando...</>
              ) : (
                <>Iniciar sesión <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Shield, label: 'Datos seguros' },
              { icon: TrendingUp, label: 'Reportes avanzados' },
              { icon: Zap, label: 'Tiempo real' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1.5 rounded-lg border bg-muted/30 p-3 text-center">
                <f.icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-medium leading-tight">{f.label}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/" className="text-primary font-medium hover:underline">
              Ver planes y precios
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}