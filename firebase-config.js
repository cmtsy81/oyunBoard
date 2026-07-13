/**
 * firebase-config.js
 * Firebase projesini başlatır ve global window.db oluşturur.
 * Tüm oyun sayfaları ve izle.html bu dosyayı yükler.
 */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCPjqwCbpQzx2L8D2rEtioXnuZ45ZynT30",
    authDomain: "yazboz3560.firebaseapp.com",
    projectId: "yazboz3560",
    storageBucket: "yazboz3560.firebasestorage.app",
    messagingSenderId: "461720092892",
    appId: "1:461720092892:web:1d0aaf53e4e12b1d237419",
    measurementId: "G-RMYBJYDKTC"
};

if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    window.db = firebase.firestore();
    console.log('[Firebase] Bağlantı kuruldu:', FIREBASE_CONFIG.projectId);
} else {
    console.warn('[Firebase] SDK yüklenmedi, localStorage modunda çalışılıyor.');
}
