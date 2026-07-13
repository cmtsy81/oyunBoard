/**
 * YazBoz — common.js
 * Tüm oyun sayfaları tarafından paylaşılan JS fonksiyonları
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

/* Global tıklama sesi — buton ve player-card'lara otomatik */
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
   Şu an: Rastgele 4 haneli kod (localStorage kontrolsüz)
   Aşama 2'de: Firestore'a sorarak çakışma kontrolü
   ═══════════════════════════════════════════════ */
function getSafeMasaID() {
    // Aşama 2'de bu fonksiyon async hale gelecek ve Firestore'a soracak
    return Math.floor(1000 + Math.random() * 9000).toString();
}

/* ═══════════════════════════════════════════════
   PAYLAŞIM (MASA YAYINI)
   Şu an: localStorage'a kaydeder (izle.html aynı cihazda çalışır)
   Aşama 2'de: Firestore'a yazar → tüm cihazlar görebilir
   ═══════════════════════════════════════════════ */
function publishGameState(masaID, state) {
    /**
     * state = {
     *   gameType : "batak" | "101" | "king" | "okey",
     *   teamMode : true | false,
     *   names    : ["Ali", "Veli", "Ayşe", "Fatma"],
     *   scores   : [120, -30, 80, 0],
     *   sheetHTML: "<table>...</table>"
     * }
     */
    const payload = {
        ...state,
        updatedAt: Date.now()
    };

    // Şu an: localStorage (tek cihaz, offline)
    localStorage.setItem('masa_' + masaID, JSON.stringify(payload));

    // Aşama 2: Firebase (çoklu cihaz, gerçek zamanlı)
    // await db.collection('masalar').doc(masaID).set(payload);
}

function readGameState(masaID) {
    // Şu an: localStorage'dan oku
    const raw = localStorage.getItem('masa_' + masaID);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch(e) {
        return null;
    }
    // Aşama 2: Firestore onSnapshot ile dinle (izle.html tarafında)
}

/* ═══════════════════════════════════════════════
   AKILLI SIRALAMA (Ana Menü)
   ═══════════════════════════════════════════════ */
function saveUsage(gameId) {
    const usageData = JSON.parse(localStorage.getItem('gameUsage')) || {};
    usageData[gameId] = Date.now();
    localStorage.setItem('gameUsage', JSON.stringify(usageData));
}

function sortMenuByUsage(gridId) {
    const grid  = document.getElementById(gridId);
    if (!grid) return;
    const cards = Array.from(grid.children);
    const usage = JSON.parse(localStorage.getItem('gameUsage')) || {};
    cards.sort((a, b) => {
        const tA = usage[a.getAttribute('data-id')] || 0;
        const tB = usage[b.getAttribute('data-id')] || 0;
        return tB - tA;
    });
    cards.forEach(c => grid.appendChild(c));
}

/* ═══════════════════════════════════════════════
   FIREBASE INIT PLACEHOLDER
   Aşama 2'de firebase-config.js ile birlikte etkinleşecek
   ═══════════════════════════════════════════════ */
// import { initializeApp } from 'firebase/app';
// import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
// import firebaseConfig from './firebase-config.js';
//
// const app = initializeApp(firebaseConfig);
// const db  = getFirestore(app);
