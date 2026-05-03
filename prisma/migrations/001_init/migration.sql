-- ============================================================
-- CREDIXA - Migración inicial PostgreSQL
-- Archivo: prisma/migrations/001_init/migration.sql
-- Ejecutar con: npm run db:push  ó  npm run db:migrate
-- ============================================================

-- Enums
CREATE TYPE "Rol" AS ENUM ('SUPERADMIN', 'ADMIN', 'EMPRESA', 'SUPERVISOR', 'SOCIO', 'VENDEDOR');
CREATE TYPE "EstadoCliente" AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO', 'MOROSO');
CREATE TYPE "EstadoPrestamo" AS ENUM ('ACTIVO', 'PAGADO', 'VENCIDO', 'REFINANCIADO', 'CASTIGADO', 'CANCELADO');
CREATE TYPE "FrecuenciaPago" AS ENUM ('DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'PERSONALIZADO');
CREATE TYPE "TipoPrestamo" AS ENUM ('PRESTAMO_PERSONAL', 'VENTA_CREDITO', 'HIPOTECARIO', 'PRENDARIO');
CREATE TYPE "TipoInteres" AS ENUM ('FIJO', 'REDUCIDO', 'MANUAL');
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO');
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'EGRESO', 'RETIRO', 'DEPOSITO', 'GASTO', 'COMISION');

-- Tabla: empresas
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "logo" TEXT,
    "rnc" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'DOP',
    "simboloMoneda" TEXT NOT NULL DEFAULT 'RD$',
    "colorPrimario" TEXT NOT NULL DEFAULT '#6366f1',
    "colorSecundario" TEXT NOT NULL DEFAULT '#8b5cf6',
    "planActivo" TEXT NOT NULL DEFAULT 'basic',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "tasaInteresDefault" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "moraDefault" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "diasGraciaMora" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- Tabla: usuarios
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "telefono" TEXT,
    "empresaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- Tabla: sesiones
CREATE TABLE "sesiones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- Tabla: clientes
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cedula" TEXT,
    "foto" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "genero" TEXT,
    "telefono" TEXT NOT NULL,
    "telefono2" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "provincia" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'DO',
    "coordenadas" TEXT,
    "estado" "EstadoCliente" NOT NULL DEFAULT 'ACTIVO',
    "scoreRiesgo" INTEGER NOT NULL DEFAULT 100,
    "notasInternas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- Tabla: referencias
CREATE TABLE "referencias" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "relacion" TEXT,
    "direccion" TEXT,
    CONSTRAINT "referencias_pkey" PRIMARY KEY ("id")
);

-- Tabla: documentos
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- Tabla: vendedores
CREATE TABLE "vendedores" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "comisionVenta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comisionCobro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ruta" TEXT,
    "zona" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vendedores_pkey" PRIMARY KEY ("id")
);

-- Tabla: prestamos
CREATE TABLE "prestamos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "vendedorId" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "tipo" "TipoPrestamo" NOT NULL DEFAULT 'PRESTAMO_PERSONAL',
    "estado" "EstadoPrestamo" NOT NULL DEFAULT 'ACTIVO',
    "capital" DOUBLE PRECISION NOT NULL,
    "interes" DOUBLE PRECISION NOT NULL,
    "tipoInteres" "TipoInteres" NOT NULL DEFAULT 'FIJO',
    "montoInteres" DOUBLE PRECISION NOT NULL,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldoPendiente" DOUBLE PRECISION NOT NULL,
    "tasaMora" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "moraAcumulada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "frecuencia" "FrecuenciaPago" NOT NULL DEFAULT 'MENSUAL',
    "numeroCuotas" INTEGER NOT NULL,
    "montoCuota" DOUBLE PRECISION NOT NULL,
    "cuotasPagadas" INTEGER NOT NULL DEFAULT 0,
    "cuotasPendientes" INTEGER NOT NULL,
    "fechaDesembolso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaPrimerPago" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "fechaUltimoPago" TIMESTAMP(3),
    "descripcion" TEXT,
    "notas" TEXT,
    "prestamoOriginalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "prestamos_pkey" PRIMARY KEY ("id")
);

-- Tabla: cuotas
CREATE TABLE "cuotas" (
    "id" TEXT NOT NULL,
    "prestamoId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldo" DOUBLE PRECISION NOT NULL,
    "fechaVence" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "mora" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "cuotas_pkey" PRIMARY KEY ("id")
);

-- Tabla: pagos
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "prestamoId" TEXT NOT NULL,
    "cobradoPorId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "montoCapital" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montoInteres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montoMora" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "referencia" TEXT,
    "notas" TEXT,
    "comprobante" TEXT,
    "reciboGenerado" BOOLEAN NOT NULL DEFAULT false,
    "reciboUrl" TEXT,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- Tabla: productos
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "codigo" TEXT,
    "precioContado" DOUBLE PRECISION NOT NULL,
    "precioCredito" DOUBLE PRECISION NOT NULL,
    "costo" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- Tabla: categorias
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT,
    "color" TEXT,
    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- Tabla: caja_movimientos
CREATE TABLE "caja_movimientos" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "referencia" TEXT,
    "pagoId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "caja_movimientos_pkey" PRIMARY KEY ("id")
);

-- Tabla: cierres_caja
CREATE TABLE "cierres_caja" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaCierre" TIMESTAMP(3) NOT NULL,
    "saldoInicial" DOUBLE PRECISION NOT NULL,
    "totalIngresos" DOUBLE PRECISION NOT NULL,
    "totalEgresos" DOUBLE PRECISION NOT NULL,
    "totalRetiros" DOUBLE PRECISION NOT NULL,
    "saldoFinal" DOUBLE PRECISION NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cierres_caja_pkey" PRIMARY KEY ("id")
);

-- Tabla: notificaciones
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- Tabla: comisiones
CREATE TABLE "comisiones" (
    "id" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "prestamoId" TEXT,
    "pagoId" TEXT,
    "tipo" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "pagada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comisiones_pkey" PRIMARY KEY ("id")
);

-- Tabla: configuracion_empresa
CREATE TABLE "configuracion_empresa" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "reciboEncabezado" TEXT,
    "reciboPie" TEXT,
    "reciboLogoActivo" BOOLEAN NOT NULL DEFAULT true,
    "reciboFirmaActivo" BOOLEAN NOT NULL DEFAULT false,
    "whatsappActivo" BOOLEAN NOT NULL DEFAULT false,
    "whatsappToken" TEXT,
    "whatsappNumero" TEXT,
    "emailActivo" BOOLEAN NOT NULL DEFAULT false,
    "emailSmtp" TEXT,
    "emailPuerto" INTEGER,
    "emailUsuario" TEXT,
    "emailPassword" TEXT,
    "alertaDiasCobro" INTEGER NOT NULL DEFAULT 1,
    "alertaMoraActiva" BOOLEAN NOT NULL DEFAULT true,
    "alertaVencimientoActiva" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "configuracion_empresa_pkey" PRIMARY KEY ("id")
);

-- Índices únicos
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE UNIQUE INDEX "sesiones_token_key" ON "sesiones"("token");
CREATE UNIQUE INDEX "vendedores_usuarioId_key" ON "vendedores"("usuarioId");
CREATE UNIQUE INDEX "prestamos_codigo_key" ON "prestamos"("codigo");
CREATE UNIQUE INDEX "pagos_codigo_key" ON "pagos"("codigo");
CREATE UNIQUE INDEX "configuracion_empresa_empresaId_key" ON "configuracion_empresa"("empresaId");

-- Índices de rendimiento
CREATE INDEX "clientes_empresaId_idx" ON "clientes"("empresaId");
CREATE INDEX "clientes_estado_idx" ON "clientes"("estado");
CREATE INDEX "prestamos_empresaId_idx" ON "prestamos"("empresaId");
CREATE INDEX "prestamos_clienteId_idx" ON "prestamos"("clienteId");
CREATE INDEX "prestamos_estado_idx" ON "prestamos"("estado");
CREATE INDEX "pagos_prestamoId_idx" ON "pagos"("prestamoId");
CREATE INDEX "pagos_fechaPago_idx" ON "pagos"("fechaPago");
CREATE INDEX "caja_movimientos_empresaId_idx" ON "caja_movimientos"("empresaId");
CREATE INDEX "caja_movimientos_fecha_idx" ON "caja_movimientos"("fecha");

-- Foreign Keys
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "referencias" ADD CONSTRAINT "referencias_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prestamos" ADD CONSTRAINT "prestamos_prestamoOriginalId_fkey" FOREIGN KEY ("prestamoOriginalId") REFERENCES "prestamos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "prestamos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "prestamos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cobradoPorId_fkey" FOREIGN KEY ("cobradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "productos" ADD CONSTRAINT "productos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "caja_movimientos" ADD CONSTRAINT "caja_movimientos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "configuracion_empresa" ADD CONSTRAINT "configuracion_empresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
