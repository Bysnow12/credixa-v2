'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, X, Save, Loader2, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/utils'

const mockProductos = [
  { id: '1', nombre: 'TV Samsung 55"', categoria: 'Electrónica', precioContado: 45000, precioCredito: 52000, costo: 32000, stock: 8, stockMinimo: 3, activo: true },
  { id: '2', nombre: 'Refrigerador LG 20 pies', categoria: 'Electrodomésticos', precioContado: 65000, precioCredito: 75000, costo: 48000, stock: 4, stockMinimo: 2, activo: true },
  { id: '3', nombre: 'Abanico de Techo', categoria: 'Electrodomésticos', precioContado: 8500, precioCredito: 10000, costo: 5500, stock: 2, stockMinimo: 5, activo: true },
  { id: '4', nombre: 'Teléfono iPhone 15', categoria: 'Electrónica', precioContado: 85000, precioCredito: 98000, costo: 72000, stock: 12, stockMinimo: 3, activo: true },
  { id: '5', nombre: 'Lavadora LG 18lbs', categoria: 'Electrodomésticos', precioContado: 48000, precioCredito: 56000, costo: 35000, stock: 6, stockMinimo: 2, activo: true },
  { id: '6', nombre: 'Microondas Panasonic', categoria: 'Electrodomésticos', precioContado: 12000, precioCredito: 14500, costo: 8500, stock: 0, stockMinimo: 3, activo: false },
]

interface Producto {
  id: string
  nombre: string
  categoria: string
  precioContado: number
  precioCredito: number
  costo: number
  stock: number
  stockMinimo: number
  activo: boolean
}

function ModalProducto({
  producto,
  onClose,
  onSave,
}: {
  producto?: Producto | null
  onClose: () => void
  onSave: (p: Producto) => void
}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const ic = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
  const [form, setForm] = useState(
    producto
      ? {
          nombre: producto.nombre,
          categoria: producto.categoria,
          precioContado: String(producto.precioContado),
          precioCredito: String(producto.precioCredito),
          costo: String(producto.costo),
          stock: String(producto.stock),
          stockMinimo: String(producto.stockMinimo),
        }
      : {
          nombre: '',
          categoria: 'Electrónica',
          precioContado: '',
          precioCredito: '',
          costo: '',
          stock: '0',
          stockMinimo: '5',
        }
  )
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    onSave({
      id: producto?.id || String(Date.now()),
      nombre: form.nombre,
      categoria: form.categoria,
      precioContado: parseFloat(form.precioContado) || 0,
      precioCredito: parseFloat(form.precioCredito) || 0,
      costo: parseFloat(form.costo) || 0,
      stock: parseInt(form.stock) || 0,
      stockMinimo: parseInt(form.stockMinimo) || 5,
      activo: true,
    })
    setLoading(false)
    setSuccess(true)
    setTimeout(onClose, 900)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-lg">{producto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <p className="font-semibold text-green-500">Producto guardado</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nombre del producto *</label>
              <input
                value={form.nombre}
                onChange={e => upd('nombre', e.target.value)}
                required
                placeholder="Ej: TV Samsung 55 pulgadas"
                className={ic}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Categoría</label>
              <select value={form.categoria} onChange={e => upd('categoria', e.target.value)} className={ic}>
                {['Electrónica', 'Electrodomésticos', 'Muebles', 'Ropa', 'Calzado', 'Otro'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Precio contado (RD$)</label>
                <input
                  type="number"
                  value={form.precioContado}
                  onChange={e => upd('precioContado', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  className={ic}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Precio crédito (RD$)</label>
                <input
                  type="number"
                  value={form.precioCredito}
                  onChange={e => upd('precioCredito', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  className={ic}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Costo</label>
                <input
                  type="number"
                  value={form.costo}
                  onChange={e => upd('costo', e.target.value)}
                  min="0"
                  step="0.01"
                  className={ic}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={e => upd('stock', e.target.value)}
                  min="0"
                  className={ic}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mínimo</label>
                <input
                  type="number"
                  value={form.stockMinimo}
                  onChange={e => upd('stockMinimo', e.target.value)}
                  min="0"
                  className={ic}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg brand-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="h-4 w-4" /> Guardar</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function InventarioPage() {
  const [search, setSearch] = useState('')
  const [productos, setProductos] = useState<Producto[]>(mockProductos)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)

  const filtered = productos.filter(
    p => search === '' || p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (p: Producto) => {
    setProductos(prev => {
      const existe = prev.find(x => x.id === p.id)
      return existe ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este producto?')) setProductos(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">Gestión de productos para venta a crédito</p>
        </div>
        <button
          onClick={() => { setEditando(null); setShowModal(true) }}
          className="flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total productos', value: productos.length, color: 'text-foreground' },
          { label: 'Disponibles', value: productos.filter(p => p.stock > 0).length, color: 'text-green-500' },
          { label: 'Stock bajo', value: productos.filter(p => p.stock < p.stockMinimo).length, color: 'text-orange-500' },
          { label: 'Sin stock', value: productos.filter(p => p.stock === 0).length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="h-10 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="h-11 px-4 text-left">Producto</th>
                <th className="h-11 px-4 text-left hidden md:table-cell">Categoría</th>
                <th className="h-11 px-4 text-right">Precio contado</th>
                <th className="h-11 px-4 text-right hidden sm:table-cell">Precio crédito</th>
                <th className="h-11 px-4 text-center">Stock</th>
                <th className="h-11 px-4 text-center">Estado</th>
                <th className="h-11 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-medium">{p.nombre}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{p.categoria}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(p.precioContado)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-primary hidden sm:table-cell">{formatCurrency(p.precioCredito)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {p.stock < p.stockMinimo && p.stock > 0 && (
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      )}
                      <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < p.stockMinimo ? 'text-orange-500' : 'text-foreground'}`}>
                        {p.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.activo && p.stock > 0 ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {p.stock === 0 ? 'Sin stock' : p.activo ? 'Disponible' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditando(p); setShowModal(true) }}
                        className="rounded-lg p-1.5 hover:bg-accent transition-colors text-muted-foreground"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-1.5 hover:bg-red-500/10 hover:text-red-500 transition-colors text-muted-foreground"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Modal dentro del return */}
      {showModal && (
        <ModalProducto
          producto={editando}
          onClose={() => { setShowModal(false); setEditando(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}