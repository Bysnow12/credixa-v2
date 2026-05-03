// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, Users, CreditCard, Wallet,
  AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight,
  Activity, ChevronRight, Clock, CheckCircle2
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency, formatDate, getInitials } from '@/utils'

// Mock data for demonstration
const mockStats = {
  totalCartera: 4850000,
  totalPrestado: 8200000,
  totalCobrado: 3350000,
  pagosPendientes: 4850000,
  clientesMorosos: 23,
  ventasHoy: 8,
  ingresosHoy: 125400,
  balanceGeneral: 2400000,
  clientesActivos: 284,
  prestamosActivos: 156,
  tasaMorosidad: 14.7,
  cobranzaEfectividad: 40.9,
  capitalHoy: 380000,
}

const mockGrafica = [
  { mes: 'Nov 24', prestado: 680000, cobrado: 420000, mora: 18000 },
  { mes: 'Dic 24', prestado: 920000, cobrado: 540000, mora: 24000 },
  { mes: 'Ene 25', prestado: 750000, cobrado: 490000, mora: 31000 },
  { mes: 'Feb 25', prestado: 1100000, cobrado: 620000, mora: 28000 },
  { mes: 'Mar 25', prestado: 980000, cobrado: 710000, mora: 22000 },
  { mes: 'Abr 25', prestado: 1240000, cobrado: 830000, mora: 19000 },
]

const mockTopClientes = [
  { id: '1', nombre: 'María', apellido: 'González', totalPrestado: 480000, totalPagado: 220000, prestamosActivos: 3 },
  { id: '2', nombre: 'Carlos', apellido: 'Rodríguez', totalPrestado: 350000, totalPagado: 180000, prestamosActivos: 2 },
  { id: '3', nombre: 'Ana', apellido: 'Martínez', totalPrestado: 290000, totalPagado: 290000, prestamosActivos: 0 },
  { id: '4', nombre: 'Pedro', apellido: 'López', totalPrestado: 260000, totalPagado: 140000, prestamosActivos: 1 },
  { id: '5', nombre: 'Luisa', apellido: 'Fernández', totalPrestado: 240000, totalPagado: 95000, prestamosActivos: 2 },
]

const mockMovimientos = [
  { id: '1', tipo: 'COBRO', descripcion: 'Pago de María González', monto: 8500, fecha: new Date().toISOString(), cliente: 'María González' },
  { id: '2', tipo: 'PRESTAMO', descripcion: 'Desembolso a Carlos Rodríguez', monto: 50000, fecha: new Date().toISOString(), cliente: 'Carlos Rodríguez' },
  { id: '3', tipo: 'COBRO', descripcion: 'Pago de Ana Martínez', monto: 15000, fecha: new Date().toISOString(), cliente: 'Ana Martínez' },
  { id: '4', tipo: 'COBRO', descripcion: 'Pago de Pedro López', monto: 6200, fecha: new Date().toISOString(), cliente: 'Pedro López' },
  { id: '5', tipo: 'PRESTAMO', descripcion: 'Desembolso a Luisa Fernández', monto: 80000, fecha: new Date().toISOString(), cliente: 'Luisa Fernández' },
]

function StatCard({
  title, value, subtitle, icon: Icon, trend, trendValue, color
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: string
}) {
  return (
    <div className="stat-card card-glow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          {trendValue && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color || 'bg-primary/10'}`}>
          <Icon className={`h-5 w-5 ${color ? 'text-white' : 'text-primary'}`} />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-popover p-3 shadow-xl text-xs">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-medium">{formatCurrency(p.value, 'RD$')}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen general del sistema — {new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Sistema activo
          </span>
        </div>
      </div>

      {/* Top stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Cartera"
          value={formatCurrency(mockStats.totalCartera)}
          subtitle="Saldo pendiente activo"
          icon={Wallet}
          trend="up"
          trendValue="+12.5% este mes"
          color="brand-gradient"
        />
        <StatCard
          title="Total Prestado"
          value={formatCurrency(mockStats.totalPrestado)}
          subtitle="Capital desembolsado"
          icon={CreditCard}
          trend="up"
          trendValue="+8.2% vs mes anterior"
        />
        <StatCard
          title="Total Cobrado"
          value={formatCurrency(mockStats.totalCobrado)}
          subtitle="Recuperación total"
          icon={DollarSign}
          trend="up"
          trendValue="+15.3% vs mes anterior"
          color="bg-green-500"
        />
        <StatCard
          title="Ingresos Hoy"
          value={formatCurrency(mockStats.ingresosHoy)}
          subtitle={`${mockStats.ventasHoy} operaciones hoy`}
          icon={Activity}
          trend="up"
          trendValue="+4 vs ayer"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Clientes Activos</p>
              <p className="mt-1.5 text-3xl font-bold">{mockStats.clientesActivos}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: '74%' }} />
            </div>
            <span className="text-xs text-muted-foreground">74% activos</span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Préstamos Activos</p>
              <p className="mt-1.5 text-3xl font-bold">{mockStats.prestamosActivos}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
              <CreditCard className="h-5 w-5 text-violet-500" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-violet-500" style={{ width: '62%' }} />
            </div>
            <span className="text-xs text-muted-foreground">62% al día</span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Clientes Morosos</p>
              <p className="mt-1.5 text-3xl font-bold text-orange-500">{mockStats.clientesMorosos}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${mockStats.tasaMorosidad}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{mockStats.tasaMorosidad}% mora</span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Efect. Cobranza</p>
              <p className="mt-1.5 text-3xl font-bold text-green-500">{mockStats.cobranzaEfectividad}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${mockStats.cobranzaEfectividad}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">meta: 60%</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Actividad Financiera</h3>
              <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Prestado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Cobrado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> Mora
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockGrafica}>
              <defs>
                <linearGradient id="colorPrestado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(243 75% 59%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(243 75% 59%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCobrado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="prestado" name="Prestado" stroke="hsl(243 75% 59%)" fill="url(#colorPrestado)" strokeWidth={2} />
              <Area type="monotone" dataKey="cobrado" name="Cobrado" stroke="#22c55e" fill="url(#colorCobrado)" strokeWidth={2} />
              <Bar dataKey="mora" name="Mora" fill="#f97316" radius={[4, 4, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top clientes */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Top Clientes</h3>
              <p className="text-xs text-muted-foreground">Por monto prestado</p>
            </div>
            <Link href="/dashboard/clientes" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockTopClientes.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full brand-gradient text-[11px] font-bold text-white">
                  {getInitials(c.nombre, c.apellido)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.nombre} {c.apellido}</p>
                  <div className="mt-0.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.totalPagado / c.totalPrestado) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold">{formatCurrency(c.totalPrestado, 'RD$')}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {((c.totalPagado / c.totalPrestado) * 100).toFixed(0)}% pagado
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimos movimientos */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Últimos Movimientos</h3>
              <p className="text-xs text-muted-foreground">Actividad reciente</p>
            </div>
            <Link href="/dashboard/clientes" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockMovimientos.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.tipo === 'COBRO' ? 'bg-green-500/10' : 'bg-primary/10'
                }`}>
                  {m.tipo === 'COBRO'
                    ? <ArrowDownRight className="h-4 w-4 text-green-500" />
                    : <ArrowUpRight className="h-4 w-4 text-primary" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.descripcion}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Hace unos minutos
                  </p>
                </div>
                <span className={`text-sm font-semibold ${m.tipo === 'COBRO' ? 'text-green-500' : 'text-primary'}`}>
                  {m.tipo === 'COBRO' ? '+' : '-'}{formatCurrency(m.monto, 'RD$')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions + alerts */}
        <div className="space-y-4">
          {/* Alertas de mora */}
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <h3 className="font-semibold text-sm text-orange-500">Alertas de Mora</h3>
              <span className="ml-auto rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-500">
                {mockStats.clientesMorosos}
              </span>
            </div>
            <div className="space-y-2">
              {['María García - 15 días mora', 'Juan Pérez - 8 días mora', 'Rosa López - 22 días mora'].map((alerta, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{alerta}</span>
                  <Link href="/dashboard/cobros" className="text-primary hover:underline">Gestionar</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold text-sm mb-3">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Nuevo Cliente', icon: Users, color: 'bg-blue-500/10 text-blue-500', href: '/dashboard/clientes/nuevo' },
                { label: 'Nuevo Préstamo', icon: CreditCard, color: 'bg-violet-500/10 text-violet-500', href: '/dashboard/prestamos/nuevo' },
                { label: 'Registrar Cobro', icon: Wallet, color: 'bg-green-500/10 text-green-500', href: '/dashboard/cobros' },
                { label: 'Ver Reportes', icon: TrendingUp, color: 'bg-orange-500/10 text-orange-500', href: '/dashboard/reportes' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex items-center gap-2 rounded-lg p-3 text-xs font-medium transition-all hover:scale-105 ${action.color} hover:opacity-90`}
                >
                  <action.icon className="h-4 w-4 shrink-0" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
