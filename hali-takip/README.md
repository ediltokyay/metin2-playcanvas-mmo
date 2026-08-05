# Halı Takip

Halı yıkamacılar için **tek ekranlık sipariş takip sistemi**. Müşteriye kargo takibi gibi
halı takip linki gönderir, "halım ne zaman gelecek?" telefonlarını bitirir.

## Özellikler

- **Yeni halı kaydı:** müşteri adı, telefon, halı ölçüleri (en × boy). Metrekare ve fiyat
  otomatik hesaplanır (varsayılan 70 TL/m², ayarlardan değiştirilir).
- **Durum akışı:** Alındı → Yıkanıyor → Kurutuluyor → Hazır → Teslim edildi. Tek tuşla ilerler.
- **WhatsApp entegrasyonu:** her aşamada tek tuşla müşteriye hazır Türkçe mesaj +
  takip linki gönderilir (wa.me üzerinden, ek kurulum gerektirmez).
- **Müşteri takip sayfası:** müşteri linke tıklar, halısının hangi aşamada olduğunu
  kargo takibi gibi görür. Dükkanı aramasına gerek kalmaz.
- **PWA:** telefonda "ana ekrana ekle" ile uygulama gibi çalışır.
- **Sıfır bağımlılık:** sadece Node.js. Veritabanı kurulumu yok (JSON dosyasında saklar).

## Çalıştırma

```bash
node server.js
```

Tarayıcıda `http://localhost:3000` açın. Varsayılan PIN: `1234`.

### Ayarlar (ortam değişkenleri)

| Değişken   | Varsayılan | Açıklama                      |
|------------|------------|-------------------------------|
| `PORT`     | `3000`     | Sunucu portu                  |
| `HALI_PIN` | `1234`     | Panel giriş PIN'i — DEĞİŞTİRİN |

```bash
HALI_PIN=5871 PORT=8080 node server.js
```

## Yayına alma

Node.js çalıştıran her yerde çalışır (Render, Railway, Fly.io, herhangi bir VPS).
Tek gereksinim: `node server.js` komutunu çalıştırmak ve `data/` klasörünün kalıcı olması
(ücretsiz platformlarda "persistent disk" seçeneğini açın).

WhatsApp mesajları `wa.me` linkiyle esnafın kendi telefonundan gönderilir —
API anahtarı, onay süreci, ek maliyet yoktur.

## Veri

Tüm kayıtlar `data/db.json` dosyasındadır. Yedeklemek = bu dosyayı kopyalamak.
