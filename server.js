// server.js
// Archivo de inicio para producción con PM2 o cPanel
// Uso: node server.js | pm2 start server.js --name credixa

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOST || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`
╔════════════════════════════════════════╗
║         CREDIXA - SISTEMA ACTIVO       ║
╠════════════════════════════════════════╣
║  URL:  http://${hostname}:${port}            ║
║  ENV:  ${process.env.NODE_ENV || 'development'}                     ║
║  PID:  ${process.pid}                           ║
╚════════════════════════════════════════╝
      `)
    })
})
