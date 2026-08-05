# Rekabet Analizi ve Yaratıcı Çözüm Tasarımı

Tarih: Ağustos 2026. Kaynak: web araştırması (rakip siteleri + endüstriyel çamaşırhane
RFID tedarikçileri).

## Türkiye'deki rakipler ve ortak şablonları

İncelenenler: ProTakip, MisPaQ, UstaPOS, Eymex, PetraPOS, halıTR, AtlamPos, PortSis, NegroPos.

Hepsinin çözüm şablonu aynı:

| Problem | Sektörün standart çözümü |
|---|---|
| Sahada hızlı kayıt | Arayan kimliği (CallerID) + çok adımlı sipariş sihirbazı + **Bluetooth termal yazıcıyla kapıda fiş basma** |
| Halı karışması | Sipariş başına QR/barkod etiket basma |
| Müşteri bilgilendirme | Otomatik SMS/WhatsApp + takip linki |
| Anlaşmazlık | Alımda fotoğraf çekme |
| İleri seviye (MisPaQ) | Halı üstündeki numarayı fotoğraftan OCR ile okuma |
| İleri seviye (Eymex) | Veriye soru soran "AI asistan" (kayıt girmiyor, rapor soruyor) |

## Tespit edilen iki boşluk

### Boşluk 1: Fiziksel konum takibi YOK
Tüm rakipler durum (yıkamada/kurutmada) takip ediyor; hiçbiri "bu halı şu an hangi
askıda?" sorusunu çözmüyor. Askıda halı arama problemi sektörde çözümsüz.

Bu problemi çözmüş tek sektör endüstriyel çamaşırhaneler:
- Yıkamaya 200+ kez dayanan UHF RFID tekstil etiketleri (silikon/PPS/dokuma).
- El okuyucularda **Geiger sayacı modu**: hedef etikete yaklaştıkça hızlanan bip;
  500 m² alanda kayıp parça 1-2 dakikada bulunuyor (manuel arama: 30+ dk).
- Okuyucu fiyatları: ~400 USD (Chainway C72 vb.) — 1.500 USD (Zebra TC22R vb.).
- Türkiye halı yıkama yazılımlarında RFID kullanan YOK.

### Boşluk 2: Sesle kayıt YOK
Hiçbir rakip sahada sesli veri girişi yapmıyor. En yakın şey CallerID + form.
Form-tabanlı eski mimarileri bunu kopyalamalarını zorlaştırır; bizim için ise
ses tanıma + dil modeli ayrıştırması doğal alan.

## Bizim çözüm: "Konuş, tak, geç" (v2 ana konsepti)

### Sahada kayıt — hedef 10 saniye, sıfır ek donanım
1. Kamyonette önceden basılmış sıralı numaralı fiş rulosu (zaten YOL-HARITASI'nda).
2. Halılara fişler ADRESTE takılır (iğneli makine mevcut).
3. Uygulamada TEK TUŞ: bas-konuş →
   "Ayşe Hanım, Ulukavak, beş halı, fiş iki yüz on dörtten başlıyor"
   → ses tanıma + LLM ayrıştırma → kayıt otomatik açılır (müşteri eşleşmesi
   telefon defterinden/geçmişten).
4. Gürültülü ortam yedeği: fişin fotoğrafı → OCR ile numara okuma.
5. Rakiplerin Bluetooth yazıcı zorunluluğu bizde YOK → daha ucuz kurulum,
   daha az arızalanan parça. (İsteğe bağlı olarak sonradan eklenebilir.)

Ölçü/fiyat dükkanda girilir; fiyatlı WhatsApp mesajı o zaman gider
(YOL-HARITASI "Hızlı Alım" ile aynı akış — ses, onun giriş yöntemi).

### Dükkanda nokta atışı konum — kademeli
- **Seviye 1 (sıfır maliyet):** Her askılığa basılı QR (A1, B3...). Halı asılırken
  fiş no + askı QR okutulur (2 saniye). Teslimatta ekran "fiş 214 → B3" der.
  Toplu asma kolaylığı: "214-218 arası → B askısı" tek dokunuş.
- **Seviye 2 (premium, Türkiye'de ilk):** RFID'li fişler + Geiger modlu el okuyucu.
  "Halı bul" tuşu → sesin hızlandığı yöne yürü. Pazarlama videosu kendiliğinden
  çıkar: "Kayıp halıyı 30 saniyede bulan dükkan."
  Maliyet: okuyucu ~400 USD + etiket başına düşük birim maliyet. SaaS'ta üst paket
  olarak satılır (donanım + yazılım paketi).

## Konumlandırma cümlesi

Rakipler: "işletmeni dijitalleştir" (muhasebe + form + yazıcı).
Biz: "kapıda konuş, dükkanda bul" — kayıt 10 saniye, kayıp halı 30 saniye.
