# YazBoz — Oyun Skor Takip Uygulaması
## Proje Notları & Geliştirme Günlüğü

> Bu dosya, projeye yeni başlayan bir ajan veya geliştirici için
> tam bağlam sağlamak amacıyla yazılmıştır. Yarım kalan işleri,
> alınan mimari kararları ve "neden"leri içerir.

---

## 1. Proje Özeti

**Ne yapıyor?**  
Türk kart/masa oyunlarının skor takibini kolaylaştıran, mobil öncelikli,
tek sayfalı HTML uygulamaları koleksiyonu. Hesap makinesi yerine geçer:
skor girişi, düzenleme, geçmiş görüntüleme.

**Nerede yayınlanıyor?**  
→ GitHub Pages: https://cmtsy81.github.io/oyunBoard/  
→ Repo: https://github.com/cmtsy81/oyunBoard

**Teknoloji:**  
- Saf HTML + CSS + Vanilla JS (framework yok)
- Paylaşılan stil: `common.css`
- Paylaşılan yardımcılar: `common.js`
- Veri kalıcılığı: `localStorage` (Aşama 1), Firebase Firestore (Aşama 2)

---

## 2. Dosya Yapısı

```
YazBoz/
├── index.html          # Ana menü — oyun kartları
├── batak.html          # Batak (İhaleli, Eşli, Gömmeli, Koz Maça)
├── king.html           # King (El, Kupa, Erkek, Kız, Rıfkı, Son İki, Koz)
├── okey101.html        # 101 Okey (Normal / Okey-Çift bitiş)
├── okeyDuz.html        # Düz Okey (Düşmeli, Tek/Eşli mod, başlangıç sayısı)
├── zarAt.html          # 3D Zar simülatörü (1 veya 2 zar, CSS 3D)
├── izle.html           # Canlı Masa İzleme (Firebase real-time)
├── common.css          # Tüm sayfalar için ortak design system
├── common.js           # Paylaşılan JS utility fonksiyonları
├── firebase-config.js  # [HENÜZ YOK] Firebase bağlantı ayarları
├── img/                # Oyun görselleri (batak.png, 101.png, king.png, okey.png, zar.png)
└── PROJE_NOTLARI.md    # Bu dosya
```

**Silinmiş:**  
`takipli/` klasörü — PHP tabanlı eski canlı takip sistemi.
Fonksiyon korundu, Firebase'e taşınacak. (Bkz. Bölüm 6)

---

## 3. common.css — Design System

Her sayfa `common.css`'i yükler. Tanımlı bileşenler:

| Sınıf | Kullanım |
|---|---|
| `.container` | Max-width 600px, dikey flex wrapper |
| `.header` | Sticky üst bar (home + title + actions) |
| `.btn-icon` | Header ikonları (🏠, 📊, 🔄) |
| `.content` | Scrollable içerik alanı |
| `.setup-section` | Oyun başlamadan önceki kurulum ekranı |
| `.table-layout` | 3×3 CSS Grid — oyuncu pozisyonları |
| `.pos-top/bottom/left/right/center` | Masa pozisyonları |
| `.setup-input-wrapper`, `.player-name-input` | İsim giriş alanları |
| `.btn-start` | "Oyunu Başlat" butonu |
| `.scoreboard` | Aktif oyun alanı |
| `.player-card` | Oyuncu skoru kartı |
| `.p-name`, `.p-score` | Kart içi elementler |
| `.center-button` | Masa ortasındaki "El Gir" butonu |
| `.history-area`, `.h-item` | Geçmiş el listesi |
| `.modal`, `.modal-content`, `.modal-sheet` | Alt panel modallar |
| `.modal-actions` | Modal buton satırı |
| `.btn-modal-action`, `.btn-gray`, `.btn-green` | Modal butonları |
| `.game-panel` | Modal içi skor giriş paneli |
| `.input-row`, `.input-controls`, `.val-box`, `.btn-math` | +/- sayaçlı giriş |
| `.check-bar`, `.check-bar.ok`, `.check-bar.err` | Toplam doğrulama çubuğu |
| `.score-table` | Puan tablosu HTML tablosu |
| `.custom-dialog`, `.dialog-box`, `.d-actions` | Confirm dialog |
| `.d-btn`, `.d-cancel`, `.d-confirm` | Dialog butonları |
| `.footer-version` | Sürüm numarası (alt bar) |
| `.menu-grid`, `.menu-card` | Ana menü kartları |

**Oyuna özgü renkler:**  
Her oyun HTML dosyası kendi `<style>` bloğunda `--accent` CSS değişkenini
ve header gradient rengini override eder. common.css bunları boş bırakır.

---

## 4. common.js — Utility Fonksiyonları

```javascript
// Navigasyon
goHome()                    // index.html'e dön

// Ses
playClick()                 // Web Audio API — 600→300Hz sine dalga
// NOT: zarAt.html AudioContext'i kendisi yönetir, common.js yüklemez!

// Modal
openModal(id)               // id'li modalı aç
closeModal(id)              // id'li modalı kapat

// Footer
setFooterVersion(v)         // 'v' + v metnini #footerVersion'a yaz

// Masa ID Üretimi (Aşama 2'de async + Firestore kontrolüne dönecek)
getSafeMasaID()             // Şimdilik: 4 haneli rastgele string döner

// Veri Yayını (Aşama 2'de Firestore'a yazacak)
publishGameState(masaID, state)
/*
  state = {
    gameType : "batak" | "101" | "king" | "okey",
    teamMode : true | false,
    names    : ["Ali", "Veli", "Ayse", "Fatma"],
    scores   : [120, -30, 80, 0],
    sheetHTML: "<table>...</table>"
  }
  Asama 1 (su an): localStorage'a yazar ("masa_" + masaID key ile)
  Asama 2 (Firebase): Firestore'a yazar
*/

// Veri Okuma (Aşama 2'de Firestore onSnapshot'a dönecek)
readGameState(masaID)       // localStorage'dan okur

// Ana Menü Sıralama
saveUsage(gameId)           // Son oynanma zamanını localStorage'a yaz
sortMenuByUsage(gridId)     // Kartları son kullanıma göre sırala
```

---

## 5. Oyun Mekanikleri — Özet

### batak.html
- 4 oyun türü: `ihaleli`, `esli`, `kozmaca`, `gommeli`
- `gommeli` 3 kişilik (pos-top disabled)
- `esli` cift bazlı puanlama
- localStorage key: `batakStatev1`

### king.html
- 7 oyun tipi — GAME_RULES nesnesi (puanlar, hedefler, limitler)
- Her oyuncunun 3 ceza + 2 koz hakkı var (dotlarla gösterilir)
- Sıra sistemi: `turnIndex`, crown animasyonu aktif oyuncuyu gösterir
- localStorage key: `kingGamev14`

### okey101.html
- Kazanan 101 çıkarıyor, kaybedenler ceza puanı yazıyor
- Okey/Çift modda değerler x2 oluyor
- localStorage key: `okey101Statev14`

### okeyDuz.html
- Başlangıç sayısı seçimi (10/12/16/20)
- Tek veya Eşli mod
- Kazanan kimse diğerleri -puan alır; 0'a düşünce oyun biter
- localStorage key: `okeyGameStatev14`

### zarAt.html
- CSS 3D transform ile gerçek küp animasyonu
- 6 yüzey — TRANSFORMS nesnesiyle her sayı için doğru rotasyon
- Tek veya çift zar modu, 5 saniyelik cooldown
- Sıra rengi (pembe/mavi) background değişimi
- `common.js` YÜKLENMEZ — kendi mini AudioContext'i var

---

## 6. ASAMA 2 — Firebase Entegrasyonu

### Neden Firebase?
- GitHub Pages PHP desteklemez — eski `takipli/api.php` calismiyordu
- Firebase Firestore: gercek zamanli veri senkronizasyonu
- Firebase JS SDK: CDN'den yuklenebilir, statik sayfalarda calisir
- Ucretsiz plan (Spark): 50K okuma + 20K yazma/gun yeterli

### Hedef: "Masayı İzle" Özelliği
Bir oyun oynandığında masa ID üretilir.
İzleyici aynı ID ile `izle.html`'i açar → skoru canlı görür (farklı cihaz).

### Adim 1 — Firebase Projesi (KULLANICI YAPACAK)
1. https://console.firebase.google.com → "Add project"
2. Firestore Database → "Create database" → "Start in test mode"
3. Project settings → "Add app" → Web (</> ikonu)
4. Config nesnesini ajan'a gönder:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "123...",
  appId: "1:..."
};
```
5. Authentication → Settings → Authorized Domains →
   `cmtsy81.github.io` ve `localhost` ekle

### Adim 2 — firebase-config.js olustur (AJAN YAPACAK)
Kullanicinin config'ini alip dosyaya yazacak.
Bu dosyayı `.gitignore`'a ekleme — Firebase Web config'i public olabilir.
Guvenlik icin Firestore Security Rules kullan.

### Adim 3 — common.js guncelle (AJAN YAPACAK)
Firebase SDK import ekle ve fonksiyonlari guncelle:
```javascript
// Eklenecek (common.js basina veya firebase-config.js'e)
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config.js';
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// publishGameState icinde:
await db.collection('masalar').doc(masaID).set(payload);

// readGameState icinde (izle.html'de):
db.collection('masalar').doc(masaID).onSnapshot(doc => updateDisplay(doc.data()));
```

NOT: ES modules kullanilacaksa HTML dosyalarinda `<script type="module">` gerekir.
Alternatif: Firebase CDN compat versiyonu (module yerine global `firebase.xxx`)

### Adim 4 — Her oyuna "Yayinla" butonu ekle (AJAN YAPACAK)
- `saveRound()` cagrisinin sonuna `publishGameState(masaID, {...})` ekle
- Header'a masa ID göstergesi ekle (tıklayınca kopyalanır)
- `startGame()` içinde `masaID = getSafeMasaID()` üret ve localStorage'a kaydet

### Adim 5 — izle.html guncelle (AJAN YAPACAK)
- Firebase uyari banner'ini kaldir
- `pollingInterval` kodunu Firestore `onSnapshot` ile degistir
- Baglanti durumu gostergesi ekle (yeşil/kırmızı dot)

### Adim 6 — Firestore Security Rules (AJAN YAPACAK)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /masalar/{masaID} {
      allow read: if true;
      allow write: if true;  // Simdilik acik — auth eklenince kisitlanir
    }
  }
}
```

### Veri Modeli (Firestore)
```
Collection: masalar
  Document: "7823"  (masaID — 4-6 haneli kod)
    gameType  : "batak" | "101" | "king" | "okey"
    teamMode  : false
    names     : ["Ali", "Veli", "Ayse", "Fatma"]
    scores    : [120, -30, 80, 0]
    sheetHTML : "<table class='score-table'>...</table>"
    updatedAt : 1720876800000  (Date.now())
```

---

## 7. ASAMA 3 (GELECEK) — Kullanici Hesaplari

- Firebase Authentication (Google Sign-in veya anonim)
- Her kullanicinin gecmis oyun skorlarina erisimi
- Firestore: `kullanicilar/{uid}/oyunlar/{oyunId}`
- Mevcut localStorage data'sini Firebase'e tasima secenegi

---

## 8. Tasarim Kararlari

| Karar | Gerekcesi |
|---|---|
| Dark/Light mode yok | Kullanici istegi: "dark light gereksiz simdilik" |
| Tek klasor yapisi | Kullanici: "takipli ya da burasi farketmez tek dosyada ilerleyelim" |
| `takipli/` silindi | PHP gerektiriyordu, GitHub Pages'de calismiyordu |
| common.css/js | Kod tekrarini azaltmak — 5 dosyada aynı CSS vardi (~150 satir) |
| localStorage once | Firebase'i beklemeden oyun calisir hale getirmek |
| zarAt kendi AudioCtx | common.js'deki AudioCtx ile cakisma olur |
| CSS Grid 3x3 masa | Mobilde 4 oyuncu pozisyonunu sezgisel gostermek |
| Vanilla JS | Framework gerekmez, dosya boyutu kucuk, GitHub Pages uyumlu |

---

## 9. Bilinen Sorunlar / TODO

- [ ] `izle.html` Firebase baglanmasi henuz yok (Adim 2-5 bekliyor)
- [ ] `publishGameState()` hicbir oyun HTML'ine entegre edilmedi
- [ ] `getSafeMasaID()` Firestore cakisma kontrolu yok
- [ ] Resimler (`img/`) yuklenmezse placeholder goruyor (beklenen davranis)
- [ ] King localStorage key `v14` — eski versiyon migration kodu var (temizlenebilir)

---

## 10. GitHub Workflow

```bash
git add -A
git commit -m "feat/fix: kisa aciklama"
git push origin main
# GitHub Actions otomatik deploy eder (~1-2 dakika)
# Canli URL: https://cmtsy81.github.io/oyunBoard/
```

**GitHub Pages ayari:**  
Repo → Settings → Pages → Branch: `main`, folder: `/ (root)`

---

## 11. Ajan Devir Teslim Notu

Projeye yeni basliyor veya devam ediyorsan:

1. Bu dosyayi oku — mimari anlasilir
2. `common.css` ve `common.js` oku — design system ve utilities
3. Hangi Asama'dayz? Bolum 6'daki kontrol listesine bak
4. Firebase config alindiysa `firebase-config.js` olustur ve `common.js` guncelle
5. Her oyun HTML'ine `publishGameState()` entegre et
6. `izle.html`'i Firestore `onSnapshot` ile guncelle
7. Test: `git push` sonrasi https://cmtsy81.github.io/oyunBoard/

**Kritik not:**
- `zarAt.html` `common.js` yuklemiyor (AudioContext cakismasi)
- Diger tum oyun sayfalari `common.js` yukluyor
- Firebase JS SDK icin `<script type="module">` veya CDN compat gerekir

---

*Son guncelleme: 2026-07-13 | Versiyon: 2.0.0*
