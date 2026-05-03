'use client'

import Link from 'next/link'
import {
  Zap, CheckCircle, ArrowRight, Star, TrendingUp, Shield,
  Users, CreditCard, BarChart3, Bell, Smartphone, Globe,
  ChevronRight, Play, Building2, Wallet, Clock, Award
} from 'lucide-react'

const features = [
  { icon: CreditCard, title: 'Gestión de Préstamos', desc: 'Crea y administra préstamos personales, ventas a crédito, hipotecarios y prendarios con cálculo automático de cuotas e intereses.' },
  { icon: Wallet, title: 'Cobros y Cobranzas', desc: 'Registra abonos, pagos parciales y completos. Genera comprobantes PDF con tu logo y envía recordatorios por WhatsApp.' },
  { icon: Users, title: 'Gestión de Clientes', desc: 'Base de datos completa con foto, documentos, referencias, historial de pagos y score de riesgo automático.' },
  { icon: TrendingUp, title: 'Reportes Avanzados', desc: 'Reportes de mora, cartera, vendedores y financieros. Exporta a Excel o PDF con filtros por fecha.' },
  { icon: Bell, title: 'Alertas Automáticas', desc: 'Recibe notificaciones de vencimientos, mora y cobros pendientes. Integración con WhatsApp y correo electrónico.' },
  { icon: Shield, title: 'Roles y Permisos', desc: 'Sistema multi-usuario con roles de Admin, Supervisor, Vendedor y Socio. Permisos personalizados por módulo.' },
]

const stats = [
  { value: '+2,400', label: 'Clientes activos' },
  { value: 'RD$ 48M', label: 'Cartera gestionada' },
  { value: '94%', label: 'Efect. cobranza' },
  { value: '+850', label: 'Usuarios activos' },
]

const plans = [
  {
    name: 'Básico',
    price: '2,500',
    desc: 'Ideal para pequeños prestamistas',
    color: 'border-border',
    features: ['Hasta 100 clientes', 'Hasta 200 préstamos', '2 usuarios', 'Reportes básicos', 'Soporte por email'],
    cta: 'Empezar gratis',
    popular: false,
  },
  {
    name: 'Profesional',
    price: '5,500',
    desc: 'Para negocios en crecimiento',
    color: 'border-primary',
    features: ['Clientes ilimitados', 'Préstamos ilimitados', '10 usuarios', 'Reportes avanzados', 'WhatsApp automático', 'Exportar PDF/Excel', 'Soporte prioritario'],
    cta: 'Empezar ahora',
    popular: true,
  },
  {
    name: 'Empresarial',
    price: '12,000',
    desc: 'Para grandes operaciones',
    color: 'border-border',
    features: ['Todo en Profesional', 'Usuarios ilimitados', 'Multi-empresa', 'API acceso', 'Servidor dedicado', 'Personalización', 'Soporte 24/7'],
    cta: 'Contactar ventas',
    popular: false,
  },
]

const testimonials = [
  { name: 'Roberto García', role: 'Director, FinanCorp RD', text: 'Credixa transformó completamente cómo gestionamos nuestra cartera. Recuperamos 30% más en los primeros 3 meses.', rating: 5 },
  { name: 'María López', role: 'Propietaria, CréditoFácil', text: 'Antes usaba Excel y era un caos. Ahora tengo todo bajo control: clientes, pagos, mora. Es increíble.', rating: 5 },
  { name: 'Carlos Martínez', role: 'Gerente, PrestaRápido', text: 'El sistema de alertas automáticas nos salvó de perder miles en mora. Totalmente recomendado.', rating: 5 },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient">
                <Zap className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-xl font-bold">Credixa</span>
            </div>

            <div className="hidden items-center gap-8 text-sm font-medium md:flex">
              {['Características', 'Precios', 'Testimonios', 'Contacto'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/login" className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                Empezar gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium shadow-sm">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Sistema en producción — Usado por +850 empresas
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
            Gestiona tu cartera de{' '}
            <span className="brand-gradient-text">créditos y préstamos</span>{' '}
            como un profesional
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            La plataforma más completa para prestamistas y negocios que venden a crédito.
            CRM + ERP + Cobranzas en un solo sistema. Sin complicaciones.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/login" className="flex items-center gap-2 rounded-xl brand-gradient px-8 py-3 text-base font-bold text-white shadow-lg hover:opacity-90 transition-all hover:scale-105">
              Empezar gratis <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="flex items-center gap-2 rounded-xl border px-8 py-3 text-base font-semibold hover:bg-accent transition-colors">
              <Play className="h-4 w-4" /> Ver demo
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Sin tarjeta de crédito · 14 días gratis · Cancela cuando quieras
          </p>

          {/* Dashboard preview */}
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
              <div className="bg-muted/50 border-b px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 h-5 rounded-md bg-background/50 text-xs flex items-center px-3 text-muted-foreground">
                  app.credixa.com/dashboard
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 p-5">
                {[
                  { label: 'Total Cartera', val: 'RD$ 4,850,000', color: 'text-foreground' },
                  { label: 'Cobrado hoy', val: 'RD$ 125,400', color: 'text-green-500' },
                  { label: 'Clientes morosos', val: '23', color: 'text-orange-500' },
                  { label: 'Efect. cobranza', val: '94.2%', color: 'text-primary' },
                ].map(card => (
                  <div key={card.label} className="rounded-lg border bg-background p-3">
                    <p className="text-[10px] text-muted-foreground mb-1">{card.label}</p>
                    <p className={`text-sm font-bold ${card.color}`}>{card.val}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <div className="h-32 rounded-xl bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                  📊 Gráficas de actividad financiera mensual
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold brand-gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="características" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Credixa combina CRM, gestión de préstamos y cobranzas en una plataforma intuitiva y potente.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6 hover:shadow-md transition-all card-glow group">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl brand-gradient shadow">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Planes simples y transparentes</h2>
            <p className="mt-4 text-lg text-muted-foreground">Precios en pesos dominicanos (RD$) por mes</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 bg-card p-7 relative flex flex-col ${plan.color} ${plan.popular ? 'shadow-xl ring-1 ring-primary/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full brand-gradient px-4 py-1.5 text-xs font-bold text-white shadow">
                      ⭐ Más popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-sm text-muted-foreground">RD$</span>
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm mb-1">/mes</span>
                  </div>
                </div>

                <ul className="flex-1 space-y-3 mb-7">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
                    plan.popular
                      ? 'brand-gradient text-white shadow hover:opacity-90'
                      : 'border hover:bg-accent'
                  }`}
                >
                  {plan.cta} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Lo que dicen nuestros clientes</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map(t => (
              <div key={t.name} className="rounded-xl border bg-card p-6">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl brand-gradient p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-white mb-4">
                Empieza hoy — 14 días gratis
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Sin tarjeta de crédito. Configura en minutos y empieza a gestionar tu cartera como un profesional.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-bold text-primary hover:bg-white/90 transition-all hover:scale-105">
                Crear cuenta gratis <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-gradient">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Credixa</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Credixa. Todos los derechos reservados.
          </p>
          <div className="flex gap-5 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
            <a href="#" className="hover:text-foreground transition-colors">Términos</a>
            <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
