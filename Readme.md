# 📅 Tarihte Bugün

> Günün tarihinde yaşanan önemli olayları, doğumları ve vefatları gösteren modern web uygulaması.

## 🚀 [Canlı Demo'yu Görüntüle](https://today-in-history-five.vercel.app/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Özellikler

- 🎨 Modern ve responsive tasarım
- 🌓 Dark/Light mode desteği
- 📊 Canlı istatistikler ve filtreleme
- 💾 Akıllı cache sistemi (60 dakika)
- 🚦 Rate limit koruması (20 istek/dakika)
- 🌙 Otomatik gece yarısı güncellemesi
- ⚡ Sıfır bağımlılık - Vanilla JavaScript

## 🚀 Hızlı Başlangıç

```bash
# Repoyu klonla
git clone https://github.com/kullaniciadi/tarihte-bugun.git

# Proje klasörüne gir
cd tarihte-bugun

# index.html dosyasını tarayıcıda aç
open index.html
```

## 📁 Proje Yapısı

```
tarihte-bugun/
├── index.html      # Ana HTML dosyası
├── style.css       # Tüm stiller (Light/Dark mode)
├── app.js          # JavaScript uygulama mantığı
├── vercel.json     # Vercel deployment config
├── .gitignore      # Git ignore kuralları
└── README.md       # Dokümantasyon
```

## 🛠️ Teknolojiler

- **HTML5** - Semantik yapı
- **CSS3** - Gradient, glassmorphism, animations, CSS Variables
- **JavaScript ES6+** - Fetch API, LocalStorage, async/await, Module Pattern
- **API** - [Zumbo Tarihte Bugün API](https://api.zumbo.net/tarihtebugun/)

## 📖 API Detayları

```javascript
// Endpoint
GET https://api.zumbo.net/tarihtebugun/

// Rate Limit: 20 istek/dakika
// Cache: 60 dakika
// Güncelleme: Her gece 00:00-01:00
```

## 🔧 Cache & Rate Limit

Uygulama otomatik olarak:

- ✅ API yanıtlarını 60 dakika cache'ler
- ✅ Dakikada 20 istekten fazla göndermeyi engeller
- ✅ **Her sayfa yüklendiğinde tarihi kontrol eder**
- ✅ Yeni gün başladıysa cache'i otomatik temizler
- ✅ Rate limit aşımında kullanıcıyı uyarır

### Nasıl Çalışır?

```javascript
// Sayfa her açıldığında:
1. LocalStorage'dan son cache tarihini oku
2. Bugünün tarihi ile karşılaştır
3. Tarih değiştiyse → Cache'i temizle + API'den yeni veri çek
4. Tarih aynıysa → Cache'den oku (60 dakika süreli)
```

Bu sayede kullanıcı sayfayı kapattıktan sonra yeni bir günde açtığında otomatik olarak güncel verileri görür!

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [Zumbo API](https://api.zumbo.net/) - Veri sağlayıcı

---
