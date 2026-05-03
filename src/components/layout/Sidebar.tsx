// src/components/layout/Sidebar.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, Wallet, UserSquare2,
  Package, Building2, BarChart3, Settings, ChevronRight,
  LogOut, Bell, Zap, Menu, X, ChevronDown, ShieldCheck
} from 'lucide-react'

interface NavItem {
  title: string
  href?: string
  icon: React.ElementType
  badge?: number
  children?: NavItem[]
}

const navigation: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Clientes', href: '/dashboard/clientes', icon: Users },
  {
    title: 'Préstamos',
    icon: CreditCard,
    children: [
      { title: 'Todos los préstamos', href: '/dashboard/prestamos', icon: CreditCard },
      { title: 'Nuevo préstamo', href: '/dashboard/prestamos/nuevo', icon: Zap },
      { title: 'Venta a crédito', href: '/dashboard/prestamos/credito', icon: ShieldCheck },
    ]
  },
  { title: 'Cobros y Pagos', href: '/dashboard/cobros', icon: Wallet },
  { title: 'Vendedores', href: '/dashboard/vendedores', icon: UserSquare2 },
  { title: 'Inventario', href: '/dashboard/inventario', icon: Package },
  { title: 'Caja', href: '/dashboard/caja', icon: Building2 },
  { title: 'Reportes', href: '/dashboard/reportes', icon: BarChart3 },
  { title: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    router.push('/login')
  }

  const toggleMenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  const isActive = (href?: string) => href === pathname
  const isParentActive = (item: NavItem) =>
    item.children?.some(c => c.href && pathname.startsWith(c.href))

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={`
        sidebar fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
        lg:sticky lg:top-0 lg:h-screen
        ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-4 border-b border-white/5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white tracking-tight">Credixa</h1>
              <p className="text-xs text-slate-400">Sistema de Créditos</p>
            </div>
          )}
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-0.5">
            {navigation.map((item) => {
              if (item.children) {
                const isOpen = openMenus.includes(item.title) || isParentActive(item)
                return (
                  <div key={item.title}>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={`nav-item w-full justify-between ${isParentActive(item) ? 'text-white' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </div>
                      {!collapsed && (
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {isOpen && !collapsed && (
                      <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/5 pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href!}
                            className={`nav-item ${isActive(child.href) ? 'active' : ''}`}
                          >
                            <child.icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-sm">{child.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-white/5 p-3">
          <div className={`flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 cursor-pointer transition-colors ${collapsed ? 'justify-center' : ''}`} onClick={!collapsed ? undefined : handleLogout}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white">
              AD
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <p className="text-xs text-slate-400 truncate">admin@credixa.com</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} title="Cerrar sesión" className="rounded p-0.5 hover:text-white transition-colors"><LogOut className="h-4 w-4 text-slate-400 hover:text-white" /></button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
