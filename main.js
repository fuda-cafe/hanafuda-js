import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts"

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
await serve(handler, { port })
