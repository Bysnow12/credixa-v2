# Credixa — Sistema de Gestión de Créditos y Préstamos

**Plataforma SaaS profesional para gestión de préstamos, ventas a crédito, cobranzas y control de cartera.**

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 + TypeScript + TailwindCSS |
| UI Components | Shadcn UI + Radix UI |
| Gráficas | Recharts |
| Backend | Next.js API Routes |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Autenticación | JWT (jose) + bcryptjs |
| Datos en cache | TanStack Query v5 |
| Validación | Zod |
| Animaciones | Framer Motion |
| Reportes | jsPDF + XLSX |

---

## 📁 Estructura del Proyecto

```
credixa/
├── prisma/
│   ├── schema.prisma          # Esquema completo de la BD
│   └── seed.ts                # Datos de demostración
├── src/
│   ├── app/
│   │   ├── api/               # API Routes (backend)
│   │   │   ├── auth/          # login, logout, me
│   │   │   ├── clientes/      # CRUD clientes
│   │   │   ├── prestamos/     # CRUD préstamos
│   │   │   ├── pagos/         # Registro de cobros
│   │   │   ├── vendedores/    # Gestión de vendedores
│   │   │   ├── productos/     # Inventario
│   │   │   ├── caja/          # Movimientos de caja
│   │   │   ├── reportes/      # Reportes avanzados
│   │   │   └── dashboard/     # Estadísticas generales
│   │   ├── dashboard/         # Páginas del panel
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── clientes/      # Gestión de clientes
│   │   │   ├── prestamos/     # Gestión de préstamos
│   │   │   ├── cobros/        # Cobros y pagos
│   │   │   ├── vendedores/    # Equipo de ventas
│   │   │   ├── inventario/    # Productos
│   │   │   ├── caja/          # Flujo de caja
│   │   │   ├── reportes/      # Reportes
│   │   │   └── configuracion/ # Ajustes del sistema
│   │   ├── login/             # Página de acceso
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── layout/            # Sidebar, Header
│   │   └── providers.tsx      # ThemeProvider + QueryClient
│   ├── hooks/
│   │   └── useApi.ts          # Hooks de datos (React Query)
│   ├── lib/
│   │   ├── auth.ts            # JWT utilities
│   │   └── db.ts              # Prisma client singleton
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── utils/
│       └── index.ts           # Helpers (formatCurrency, etc.)
├── middleware.ts               # Auth middleware
├── .env.example               # Variables de entorno
└── README.md
```

---

## ⚡ Instalación y Configuración

### 1. Clonar e instalar dependencias
```bash
git clone https://github.com/tu-usuario/credixa.git
cd credixa
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/credixa_db"
JWT_SECRET="tu-clave-secreta-muy-segura-aqui"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Configurar la base de datos
```bash
# Crear la base de datos en PostgreSQL
createdb credixa_db

# Aplicar el esquema
npm run db:push

# (Opcional) Poblar con datos de demostración
npm run db:seed
```

### 4. Iniciar en desarrollo
```bash
npm run dev
```

Accede a: **http://localhost:3000**

---

## 🔐 Credenciales de Demo

Después de ejecutar el seed:

| Usuario | Email | Contraseña | Rol |
|---------|-------|-----------|-----|
| Administrador | admin@credixa.com | admin123 | ADMIN |
| Supervisor | supervisor@credixa.com | admin123 | SUPERVISOR |
| Vendedor 1 | juan@credixa.com | vendedor123 | VENDEDOR |
| Vendedor 2 | pedro@credixa.com | vendedor123 | VENDEDOR |
| Vendedor 3 | carmen@credixa.com | vendedor123 | VENDEDOR |

---

## 🚀 Despliegue en Producción (VPS/cPanel)

### Opción A: Servidor VPS (Ubuntu)

```bash
# 1. Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# 3. Crear base de datos
sudo -u postgres psql -c "CREATE DATABASE credixa_db;"
sudo -u postgres psql -c "CREATE USER credixa_user WITH PASSWORD 'tu_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE credixa_db TO credixa_user;"

# 4. Clonar y configurar el proyecto
git clone https://github.com/tu-usuario/credixa.git /var/www/credixa
cd /var/www/credixa
npm install
cp .env.example .env
# Editar .env con los valores de producción

# 5. Build y migración
npm run build
npm run db:push
npm run db:seed

# 6. Configurar PM2 para proceso persistente
npm install -g pm2
pm2 start npm --name "credixa" -- start
pm2 save
pm2 startup

# 7. Configurar Nginx como reverse proxy
sudo nano /etc/nginx/sites-available/credixa
```

Configuración Nginx:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Opción B: cPanel con Node.js

1. En cPanel, ir a **Software → Setup Node.js App**
2. Crear nueva app:
   - Node.js version: 18+
   - Application mode: Production
   - Application root: `/home/usuario/credixa`
   - Application URL: `tu-dominio.com`
   - Application startup file: `server.js`
3. Configurar variables de entorno en cPanel
4. Ejecutar `npm install && npm run build`

---

## 📊 Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | KPIs, gráficas mensuales, top clientes/vendedores, últimos movimientos |
| **Clientes** | CRUD completo con foto, documentos, referencias y score de riesgo |
| **Préstamos** | Creación con cálculo automático de cuotas, refinanciación, mora |
| **Cobros** | Registro de pagos, generación de recibos PDF, envío WhatsApp |
| **Vendedores** | Comisiones, rutas, rendimiento mensual |
| **Inventario** | Productos, stock, precios contado vs crédito |
| **Caja** | Ingresos, egresos, retiros, cierre de caja |
| **Reportes** | Mora, financiero, clientes, vendedores — Exportar PDF/Excel |
| **Configuración** | Empresa, intereses, notificaciones, recibos, seguridad |

---

## 🔑 Roles y Permisos

| Rol | Acceso |
|-----|--------|
| SUPERADMIN | Acceso total a todas las empresas |
| ADMIN | Acceso total a su empresa |
| SUPERVISOR | Ver y gestionar, sin eliminar |
| SOCIO | Solo reportes y dashboard |
| VENDEDOR | Crear préstamos/clientes, registrar cobros |

---

## 🔗 API Endpoints

```
POST   /api/auth/login          Iniciar sesión
POST   /api/auth/logout         Cerrar sesión
GET    /api/auth/me             Usuario actual

GET    /api/dashboard           Estadísticas generales
GET    /api/clientes            Listar clientes
POST   /api/clientes            Crear cliente
GET    /api/clientes/:id        Detalle cliente
PUT    /api/clientes/:id        Actualizar cliente
DELETE /api/clientes/:id        Eliminar cliente

GET    /api/prestamos           Listar préstamos
POST   /api/prestamos           Crear préstamo
GET    /api/prestamos/:id       Detalle préstamo
POST   /api/prestamos/:id       Refinanciar préstamo
DELETE /api/prestamos/:id       Cancelar préstamo

GET    /api/pagos               Listar cobros
POST   /api/pagos               Registrar cobro

GET    /api/vendedores          Listar vendedores
POST   /api/vendedores          Crear vendedor
GET    /api/productos           Inventario
POST   /api/productos           Crear producto
GET    /api/caja                Movimientos de caja
POST   /api/caja                Registrar movimiento
GET    /api/reportes?tipo=...   Reportes (mora|financiero|clientes|vendedores)
```

---

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Iniciar producción
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Crear migración
npm run db:push      # Push esquema a BD
npm run db:seed      # Poblar con datos demo
npm run db:studio    # Abrir Prisma Studio
```

---

## 📄 Licencia

Copyright © 2025 Credixa. Todos los derechos reservados.
