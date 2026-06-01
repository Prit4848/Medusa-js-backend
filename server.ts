import start from "@medusajs/medusa/commands/start"

start({
  directory: process.cwd(),
  port: Number(process.env.PORT || 9000),
  host: process.env.HOST || "0.0.0.0",
})
