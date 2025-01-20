const handler = async (req) => {
  const url = new URL(req.url)

  if (url.pathname === "/" || url.pathname === "/index.html") {
    try {
      const content = await Deno.readFile("./example/index.html")
      return new Response(content, {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      })
    } catch (error) {
      console.error("Error loading index.html:", error)
      return new Response(`Error loading index.html: ${error.message}`, {
        status: 500,
      })
    }
  }

  if (url.pathname === "/app.js") {
    try {
      const content = await Deno.readFile("./example/app.js")
      return new Response(content, {
        status: 200,
        headers: {
          "content-type": "application/javascript",
        },
      })
    } catch (error) {
      console.error("Error loading app.js:", error)
      return new Response(`Error loading app.js: ${error.message}`, {
        status: 500,
      })
    }
  }

  if (url.pathname === "/dist/index.min.js") {
    try {
      const content = await Deno.readFile("./dist/index.min.js")
      return new Response(content, {
        status: 200,
        headers: {
          "content-type": "application/javascript",
        },
      })
    } catch (error) {
      console.error("Error loading index.min.js:", error)
      return new Response(`Error loading index.min.js: ${error.message}`, {
        status: 500,
      })
    }
  }

  return new Response("Not Found", { status: 404 })
}

export default {
  fetch: handler,
}
