#!/usr/bin/env node
/*
 * Halı Takip — halı yıkamacılar için tek ekranlık sipariş takip sistemi.
 * Sıfır bağımlılık: sadece Node.js (v18+) yeterli.  Çalıştır: node server.js
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = process.env.PORT || 3000;
const PIN = process.env.HALI_PIN || "1234";
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SECRET_FILE = path.join(DATA_DIR, "secret");
const PUBLIC_DIR = path.join(__dirname, "public");

const STATUSES = ["alindi", "yikaniyor", "kurutuluyor", "hazir", "teslim"];
const STATUS_LABELS = {
  alindi: "Alındı",
  yikaniyor: "Yıkanıyor",
  kurutuluyor: "Kurutuluyor",
  hazir: "Hazır",
  teslim: "Teslim edildi",
};

// ---------- veri ----------
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SECRET_FILE)) {
  fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString("hex"));
}
const SECRET = fs.readFileSync(SECRET_FILE, "utf8").trim();

function loadDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return { settings: { shopName: "Halı Yıkama", pricePerM2: 70 }, orders: [] };
  }
}
function saveDb(db) {
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}
let db = loadDb();

// ---------- yardımcılar ----------
function authToken() {
  return crypto.createHmac("sha256", SECRET).update("pin:" + PIN).digest("hex");
}
function isAuthed(req) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || "").split(";").map((c) => {
      const i = c.indexOf("=");
      return [c.slice(0, i).trim(), c.slice(i + 1).trim()];
    })
  );
  return cookies.ht_auth === authToken();
}
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1e6) reject(new Error("too big"));
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}
function normalizePhone(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = d.slice(1);
  if (d.length === 10 && d.startsWith("5")) d = "90" + d;
  if (d.startsWith("90") && d.length === 12) return d;
  return d; // yabancı numara vs. — olduğu gibi bırak
}
function newCode() {
  // karışması kolay harfler (O/0, I/1) hariç
  const chars = "ABCDEFGHJKLMNPRSTUVYZ23456789";
  let code;
  do {
    code = Array.from(crypto.randomBytes(6), (b) => chars[b % chars.length]).join("");
  } while (db.orders.some((o) => o.code === code));
  return code;
}
function computeTotals(carpets) {
  const totalM2 = carpets.reduce((s, c) => s + c.m2, 0);
  return {
    totalM2: Math.round(totalM2 * 100) / 100,
    price: Math.round(totalM2 * db.settings.pricePerM2),
  };
}

// ---------- API ----------
const routes = {
  "POST /api/login": async (req, res) => {
    const { pin } = await readBody(req);
    if (String(pin) !== PIN) return json(res, 401, { error: "PIN hatalı" });
    res.writeHead(200, {
      "Set-Cookie": `ht_auth=${authToken()}; HttpOnly; Path=/; Max-Age=31536000; SameSite=Lax`,
      "Content-Type": "application/json",
    });
    res.end('{"ok":true}');
  },

  "GET /api/me": (req, res) =>
    isAuthed(req) ? json(res, 200, { ok: true }) : json(res, 401, { error: "giriş gerekli" }),

  "GET /api/settings": (req, res) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    json(res, 200, db.settings);
  },

  "POST /api/settings": async (req, res) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    const { shopName, pricePerM2 } = await readBody(req);
    if (shopName) db.settings.shopName = String(shopName).slice(0, 60);
    const p = Number(pricePerM2);
    if (p > 0) db.settings.pricePerM2 = p;
    saveDb(db);
    json(res, 200, db.settings);
  },

  "GET /api/orders": (req, res) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    json(res, 200, { orders: db.orders, settings: db.settings });
  },

  "POST /api/orders": async (req, res) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    const b = await readBody(req);
    const name = String(b.name || "").trim().slice(0, 80);
    const phone = normalizePhone(b.phone);
    const carpets = (Array.isArray(b.carpets) ? b.carpets : [])
      .map((c) => {
        const w = Number(c.w), h = Number(c.h);
        const m2 = c.m2 != null ? Number(c.m2) : w * h;
        return { w: w || null, h: h || null, m2: Math.round(m2 * 100) / 100 };
      })
      .filter((c) => c.m2 > 0);
    if (!name || carpets.length === 0)
      return json(res, 400, { error: "İsim ve en az bir halı gerekli" });
    const now = Date.now();
    const order = {
      id: crypto.randomUUID(),
      code: newCode(),
      createdAt: now,
      customer: { name, phone },
      carpets,
      note: String(b.note || "").slice(0, 300),
      status: "alindi",
      history: [{ status: "alindi", at: now }],
      ...computeTotals(carpets),
    };
    db.orders.unshift(order);
    saveDb(db);
    json(res, 200, { order });
  },

  "POST /api/orders/:id/status": async (req, res, params) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    const { status } = await readBody(req);
    if (!STATUSES.includes(status)) return json(res, 400, { error: "geçersiz durum" });
    const order = db.orders.find((o) => o.id === params.id);
    if (!order) return json(res, 404, { error: "sipariş yok" });
    order.status = status;
    order.history.push({ status, at: Date.now() });
    saveDb(db);
    json(res, 200, { order });
  },

  "POST /api/orders/:id/delete": (req, res, params) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    const i = db.orders.findIndex((o) => o.id === params.id);
    if (i === -1) return json(res, 404, { error: "sipariş yok" });
    db.orders.splice(i, 1);
    saveDb(db);
    json(res, 200, { ok: true });
  },

  // müşteri takip — halka açık, kişisel veri asgari
  "GET /api/track/:code": (req, res, params) => {
    const order = db.orders.find((o) => o.code === params.code.toUpperCase());
    if (!order) return json(res, 404, { error: "Takip kodu bulunamadı" });
    json(res, 200, {
      code: order.code,
      shopName: db.settings.shopName,
      firstName: order.customer.name.split(" ")[0],
      carpetCount: order.carpets.length,
      totalM2: order.totalM2,
      price: order.price,
      status: order.status,
      statuses: STATUSES,
      labels: STATUS_LABELS,
      history: order.history,
    });
  },
};

// ---------- statik dosyalar ----------
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
};
function serveFile(res, file) {
  const full = path.join(PUBLIC_DIR, file);
  if (!full.startsWith(PUBLIC_DIR) || !fs.existsSync(full)) {
    res.writeHead(404);
    return res.end("bulunamadı");
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(full)] || "application/octet-stream" });
  fs.createReadStream(full).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const p = url.pathname;

  // API yönlendirme (parametreli)
  for (const key of Object.keys(routes)) {
    const [method, pattern] = key.split(" ");
    if (req.method !== method) continue;
    const patParts = pattern.split("/");
    const urlParts = p.split("/");
    if (patParts.length !== urlParts.length) continue;
    const params = {};
    let match = true;
    for (let i = 0; i < patParts.length; i++) {
      if (patParts[i].startsWith(":")) params[patParts[i].slice(1)] = decodeURIComponent(urlParts[i]);
      else if (patParts[i] !== urlParts[i]) { match = false; break; }
    }
    if (match) {
      try {
        return await routes[key](req, res, params);
      } catch (e) {
        return json(res, 500, { error: "sunucu hatası" });
      }
    }
  }

  if (p === "/" || p === "/index.html") return serveFile(res, "index.html");
  if (p.startsWith("/t/")) return serveFile(res, "track.html");
  return serveFile(res, p.slice(1));
});

server.listen(PORT, () => {
  console.log(`Halı Takip çalışıyor → http://localhost:${PORT}  (PIN: ${PIN === "1234" ? "1234 — DEĞİŞTİRİN (HALI_PIN ortam değişkeni)" : "özel"})`);
});
