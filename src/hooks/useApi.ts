// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud')
  return data
}

// ─── Dashboard ────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetcher('/api/dashboard'),
    refetchInterval: 60000,
  })
}

// ─── Clientes ─────────────────────────────────────────────────
export function useClientes(params?: { search?: string; estado?: string; page?: number }) {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.estado) qs.set('estado', params.estado)
  if (params?.page) qs.set('page', String(params.page))

  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => fetcher(`/api/clientes?${qs}`),
  })
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ['clientes', id],
    queryFn: () => fetcher(`/api/clientes/${id}`),
    enabled: !!id,
  })
}

export function useCreateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => fetcher('/api/clientes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  })
}

export function useUpdateCliente(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => fetcher(`/api/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] })
      qc.invalidateQueries({ queryKey: ['clientes', id] })
    },
  })
}

export function useDeleteCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetcher(`/api/clientes/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  })
}

// ─── Préstamos ────────────────────────────────────────────────
export function usePrestamos(params?: { search?: string; estado?: string; clienteId?: string; page?: number }) {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.estado) qs.set('estado', params.estado)
  if (params?.clienteId) qs.set('clienteId', params.clienteId)
  if (params?.page) qs.set('page', String(params.page))

  return useQuery({
    queryKey: ['prestamos', params],
    queryFn: () => fetcher(`/api/prestamos?${qs}`),
  })
}

export function usePrestamo(id: string) {
  return useQuery({
    queryKey: ['prestamos', id],
    queryFn: () => fetcher(`/api/prestamos/${id}`),
    enabled: !!id,
  })
}

export function useCreatePrestamo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => fetcher('/api/prestamos', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prestamos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useRefinanciarPrestamo(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => fetcher(`/api/prestamos/${id}`, { method: 'POST', body: JSON.stringify({ accion: 'refinanciar', ...data }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prestamos'] })
      qc.invalidateQueries({ queryKey: ['prestamos', id] })
    },
  })
}

// ─── Pagos ────────────────────────────────────────────────────
export function usePagos(params?: { prestamoId?: string; page?: number }) {
  const qs = new URLSearchParams()
  if (params?.prestamoId) qs.set('prestamoId', params.prestamoId)
  if (params?.page) qs.set('page', String(params.page))

  return useQuery({
    queryKey: ['pagos', params],
    queryFn: () => fetcher(`/api/pagos?${qs}`),
  })
}

export function useCreatePago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => fetcher('/api/pagos', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pagos'] })
      qc.invalidateQueries({ queryKey: ['prestamos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['caja'] })
    },
  })
}

// ─── Vendedores ───────────────────────────────────────────────
export function useVendedores() {
  return useQuery({
    queryKey: ['vendedores'],
    queryFn: () => fetcher('/api/vendedores'),
  })
}

export function useCreateVendedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => fetcher('/api/vendedores', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendedores'] }),
  })
}

// ─── Productos ────────────────────────────────────────────────
export function useProductos(search?: string) {
  return useQuery({
    queryKey: ['productos', search],
    queryFn: () => fetcher(`/api/productos${search ? `?search=${search}` : ''}`),
  })
}

// ─── Caja ─────────────────────────────────────────────────────
export function useCaja(params?: { fechaInicio?: string; fechaFin?: string; tipo?: string }) {
  const qs = new URLSearchParams()
  if (params?.fechaInicio) qs.set('fechaInicio', params.fechaInicio)
  if (params?.fechaFin) qs.set('fechaFin', params.fechaFin)
  if (params?.tipo) qs.set('tipo', params.tipo)

  return useQuery({
    queryKey: ['caja', params],
    queryFn: () => fetcher(`/api/caja?${qs}`),
  })
}

export function useCreateMovimiento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => fetcher('/api/caja', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['caja'] }),
  })
}

// ─── Reportes ─────────────────────────────────────────────────
export function useReporte(tipo: string, params?: { fechaInicio?: string; fechaFin?: string }) {
  const qs = new URLSearchParams({ tipo })
  if (params?.fechaInicio) qs.set('fechaInicio', params.fechaInicio)
  if (params?.fechaFin) qs.set('fechaFin', params.fechaFin)

  return useQuery({
    queryKey: ['reportes', tipo, params],
    queryFn: () => fetcher(`/api/reportes?${qs}`),
    staleTime: 5 * 60 * 1000,
  })
}
