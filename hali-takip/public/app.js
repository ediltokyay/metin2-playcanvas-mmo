/* Halı Takip — esnaf paneli */
const $ = (s) => document.querySelector(s);
const STATUSES = ["alindi", "yikaniyor", "kurutuluyor", "hazir", "teslim"];
const LABELS = { alindi: "Alındı", yikaniyor: "Yıkanıyor", kurutuluyor: "Kurutuluyor", hazir: "Hazır", teslim: "Teslim edildi" };
const NEXT_LABEL = { alindi: "Yıkamaya al", yikaniyor: "Kurutmaya al", kurutuluyor: "Hazır olarak işaretle", hazir: "Teslim edildi olarak işaretle" };

let settings = { shopName: "Halı Yıkama", pricePerM2: 70 };
let orders = [];
let tab = "active";

// ---------- giriş ----------
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

// ---------- veri ----------
async function refresh() {
  const r = await fetch("/api/orders");
  if (!r.ok) return checkAuth();
  const d = await r.json();
  orders = d.orders;
  settings = d.settings;
  $("#shopName").textContent = settings.shopName;
  $("#priceInfo").textContent = `m² fiyatı: ${settings.pricePerM2} TL`;
  render();
}

// ---------- yeni kayıt formu ----------
$("#newOrderToggle").onclick = () => {
  $("#newOrder").classList.toggle("hidden");
  if (!$("#carpets").children.length) addCarpetRow();
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
  return [...document.querySelectorAll(".carpet-row")]
    .map((r) => ({ w: parseFloat(r.querySelector(".cw").value), h: parseFloat(r.querySelector(".ch").value) }))
    .filter((c) => c.w > 0 && c.h > 0);
}
function updatePreview() {
  document.querySelectorAll(".carpet-row").forEach((r) => {
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
    body: JSON.stringify({ name: f.name.value, phone: f.phone.value, note: f.note.value, carpets }),
  });
  if (r.ok) {
    f.reset();
    $("#carpets").innerHTML = "";
    $("#preview").textContent = "";
    $("#newOrder").classList.add("hidden");
    const { order } = await r.json();
    await refresh();
    // kayıt biter bitmez müşteriye takip linkini gönderme fırsatı
    if (order.customer.phone) {
      if (confirm(`Kayıt alındı: ${order.code}\nMüşteriye WhatsApp'tan takip linki gönderilsin mi?`)) {
        window.open(waLink(order, "alindi"), "_blank");
      }
    }
  } else alert((await r.json()).error || "Hata");
};

// ---------- WhatsApp ----------
function trackUrl(order) {
  return location.origin + "/t/" + order.code;
}
function waLink(order, status) {
  const url = trackUrl(order);
  const shop = settings.shopName;
  const msgs = {
    alindi: `Merhaba ${order.customer.name}, ${order.carpets.length} adet halınızı teslim aldık (${order.totalM2} m² — ${order.price} TL). Halınızın durumunu buradan takip edebilirsiniz: ${url}\n${shop}`,
    yikaniyor: `Merhaba ${order.customer.name}, halılarınızın yıkanmasına başlandı. Takip: ${url}\n${shop}`,
    kurutuluyor: `Merhaba ${order.customer.name}, halılarınız yıkandı, kurutuluyor. Takip: ${url}\n${shop}`,
    hazir: `Merhaba ${order.customer.name}, halılarınız hazır! En kısa sürede teslimat için sizi arayacağız. Tutar: ${order.price} TL. Takip: ${url}\n${shop}`,
    teslim: `Merhaba ${order.customer.name}, halılarınız teslim edilmiştir. Bizi tercih ettiğiniz için teşekkürler! ${shop}`,
  };
  return `https://wa.me/${order.customer.phone}?text=${encodeURIComponent(msgs[status] || msgs.alindi)}`;
}

// ---------- liste ----------
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

function render() {
  const list = orders.filter((o) => (tab === "active" ? o.status !== "teslim" : o.status === "teslim"));
  const el = $("#orders");
  if (!list.length) {
    el.innerHTML = `<p class="empty">${tab === "active" ? "Aktif kayıt yok. Yeni halı geldiğinde “+ Yeni Halı Kaydı”na basın." : "Henüz teslim edilen yok."}</p>`;
    return;
  }
  el.innerHTML = list
    .map((o) => {
      const idx = STATUSES.indexOf(o.status);
      const next = STATUSES[idx + 1];
      const dots = STATUSES.slice(0, 4)
        .map((s, i) => `<span class="dot ${i <= Math.min(idx, 3) ? "on" : ""}" title="${LABELS[s]}"></span>`)
        .join("");
      return `<div class="card order">
        <div class="order-head">
          <div>
            <b>${esc(o.customer.name)}</b>
            <div class="muted">${o.carpets.length} halı · ${o.totalM2} m² · <b>${o.price} TL</b></div>
            <div class="muted small">${fmtDate(o.createdAt)} · Kod: ${o.code}</div>
          </div>
          <span class="chip s-${o.status}">${LABELS[o.status]}</span>
        </div>
        ${o.note ? `<div class="note">${esc(o.note)}</div>` : ""}
        <div class="progress">${dots}</div>
        <div class="order-actions">
          ${next ? `<button class="btn primary" onclick="advance('${o.id}','${next}')">${NEXT_LABEL[o.status]}</button>` : ""}
          ${o.customer.phone ? `<a class="btn wa" target="_blank" href="${waLink(o, o.status)}">WhatsApp</a>` : ""}
          <button class="icon-btn" title="Takip linkini kopyala" onclick="copyLink('${o.code}')">🔗</button>
          <button class="icon-btn danger" title="Sil" onclick="removeOrder('${o.id}')">🗑</button>
        </div>
      </div>`;
    })
    .join("");
}
function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

window.advance = async (id, status) => {
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

// ---------- ayarlar ----------
$("#settingsBtn").onclick = () => {
  $("#setShop").value = settings.shopName;
  $("#setPrice").value = settings.pricePerM2;
  $("#settings").showModal();
};
$("#saveSettings").onclick = async () => {
  await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shopName: $("#setShop").value, pricePerM2: $("#setPrice").value }),
  });
  refresh();
};

checkAuth();
