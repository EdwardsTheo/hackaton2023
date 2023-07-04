import net from "net"

const scanPort = (targetHost, targetPort) =>
  new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = 1000

    socket.setTimeout(timeout)
    socket.once("connect", () => {
      resolve({ ip: targetHost, port: targetPort, status: "ouvert" })
      socket.end()
    })

    socket.on("timeout", () => {
      resolve({ ip: targetHost, port: targetPort, status: "fermé" })
      socket.end()
    })

    socket.on("error", () => {
      resolve({ ip: targetHost, port: targetPort, status: "fermé" })
    })

    socket.connect(targetPort, targetHost)
  })

export default async (req, res) => {
  const targetHosts = req.body.ip.split(",")
  const targetPorts = [21, 22, 80, 443, 3389, 8080]
  let scanResults = []

  for (const host of targetHosts) {
    for (const port of targetPorts) {
      const result = await scanPort(host, port)
      scanResults.push(result)
    }
  }

  const scan_datetime = new Date().toISOString()
  const scan_data = { scan_datetime, results: scanResults }

  res.status(200).json(scan_data)
}
