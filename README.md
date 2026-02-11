# TechReview - Teknoloji İnceleme ve Topluluk Platformu

TechReview, kullanıcıların en son teknolojik ürünleri inceleyebileceği, yorum yapabileceği ve teknoloji dünyasındaki gelişmeleri takip edebileceği kapsamlı bir web platformudur. Bu proje, modern web teknolojileri kullanılarak geliştirilmiş olup, kullanıcı etkileşimini ön planda tutan bir yapıya sahiptir.

## 🚀 Proje Hakkında

TechReview, teknoloji meraklılarını bir araya getirmeyi amaçlar. Kullanıcılar sisteme kayıt olup ürünler hakkında detaylı incelemeler yazabilir, diğer kullanıcıların deneyimlerinden faydalanabilir ve forum bölümünde tartışmalara katılabilirler. Ayrıca güncel teknoloji haberlerine de platform üzerinden erişim sağlanabilir.

## ✨ Özellikler

*   **Kullanıcı Yönetimi:**
    *   Kayıt Ol ve Giriş Yap (Authentication)
    *   Profil Yönetimi (Biyografi, yaş, cinsiyet vb.)
    *   Kullanıcı Rolleri (Kullanıcı, Şirket Hesabı)

*   **Ürün İncelemeleri:**
    *   Detaylı ürün listeleme ve arama
    *   Ürünlere puan verme ve yorum yapma
    *   Ortalama puanların otomatik hesaplanması

*   **Forum Sistemi:**
    *   Kategori bazlı tartışma konuları oluşturma
    *   Konulara cevap yazma ve etkileşim

*   **Haberler:**
    *   Güncel teknoloji haberleri ve makaleler
    *   Haber detay sayfaları

*   **Diğer Özellikler:**
    *   Alışveriş/İstek Listesi (Sepet) yönetimi
    *   Dinamik içerik yönetimi
    *   Responsive (Mobil uyumlu) tasarım

## 🛠️ Kullanılan Teknolojiler

Bu proje aşağıdaki teknolojiler kullanılarak geliştirilmiştir:

*   **Frontend:**
    *   HTML5, CSS3
    *   JavaScript (ES6+)
    *   Bootstrap / Custom CSS (Tasarım detaylarına göre)

*   **Backend:**
    *   Node.js
    *   Express.js (Web Sunucusu)
    *   RESTful API Mimarisi

*   **Veritabanı:**
    *   SQLite3 (Hafif ve hızlı yerel veritabanı)

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/kullaniciadi/TechReview.git
    cd TechReview
    ```

2.  **Gerekli Paketleri Yükleyin:**
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın:**
    ```bash
    npm start
    ```

4.  **Tarayıcıda Açın:**
    Tarayıcınızın adres çubuğuna `http://localhost:3000` yazarak uygulamaya erişebilirsiniz.

## 📂 Dosya Yapısı

*   `backend/`: Sunucu taraflı kodlar ve veritabanı bağlantıları.
*   `public/`: Statik dosyalar (HTML, CSS, JS, Resimler).
*   `user_dbs/`: Kullanıcılara özel oluşturulan veritabanı dosyaları.
*   `database.db`: Ana veritabanı dosyası.

## 📝 Lisans

Bu proje açık kaynaklıdır ve eğitim amaçlı geliştirilmiştir.
