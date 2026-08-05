# Halı Takip

Halı yıkamacılar için **tek ekranlık sipariş takip sistemi**. Müşteriye kargo takibi gibi
halı takip linki gönderir, "halım ne zaman gelecek?" telefonlarını bitirir.

## Özellikler

### Sahada — "Konuş, tak, geç"
- **Sesli Hızlı Alım:** Adreste halılara önceden numaralı fişleri tak, mikrofon
  tuşuna bas ve söyle: *"Ayşe Yılmaz, beş halı, fiş iki yüz on dört"*. Uygulama
  Türkçe sayı sözcüklerini de anlar, kaydı açar. Ses çalışmazsa 3 alanlık mini form
  (isim + ilk fiş no + adet) 10 saniyede doldurulur. Ölçü ve fiyat dükkanda tamamlanır.
- **Fiş numarası takibi:** her halının kendi fiş numarası vardır; uygulama sıradaki
  boş fişi önerir, çakışmaları engeller.

### Dükkanda
- **Ölçü tamamlama:** "ölçü bekliyor" işaretli kayıtlara en × boy girilir; fiyat
  hesaplanır ve müşteriye tek tuşla fiyat mesajı gönderilir.
- **Askı yeri takibi:** halı asılırken fiş(ler) seçilir, askı düğmesine basılır (A1, B3…).
  Askı doluluk haritası tek bakışta görünür. `/raflar` sayfasından basılabilir askı
  etiketleri çıkar. Teslim edilen işlerin askıları otomatik boşalır.
- **Halı Bul:** fiş numarasını yaz → müşteri + askı yeri ekranda. Arama bitti.

### Genel
- **Durum akışı:** Alındı → Yıkanıyor → Kurutuluyor → Hazır → Teslim edildi. Tek tuşla ilerler.
- **WhatsApp entegrasyonu:** her aşamada tek tuşla müşteriye hazır Türkçe mesaj +
  takip linki gönderilir (wa.me üzerinden, ek kurulum gerektirmez).
- **Müşteri takip sayfası:** müşteri linke tıklar, halısının hangi aşamada olduğunu
  kargo takibi gibi görür. Dükkanı aramasına gerek kalmaz.
- **PWA:** telefonda "ana ekrana ekle" ile uygulama gibi çalışır.
- **Sıfır bağımlılık:** sadece Node.js. Veritabanı kurulumu yok (JSON dosyasında saklar).

> Sesli kayıt, tarayıcının yerleşik ses tanımasını kullanır (Chrome/Android'de ücretsiz
> çalışır, API anahtarı ve ek maliyet yoktur). Desteklemeyen tarayıcıda mini form devrededir.

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
