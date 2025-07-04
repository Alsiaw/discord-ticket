<div align="center">

# 🎫 Alsia Discord Ticket Bot

<img src="https://img.shields.io/badge/Discord.js-v14-blue?style=for-the-badge&logo=discord" alt="Discord.js">
<img src="https://img.shields.io/badge/Node.js-16+-green?style=for-the-badge&logo=node.js" alt="Node.js">
<img src="https://img.shields.io/badge/Database-CroxyDB-purple?style=for-the-badge" alt="CroxyDB">
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">

**Profesyonel Discord Ticket Yönetim Sistemi**

*Sunucunuz için gelişmiş ticket sistemi, otomatik kanal yönetimi ve kapsamlı destek araçları.*

</div>

---

## 🚀 Özellikler

- 🎫 **3 Kategorili Ticket Sistemi** - Oyun içi, oyun dışı ve şikayet desteği
- 🔄 **Otomatik Kanal Yönetimi** - Ticket açma/kapama otomasyonu
- 👥 **Yetkili Atama Sistemi** - Ticket devralma ve bildirim sistemi
- 📊 **İstatistik Takibi** - Ticket sayıları ve performans analizi
- 🛡️ **Yetki Kontrolü** - Rol tabanlı erişim yönetimi
- 📝 **Transcript Sistemi** - Ticket geçmişlerini kaydetme
- 🎨 **Özelleştirilebilir Embeds** - Tamamen kişiselleştirilebilir görünüm

---

## 📋 Gereksinimler

- **Node.js** v16.11.0 veya üzeri
- **Discord Bot Token**
- **Discord Sunucusu** (Yönetici yetkisi gerekli)

---

## ⚡ Kurulum

### 1. Projeyi İndirin
```bash
git clone https://github.com/kullaniciadi/alsia-ticket-bot.git
cd alsia-ticket-bot
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Konfigürasyon Dosyalarını Ayarlayın

**config.json:**
```json
{
  "token": "BOT_TOKEN_BURAYA"
}
```

**ayarlar.json:**
```json
{
  "Bot": {
    "SunucuID": "SUNUCU_ID_BURAYA"
  },
  "Yetkiler": {
    "Staff": ["YETKILI_ROL_ID_1", "YETKILI_ROL_ID_2"],
    "yetkili": "YETKILI_ROL_ID"
  },
  "Ticket": {
    "ticketCategory": "TICKET_KATEGORI_ID",
    "ticketLog": "LOG_KANAL_ID",
    "ticketLog2": "LOG_KANAL_ID_2"
  },
  "Kanallar": {
    "bilgiKanal": "BILGI_KANAL_ID"
  },
  "Embed": {
    "footerText": "Alsia Ticket System",
    "authorembed": "ᴀʟꜱɪᴀ ᴛɪᴄᴋᴇᴛ",
    "iconURL": "BOT_AVATAR_URL"
  },
  "Resimler": {
    "moderasyonURL": "EMBED_RESIM_URL"
  }
}
```

### 4. Botu Başlatın
```bash
npm start
```

---

## 🎯 Komutlar

### 📱 Slash Komutlar

#### 🎫 **Ticket Yönetimi**
```
» /ticket-kurulum
  └─ Ticket sistemini kurar ve embed mesajını gönderir

» /ticket-isim (isim)
  └─ Mevcut ticket kanalının ismini değiştirir

» /ticket-top
  └─ En çok ticket açan kullanıcıları listeler

» /database-sıfırla
  └─ Ticket veritabanını sıfırlar (Dikkatli kullanın!)
```

### 🖱️ **Sağ Tık (Context Menu) Komutlar**
```
» Oyuncu Ekle
  └─ Seçilen kullanıcıyı ticket kanalına ekler

» Oyuncu Çıkar  
  └─ Seçilen kullanıcıyı ticket kanalından çıkarır
```

### 🔘 **Button Etkileşimleri**

#### 📋 **Ticket Açma Butonları**
- 🎮 **Oyun İçi Destek** - Oyun içi sorunlar için
- 💬 **Oyun Dışı Destek** - Genel sorular için  
- ⚠️ **Şikayet Destek** - Şikayet ve raporlar için

#### ⚙️ **Ticket Yönetim Butonları**
- 🔒 **Kapat** - Ticket'ı kapatır
- 👤 **Devral** - Ticket'ı yetkili devralır
- 🔔 **Bildir** - Kullanıcıya bildirim gönderir

---

## 🗂️ Dosya Yapısı

```
alsia-ticket-bot/
├── alsia.js                    # Ana bot dosyası
├── config.json                # Bot token konfigürasyonu
├── ayarlar.json               # Genel ayarlar ve konfigürasyon
├── ticketCounter.json         # Ticket sayacı
├── package.json               # Proje bağımlılıkları
├── alsia/
│   ├── events/                # Event handler'ları
│   │   ├── ready.js          # Bot hazır eventi
│   │   └── interactionCreate.js # Etkileşim eventi
│   ├── handlers/              # Özel handler'lar
│   │   ├── ticket.js         # Ticket sistemi handler'ı
│   │   └── destek_kapat.js   # Ticket kapatma handler'ı
│   └── komutlar/             # Slash komutları
│       ├── ticket-kurulum.js # Ticket kurulum komutu
│       ├── ticket-ekle.js    # Context menu - oyuncu ekleme
│       ├── ticket-çıkar.js   # Context menu - oyuncu çıkarma
│       ├── ticket-isim.js    # Ticket isim değiştirme
│       ├── ticket-top.js     # Ticket istatistikleri
│       └── database-sıfırla.js # Veritabanı sıfırlama
└── database/                  # Veritabanı dosyaları
```

---

## ⚙️ Konfigürasyon Rehberi

### 🔧 **Temel Ayarlar**

| Ayar | Açıklama | Nasıl Alınır |
|------|----------|--------------|
| `Bot.SunucuID` | Discord sunucu ID'si | Sunucuya sağ tık → ID'yi Kopyala |
| `Yetkiler.Staff` | Yetkili rol ID'leri | Role sağ tık → ID'yi Kopyala |
| `Ticket.ticketCategory` | Ticket kategorisi ID'si | Kategoriye sağ tık → ID'yi Kopyala |
| `Ticket.ticketLog` | Log kanalı ID'si | Kanala sağ tık → ID'yi Kopyala |

### 🎨 **Görsel Ayarlar**
- **Embed Renkleri**: Hex kod formatında (#000000)
- **Emoji ID'leri**: Custom emoji'ler için <:emoji_name:id> formatı
- **Resim URL'leri**: Discord CDN veya harici hosting

---

## 🎮 Ticket Sistemi Nasıl Çalışır?

### 1. **Kurulum**
```
/ticket-kurulum komutu ile embed mesajı gönderilir
```

### 2. **Ticket Açma**
```
Kullanıcı → Button'a tıklar → Otomatik kanal oluşturulur
```

### 3. **Ticket Yönetimi**
```
Yetkili → Devral/Bildir/Kapat butonları ile yönetir
```

### 4. **Ticket Kapatma**
```
Kapat butonu → Onay mesajı → Kanal silinir → Log kaydedilir
```

---

## 📊 Özellikler Detayı

### 🔐 **Yetki Sistemi**
- Rol tabanlı erişim kontrolü
- Çoklu yetkili rol desteği
- Otomatik yetki kontrolü

### 📈 **İstatistik Sistemi**
- Kullanıcı başına ticket sayısı
- Kategori bazlı istatistikler
- Toplam ticket sayacı

### 🔔 **Bildirim Sistemi**
- Yetkili etiketleme
- Kullanıcı bildirimleri
- Log kanalı entegrasyonu

---

## 🛠️ Kullanılan Teknolojiler

- **[Discord.js v14](https://discord.js.org/)** - Discord API wrapper
- **[CroxyDB](https://www.npmjs.com/package/croxydb)** - Basit JSON veritabanı
- **[Moment.js](https://momentjs.com/)** - Tarih/saat işlemleri
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[Express.js](https://expressjs.com/)** - Web framework (opsiyonel)

---

## 🚨 Önemli Notlar

### ⚠️ **Dikkat Edilmesi Gerekenler**
- Bot'un sunucuda **Yönetici** yetkisi olmalı
- Ticket kategorisi önceden oluşturulmalı
- Log kanalları bot tarafından erişilebilir olmalı
- Yetkili rolleri doğru ayarlanmalı

### 🔒 **Güvenlik**
- `config.json` dosyasını **asla** paylaşmayın
- Bot token'ını güvenli tutun
- Yetkili rollerini dikkatli ayarlayın

---

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/YeniOzellik`)
5. Pull Request oluşturun

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📞 Destek ve İletişim

- 🐛 **Bug Report:** [GitHub Issues](https://github.com/kullaniciadi/alsia-ticket-bot/issues)
- 💬 **Discord Destek:** [Destek Sunucusu](https://discord.gg/mcqueen)
- 📧 **E-mail:** destek@example.com

---

## 📸 Ekran Görüntüleri

<div align="center">

### 🎫 Ticket Kurulum Paneli
*Kullanıcıların ticket açabileceği ana panel*

### 💬 Ticket Kanalı
*Otomatik oluşturulan ticket kanalı görünümü*

### 📊 İstatistik Paneli
*Ticket istatistikleri ve kullanıcı verileri*

</div>

---

## 🔄 Güncellemeler

### v2.0.0
- Discord.js v14 desteği
- Yeni button sistemi
- Gelişmiş embed tasarımı
- Context menu komutları

---

<div align="center">



*Made with ❤️ by Alsia*

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**



</div>
