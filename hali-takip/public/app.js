/* Halı Takip — esnaf paneli (v2: sesli Hızlı Alım, ölçü tamamlama, askı takibi) */
const $ = (s) => document.querySelector(s);
const STATUSES = ["alindi", "yikaniyor", "kurutuluyor", "hazir", "teslim"];
const LABELS = { alindi: "Alındı", yikaniyor: "Yıkanıyor", kurutuluyor: "Kurutuluyor", hazir: "Hazır", teslim: "Teslim edildi" };
const NEXT_LABEL = { alindi: "Yıkamaya al", yikaniyor: "Kurutmaya al", kurutuluyor: "Hazır olarak işaretle", hazir: "Teslim edildi olarak işaretle" };

let settings = { shopName: "Halı Yıkama", pricePerM2: 70, racks: [] };
let orders = [];
let nextTagSuggestion = 101;
let tab = "active";

/* ================= giriş ================= */
async function checkAuth() {
  const r = await fetch("/api/me");
  if (r.ok) {
    $("#login").classList.add("hidden");
    $("#app").classList.remove("hidden");
    await refresh();
  } else {
    $("#login").classList.remove("hidden");
    $("#app").classList.add("hidden");
  }
}
$("#loginBtn").onclick = async () => {
  const r = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin: $("#pin").value }),
  });
  if (r.ok) checkAuth();
  else $("#loginErr").textContent = "PIN hatalı";
};
$("#pin").addEventListener("keydown", (e) => e.key === "Enter" && $("#loginBtn").click());

/* ================= veri ================= */
async function refresh() {
  const r = await fetch("/api/orders");
  if (!r.ok) return checkAuth();
  const d = await r.json();
  orders = d.orders;
  settings = d.settings;
  nextTagSuggestion = d.nextTag;
  $("#shopName").textContent = settings.shopName;
  $("#priceInfo").textContent = `m² fiyatı: ${settings.pricePerM2} TL`;
  const qt = document.querySelector('[name="qtag"]');
  if (qt && !qt.value) qt.value = nextTagSuggestion;
  $("#quickHint").textContent = `Sıradaki boş fiş: ${nextTagSuggestion}`;
  render();
  renderRackMap();
}

/* ================= görünüm geçişi ================= */
document.querySelectorAll(".nav-btn").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll(".nav-btn").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    $("#view-" + b.dataset.view).classList.remove("hidden");
    if (b.dataset.view === "bul") renderRackMap();
  };
});

/* ================= Türkçe sayı sözcükleri → rakam ================= */
const NUMWORD = {
  "sıfır": 0, bir: 1, iki: 2, "üç": 3, "dört": 4, "beş": 5, "altı": 6, yedi: 7,
  sekiz: 8, dokuz: 9, on: 10, yirmi: 20, otuz: 30, "kırk": 40, elli: 50,
  "altmış": 60, yetmiş: 70, seksen: 80, doksan: 90, "yüz": 100, bin: 1000,
};
function wordsToNumbers(text) {
  const out = [];
  let total = null, cur = 0;
  const flush = () => {
    if (total !== null) { out.push(String(total + cur)); total = null; cur = 0; }
  };
  const add = (v) => {
    if (total === null) { total = 0; cur = 0; }
    if (v === 1000) { total += (cur || 1) * 1000; cur = 0; }        // "bin iki yüz" → 1000 + …
    else if (v === 100) { cur = (cur || 1) * 100; }                 // "iki yüz" → 200
    else cur += v;
  };
  for (const t of text.split(/\s+/)) {
    const key = t.toLocaleLowerCase("tr");
    const suffixed = key.match(/^(.+?)['’]?([dt][ea]n)$/);          // "dörtten" = dört + ten
    if (key in NUMWORD) {
      add(NUMWORD[key]);
    } else if (suffixed && suffixed[1] in NUMWORD) {
      add(NUMWORD[suffixed[1]]);
      out.push(String(total + cur) + "'" + suffixed[2]);            // → "214'ten"
      total = null; cur = 0;
    } else {
      flush();
      out.push(t);
    }
  }
  flush();
  return out.join(" ");
}

/* Sesli komut ayrıştırma:
   "Ayşe Yılmaz beş halı fiş iki yüz on dört" → {name, count, startTag, phone} */
function parseUtterance(raw) {
  let text = wordsToNumbers(raw.replace(/[,.]/g, " ")).replace(/\s+/g, " ").trim();
  const lower = text.toLocaleLowerCase("tr");
  const res = { name: "", phone: "", count: null, startTag: null };

  // telefon: 5 ile başlayan 10 hane — ses tanıma araya boşluk koyabilir
  const mPhone = lower.match(/\b0?\s?(5\d{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})\b/);
  if (mPhone) res.phone = "0" + mPhone.slice(1).join("");

  // adet: "5 halı" / "5 adet halı" / "5 adet"
  // (dikkat: JS \b Türkçe harfleri kelime saymaz, "halı" sonuna \b konmaz)
  const mCount = lower.match(/\b(\d{1,3})\s*(adet\s*)?(halı|hali|kilim|yolluk|parça|parca)/) ||
                 lower.match(/\b(\d{1,3})\s*adet\b/);
  if (mCount) res.count = parseInt(mCount[1], 10);

  // fiş: "fiş 214" / "fiş no 214" / "214'ten başlıyor"
  const mTag = lower.match(/fi[şs]\s*(?:no\s*|numara\s*)?(\d{1,6})/) ||
               lower.match(/\b(\d{2,6})\s*(?:'?[dt][ea]n)\s*(?:başlıyor|itibaren|başla\w*)/);
  if (mTag) res.startTag = parseInt(mTag[1], 10);

  // isim: sayı, telefon ve anahtar kelimeler dışında kalan baştaki sözcükler
  const stop = new Set(["adet", "halı", "hali", "kilim", "yolluk", "parça", "parca",
    "fiş", "fis", "no", "numara", "başlıyor", "itibaren", "tane", "ve"]);
  const nameWords = [];
  for (const w of text.split(" ")) {
    if (/^\d+$/.test(w)) break; // ilk sayıdan sonrası isim değildir
    if (stop.has(w.toLocaleLowerCase("tr"))) break;
    nameWords.push(w);
    if (nameWords.length >= 5) break;
  }
  res.name = nameWords.join(" ");
  return res;
}

/* ================= sesli kayıt ================= */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizing = false, recognition = null;
if (SR) {
  recognition = new SR();
  recognition.lang = "tr-TR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    $("#transcript").textContent = "“" + text + "”";
    $("#transcript").classList.remove("hidden");
    applyParsed(parseUtterance(text));
  };
  recognition.onend = () => {
    recognizing = false;
    $("#micBtn").classList.remove("listening");
    $("#micStatus").textContent = "Dinleme bitti — alanları kontrol edip Kaydı Aç'a bas";
  };
  recognition.onerror = (e) => {
    recognizing = false;
    $("#micBtn").classList.remove("listening");
    $("#micStatus").textContent = e.error === "not-allowed"
      ? "Mikrofon izni verilmedi — alanları elle doldur"
      : "Ses anlaşılamadı — tekrar dene veya elle doldur";
  };
} else {
  $("#micBtn").disabled = true;
  $("#micStatus").textContent = "Bu tarayıcıda ses tanıma yok (Chrome önerilir) — form elle doldurulur";
}
$("#micBtn").onclick = () => {
  if (!recognition) return;
  if (recognizing) { recognition.stop(); return; }
  recognizing = true;
  $("#transcript").classList.add("hidden");
  $("#micBtn").classList.add("listening");
  $("#micStatus").textContent = "Dinliyorum… örn: “Ayşe Yılmaz, beş halı, fiş iki yüz on dört”";
  recognition.start();
};
function applyParsed(p) {
  const f = $("#quickForm");
  if (p.name) f.qname.value = p.name;
  if (p.phone) f.qphone.value = p.phone;
  if (p.count) f.qcount.value = p.count;
  f.qtag.value = p.startTag || nextTagSuggestion;
  const missing = [];
  if (!f.qname.value) missing.push("isim");
  if (!f.qcount.value) missing.push("adet");
  $("#micStatus").textContent = missing.length
    ? "Eksik: " + missing.join(", ") + " — elle tamamla"
    : "Anlaşıldı ✓ Kontrol et ve Kaydı Aç";
}

/* Hızlı Alım kaydet */
$("#quickForm").onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  const r = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: f.qname.value,
      phone: f.qphone.value,
      quick: { count: f.qcount.value, startTag: f.qtag.value },
    }),
  });
  const d = await r.json();
  if (!r.ok) return alert(d.error || "Hata");
  const o = d.order;
  f.reset();
  $("#transcript").classList.add("hidden");
  $("#micStatus").innerHTML = `✅ Kayıt açıldı: <b>${esc(o.customer.name)}</b> — fiş ${o.carpets[0].tag}–${o.carpets[o.carpets.length - 1].tag}`;
  await refresh();
  if (o.customer.phone && confirm("Müşteriye WhatsApp'tan 'halınızı aldık' mesajı + takip linki gönderilsin mi?")) {
    window.open(waLink(o, "alindi"), "_blank");
  }
};

/* ================= detaylı kayıt formu ================= */
$("#newOrderToggle").onclick = () => {
  const f = $("#newOrder");
  f.classList.toggle("hidden");
  if (!f.classList.contains("hidden")) {
    if (!$("#carpets").children.length) addCarpetRow();
    if (!f.startTag.value) f.startTag.value = nextTagSuggestion;
  }
};
$("#addCarpet").onclick = () => addCarpetRow();

function addCarpetRow() {
  const div = document.createElement("div");
  div.className = "carpet-row";
  div.innerHTML = `
    <input type="number" step="0.1" min="0.1" placeholder="En (m)" class="cw" inputmode="decimal">
    <span>×</span>
    <input type="number" step="0.1" min="0.1" placeholder="Boy (m)" class="ch" inputmode="decimal">
    <span class="m2 muted"></span>
    <button type="button" class="icon-btn del">✕</button>`;
  div.querySelector(".del").onclick = () => { div.remove(); updatePreview(); };
  div.querySelectorAll("input").forEach((i) => (i.oninput = updatePreview));
  $("#carpets").appendChild(div);
}
function readCarpets() {
  return [...document.querySelectorAll("#carpets .carpet-row")]
    .map((r) => ({ w: parseFloat(r.querySelector(".cw").value), h: parseFloat(r.querySelector(".ch").value) }))
    .filter((c) => c.w > 0 && c.h > 0);
}
function updatePreview() {
  document.querySelectorAll("#carpets .carpet-row").forEach((r) => {
    const w = parseFloat(r.querySelector(".cw").value), h = parseFloat(r.querySelector(".ch").value);
    r.querySelector(".m2").textContent = w > 0 && h > 0 ? (w * h).toFixed(2) + " m²" : "";
  });
  const total = readCarpets().reduce((s, c) => s + c.w * c.h, 0);
  $("#preview").textContent = total > 0
    ? `${total.toFixed(2)} m² → ${Math.round(total * settings.pricePerM2)} TL`
    : "";
}
$("#newOrder").onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  const carpets = readCarpets();
  if (!carpets.length) return alert("En az bir halının ölçüsünü girin");
  const r = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: f.name.value, phone: f.phone.value, note: f.note.value,
      carpets, startTag: f.startTag.value,
    }),
  });
  const d = await r.json();
  if (!r.ok) return alert(d.error || "Hata");
  f.reset();
  $("#carpets").innerHTML = "";
  $("#preview").textContent = "";
  $("#newOrder").classList.add("hidden");
  await refresh();
  const order = d.order;
  if (order.customer.phone && confirm(`Kayıt alındı (${order.price} TL)\nMüşteriye WhatsApp'tan takip linki gönderilsin mi?`)) {
    window.open(waLink(order, "alindi"), "_blank");
  }
};

/* ================= WhatsApp ================= */
function trackUrl(order) {
  return location.origin + "/t/" + order.code;
}
function waLink(order, status) {
  const url = trackUrl(order);
  const shop = settings.shopName;
  const priced = order.price != null;
  const msgs = {
    alindi: priced
      ? `Merhaba ${order.customer.name}, ${order.carpets.length} adet halınızı teslim aldık (${order.totalM2} m² — ${order.price} TL). Durumu buradan takip edebilirsiniz: ${url}\n${shop}`
      : `Merhaba ${order.customer.name}, ${order.carpets.length} adet halınızı teslim aldık. Ölçüm sonrası fiyat bilgisi ileteceğiz. Durumu buradan takip edebilirsiniz: ${url}\n${shop}`,
    olcu: `Merhaba ${order.customer.name}, halılarınızın ölçümü tamamlandı: ${order.totalM2} m², tutar ${order.price} TL. Takip: ${url}\n${shop}`,
    yikaniyor: `Merhaba ${order.customer.name}, halılarınızın yıkanmasına başlandı. Takip: ${url}\n${shop}`,
    kurutuluyor: `Merhaba ${order.customer.name}, halılarınız yıkandı, kurutuluyor. Takip: ${url}\n${shop}`,
    hazir: `Merhaba ${order.customer.name}, halılarınız hazır! En kısa sürede teslimat için sizi arayacağız.${priced ? " Tutar: " + order.price + " TL." : ""} Takip: ${url}\n${shop}`,
    teslim: `Merhaba ${order.customer.name}, halılarınız teslim edilmiştir. Bizi tercih ettiğiniz için teşekkürler! ${shop}`,
  };
  return `https://wa.me/${order.customer.phone}?text=${encodeURIComponent(msgs[status] || msgs.alindi)}`;
}

/* ================= kayıt listesi ================= */
document.querySelectorAll(".tab").forEach((t) => {
  t.onclick = () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    tab = t.dataset.tab;
    render();
  };
});
function fmtDate(ts) {
  return new Date(ts).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function tagRange(o) {
  const tags = o.carpets.map((c) => c.tag).filter(Boolean);
  if (!tags.length) return "";
  return tags.length === 1 ? `Fiş ${tags[0]}` : `Fiş ${Math.min(...tags)}–${Math.max(...tags)}`;
}

function render() {
  const list = orders.filter((o) => (tab === "active" ? o.status !== "teslim" : o.status === "teslim"));
  const el = $("#orders");
  if (!list.length) {
    el.innerHTML = `<p class="empty">${tab === "active" ? "Aktif kayıt yok. Sahada 🎤 Hızlı Alım, dükkanda Detaylı Kayıt kullan." : "Henüz teslim edilen yok."}</p>`;
    return;
  }
  el.innerHTML = list.map((o) => {
    const idx = STATUSES.indexOf(o.status);
    const next = STATUSES[idx + 1];
    const unmeasured = o.price == null;
    const dots = STATUSES.slice(0, 4)
      .map((s, i) => `<span class="dot ${i <= Math.min(idx, 3) ? "on" : ""}"></span>`).join("");
    const tagChips = o.carpets
      .map((c) => `<span class="tagchip ${c.rack ? "placed" : ""}">${c.tag ?? "-"}${c.rack ? "→" + c.rack : ""}</span>`)
      .join("");
    return `<div class="card order">
      <div class="order-head">
        <div>
          <b>${esc(o.customer.name)}</b>
          <div class="muted">${o.carpets.length} halı · ${unmeasured ? "<b class='warn'>ölçü bekliyor</b>" : `${o.totalM2} m² · <b>${o.price} TL</b>`}</div>
          <div class="muted small">${fmtDate(o.createdAt)} · ${tagRange(o)} · Kod: ${o.code}</div>
        </div>
        <span class="chip s-${o.status}">${LABELS[o.status]}</span>
      </div>
      <div class="tagchips">${tagChips}</div>
      ${o.note ? `<div class="note">${esc(o.note)}</div>` : ""}
      <div class="progress">${dots}</div>
      <div class="order-actions">
        ${unmeasured ? `<button class="btn warn-btn" onclick="openMeasure('${o.id}')">📏 Ölçü gir</button>` : ""}
        ${o.status !== "teslim" ? `<button class="btn ghost" onclick="openRack('${o.id}')">🪝 Askıya as</button>` : ""}
        ${next ? `<button class="btn primary" onclick="advance('${o.id}','${next}')">${NEXT_LABEL[o.status]}</button>` : ""}
        ${o.customer.phone ? `<a class="btn wa" target="_blank" href="${waLink(o, o.status)}">WhatsApp</a>` : ""}
        <button class="icon-btn" title="Takip linkini kopyala" onclick="copyLink('${o.code}')">🔗</button>
        <button class="icon-btn danger" title="Sil" onclick="removeOrder('${o.id}')">🗑</button>
      </div>
    </div>`;
  }).join("");
}

window.advance = async (id, status) => {
  const o = orders.find((x) => x.id === id);
  if (status === "hazir" && o && o.price == null &&
      !confirm("Bu işin ölçüsü hâlâ girilmemiş. Yine de 'Hazır' yapılsın mı?")) return;
  const r = await fetch(`/api/orders/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (r.ok) {
    const { order } = await r.json();
    await refresh();
    if (order.customer.phone && confirm(`Durum güncellendi: ${LABELS[status]}\nMüşteriye WhatsApp mesajı gönderilsin mi?`)) {
      window.open(waLink(order, status), "_blank");
    }
  }
};
window.copyLink = (code) => {
  navigator.clipboard.writeText(location.origin + "/t/" + code);
  alert("Takip linki kopyalandı");
};
window.removeOrder = async (id) => {
  if (!confirm("Bu kayıt silinsin mi?")) return;
  await fetch(`/api/orders/${id}/delete`, { method: "POST" });
  refresh();
};

/* ================= ölçü girme ================= */
let measureOrderId = null;
window.openMeasure = (id) => {
  const o = orders.find((x) => x.id === id);
  if (!o) return;
  measureOrderId = id;
  $("#measureWho").textContent = `${o.customer.name} — ${o.carpets.length} halı`;
  $("#measureRows").innerHTML = o.carpets.map((c) => `
    <div class="carpet-row" data-tag="${c.tag}">
      <span class="tagchip">${c.tag ?? "-"}</span>
      <input type="number" step="0.1" min="0.1" placeholder="En" class="cw" inputmode="decimal" value="${c.w ?? ""}">
      <span>×</span>
      <input type="number" step="0.1" min="0.1" placeholder="Boy" class="ch" inputmode="decimal" value="${c.h ?? ""}">
      <span class="m2 muted">${c.m2 ? c.m2 + " m²" : ""}</span>
    </div>`).join("");
  $("#measureRows").querySelectorAll("input").forEach((i) => (i.oninput = updateMeasurePreview));
  updateMeasurePreview();
  window.measureDlg.showModal();
};
function updateMeasurePreview() {
  let total = 0, all = true;
  $("#measureRows").querySelectorAll(".carpet-row").forEach((r) => {
    const w = parseFloat(r.querySelector(".cw").value), h = parseFloat(r.querySelector(".ch").value);
    if (w > 0 && h > 0) { r.querySelector(".m2").textContent = (w * h).toFixed(2) + " m²"; total += w * h; }
    else { r.querySelector(".m2").textContent = ""; all = false; }
  });
  $("#measurePreview").textContent = total > 0
    ? `${total.toFixed(2)} m² → ${Math.round(total * settings.pricePerM2)} TL${all ? "" : " (eksik ölçüler var)"}`
    : "";
}
$("#measureForm").onsubmit = async (e) => {
  e.preventDefault();
  const carpets = [...$("#measureRows").querySelectorAll(".carpet-row")].map((r) => ({
    tag: parseInt(r.dataset.tag, 10),
    w: parseFloat(r.querySelector(".cw").value),
    h: parseFloat(r.querySelector(".ch").value),
  }));
  const r = await fetch(`/api/orders/${measureOrderId}/measure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ carpets }),
  });
  const d = await r.json();
  window.measureDlg.close();
  await refresh();
  if (r.ok && d.order.price != null && d.order.customer.phone &&
      confirm(`Ölçüm tamam: ${d.order.totalM2} m² → ${d.order.price} TL\nMüşteriye fiyat bilgisini WhatsApp'tan gönder?`)) {
    window.open(waLink(d.order, "olcu"), "_blank");
  }
};

/* ================= askıya asma ================= */
let rackOrderId = null, rackSelectedTags = new Set();
window.openRack = (id) => {
  const o = orders.find((x) => x.id === id);
  if (!o) return;
  rackOrderId = id;
  rackSelectedTags = new Set(o.carpets.map((c) => c.tag).filter(Boolean));
  $("#rackWho").textContent = `${o.customer.name} — asılacak fişleri ve askıyı seç`;
  renderRackDlg();
  window.rackDlg.showModal();
};
function renderRackDlg() {
  const o = orders.find((x) => x.id === rackOrderId);
  $("#rackTags").innerHTML = o.carpets.map((c) => `
    <button type="button" class="tagchip big ${rackSelectedTags.has(c.tag) ? "sel" : ""}" data-tag="${c.tag}">
      ${c.tag}${c.rack ? "→" + c.rack : ""}
    </button>`).join("");
  $("#rackTags").querySelectorAll("button").forEach((b) => {
    b.onclick = () => {
      const t = parseInt(b.dataset.tag, 10);
      rackSelectedTags.has(t) ? rackSelectedTags.delete(t) : rackSelectedTags.add(t);
      renderRackDlg();
    };
  });
  $("#rackButtons").innerHTML = settings.racks.map((r) =>
    `<button type="button" class="rack-btn" data-rack="${r}">${r}</button>`).join("");
  $("#rackButtons").querySelectorAll("button").forEach((b) => {
    b.onclick = () => assignRack(b.dataset.rack);
  });
}
async function assignRack(rack) {
  if (!rackSelectedTags.size) return alert("Önce fiş seç");
  const r = await fetch("/api/rack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags: [...rackSelectedTags], rack }),
  });
  const d = await r.json();
  if (!r.ok) return alert(d.error || "Hata");
  await refresh();
  window.rackDlg.close();
}
$("#rackClear").onclick = () => assignRack(null);

/* ================= halı bul + askı haritası ================= */
$("#findBtn").onclick = doFind;
$("#findTag").addEventListener("keydown", (e) => e.key === "Enter" && doFind());
async function doFind() {
  const tag = $("#findTag").value.trim();
  if (!tag) return;
  const r = await fetch("/api/find/" + tag);
  const d = await r.json();
  $("#findResult").innerHTML = r.ok
    ? `<div class="find-card">
        <div class="find-rack">${d.rack ? d.rack : "askıda değil"}</div>
        <div>
          <b>${esc(d.customer)}</b>
          <div class="muted small">Fiş ${d.tag} · ${d.m2 ? d.m2 + " m²" : "ölçüsüz"} · ${d.statusLabel}</div>
          <div class="muted small">Aynı işin fişleri: ${d.allTags.map((t) => t.tag + (t.rack ? "→" + t.rack : "")).join(", ")}</div>
        </div>
      </div>`
    : `<p class="err">${d.error || "Bulunamadı"}</p>`;
}
async function renderRackMap() {
  const r = await fetch("/api/racks");
  if (!r.ok) return;
  const d = await r.json();
  $("#rackMap").innerHTML = d.racks.map((rack) => {
    const items = d.map[rack] || [];
    return `<div class="rack-cell ${items.length ? "full" : ""}">
      <b>${rack}</b>
      <span class="muted small">${items.length ? items.map((i) => i.tag).join(", ") : "boş"}</span>
    </div>`;
  }).join("");
}

/* ================= ayarlar ================= */
$("#settingsBtn").onclick = () => {
  $("#setShop").value = settings.shopName;
  $("#setPrice").value = settings.pricePerM2;
  $("#setRacks").value = (settings.racks || []).join(", ");
  window.settings.showModal();
};
$("#saveSettings").onclick = async () => {
  await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shopName: $("#setShop").value,
      pricePerM2: $("#setPrice").value,
      racks: $("#setRacks").value.split(","),
    }),
  });
  refresh();
};

checkAuth();
