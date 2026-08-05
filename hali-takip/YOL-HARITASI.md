# Yol Haritası — Sahadan Gelen Gerçek Problemler (v2)

Kaynak: Çorum'daki halı yıkamacının bizzat yaşadığı sorunlar. v2'nin kapsamı bu dosyadır;
her madde "problem → çözüm mantığı" olarak yazıldı.

## 1. Adreste kayıt pratik değil → "Hızlı Alım" modu

**Problem:** Servis sırasında müşteri adı, ölçü vb. girmek pratik değil. Şu an halılar
fişlenmeden toplanıyor, dükkanda hafızadan fişleniyor → karışma riski.

**Çözüm:**
- Kamyonette **önceden basılmış sıralı numaralı fiş rulosu** (suya dayanıklı). Halıya fiş
  ADRESTE takılır (iğneli makine zaten var).
- Uygulamada "Hızlı Alım" ekranı — adreste girilen TEK şey:
  - müşteri telefonu (veya eski müşteri listesinden seçim — kayıtlı müşteri defteri gerekir)
  - başlangıç fiş no + halı adedi (örn. "214'ten itibaren 5 halı")
- Ölçü/fiyat girişi DÜKKANDA yapılır: sipariş "ölçü bekliyor" durumunda listelenir,
  ölçüler girilince fiyat hesaplanır ve müşteriye ancak o zaman fiyatlı mesaj gider.
- Sipariş durum akışına "Alındı (ölçü bekliyor)" ara aşaması eklenir.

**Gerektirdiği değişiklikler:** müşteri defteri (tekrar eden müşteriler), fiş no alanı,
ölçüsüz sipariş oluşturma, sonradan ölçü tamamlama ekranı.

## 2. Askıda halı kaybolması → askı yeri takibi

**Problem:** Halılar askıdan alınırken bulunamıyor, tek tek aranıyor.

**Çözüm:**
- Askılıklar bir kez adlandırılır (A1, A2, B1, ...).
- Halı askıya asılırken uygulamada fişin yanına askı yeri seçilir (tek dokunuş).
- Teslimat ekranında her fişin yanında askı yeri yazar: "Fiş 214 → B3".
- v2.1: fişlere QR kod basılıp telefon kamerasıyla okutma (numara alışkanlığı
  oturduktan sonra; ilk sürümde numara yeterli).

**Gerektirdiği değişiklikler:** halı bazında (sipariş bazında değil) fiş no + konum alanı,
"askıya as" adımında konum sorma, konuma göre arama/filtre.

## 3. Mesajlar işletme adından gitsin + çoklu marka

**Problem:** wa.me linki esnafın kişisel numarasından gider. Ayrıca ikinci bir marka
işletip orada daha yüksek fiyat çalışmak isteniyor.

**Çözüm kademeleri:**
1. **Bedava, hemen:** WhatsApp Business uygulaması + markaya ayrı hat. İşletme profili
   adıyla görünür. İki marka = iki hat, uygulama hangi markaysa o hattın wa.me linkini üretir.
2. **Türkiye kestirmesi — SMS:** toplu SMS sağlayıcılarında (NetGSM, İleti Merkezi vb.)
   gönderici adı ALFANÜMERİK BAŞLIK olabilir → müşteri mesajı doğrudan marka adından görür,
   numara görünmez. Mesaj başına maliyet düşüktür. Uygulamaya SMS API entegrasyonu eklenir.
3. **Ölçeklenince:** WhatsApp Business API (BSP üzerinden) ile tam otomatik markalı gönderim.

**Uygulamadaki karşılığı — çoklu marka desteği:**
- Marka = ad + m² fiyatı + gönderici kimliği (hat / SMS başlığı) + mesaj imzası.
- Sipariş açılırken marka seçilir; fiyat hesabı ve tüm mesajlar/takip sayfası o markanın
  kimliğiyle üretilir (takip sayfasında da marka adı görünmeli).

## Öncelik sırası

1. Hızlı Alım + fiş numarası (karışma riskini bitirir — en acil saha problemi)
2. Askı yeri takibi (kayıp aramayı bitirir)
3. Çoklu marka + SMS başlığı (gelir artırıcı)
4. QR kod (konfor, aciliyeti yok)

## İlke

50 yaşındaki esnaf bir özelliği 10 dakikada öğrenemiyorsa o özellik fazladır.
Her yeni ekran bu ilkeyle sınanır.
