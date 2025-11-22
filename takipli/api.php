<?php
// api.php
// Bu dosya trafiği yönetir, dosyaları yazar/okur ve temizlik yapar.

header('Access-Control-Allow-Origin: *'); // Her yerden erişime izin ver (CORS)
header('Content-Type: application/json; charset=utf-8');

// Ayarlar
$klasor = "veriler"; // JSON dosyalarının duracağı klasör
$saklamaSuresi = 3 * 24 * 60 * 60; // 3 Gün (Saniye cinsinden)

// 1. Klasör Kontrolü
if (!file_exists($klasor)) {
    mkdir($klasor, 0777, true); // Klasör yoksa oluştur
}

// 2. Gelen Verileri Al
$islem = $_GET['islem'] ?? ''; // 'oku' veya 'yaz'
$masaID = $_GET['masa_id'] ?? '';

// Güvenlik: Masa ID sadece rakam olabilir
$masaID = preg_replace("/[^0-9]/", "", $masaID);

// Eğer Masa ID boşsa işlem yapma
if (!$masaID) {
    echo json_encode(["durum" => "hata", "mesaj" => "Masa ID gecersiz"]);
    exit;
}

$dosyaYolu = $klasor . "/" . $masaID . ".json";

// --- İŞLEM: YAZMA (Masa sahibi veri gönderiyor) ---
if ($islem == 'yaz' && $_SERVER['REQUEST_METHOD'] == 'POST') {
    
    // POST ile gelen ham veriyi al
    $jsonVeri = file_get_contents('php://input');
    
    // Veriyi dosyaya kaydet
    if(file_put_contents($dosyaYolu, $jsonVeri)) {
        echo json_encode(["durum" => "basarili"]);
        
        // *** TEMİZLİK TETİKLEME *** // Her yazma işleminde temizlik yapmak sunucuyu yorabilir.
        // %10 ihtimalle temizlik fonksiyonunu çalıştıralım.
        if(rand(1, 10) == 1) { 
            eskiDosyalariTemizle($klasor, $saklamaSuresi); 
        }
    } else {
        echo json_encode(["durum" => "hata", "mesaj" => "Dosya yazilamadi (Yazim izni var mi?)"]);
    }
}

// --- İŞLEM: OKUMA (İzleyiciler veri çekiyor) ---
elseif ($islem == 'oku') {
    
    if (file_exists($dosyaYolu)) {
        // Dosyayı oku ve ekrana bas
        echo file_get_contents($dosyaYolu);
    } else {
        echo json_encode(["durum" => "yok", "mesaj" => "Masa bulunamadi"]);
    }
}

// --- TEMİZLİK FONKSİYONU ---
function eskiDosyalariTemizle($klasor, $saniye) {
    $dosyalar = glob($klasor . "/*.json");
    $suan = time();
    
    foreach ($dosyalar as $dosya) {
        // Dosya oluşturulma/değiştirilme zamanı
        $dosyaZamani = filemtime($dosya);
        
        // Eğer şu anki zaman ile dosya zamanı arasındaki fark 3 günden fazlaysa
        if (($suan - $dosyaZamani) > $saniye) {
            unlink($dosya); // Dosyayı sil
        }
    }
}
?>