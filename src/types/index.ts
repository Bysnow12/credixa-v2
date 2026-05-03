// src/types/index.ts
// Tipos globales de Credixa

export type Rol = 'SUPERADMIN' | 'ADMIN' | 'EMPRESA' | 'SUPERVISOR' | 'SOCIO' | 'VENDEDOR'
export type EstadoCliente = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO' | 'MOROSO'
export type EstadoPrestamo = 'ACTIVO' | 'PAGADO' | 'VENCIDO' | 'REFINANCIADO' | 'CASTIGADO' | 'CANCELADO'
export type FrecuenciaPago = 'DIARIO' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'PERSONALIZADO'
export type TipoPrestamo = 'PRESTAMO_PERSONAL' | 'VENTA_CREDITO' | 'HIPOTECARIO' | 'PRENDARIO'
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE' | 'OTRO'
export type TipoMovimiento = 'INGRESO' | 'EGRESO' | 'RETIRO' | 'DEPOSITO' | 'GASTO' | 'COMISION'

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: Rol
  activo: boolean
  avatar?: string
  telefono?: string
  empresaId?: string
  empresa?: Empresa
  createdAt: string
  updatedAt: string
}

export interface Empresa {
  id: string
  nombre: string
  logo?: string
  moneda: string
  simboloMoneda: string
  colorPrimario: string
  colorSecundario: string
  tasaInteresDefault: number
  moraDefault: number
  diasGraciaMora: number
}

export interface Cliente {
  id: string
  empresaId: string
  nombre: string
  apellido: string
  cedula?: string
  foto?: string
  telefono: string
  telefono2?: string
  email?: string
  whatsapp?: string
  direccion?: string
  ciudad?: string
  provincia?: string
  estado: EstadoCliente
  scoreRiesgo: number
  notasInternas?: string
  createdAt: string
  updatedAt: string
  referencias?: Referencia[]
  documentos?: Documento[]
  _count?: {
    prestamos: number
  }
  // Calculados
  totalPrestado?: number
  totalPagado?: number
  saldoPendiente?: number
}

export interface Referencia {
  id: string
  clienteId: string
  nombre: string
  telefono: string
  relacion?: string
  direccion?: string
}

export interface Documento {
  id: string
  clienteId: string
  tipo: string
  url: string
  nombre: string
  createdAt: string
}

export interface Prestamo {
  id: string
  codigo: string
  empresaId: string
  clienteId: string
  cliente?: Cliente
  vendedorId?: string
  vendedor?: Vendedor
  tipo: TipoPrestamo
  estado: EstadoPrestamo
  capital: number
  interes: number
  montoInteres: number
  montoTotal: number
  montoPagado: number
  saldoPendiente: number
  tasaMora: number
  moraAcumulada: number
  frecuencia: FrecuenciaPago
  numeroCuotas: number
  montoCuota: number
  cuotasPagadas: number
  cuotasPendientes: number
  fechaDesembolso: string
  fechaPrimerPago: string
  fechaVencimiento: string
  fechaUltimoPago?: string
  descripcion?: string
  notas?: string
  createdAt: string
  pagos?: Pago[]
  cuotas?: Cuota[]
}

export interface Cuota {
  id: string
  prestamoId: string
  numero: number
  monto: number
  montoPagado: number
  saldo: number
  fechaVence: string
  fechaPago?: string
  estado: string
  mora: number
}

export interface Pago {
  id: string
  codigo: string
  prestamoId: string
  prestamo?: Prestamo
  cobradoPorId: string
  cobradoPor?: Usuario
  monto: number
  montoCapital: number
  montoInteres: number
  montoMora: number
  metodoPago: MetodoPago
  referencia?: string
  notas?: string
  reciboUrl?: string
  fechaPago: string
  createdAt: string
}

export interface Vendedor {
  id: string
  usuarioId: string
  usuario?: Usuario
  empresaId: string
  comisionVenta: number
  comisionCobro: number
  ruta?: string
  zona?: string
  activo: boolean
  // Stats calculados
  totalPrestamos?: number
  totalCobrado?: number
  comisionesTotales?: number
}

export interface Producto {
  id: string
  empresaId: string
  categoriaId?: string
  categoria?: Categoria
  nombre: string
  descripcion?: string
  imagen?: string
  codigo?: string
  precioContado: number
  precioCredito: number
  costo?: number
  stock: number
  stockMinimo: number
  activo: boolean
}

export interface Categoria {
  id: string
  nombre: string
  icono?: string
  color?: string
}

export interface CajaMovimiento {
  id: string
  empresaId: string
  tipo: TipoMovimiento
  concepto: string
  monto: number
  referencia?: string
  usuarioId: string
  fecha: string
}

// Dashboard types
export interface DashboardStats {
  totalCartera: number
  totalPrestado: number
  totalCobrado: number
  pagosPendientes: number
  clientesMorosos: number
  ventasHoy: number
  ingresosHoy: number
  balanceGeneral: number
  clientesActivos: number
  prestamosActivos: number
  tasaMorosidad: number
  cobranzaEfectividad: number
}

export interface GraficaMensual {
  mes: string
  prestado: number
  cobrado: number
  mora: number
}

export interface TopCliente {
  id: string
  nombre: string
  apellido: string
  foto?: string
  totalPrestado: number
  totalPagado: number
  prestamosActivos: number
}

export interface TopVendedor {
  id: string
  nombre: string
  apellido: string
  avatar?: string
  totalVentas: number
  totalCobrado: number
  comisiones: number
}

export interface UltimoMovimiento {
  id: string
  tipo: string
  descripcion: string
  monto: number
  fecha: string
  cliente?: string
  vendedor?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LoginResponse {
  token: string
  usuario: Usuario
  empresa?: Empresa
}

// Form types
export interface ClienteForm {
  nombre: string
  apellido: string
  cedula?: string
  telefono: string
  telefono2?: string
  email?: string
  whatsapp?: string
  direccion?: string
  ciudad?: string
  provincia?: string
  notasInternas?: string
}

export interface PrestamoForm {
  clienteId: string
  vendedorId?: string
  tipo: TipoPrestamo
  capital: number
  interes: number
  frecuencia: FrecuenciaPago
  numeroCuotas: number
  fechaDesembolso: string
  fechaPrimerPago: string
  descripcion?: string
  notas?: string
}

export interface PagoForm {
  prestamoId: string
  monto: number
  metodoPago: MetodoPago
  referencia?: string
  notas?: string
  fechaPago: string
}

// Sidebar navigation
export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
  roles?: Rol[]
}

// Session
export interface SessionUser {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: Rol
  empresaId?: string
  avatar?: string
}
