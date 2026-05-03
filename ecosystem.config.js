// ecosystem.config.js
// Configuración de PM2 para producción
// Uso: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'credixa',
      script: 'server.js',
      instances: 'max',          // Usar todos los CPUs disponibles
      exec_mode: 'cluster',       // Modo cluster para alta disponibilidad
      watch: false,
      max_memory_restart: '1G',

      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,

      // Reinicio automático
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Variables de entorno (sobreescribir con tu .env)
      node_args: '--max-old-space-size=2048',
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'tu-servidor.com',
      ref: 'origin/main',
      repo: 'git@github.com:tu-usuario/credixa.git',
      path: '/var/www/credixa',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npx prisma generate && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
}
