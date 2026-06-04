import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import {
  backendPaths,
  executeQuery,
  getSessionForToken,
  getUploadFile,
  importCatalogueProducts,
  isMysqlConfigured,
  invokeFunction,
  resetPasswordDirect,
  setSession,
  signInWithPassword,
  signOut,
  signUp,
  uploadFile,
} from "./store.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const publicRoot = path.join(projectRoot, "public");
const isProduction = process.argv.includes("--production") || process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 8080);

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const streamFile = (res, filePath, contentType) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", contentType);
  fs.createReadStream(filePath).pipe(res);
};

const readJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const getAccessToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length);
};

const tryStaticFile = (requestPath) => {
  const normalized = requestPath === "/" ? "/index.html" : requestPath;
  const target = path.join(distRoot, normalized.replace(/^\/+/, ""));

  if (!target.startsWith(distRoot) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    return null;
  }

  const ext = path.extname(target).toLowerCase();
  const contentType =
    ext === ".js" ? "text/javascript; charset=utf-8"
    : ext === ".css" ? "text/css; charset=utf-8"
    : ext === ".svg" ? "image/svg+xml"
    : ext === ".json" ? "application/json; charset=utf-8"
    : ext === ".png" ? "image/png"
    : ext === ".webp" ? "image/webp"
    : ext === ".ico" ? "image/x-icon"
    : "text/html; charset=utf-8";

  return { target, contentType };
};

const getHeroSlideFiles = () => {
  const heroDir = path.join(publicRoot, "images", "hero-slides");
  if (!fs.existsSync(heroDir)) return [];

  const allFiles = fs
    .readdirSync(heroDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(png|jpe?g|webp|avif)$/i.test(name))
    .sort((left, right) => left.localeCompare(right));

  const orderedFiles = allFiles.filter((name) => /^(0[1-4])-/i.test(name));
  const chosenFiles = orderedFiles.length ? orderedFiles : allFiles;

  return chosenFiles.map((name) => `/images/hero-slides/${name}`);
};

const handleApi = async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const { pathname } = requestUrl;

  if (pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      mode: isProduction ? "production" : "development",
      database: isMysqlConfigured() ? "mysql" : "file",
    });
    return true;
  }

  if (pathname === "/api/hero-slides") {
    sendJson(res, 200, { data: getHeroSlideFiles(), error: null });
    return true;
  }

  if (pathname === "/api/auth/session" && req.method === "GET") {
    const response = await getSessionForToken(getAccessToken(req));
    sendJson(res, 200, response);
    return true;
  }

  if (pathname === "/api/auth/sign-in" && req.method === "POST") {
    const response = await signInWithPassword(await readJsonBody(req));
    sendJson(res, 200, response);
    return true;
  }

  if (pathname === "/api/auth/sign-up" && req.method === "POST") {
    const response = await signUp(await readJsonBody(req));
    sendJson(res, 200, response);
    return true;
  }

  if (pathname === "/api/auth/reset-password" && req.method === "POST") {
    const response = await resetPasswordDirect(await readJsonBody(req));
    sendJson(res, 200, response);
    return true;
  }

  if (pathname === "/api/auth/sign-out" && req.method === "POST") {
    const response = await signOut(getAccessToken(req));
    sendJson(res, 200, response);
    return true;
  }

  if (pathname === "/api/auth/set-session" && req.method === "POST") {
    const response = await setSession(await readJsonBody(req));
    sendJson(res, 200, response);
    return true;
  }

  if (pathname === "/api/catalogues/import-products" && req.method === "POST") {
    const response = await importCatalogueProducts(await readJsonBody(req));
    sendJson(res, 200, response);
    return true;
  }

  if (pathname === "/api/query" && req.method === "POST") {
    const response = await executeQuery(await readJsonBody(req));
    sendJson(res, 200, response);
    return true;
  }

  if (pathname.startsWith("/api/functions/") && req.method === "POST") {
    const name = pathname.replace("/api/functions/", "");
    const body = await readJsonBody(req);
    const origin = `${requestUrl.protocol}//${requestUrl.host}`;
    const response = await invokeFunction(name, body.body || body, origin);
    sendJson(res, 200, response);
    return true;
  }

  if (pathname === "/api/storage/upload" && req.method === "POST") {
    const response = await uploadFile(await readJsonBody(req));
    sendJson(res, 200, response);
    return true;
  }

  return false;
};

const handleUploads = (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (!requestUrl.pathname.startsWith("/uploads/")) return false;

  let uploadPath = requestUrl.pathname.replace("/uploads/", "");
  try {
    uploadPath = decodeURIComponent(uploadPath);
  } catch {
    res.statusCode = 400;
    res.end("Invalid upload path");
    return true;
  }

  const result = getUploadFile(uploadPath);
  if (!result) {
    res.statusCode = 404;
    res.end("Not found");
    return true;
  }

  streamFile(res, result.filePath, result.contentType);
  return true;
};

const createApp = async () => {
  let vite = null;
  const server = http.createServer(async (req, res) => {
    try {
      if (await handleApi(req, res)) return;
      if (handleUploads(req, res)) return;

      if (isProduction) {
        const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
        const staticFile = tryStaticFile(requestUrl.pathname);
        if (staticFile) {
          streamFile(res, staticFile.target, staticFile.contentType);
          return;
        }

        const indexPath = path.join(distRoot, "index.html");
        if (fs.existsSync(indexPath)) {
          streamFile(res, indexPath, "text/html; charset=utf-8");
          return;
        }

        res.statusCode = 500;
        res.end("Build output not found. Run npm run build first.");
        return;
      }

      vite.middlewares(req, res, () => {
        res.statusCode = 404;
        res.end("Not found");
      });
    } catch (error) {
      if (vite) vite.ssrFixStacktrace(error);
      sendJson(res, 500, { error: error instanceof Error ? error.message : "Server error" });
    }
  });

  if (!isProduction) {
    vite = await createViteServer({
      root: projectRoot,
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: "spa",
    });
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Regal project server running at http://localhost:${port}`);
    console.log(`Uploads root: ${backendPaths.uploadRoot}`);
  });
};

await createApp();
