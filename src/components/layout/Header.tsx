// src/components/layout/Header.tsx
'use client'

import { Bell, Search, Menu, Moon, Sun, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'

interface HeaderProps {
  onMenuToggle: () => void
  title?: string
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [showNotif, setShowNotif] = useState(false)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop collapse toggle */}
      <button
        onClick={onMenuToggle}
        className="hidden rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors lg:flex"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar clientes, préstamos..."
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border bg-popover shadow-xl">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-sm font-semibold">Notificaciones</h3>
                <button onClick={() => setShowNotif(false)} className="text-xs text-primary hover:underline">Marcar todas leídas</button>
              </div>
              <div className="divide-y max-h-64 overflow-y-auto">
                {[
                  { title: 'Pedro López en mora', msg: '12 días de retraso · RD$ 160,000', color: 'bg-orange-500' },
                  { title: 'Nuevo pago registrado', msg: 'María González pagó RD$ 8,500', color: 'bg-green-500' },
                  { title: 'Vencimiento próximo', msg: 'Ana Martínez vence en 3 días', color: 'bg-blue-500' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 hover:bg-accent cursor-pointer">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.color}`} />
                    <div>
                      <p className="text-xs font-medium">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground">{n.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t">
                <button className="w-full rounded-lg text-xs text-center text-primary hover:bg-accent py-1.5 transition-colors">Ver todas las notificaciones</button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full brand-gradient text-xs font-bold text-white shadow-sm">
          AD
        </div>
      </div>
    </header>
  )
}
