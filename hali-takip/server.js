#!/usr/bin/env node
/*
 * Halı Takip — halı yıkamacılar için tek ekranlık sipariş takip sistemi.
 * Sıfır bağımlılık: sadece Node.js (v18+) yeterli.  Çalıştır: node server.js
 *
 * v2: önceden numaralı fiş desteği, sahada ölçüsüz "Hızlı Alım",
 *     dükkanda ölçü tamamlama, askı yeri takibi ve fiş numarasıyla halı bulma.
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
const DEFAULT_RACKS = ["A1", "A2", "A3", "B1", "B2", "B3"];

// ---------- veri ----------
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SECRET_FILE)) {
  fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString("hex"));
}
const SECRET = fs.readFileSync(SECRET_FILE, "utf8").trim();

function loadDb() {
  let db;
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    db = { settings: {}, orders: [] };
  }
  db.settings = {
    shopName: "Halı Yıkama",
    pricePerM2: 70,
    racks: DEFAULT_RACKS,
    ...db.settings,
  };
  // v1 kayıtlarını v2 şemasına taşı (fiş no ve askı alanları)
  for (const o of db.orders) {
    for (const c of o.carpets) {
      if (!("tag" in c)) c.tag = null;
      if (!("rack" in c)) c.rack = null;
    }
  }
  return db;
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
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
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
  return d;
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
function nextTag() {
  let max = 100; // fiş ruloları 101'den başlar
  for (const o of db.orders)
    for (const c of o.carpets) if (c.tag && c.tag > max) max = c.tag;
  return max + 1;
}
function isMeasured(o) {
  return o.carpets.length > 0 && o.carpets.every((c) => c.m2 > 0);
}
function recomputeTotals(o) {
  if (isMeasured(o)) {
    const totalM2 = o.carpets.reduce((s, c) => s + c.m2, 0);
    o.totalM2 = Math.round(totalM2 * 100) / 100;
    o.price = Math.round(totalM2 * db.settings.pricePerM2);
  } else {
    o.totalM2 = null;
    o.price = null;
  }
}
function activeCarpetByTag(tag) {
  // aynı fiş no eski (teslim edilmiş) işlerde geçmiş olabilir; aktif olan öncelikli,
  // yoksa en yeni kayıt gösterilir
  let found = null;
  for (const o of db.orders) {
    const c = o.carpets.find((x) => x.tag === tag);
    if (!c) continue;
    if (o.status !== "teslim") return { order: o, carpet: c };
    if (!found) found = { order: o, carpet: c };
  }
  return found;
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
    const { shopName, pricePerM2, racks } = await readBody(req);
    if (shopName) db.settings.shopName = String(shopName).slice(0, 60);
    const p = Number(pricePerM2);
    if (p > 0) db.settings.pricePerM2 = p;
    if (Array.isArray(racks)) {
      const clean = racks.map((r) => String(r).trim().toUpperCase().slice(0, 8)).filter(Boolean);
      if (clean.length) db.settings.racks = [...new Set(clean)];
    }
    saveDb(db);
    json(res, 200, db.settings);
  },

  "GET /api/orders": (req, res) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    json(res, 200, { orders: db.orders, settings: db.settings, nextTag: nextTag() });
  },

  // Sipariş oluşturma — iki mod:
  //  1) Hızlı Alım (sahada): {name, phone, note, quick:{count, startTag}} → ölçüsüz
  //  2) Detaylı (dükkanda): {name, phone, note, carpets:[{w,h}], startTag?} → ölçülü
  "POST /api/orders": async (req, res) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    const b = await readBody(req);
    const name = String(b.name || "").trim().slice(0, 80);
    const phone = normalizePhone(b.phone);
    if (!name) return json(res, 400, { error: "Müşteri adı gerekli" });

    let carpets;
    if (b.quick) {
      const count = Math.floor(Number(b.quick.count));
      if (!(count >= 1 && count <= 100))
        return json(res, 400, { error: "Halı adedi 1-100 arası olmalı" });
      const startTag = Math.floor(Number(b.quick.startTag)) || nextTag();
      carpets = Array.from({ length: count }, (_, i) => ({
        tag: startTag + i, w: null, h: null, m2: null, rack: null,
      }));
    } else {
      const startTag = Math.floor(Number(b.startTag)) || nextTag();
      carpets = (Array.isArray(b.carpets) ? b.carpets : [])
        .map((c, i) => {
          const w = Number(c.w), h = Number(c.h);
          const m2 = c.m2 != null ? Number(c.m2) : w * h;
          return {
            tag: Math.floor(Number(c.tag)) || startTag + i,
            w: w || null, h: h || null,
            m2: m2 > 0 ? Math.round(m2 * 100) / 100 : null,
            rack: null,
          };
        })
        .filter((c) => c.m2 > 0);
      if (!carpets.length) return json(res, 400, { error: "En az bir halı ölçüsü gerekli" });
    }

    // fiş no çakışma kontrolü (aktif işler arasında)
    for (const c of carpets) {
      const hit = activeCarpetByTag(c.tag);
      if (hit && hit.order.status !== "teslim")
        return json(res, 400, { error: `Fiş ${c.tag} şu an ${hit.order.customer.name} işinde kullanılıyor` });
    }

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
    };
    recomputeTotals(order);
    db.orders.unshift(order);
    saveDb(db);
    json(res, 200, { order });
  },

  // Dükkanda ölçü tamamlama: {carpets:[{tag, w, h}]}
  "POST /api/orders/:id/measure": async (req, res, params) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    const order = db.orders.find((o) => o.id === params.id);
    if (!order) return json(res, 404, { error: "sipariş yok" });
    const b = await readBody(req);
    for (const m of Array.isArray(b.carpets) ? b.carpets : []) {
      const c = order.carpets.find((x) => x.tag === Math.floor(Number(m.tag)));
      if (!c) continue;
      const w = Number(m.w), h = Number(m.h);
      if (w > 0 && h > 0) {
        c.w = w; c.h = h;
        c.m2 = Math.round(w * h * 100) / 100;
      }
    }
    recomputeTotals(order);
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
    if (status === "teslim") for (const c of order.carpets) c.rack = null; // askı boşaldı
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

  // Askıya asma: {tags:[214,215], rack:"B3"}  (rack:null → askıdan indir)
  "POST /api/rack": async (req, res) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    const b = await readBody(req);
    const rack = b.rack == null ? null : String(b.rack).trim().toUpperCase();
    if (rack && !db.settings.racks.includes(rack))
      return json(res, 400, { error: `Tanımsız askı: ${rack} (Ayarlar'dan ekleyin)` });
    const updated = [], missing = [];
    for (const t of Array.isArray(b.tags) ? b.tags : []) {
      const tag = Math.floor(Number(t));
      const hit = activeCarpetByTag(tag);
      if (hit && hit.order.status !== "teslim") {
        hit.carpet.rack = rack;
        updated.push(tag);
      } else missing.push(tag);
    }
    saveDb(db);
    json(res, 200, { updated, missing });
  },

  // Halı bul: fiş numarasından müşteri + askı yeri
  "GET /api/find/:tag": (req, res, params) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    const tag = Math.floor(Number(params.tag));
    const hit = activeCarpetByTag(tag);
    if (!hit) return json(res, 404, { error: `Fiş ${tag} kayıtlarda yok` });
    const { order, carpet } = hit;
    json(res, 200, {
      tag,
      rack: carpet.rack,
      m2: carpet.m2,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status],
      customer: order.customer.name,
      phone: order.customer.phone,
      orderId: order.id,
      code: order.code,
      allTags: order.carpets.map((c) => ({ tag: c.tag, rack: c.rack })),
    });
  },

  // Askı doluluk haritası
  "GET /api/racks": (req, res) => {
    if (!isAuthed(req)) return json(res, 401, { error: "giriş gerekli" });
    const map = Object.fromEntries(db.settings.racks.map((r) => [r, []]));
    for (const o of db.orders) {
      if (o.status === "teslim") continue;
      for (const c of o.carpets)
        if (c.rack && map[c.rack])
          map[c.rack].push({ tag: c.tag, customer: o.customer.name });
    }
    json(res, 200, { racks: db.settings.racks, map });
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
  if (p === "/raflar") return serveFile(res, "raflar.html");
  if (p.startsWith("/t/")) return serveFile(res, "track.html");
  return serveFile(res, p.slice(1));
});

server.listen(PORT, () => {
  console.log(`Halı Takip çalışıyor → http://localhost:${PORT}  (PIN: ${PIN === "1234" ? "1234 — DEĞİŞTİRİN (HALI_PIN ortam değişkeni)" : "özel"})`);
});
