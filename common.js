/**
 * YazBoz — common.js v2.1.0
 * Tüm oyun sayfaları tarafından paylaşılan JS fonksiyonları.
 * Firebase compat SDK yüklendikten SONRA bu dosya yüklenmeli.
 */

'use strict';

/* ═══════════════════════════════════════════════
   NAVİGASYON
   ═══════════════════════════════════════════════ */
function goHome() {
    window.location.href = 'index.html';
}

/* ═══════════════════════════════════════════════
   SES EFEKTİ
   ═══════════════════════════════════════════════ */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playClick() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

document.addEventListener('click', e => {
    if (e.target.closest('button') || e.target.closest('.player-card')) {
        playClick();
    }
});

/* ═══════════════════════════════════════════════
   MODAL YÖNETİMİ
   ═══════════════════════════════════════════════ */
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

/* ═══════════════════════════════════════════════
   FOOTER VERSION
   ═══════════════════════════════════════════════ */
function setFooterVersion(v) {
    const el = document.getElementById('footerVersion');
    if (el) el.textContent = 'v' + v;
}

/* ═══════════════════════════════════════════════
   MASA KOD ÜRETİCİ
   ═══════════════════════════════════════════════ */
function getSafeMasaID() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

/* ═══════════════════════════════════════════════
   PAYLAŞIM — FIRESTORE (birincil) + localStorage (yedek)
   ═══════════════════════════════════════════════ */

/**
 * Oyun durumunu Firestore'a ve localStorage'a yazar.
 * @param {string} masaID  - 4 haneli masa kodu
 * @param {object} state   - { gameType, names, scores, teamMode? }
 */
function publishGameState(masaID, state) {
    const payload = {
        ...state,
        updatedAt: Date.now()
    };

    // 1. Firestore (gerçek zamanlı, çoklu cihaz)
    if (window.db) {
        window.db.collection('masalar').doc(masaID).set(payload)
            .then(() => console.log('[Firestore] Yayınlandı:', masaID))
            .catch(err => console.error('[Firestore] Hata:', err));
    }

    // 2. localStorage (aynı cihaz yedek)
    try {
        localStorage.setItem('masa_' + masaID, JSON.stringify(payload));
    } catch(e) {}
}

/**
 * Oyun durumunu localStorage'dan okur (aynı cihaz yedek).
 * Firestore okuma izle.html'de onSnapshot ile yapılır.
 */
function readGameState(masaID) {
    const raw = localStorage.getItem('masa_' + masaID);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
}

/* ═══════════════════════════════════════════════
   PAYLAŞIM MODAL — Tüm oyunlarda ortak
   ═══════════════════════════════════════════════ */

/**
 * Masa kodunu ve link'i gösteren paylaşım modalını açar.
 * Her oyun sayfasında aynı HTML: id="shareModal"
 */
function openShareModal(masaID) {
    const base   = window.location.href.replace(/\/[^/]*$/, '/');
    const url    = base + 'izle.html?masa=' + masaID;

    const codeEl = document.getElementById('shareMasaCode');
    const linkEl = document.getElementById('shareLink');
    if (codeEl) codeEl.textContent = masaID;
    if (linkEl) { linkEl.href = url; linkEl.textContent = url; }

    openModal('shareModal');
}

function copyShareLink() {
    const linkEl = document.getElementById('shareLink');
    if (!linkEl) return;
    const url = linkEl.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            const btn = document.getElementById('btnCopyLink');
            if (btn) {
                btn.textContent = '✅ Kopyalandı!';
                setTimeout(() => btn.textContent = '🔗 Linki Kopyala', 2000);
            }
        });
    }
}

/* ═══════════════════════════════════════════════
   AKILLI SIRALAMA (Ana Menü)
   ═══════════════════════════════════════════════ */
function saveUsage(gameId) {
    const usageData = JSON.parse(localStorage.getItem('gameUsage') || '{}');
    usageData[gameId] = Date.now();
    localStorage.setItem('gameUsage', JSON.stringify(usageData));
}

function sortMenuByUsage(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    const cards = Array.from(grid.children);
    const usage = JSON.parse(localStorage.getItem('gameUsage') || '{}');
    cards.sort((a, b) => {
        const tA = usage[a.getAttribute('data-id')] || 0;
        const tB = usage[b.getAttribute('data-id')] || 0;
        return tB - tA;
    });
    cards.forEach(c => grid.appendChild(c));
}
