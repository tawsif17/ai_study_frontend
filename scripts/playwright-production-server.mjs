import { createServer } from "node:http"
import next from "next"

const hostname = "127.0.0.1"
const port = 3100
const app = next({
  dev: false,
  dir: process.cwd(),
  hostname,
  port,
})
const handle = app.getRequestHandler()

await app.prepare()

const server = createServer((request, response) => {
  if (request.method === "POST" && request.url === "/__playwright_shutdown") {
    response.writeHead(204)
    response.end()
    setTimeout(() => {
      void shutdown().finally(() => process.exit(0))
    }, 25)
    return
  }
  void handle(request, response)
})

await new Promise((resolve, reject) => {
  server.once("error", reject)
  server.listen(port, hostname, resolve)
})

let shuttingDown = false

async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true

  server.closeAllConnections?.()
  await new Promise((resolve) => server.close(resolve))
  await app.close()
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    void shutdown().finally(() => process.exit(0))
  })
}

process.once("uncaughtException", (error) => {
  void shutdown().finally(() => {
    console.error(error)
    process.exit(1)
  })
})

process.once("unhandledRejection", (error) => {
  void shutdown().finally(() => {
    console.error(error)
    process.exit(1)
  })
})
