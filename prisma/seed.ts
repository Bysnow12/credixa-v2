// prisma/seed.ts
// Ejecutar con: npm run db:seed

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos Credixa...')

  // ── 1. Crear empresa demo ──────────────────────────────────
  const empresa = await prisma.empresa.upsert({
    where: { id: 'empresa-demo-001' },
    update: {},
    create: {
      id: 'empresa-demo-001',
      nombre: 'FinanCorp RD',
      rnc: '131-12345-6',
      direccion: 'Av. Winston Churchill #25, Santo Domingo',
      telefono: '809-555-0100',
      email: 'info@finacorp.com',
      moneda: 'DOP',
      simboloMoneda: 'RD$',
      colorPrimario: '#6366f1',
      colorSecundario: '#8b5cf6',
      tasaInteresDefault: 10,
      moraDefault: 2,
      diasGraciaMora: 3,
      planActivo: 'professional',
    },
  })
  console.log('✅ Empresa creada:', empresa.nombre)

  // ── 2. Crear usuarios ──────────────────────────────────────
  const passwordAdmin = await bcrypt.hash('admin123', 12)
  const passwordVendedor = await bcrypt.hash('vendedor123', 12)

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@credixa.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      apellido: 'Principal',
      email: 'admin@credixa.com',
      password: passwordAdmin,
      rol: 'ADMIN',
      activo: true,
      empresaId: empresa.id,
    },
  })

  const supervisor = await prisma.usuario.upsert({
    where: { email: 'supervisor@credixa.com' },
    update: {},
    create: {
      nombre: 'Carlos',
      apellido: 'Supervisor',
      email: 'supervisor@credixa.com',
      password: passwordAdmin,
      rol: 'SUPERVISOR',
      activo: true,
      empresaId: empresa.id,
    },
  })

  const usuarioJuan = await prisma.usuario.upsert({
    where: { email: 'juan@credixa.com' },
    update: {},
    create: {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@credixa.com',
      password: passwordVendedor,
      rol: 'VENDEDOR',
      activo: true,
      telefono: '809-555-0201',
      empresaId: empresa.id,
    },
  })

  const usuarioPedro = await prisma.usuario.upsert({
    where: { email: 'pedro@credixa.com' },
    update: {},
    create: {
      nombre: 'Pedro',
      apellido: 'Gómez',
      email: 'pedro@credixa.com',
      password: passwordVendedor,
      rol: 'VENDEDOR',
      activo: true,
      telefono: '809-555-0202',
      empresaId: empresa.id,
    },
  })

  const usuarioCarmen = await prisma.usuario.upsert({
    where: { email: 'carmen@credixa.com' },
    update: {},
    create: {
      nombre: 'Carmen',
      apellido: 'Rosa',
      email: 'carmen@credixa.com',
      password: passwordVendedor,
      rol: 'VENDEDOR',
      activo: true,
      empresaId: empresa.id,
    },
  })

  console.log('✅ Usuarios creados: admin, supervisor, 3 vendedores')

  // ── 3. Crear vendedores ────────────────────────────────────
  const vendedor1 = await prisma.vendedor.upsert({
    where: { usuarioId: usuarioJuan.id },
    update: {},
    create: {
      usuarioId: usuarioJuan.id,
      empresaId: empresa.id,
      comisionVenta: 2.0,
      comisionCobro: 1.0,
      ruta: 'Ruta Norte A',
      zona: 'Zona Norte',
      activo: true,
    },
  })

  const vendedor2 = await prisma.vendedor.upsert({
    where: { usuarioId: usuarioPedro.id },
    update: {},
    create: {
      usuarioId: usuarioPedro.id,
      empresaId: empresa.id,
      comisionVenta: 2.0,
      comisionCobro: 1.0,
      ruta: 'Ruta Sur B',
      zona: 'Zona Sur',
      activo: true,
    },
  })

  const vendedor3 = await prisma.vendedor.upsert({
    where: { usuarioId: usuarioCarmen.id },
    update: {},
    create: {
      usuarioId: usuarioCarmen.id,
      empresaId: empresa.id,
      comisionVenta: 2.5,
      comisionCobro: 1.5,
      ruta: 'Ruta Este C',
      zona: 'Zona Este',
      activo: true,
    },
  })

  console.log('✅ Vendedores configurados')

  // ── 4. Crear categorías ────────────────────────────────────
  const catElectronica = await prisma.categoria.upsert({
    where: { id: 'cat-electronica' },
    update: {},
    create: { id: 'cat-electronica', nombre: 'Electrónica', icono: '📱', color: '#6366f1' },
  })
  const catElectrodomesticos = await prisma.categoria.upsert({
    where: { id: 'cat-electro' },
    update: {},
    create: { id: 'cat-electro', nombre: 'Electrodomésticos', icono: '🏠', color: '#22c55e' },
  })
  const catMuebles = await prisma.categoria.upsert({
    where: { id: 'cat-muebles' },
    update: {},
    create: { id: 'cat-muebles', nombre: 'Muebles', icono: '🛋️', color: '#f59e0b' },
  })

  // ── 5. Crear productos ─────────────────────────────────────
  const productosData = [
    { nombre: 'TV Samsung 55" 4K', categoriaId: catElectronica.id, precioContado: 45000, precioCredito: 52000, costo: 32000, stock: 8 },
    { nombre: 'iPhone 15 128GB', categoriaId: catElectronica.id, precioContado: 85000, precioCredito: 98000, costo: 72000, stock: 12 },
    { nombre: 'Refrigerador LG 20 pies', categoriaId: catElectrodomesticos.id, precioContado: 65000, precioCredito: 75000, costo: 48000, stock: 4 },
    { nombre: 'Lavadora LG 18lbs', categoriaId: catElectrodomesticos.id, precioContado: 48000, precioCredito: 56000, costo: 35000, stock: 6 },
    { nombre: 'Abanico de Techo 52"', categoriaId: catElectrodomesticos.id, precioContado: 8500, precioCredito: 10000, costo: 5500, stock: 2 },
    { nombre: 'Juego de Sala 3 Piezas', categoriaId: catMuebles.id, precioContado: 38000, precioCredito: 45000, costo: 28000, stock: 5 },
  ]

  for (const p of productosData) {
    await prisma.producto.create({
      data: { ...p, empresaId: empresa.id, activo: true, stockMinimo: 3 },
    }).catch(() => {}) // ignore if exists
  }

  console.log('✅ Productos de inventario creados')

  // ── 6. Crear clientes ──────────────────────────────────────
  const clientesData = [
    { nombre: 'María', apellido: 'González', cedula: '001-1234567-1', telefono: '809-555-1001', ciudad: 'Santo Domingo', provincia: 'Distrito Nacional', estado: 'ACTIVO' as const, scoreRiesgo: 92 },
    { nombre: 'Carlos', apellido: 'Rodríguez', cedula: '001-2345678-2', telefono: '809-555-1002', ciudad: 'Santiago', provincia: 'Santiago', estado: 'ACTIVO' as const, scoreRiesgo: 78 },
    { nombre: 'Ana', apellido: 'Martínez', cedula: '001-3456789-3', telefono: '809-555-1003', ciudad: 'La Vega', provincia: 'La Vega', estado: 'ACTIVO' as const, scoreRiesgo: 95 },
    { nombre: 'Pedro', apellido: 'López', cedula: '001-4567890-4', telefono: '809-555-1004', ciudad: 'San Pedro', provincia: 'San Pedro de Macorís', estado: 'MOROSO' as const, scoreRiesgo: 45 },
    { nombre: 'Luisa', apellido: 'Fernández', cedula: '001-5678901-5', telefono: '809-555-1005', ciudad: 'La Romana', provincia: 'La Romana', estado: 'ACTIVO' as const, scoreRiesgo: 88 },
    { nombre: 'José', apellido: 'García', cedula: '001-6789012-6', telefono: '829-555-1006', ciudad: 'Santo Domingo', provincia: 'Distrito Nacional', estado: 'ACTIVO' as const, scoreRiesgo: 72 },
    { nombre: 'Carmen', apellido: 'Sánchez', cedula: '001-7890123-7', telefono: '829-555-1007', ciudad: 'Santiago', provincia: 'Santiago', estado: 'INACTIVO' as const, scoreRiesgo: 60 },
    { nombre: 'Miguel', apellido: 'Torres', cedula: '001-8901234-8', telefono: '849-555-1008', ciudad: 'Santo Domingo', provincia: 'Distrito Nacional', estado: 'ACTIVO' as const, scoreRiesgo: 85 },
    { nombre: 'Rosa', apellido: 'Ramírez', cedula: '001-9012345-9', telefono: '809-555-1009', ciudad: 'Santo Domingo Este', provincia: 'Distrito Nacional', estado: 'MOROSO' as const, scoreRiesgo: 38 },
    { nombre: 'Luis', apellido: 'Cruz', cedula: '001-0123456-0', telefono: '809-555-1010', ciudad: 'Higüey', provincia: 'La Altagracia', estado: 'ACTIVO' as const, scoreRiesgo: 91 },
  ]

  const clientes = []
  for (const c of clientesData) {
    const cliente = await prisma.cliente.create({
      data: {
        ...c,
        empresaId: empresa.id,
        whatsapp: c.telefono,
        direccion: `Calle Principal #${Math.floor(Math.random() * 200) + 1}`,
        pais: 'DO',
        referencias: {
          create: [{
            nombre: 'Referencia Personal',
            telefono: '809-555-9999',
            relacion: 'Familiar',
          }],
        },
      },
    }).catch(async () => {
      // return existing if duplicate
      return await prisma.cliente.findFirst({ where: { cedula: c.cedula, empresaId: empresa.id } })
    })
    if (cliente) clientes.push(cliente)
  }

  console.log(`✅ ${clientes.length} clientes creados`)

  // ── 7. Crear préstamos ─────────────────────────────────────
  const { addMonths, addDays } = await import('date-fns')

  const prestamosData = [
    { clienteIdx: 0, capital: 50000, interes: 10, cuotas: 12, vendedor: vendedor1 },
    { clienteIdx: 1, capital: 80000, interes: 12, cuotas: 12, vendedor: vendedor1 },
    { clienteIdx: 2, capital: 30000, interes: 10, cuotas: 10, vendedor: vendedor2 },
    { clienteIdx: 3, capital: 60000, interes: 12, cuotas: 12, vendedor: vendedor2, estado: 'VENCIDO' as const },
    { clienteIdx: 4, capital: 45000, interes: 10, cuotas: 12, vendedor: vendedor3 },
    { clienteIdx: 5, capital: 100000, interes: 10, cuotas: 24, vendedor: vendedor1 },
    { clienteIdx: 7, capital: 75000, interes: 8, cuotas: 12, vendedor: vendedor3 },
    { clienteIdx: 8, capital: 40000, interes: 15, cuotas: 10, vendedor: vendedor2, estado: 'VENCIDO' as const },
    { clienteIdx: 9, capital: 90000, interes: 10, cuotas: 12, vendedor: vendedor1 },
  ]

  for (let i = 0; i < prestamosData.length; i++) {
    const pd = prestamosData[i]
    if (!clientes[pd.clienteIdx]) continue

    const montoInteres = pd.capital * (pd.interes / 100)
    const montoTotal = pd.capital + montoInteres
    const montoCuota = montoTotal / pd.cuotas
    const cuotasPagadas = Math.floor(pd.cuotas * 0.4)
    const montoPagado = montoCuota * cuotasPagadas
    const fechaDesembolso = addMonths(new Date(), -(i + 2))
    const fechaPrimerPago = addMonths(fechaDesembolso, 1)
    const fechaVencimiento = addMonths(fechaPrimerPago, pd.cuotas - 1)

    const codigo = `PRE-${String(i + 1).padStart(5, '0')}`

    const prestamo = await prisma.prestamo.create({
      data: {
        codigo,
        empresaId: empresa.id,
        clienteId: clientes[pd.clienteIdx]!.id,
        vendedorId: pd.vendedor.id,
        creadoPorId: admin.id,
        tipo: 'PRESTAMO_PERSONAL',
        estado: pd.estado || 'ACTIVO',
        capital: pd.capital,
        interes: pd.interes,
        tipoInteres: 'FIJO',
        montoInteres,
        montoTotal,
        montoPagado,
        saldoPendiente: montoTotal - montoPagado,
        tasaMora: 2,
        moraAcumulada: pd.estado === 'VENCIDO' ? pd.capital * 0.02 * 15 : 0,
        frecuencia: 'MENSUAL',
        numeroCuotas: pd.cuotas,
        montoCuota,
        cuotasPagadas,
        cuotasPendientes: pd.cuotas - cuotasPagadas,
        fechaDesembolso,
        fechaPrimerPago,
        fechaVencimiento,
        fechaUltimoPago: cuotasPagadas > 0 ? addMonths(fechaPrimerPago, cuotasPagadas - 1) : null,
      },
    }).catch(() => null)

    if (!prestamo) continue

    // Crear cuotas
    for (let c = 0; c < pd.cuotas; c++) {
      const fechaVence = addMonths(fechaPrimerPago, c)
      const pagada = c < cuotasPagadas
      await prisma.cuota.create({
        data: {
          prestamoId: prestamo.id,
          numero: c + 1,
          monto: montoCuota,
          montoPagado: pagada ? montoCuota : 0,
          saldo: pagada ? 0 : montoCuota,
          fechaVence,
          fechaPago: pagada ? addMonths(fechaPrimerPago, c) : null,
          estado: pagada ? 'PAGADA' : pd.estado === 'VENCIDO' && c === cuotasPagadas ? 'VENCIDA' : 'PENDIENTE',
        },
      }).catch(() => {})
    }

    // Crear pagos históricos
    for (let p = 0; p < cuotasPagadas; p++) {
      const codigoPago = `PAG-${String(i * 20 + p + 1).padStart(5, '0')}`
      await prisma.pago.create({
        data: {
          codigo: codigoPago,
          prestamoId: prestamo.id,
          cobradoPorId: [usuarioJuan, usuarioPedro, usuarioCarmen][p % 3].id,
          monto: montoCuota,
          montoCapital: montoCuota * 0.85,
          montoInteres: montoCuota * 0.15,
          montoMora: 0,
          metodoPago: p % 3 === 0 ? 'EFECTIVO' : p % 3 === 1 ? 'TRANSFERENCIA' : 'EFECTIVO',
          fechaPago: addMonths(fechaPrimerPago, p),
          reciboGenerado: true,
        },
      }).catch(() => {})
    }

    // Registrar en caja
    await prisma.cajaMovimiento.create({
      data: {
        empresaId: empresa.id,
        tipo: 'EGRESO',
        concepto: `Desembolso préstamo ${codigo}`,
        monto: -pd.capital,
        referencia: prestamo.id,
        usuarioId: admin.id,
        fecha: fechaDesembolso,
      },
    }).catch(() => {})
  }

  console.log('✅ Préstamos y pagos históricos creados')

  // ── 8. Movimientos de caja adicionales ────────────────────
  const movimientosExtra = [
    { tipo: 'INGRESO' as const, concepto: 'Depósito inicial de capital', monto: 500000 },
    { tipo: 'GASTO' as const, concepto: 'Gastos de oficina - Papelería', monto: -3500 },
    { tipo: 'GASTO' as const, concepto: 'Servicios de internet', monto: -2800 },
    { tipo: 'RETIRO' as const, concepto: 'Retiro de utilidades - Socio A', monto: -50000 },
    { tipo: 'DEPOSITO' as const, concepto: 'Depósito de capital adicional', monto: 200000 },
  ]

  for (const mov of movimientosExtra) {
    await prisma.cajaMovimiento.create({
      data: {
        empresaId: empresa.id,
        tipo: mov.tipo,
        concepto: mov.concepto,
        monto: mov.monto,
        usuarioId: admin.id,
      },
    }).catch(() => {})
  }

  console.log('✅ Movimientos de caja adicionales creados')

  // ── 9. Configuración de empresa ────────────────────────────
  await prisma.configuracionEmpresa.upsert({
    where: { empresaId: empresa.id },
    update: {},
    create: {
      empresaId: empresa.id,
      reciboEncabezado: 'Gracias por su pago puntual',
      reciboPie: 'Conserve este comprobante. FinanCorp RD - Tel: 809-555-0100',
      reciboLogoActivo: true,
      alertaDiasCobro: 2,
      alertaMoraActiva: true,
      alertaVencimientoActiva: true,
    },
  })

  console.log('✅ Configuración de empresa guardada')

  // ── Resumen ────────────────────────────────────────────────
  console.log('\n🎉 Seed completado exitosamente!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('CREDENCIALES DE ACCESO:')
  console.log('  Admin:     admin@credixa.com       / admin123')
  console.log('  Supervisor: supervisor@credixa.com  / admin123')
  console.log('  Vendedor 1: juan@credixa.com        / vendedor123')
  console.log('  Vendedor 2: pedro@credixa.com       / vendedor123')
  console.log('  Vendedor 3: carmen@credixa.com      / vendedor123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(e => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
