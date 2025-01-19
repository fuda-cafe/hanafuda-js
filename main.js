import { serveDir } from "jsr:@std/http/file-server"

const port = 8000
const handler = async (req) => {
  // Serve static files from the src directory
  const response = await serveDir(req, {
    fsRoot: "src",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  })

  return response
}

console.log(`HTTP server running at http://localhost:${port}/example/`)
await Deno.serve(handler, { port })
