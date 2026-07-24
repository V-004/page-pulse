import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { execFile } from "child_process";

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get(["/health", "/api/health"], (req, res) => {
  res.json({ status: "ok", service: "Page Pulse API" });
});

// Audit API handler executing python audit runner
app.post(["/audit", "/api/audit"], (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  const pythonScript = `
import sys, os, json
sys.path.insert(0, os.getcwd())

from backend.utils import (
    audit_url, InvalidURLException, TimeoutException,
    UnreachableException, NonHTMLContentException, ExceptionCustom
)

try:
    url_arg = sys.argv[1] if len(sys.argv) > 1 else ""
    res = audit_url(url_arg)
    print(json.dumps({"status_code": 200, "data": res}))
except InvalidURLException as e:
    print(json.dumps({"status_code": 400, "error": "Invalid URL"}))
except TimeoutException as e:
    print(json.dumps({"status_code": 408, "error": "Request timed out"}))
except UnreachableException as e:
    print(json.dumps({"status_code": 502, "error": str(e.message) if getattr(e, 'message', None) else "Unable to reach website"}))
except NonHTMLContentException as e:
    print(json.dumps({"status_code": 415, "error": "URL is not an HTML page"}))
except ExceptionCustom as e:
    print(json.dumps({"status_code": getattr(e, 'status_code', 500), "error": str(e.message)}))
except Exception as e:
    print(json.dumps({"status_code": 500, "error": "Internal server error"}))
  `;

  execFile(pythonCmd, ["-c", pythonScript, url], { timeout: 15000 }, (error, stdout, stderr) => {
    if (error && error.killed) {
      return res.status(408).json({ error: "Request timed out" });
    }
    
    try {
      const output = stdout.trim();
      if (!output) {
        return res.status(500).json({ error: "Internal server error" });
      }
      
      const parsed = JSON.parse(output);
      if (parsed.data) {
        return res.status(parsed.status_code || 200).json(parsed.data);
      } else if (parsed.error) {
        return res.status(parsed.status_code || 500).json({ error: parsed.error });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    } catch (parseErr) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Page Pulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
