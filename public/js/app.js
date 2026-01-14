const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? "http://localhost:3000/api" 
  : `${window.location.origin}/api`;

const api = {
  async get(endpoint) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`);
      if (!res.ok) throw new Error("Veri çekilemedi");
      const data = await res.json();
      console.log(`✓ API GET ${endpoint}:`, data);
      return data;
    } catch (e) {
      console.error(`✗ API GET Error ${endpoint}:`, e);
      return [];
    }
  },
  async post(endpoint, data) {
    console.log(`→ API POST ${endpoint}:`, data);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    console.log(`✓ API POST Response ${endpoint}:`, result);
    return result;
  },
  async put(endpoint, data) {
    console.log(`→ API PUT ${endpoint}:`, data);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    console.log(`✓ API PUT Response ${endpoint}:`, result);
    return result;
  },
  async delete(endpoint) {
    console.log(`→ API DELETE ${endpoint}`);
    const res = await fetch(`${API_URL}${endpoint}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Silme işlemi başarısız");
    return true;
  },
};

const app = {
  currentUser: JSON.parse(localStorage.getItem("current_user_session")),
  compareList: [],

  themes: {
    Tümü: { primary: "#2563eb", bg: "#f3f4f6", icon: "fa-layer-group" },
    Telefon: { primary: "#dc2626", bg: "#fef2f2", icon: "fa-mobile-screen" },
    Laptop: { primary: "#059669", bg: "#ecfdf5", icon: "fa-laptop" },
    Oyun: { primary: "#7c3aed", bg: "#f5f3ff", icon: "fa-gamepad" },
    Kamera: { primary: "#d97706", bg: "#fffbeb", icon: "fa-camera" },
    Kulaklık: { primary: "#db2777", bg: "#fdf2f8", icon: "fa-headphones" },
    Kitap: { primary: "#8b5cf6", bg: "#f5f3ff", icon: "fa-book" },
    Aksesuar: { primary: "#ea580c", bg: "#ffedd5", icon: "fa-keyboard" },
    Uygulama: { primary: "#0ea5e9", bg: "#e0f2fe", icon: "fa-mobile" },
    "Yapay Zeka": { primary: "#10b981", bg: "#ecfdf5", icon: "fa-robot" },
  },

  // Category-specific specifications
  categorySpecs: {
    "Telefon": {
      comparable: true,
      fields: [
        { name: "ekran", label: "Ekran", type: "text", placeholder: "Örn: 6.7 inch AMOLED", required: true },
        { name: "islemci", label: "İşlemci", type: "text", placeholder: "Örn: Snapdragon 8 Gen 2", required: true },
        { name: "ram", label: "RAM", type: "text", placeholder: "Örn: 12GB", required: true },
        { name: "depolama", label: "Depolama", type: "text", placeholder: "Örn: 256GB", required: true },
        { name: "pil", label: "Pil Kapasitesi", type: "text", placeholder: "Örn: 5000mAh", required: false },
        { name: "agirlik", label: "Ağırlık", type: "text", placeholder: "Örn: 195g", required: false }
      ]
    },
    "Laptop": {
      comparable: true,
      fields: [
        { name: "ekran", label: "Ekran", type: "text", placeholder: "Örn: 15.6 inch FHD", required: true },
        { name: "islemci", label: "İşlemci", type: "text", placeholder: "Örn: Intel i7-13700H", required: true },
        { name: "ram", label: "RAM", type: "text", placeholder: "Örn: 16GB DDR5", required: true },
        { name: "depolama", label: "Depolama", type: "text", placeholder: "Örn: 512GB SSD", required: true },
        { name: "ekranKarti", label: "Ekran Kartı", type: "text", placeholder: "Örn: RTX 4060", required: false },
        { name: "agirlik", label: "Ağırlık", type: "text", placeholder: "Örn: 2.1kg", required: false }
      ]
    },
    "Kitap": {
      comparable: false,
      fields: [
        { name: "yazar", label: "Yazar", type: "text", placeholder: "Örn: Isaac Asimov", required: true },
        { name: "yayinevi", label: "Yayınevi", type: "text", placeholder: "Örn: Altın Kitaplar", required: true },
        { name: "sayfaSayisi", label: "Sayfa Sayısı", type: "number", placeholder: "Örn: 320", required: true },
        { name: "baski", label: "Baskı", type: "text", placeholder: "Örn: 5. Baskı", required: false },
        { name: "isbn", label: "ISBN", type: "text", placeholder: "Örn: 978-123456789", required: false },
        { name: "tur", label: "Kitap Türü", type: "text", placeholder: "Örn: Bilim Kurgu", required: false }
      ]
    },
    "Uygulama": {
      comparable: false,
      fields: [
        { name: "platform", label: "Platform", type: "text", placeholder: "Örn: iOS, Android", required: true },
        { name: "versiyon", label: "Versiyon", type: "text", placeholder: "Örn: 2.5.1", required: true },
        { name: "cikisTarihi", label: "Çıkış Tarihi", type: "date", placeholder: "", required: false },
        { name: "boyut", label: "Boyut", type: "text", placeholder: "Örn: 125MB", required: false },
        { name: "gelistirici", label: "Geliştirici", type: "text", placeholder: "Örn: ABC Studios", required: false }
      ]
    },
    "Kamera": {
      comparable: true,
      fields: [
        { name: "megapiksel", label: "Megapiksel", type: "text", placeholder: "Örn: 24MP", required: true },
        { name: "sensorBoyutu", label: "Sensör Boyutu", type: "text", placeholder: "Örn: APS-C", required: true },
        { name: "lens", label: "Lens", type: "text", placeholder: "Örn: 18-55mm", required: false },
        { name: "video", label: "Video", type: "text", placeholder: "Örn: 4K 60fps", required: false },
        { name: "agirlik", label: "Ağırlık", type: "text", placeholder: "Örn: 450g", required: false }
      ]
    },
    "Kulaklık": {
      comparable: true,
      fields: [
        { name: "tip", label: "Tip", type: "text", placeholder: "Örn: Over-Ear, In-Ear", required: true },
        { name: "baglanti", label: "Bağlantı", type: "text", placeholder: "Örn: Bluetooth 5.3", required: true },
        { name: "pilOmru", label: "Pil Ömrü", type: "text", placeholder: "Örn: 30 saat", required: false },
        { name: "anc", label: "Aktif Gürültü Önleme", type: "text", placeholder: "Evet/Hayır", required: false },
        { name: "agirlik", label: "Ağırlık", type: "text", placeholder: "Örn: 250g", required: false }
      ]
    },
    "Oyun": {
      comparable: false,
      fields: [
        { name: "platform", label: "Platform", type: "text", placeholder: "Örn: PC, PS5, Xbox", required: true },
        { name: "tur", label: "Tür", type: "text", placeholder: "Örn: RPG, FPS", required: true },
        { name: "cikisTarihi", label: "Çıkış Tarihi", type: "date", placeholder: "", required: false },
        { name: "gelistirici", label: "Geliştirici", type: "text", placeholder: "Örn: Ubisoft", required: false },
        { name: "oyuncuSayisi", label: "Oyuncu Sayısı", type: "text", placeholder: "Örn: Tek/Çok oyunculu", required: false }
      ]
    },
    "Aksesuar": {
      comparable: true,
      fields: [
        { name: "tip", label: "Aksesuar Tipi", type: "text", placeholder: "Örn: Klavye, Mouse", required: true },
        { name: "baglanti", label: "Bağlantı", type: "text", placeholder: "Örn: USB, Bluetooth", required: true },
        { name: "uyumluluk", label: "Uyumluluk", type: "text", placeholder: "Örn: Windows, Mac", required: false },
        { name: "renk", label: "Renk", type: "text", placeholder: "Örn: Siyah", required: false }
      ]
    },
    "Yapay Zeka": {
      comparable: false,
      fields: [
        { name: "model", label: "Model", type: "text", placeholder: "Örn: GPT-4", required: true },
        { name: "gelistirici", label: "Geliştirici", type: "text", placeholder: "Örn: OpenAI", required: true },
        { name: "cikisTarihi", label: "Çıkış Tarihi", type: "date", placeholder: "", required: false },
        { name: "kullanimAlani", label: "Kullanım Alanı", type: "text", placeholder: "Örn: Metin üretimi", required: false }
      ]
    }
  },

  // Toggle comparison for a product
  toggleCompare(id) {
    if (!this.products) return;
    const product = this.products.find((p) => p.id === id);
    if (!product) return;

    const exists = this.compareList.find((p) => p.id === id);
    if (exists) {
      this.compareList = this.compareList.filter((p) => p.id !== id);
    } else {
      if (this.compareList.length >= 3) {
        alert("En fazla 3 ürün karşılaştırabilirsiniz.");
        return;
      }
      this.compareList.push(product);
    }

    // Re-render to update buttons
    this.renderProducts(this.products);
    this.renderCompareBar();
  },

  renderCompareBar() {
    let bar = document.getElementById("compare-bar");
    if (!this.compareList.length) {
      if (bar) bar.remove();
      return;
    }

    if (!bar) {
      bar = document.createElement("div");
      bar.id = "compare-bar";
      bar.className =
        "fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 translate-y-0";
      // Ensure it respects sidebar margin
      if (window.innerWidth >= 769) {
        const sidebar = document.getElementById("sidebar-nav");
        const isExpanded = sidebar && sidebar.classList.contains("expanded");
        bar.style.paddingLeft = isExpanded ? "260px" : "80px";
      }
      document.body.appendChild(bar);
    } else {
      // Update padding if needed
      if (window.innerWidth >= 769) {
        const sidebar = document.getElementById("sidebar-nav");
        const isExpanded = sidebar && sidebar.classList.contains("expanded");
        bar.style.paddingLeft = isExpanded ? "260px" : "80px";
      }
    }

    const itemsHtml = this.compareList
      .map(
        (p) => `
      <div class="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
        <img src="${p.image}" class="w-10 h-10 rounded object-cover" onerror="this.src='https://placehold.co/100'">
        <div class="text-xs font-bold text-slate-700 max-w-[100px] truncate">${p.name}</div>
        <button onclick="app.toggleCompare(${p.id})" class="text-slate-400 hover:text-red-500 transition-colors">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `
      )
      .join("");

    bar.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="font-bold text-slate-700">${this.compareList.length} Ürün Seçildi</span>
          <div class="flex gap-2">${itemsHtml}</div>
        </div>
        <div class="flex gap-3">
            <button onclick="app.compareList=[]; app.renderProducts(app.products); app.renderCompareBar()" class="text-sm text-slate-500 hover:text-slate-800 underline">Temizle</button>
            <button onclick="app.showComparisonModal()" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Karşılaştır
            </button>
        </div>
      </div>
    `;
  },

  showComparisonModal() {
    // Create modal
    const modalHtml = `
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="this.parentElement.remove()"></div>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto relative z-10 animate-fade-in-up">
          <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
          
          <div class="p-8">
            <h2 class="text-2xl font-black text-slate-800 mb-8 text-center">Karşılaştırma</h2>
            <div class="grid grid-cols-${
              this.compareList.length
            } gap-8 divide-x divide-slate-100">
              ${this.compareList
                .map(
                  (p) => `
                <div class="flex flex-col gap-6">
                  <div class="aspect-video bg-slate-100 rounded-xl overflow-hidden relative group">
                    <img src="${p.image}" class="w-full h-full object-cover">
                    <span class="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">ID: ${
                      p.id
                    }</span>
                  </div>
                  <div class="text-center">
                    <h3 class="font-black text-xl text-slate-800 mb-2">${
                      p.name
                    }</h3>
                    <span class="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide">${
                      p.category
                    }</span>
                  </div>
                  
                  <div class="space-y-4">
                    <div class="bg-slate-50 p-4 rounded-xl text-center">
                        <span class="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Puan</span>
                        <div class="text-3xl font-black text-blue-600 flex items-center justify-center gap-2">
                            ${
                              p.avgRating
                                ? Number(p.avgRating).toFixed(1)
                                : "0.0"
                            }
                            <i class="fa-solid fa-star text-base text-yellow-400"></i>
                        </div>
                    </div>
                    
                    <div class="p-4 border border-slate-100 rounded-xl">
                        <span class="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Açıklama</span>
                        <p class="text-sm text-slate-600 leading-relaxed">${
                          p.description
                        }</p>
                    </div>

                     <div class="p-4 border border-slate-100 rounded-xl text-center">
                        <span class="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Ekleyen</span>
                        <div class="flex items-center justify-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">${(
                              p.username || "U"
                            ).charAt(0)}</div>
                            <span class="text-sm font-medium">${
                              p.username || "Anonim"
                            }</span>
                        </div>
                    </div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    const div = document.createElement("div");
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);
  },

  changeTheme(themeName) {
    const theme = this.themes[themeName] || this.themes["Tümü"];
    document.body.style.backgroundColor = theme.bg;
    return theme;
  },

  init() {
    this.renderNavbar();

    const pageId = document.body.id;

    // Skip sidebar on authentication pages
    if (pageId !== "page-login" && pageId !== "page-register") {
      this.renderSidebar(); // Add Kaggle-style sidebar
    }

    this.renderFooter(); // Add professional footer

    if (pageId === "page-home") this.initHome();
    if (pageId === "page-news") this.initNews();
    if (pageId === "page-forum") this.initForum();
    if (pageId === "page-forum-detail") this.initForumDetail();
    if (pageId === "page-product-detail") this.initProductDetail();
    if (pageId === "page-product-form") {
      this.initProductForm();
      this.changeTheme("Profil");
    }
    if (pageId === "page-news-form") {
      this.initNewsForm();
      this.changeTheme("Haberler");
    }
    if (pageId === "page-profile") this.initProfile();
    if (pageId === "page-login") {
      this.initLogin();
      this.changeTheme("Login");
    }
    if (pageId === "page-register") {
      this.initRegister();
      this.changeTheme("Login");
    }
  },

  // --- KAGGLE-STYLE SIDEBAR ---
  renderSidebar() {
    let sidebarContainer = document.getElementById("sidebar-container");
    if (!sidebarContainer) {
      sidebarContainer = document.createElement("div");
      sidebarContainer.id = "sidebar-container";
      document.body.appendChild(sidebarContainer);
    }

    const pageId = document.body.id;
    const cats = Object.keys(this.themes).filter(
      (k) => !["Tümü", "Haberler", "Forum", "Profil", "Login"].includes(k)
    );

    const catsHtml = cats
      .map(
        (c) => `
        <div class="nav-item" data-category="${c}">
          <i class="fa-solid ${this.themes[c].icon}"></i>
          <span>${c}</span>
        </div>
      `
      )
      .join("");

    // State Management for Sidebar (Per Page)
    const storageKey = `sidebarState_${pageId}`;
    const storedState = localStorage.getItem(storageKey);
    // Default: Home -> expanded, Others -> collapsed (unless user saved preference)
    // If no stored state: Home=true, Others=false
    const isExpanded =
      storedState !== null
        ? storedState === "expanded"
        : pageId === "page-home";

    sidebarContainer.innerHTML = `
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <nav class="sidebar-nav ${isExpanded ? "expanded" : ""}" id="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">Ana Menü</div>
          <a href="index.html" class="nav-item ${
            pageId === "page-home" ? "active" : ""
          }">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>İncelemeler</span>
          </a>
          <div class="relative group">
            <a href="news.html" class="nav-item ${
              pageId === "page-news" ? "active" : ""
            }">
                <i class="fa-regular fa-newspaper"></i>
                <span>Haberler</span>
            </a>
            <!-- Submenu -->
            <div class="absolute left-full top-0 w-48 bg-white border border-gray-100 rounded-xl shadow-xl hidden group-hover:block z-50 overflow-hidden">
                <div class="py-2">
                    <a href="news.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        <i class="fa-solid fa-layer-group w-5 text-center mr-2 text-gray-300"></i> Tümü
                    </a>
                    <a href="news.html?cat=Donanım" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        <i class="fa-solid fa-microchip w-5 text-center mr-2 text-gray-300"></i> Donanım
                    </a>
                    <a href="news.html?cat=Kültür & Sanat" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        <i class="fa-solid fa-book w-5 text-center mr-2 text-gray-300"></i> Kültür & Sanat
                    </a>
                    <a href="news.html?cat=Bilim" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        <i class="fa-solid fa-flask w-5 text-center mr-2 text-gray-300"></i> Bilim
                    </a>
                    <a href="news.html?cat=Yapay Zeka" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        <i class="fa-solid fa-robot w-5 text-center mr-2 text-gray-300"></i> Yapay Zeka
                    </a>
                </div>
            </div>
          </div>
          <a href="forum.html" class="nav-item ${
            pageId === "page-forum" || pageId === "page-forum-detail"
              ? "active"
              : ""
          }">
            <i class="fa-regular fa-comments"></i>
            <span>Forum</span>
          </a>
        </div>

        <div class="nav-section">
          <div class="nav-section-title">Kategoriler</div>
          <div class="nav-item" data-category="Tümü">
            <i class="fa-solid fa-layer-group"></i>
            <span>Tümü</span>
          </div>
          ${catsHtml}
        </div>
      </nav>
    `;

    // Add with-sidebar class to main IF expanded
    const main = document.querySelector("main");
    if (main) {
      main.classList.add("with-sidebar");
      // Initially sync body class for CSS margins based on state
      if (!isExpanded) {
        document.body.classList.add("sidebar-closed");
      } else {
        document.body.classList.remove("sidebar-closed");
      }
    }

    // Event listeners for category filtering
    const categoryItems = sidebarContainer.querySelectorAll("[data-category]");
    categoryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const category = item.getAttribute("data-category");
        console.log("Sidebar click:", category, "Page:", pageId);
        
        // If we are on the Home Page, we allow in-place filtering
        // We also check if 'window.filterCategory' exists (it's defined in initHome)
        if (pageId === "page-home" && typeof window.filterCategory === 'function') {
          window.filterCategory(category);
          
          // Close mobile sidebar if open
          const sidebar = document.getElementById("sidebar-nav");
          const overlay = document.getElementById("sidebar-overlay");
          if (window.innerWidth < 768) {
            sidebar.classList.remove("open");
            overlay.classList.remove("show");
          }
        } 
        // If we are on ANY OTHER page (Forum, News, Detail etc.), we MUST redirect to Home
        else {
          window.location.href = `index.html?cat=${encodeURIComponent(category)}`;
        }
      });
    });

    // Mobile overlay toggle
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        document.getElementById("sidebar-nav").classList.remove("open");
        overlay.classList.remove("show");
      });
    }

    // HAMBURGER BUTTON LOGIC
    const categoryBtn = document.getElementById("category-btn");
    const sidebar = document.getElementById("sidebar-nav");

    if (categoryBtn && sidebar && overlay) {
      categoryBtn.onclick = () => {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
          // Mobile: toggle overlay
          const isOpen = sidebar.classList.contains("open");
          sidebar.classList.toggle("open");
          overlay.classList.toggle("show");

          const icon = categoryBtn.querySelector("i");
          if (isOpen) {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
          } else {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
          }
        } else {
          // Desktop: toggle expansion AND save state
          sidebar.classList.toggle("expanded");
          document.body.classList.toggle("sidebar-closed");

          const newState = sidebar.classList.contains("expanded")
            ? "expanded"
            : "collapsed";
          localStorage.setItem(storageKey, newState);
        }
      };
    }
  },

  // --- NAVBAR GÜNCELLENDİ (CSS ile Uyumlu Logo) ---
  renderNavbar() {
    const navContainer = document.getElementById("navbar-placeholder");
    if (!navContainer) return;

    // Show/Hide mobile write button based on auth
    const mobileWriteBtn = document.getElementById("mobile-write-btn");
    if (mobileWriteBtn) {
      if (this.currentUser) {
        mobileWriteBtn.style.display = "flex";
      } else {
        mobileWriteBtn.style.display = "none";
      }
    }

    const userHtml = this.currentUser
      ? `
            <div class="relative group">
                <button class="flex items-center gap-3 bg-gradient-to-r from-white/80 to-white/60 hover:to-white px-4 py-2 rounded-full transition-all border border-gray-200/50 hover:border-gray-300 hover:shadow-lg backdrop-blur-sm">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md pointer-events-none">
                        ${this.currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="text-sm font-bold text-gray-800 hidden sm:block pointer-events-none">${
                      this.currentUser.username
                    }</span>
                    <i class="fa-solid fa-chevron-down text-xs text-gray-400 hidden sm:block pointer-events-none transition-transform group-hover:rotate-180"></i>
                </button>
                <div class="absolute top-12 right-0 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 hidden group-hover:block z-50 animate-fade-in overflow-hidden">
                    <div class="p-2 bg-gradient-to-br from-blue-50/50 to-purple-50/30 border-b border-gray-100">
                        <div class="px-3 py-2">
                            <p class="text-xs text-gray-500 font-medium">Hesabım</p>
                            <p class="text-sm font-bold text-gray-900 truncate">${this.currentUser.username}</p>
                        </div>
                    </div>
                    <div class="py-1">
                        <a href="profile.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all group/item">
                            <i class="fa-solid fa-user w-5 text-blue-500 group-hover/item:scale-110 transition-transform"></i>
                            <span class="font-medium">Profilim</span>
                        </a>
                        <a href="product-form.html" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all group/item">
                            <i class="fa-solid fa-plus-circle w-5 text-green-500 group-hover/item:scale-110 transition-transform"></i>
                            <span class="font-medium">Yeni İnceleme</span>
                        </a>
                    </div>
                    <div class="border-t border-gray-100 py-1">
                        <button onclick="app.logout()" class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all group/item">
                            <i class="fa-solid fa-right-from-bracket w-5 group-hover/item:scale-110 transition-transform"></i>
                            <span class="font-medium">Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </div>
        `
      : `
            <div class="flex gap-2">
                <a href="login.html" class="text-gray-600 hover:text-gray-900 font-bold px-3 py-2">Giriş</a>
                <a href="register.html" class="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition-transform hover:-translate-y-0.5">Kayıt Ol</a>
            </div>
        `;

    const cats = Object.keys(this.themes).filter(
      (k) => !["Tümü", "Haberler", "Forum", "Profil", "Login"].includes(k)
    );
    const catsHtml = cats
      .map(
        (c) => `
            <a href="#" data-category="${c}" class="category-link block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-blue-500 font-medium">
                <i class="fa-solid ${this.themes[c].icon} w-5 text-center mr-2 text-gray-400"></i> ${c}
            </a>
        `
      )
      .join("");

    // SVG Logo
    const logoHtml = `
      <a href="index.html" class="flex items-center gap-2 group" aria-label="TechReview Ana Sayfa">
        <!-- SVG icon -->
        <svg class="w-10 h-10 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="40" height="40" rx="8" fill="#0b1220"></rect>
            <g transform="translate(8,8)" stroke="#0ea5e9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95">
                <path d="M6 6 H18"></path>
                <circle cx="6" cy="6" r="1.6" fill="#0ea5e9" stroke="none"></circle>
                <circle cx="18" cy="6" r="1.6" fill="#0ea5e9" stroke="none"></circle>
                <path d="M6 18 V12"></path>
                <circle cx="6" cy="18" r="1.6" fill="#0ea5e9" stroke="none"></circle>
            </g>
            <g transform="translate(28,28) rotate(-10)">
                <circle cx="6" cy="6" r="6" stroke="#ffffff" stroke-width="2.4" fill="none" opacity="0.95"></circle>
                <rect x="11" y="11" width="9" height="3" rx="1.2" transform="rotate(45 11 11)" fill="#111827" stroke="#ffffff" stroke-width="1.6"></rect>
            </g>
            <polygon points="50,8 52.5,13 58,13 53.5,16 55.5,21 50,17 44.5,21 46.5,16 42,13 47.5,13" fill="#facc15" stroke="#f59e0b" stroke-width="0.6"></polygon>
            <rect x="2" y="2" width="40" height="40" rx="8" fill="none" stroke="rgba(255,255,255,0.03)"></rect>
        </svg>

        <span class="text-xl font-black tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
            Tech<span class="text-blue-600 group-hover:text-gray-900 transition-colors">Review</span>
        </span>
    </a>
    `;

    navContainer.innerHTML = `
      <nav id="main-navbar" class="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-colors duration-500 fixed w-full top-0 z-40">
            <div class="w-full px-6 h-16 flex items-center justify-between">
                
                <!-- LEFT: Hamburger + LOGO -->
                <div class="flex items-center gap-4">
                    <button id="category-btn" class="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none text-gray-700">
                        <i class="fa-solid fa-bars text-xl"></i>
                    </button>
                    ${logoHtml}
                </div>

                <!-- CENTER: SEARCH BAR -->
                <div class="hidden md:flex flex-1 max-w-xl mx-4">
                    <div class="relative w-full">
                        <input type="text" id="search-input" placeholder="Ürün, haber veya forum konusu ara..." 
                               class="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                        <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                <!-- SAĞ: AUTH -->
                ${userHtml}
            </div>
        </nav>`;

    // Ensure main content has sidebar class for spacing
    const main = document.querySelector("main");
    if (main) main.classList.add("with-sidebar");
    
    // Init Smart Search
    this.initSmartSearch();
  },

  initSmartSearch() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const query = e.target.value.toLowerCase().trim();
            
            // Smart Navigation Commands
            if (["forum", "topluluk", "tartışma"].some(k => query.includes(k))) {
                window.location.href = "forum.html";
                return;
            }
            if (["profil", "hesabım", "ayarlar"].some(k => query.includes(k))) {
                window.location.href = "profile.html";
                return;
            }
            if (["haber", "gündem", "teknoloji haberleri"].some(k => query.includes(k))) {
                window.location.href = "news.html";
                return;
            }
            if (["ana sayfa", "home", "incelemeler"].some(k => query.includes(k))) {
                window.location.href = "index.html";
                return;
            }
            if (["çıkış", "logout"].some(k => query.includes(k))) {
                this.logout();
                return;
            }
            
            // If on home page, filter products. Else redirect to home with search
            if (document.body.id === "page-home" && window.filterCategory) {
                 window.filterCategory("Tümü", query);
            } else {
                 window.location.href = `index.html?search=${encodeURIComponent(query)}`;
            }
        }
    });
  },

  // --- PREMIUM FOOTER RE-IMPLEMENTATION ---
  renderFooter() {
    const pageId = document.body.id;
    if (pageId === "page-login" || pageId === "page-register") return;

    let footerContainer = document.getElementById("footer-container");
    if (!footerContainer) {
      footerContainer = document.createElement("div");
      footerContainer.id = "footer-container";
      document.body.appendChild(footerContainer);
    }
    
    // Premium Dark Footer Design
    footerContainer.innerHTML = `
      <footer class="site-footer bg-slate-900 text-slate-300 font-sans border-t border-slate-800">
        <!-- Top Section: Brand & Newsletter -->
        <div class="max-w-7xl mx-auto px-6 pt-16 pb-8">
            <div class="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-800 pb-12">
                <div class="flex flex-col gap-4 max-w-md text-center md:text-left">
                    <div class="flex items-center justify-center md:justify-start gap-3">
                        <!-- SVG Logo (matching navbar) -->
                        <svg class="w-10 h-10" viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="40" height="40" rx="8" fill="#0b1220"></rect>
                            <g transform="translate(8,8)" stroke="#0ea5e9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95">
                                <path d="M6 6 H18"></path>
                                <circle cx="6" cy="6" r="1.6" fill="#0ea5e9" stroke="none"></circle>
                                <circle cx="18" cy="6" r="1.6" fill="#0ea5e9" stroke="none"></circle>
                                <path d="M6 18 V12"></path>
                                <circle cx="6" cy="18" r="1.6" fill="#0ea5e9" stroke="none"></circle>
                            </g>
                            <g transform="translate(28,28) rotate(-10)">
                                <circle cx="6" cy="6" r="6" stroke="#ffffff" stroke-width="2.4" fill="none" opacity="0.95"></circle>
                                <rect x="11" y="11" width="9" height="3" rx="1.2" transform="rotate(45 11 11)" fill="#111827" stroke="#ffffff" stroke-width="1.6"></rect>
                            </g>
                            <polygon points="50,8 52.5,13 58,13 53.5,16 55.5,21 50,17 44.5,21 46.5,16 42,13 47.5,13" fill="#facc15" stroke="#f59e0b" stroke-width="0.6"></polygon>
                            <rect x="2" y="2" width="40" height="40" rx="8" fill="none" stroke="rgba(255,255,255,0.03)"></rect>
                        </svg>
                        <span class="text-2xl font-black text-white tracking-tight">Tech<span class="text-blue-500">Review</span></span>
                    </div>
                    <p class="text-slate-400 text-sm leading-relaxed">
                        Teknoloji dünyasındaki en son incelemeler, haberler ve tartışmalar için güvenilir kaynağınız. 
                        Topluluğumuza katılın ve deneyimlerinizi paylaşın.
                    </p>
                </div>
                
                <div class="w-full max-w-sm bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                    <h3 class="text-white font-bold mb-2 flex items-center gap-2">
                        <i class="fa-regular fa-envelope text-blue-500"></i> Bültene Abone Ol
                    </h3>
                    <p class="text-xs text-slate-400 mb-4">En yeni incelemelerden anında haberdar olun.</p>
                    <div class="flex gap-2">
                        <input type="email" placeholder="E-posta adresiniz" class="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors">
                        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all hover:shadow-lg hover:shadow-blue-600/20">
                            Kayıt Ol
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Middle Section: Links -->
        <div class="max-w-7xl mx-auto px-6 py-12">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                <div>
                    <h4 class="text-white font-bold mb-6 text-sm uppercase tracking-wider">Platform</h4>
                    <ul class="space-y-3 text-sm">
                        <li><a href="index.html" class="hover:text-blue-400 transition-colors flex items-center gap-2"><i class="fa-solid fa-chevron-right text-[10px] text-slate-600"></i> İncelemeler</a></li>
                        <li><a href="news.html" class="hover:text-blue-400 transition-colors flex items-center gap-2"><i class="fa-solid fa-chevron-right text-[10px] text-slate-600"></i> Haberler</a></li>
                        <li><a href="forum.html" class="hover:text-blue-400 transition-colors flex items-center gap-2"><i class="fa-solid fa-chevron-right text-[10px] text-slate-600"></i> Forum</a></li>
                        <li><a href="product-form.html" class="hover:text-blue-400 transition-colors flex items-center gap-2"><i class="fa-solid fa-chevron-right text-[10px] text-slate-600"></i> İnceleme Yaz</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="text-white font-bold mb-6 text-sm uppercase tracking-wider">Kategoriler</h4>
                    <ul class="space-y-3 text-sm">
                        <li><a href="index.html?cat=Telefon" class="hover:text-blue-400 transition-colors">Telefonlar</a></li>
                        <li><a href="index.html?cat=Laptop" class="hover:text-blue-400 transition-colors">Laptoplar</a></li>
                        <li><a href="index.html?cat=Oyun" class="hover:text-blue-400 transition-colors">Oyun Dünyası</a></li>
                        <li><a href="index.html?cat=Yapay%20Zeka" class="hover:text-blue-400 transition-colors">Yapay Zeka</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-white font-bold mb-6 text-sm uppercase tracking-wider">Kurumsal</h4>
                    <ul class="space-y-3 text-sm">
                        <li><a href="about.html" class="hover:text-blue-400 transition-colors">Hakkımızda</a></li>
                        <li><a href="affiliate.html" class="hover:text-blue-400 transition-colors">Ortaklık & Reklam</a></li>
                        <li><a href="support.html" class="hover:text-blue-400 transition-colors">Destek & İletişim</a></li>
                        <li><a href="faq.html" class="hover:text-blue-400 transition-colors">S.S.S.</a></li>
                         <li><a href="sitemap.html" class="hover:text-blue-400 transition-colors">Site Haritası</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-white font-bold mb-6 text-sm uppercase tracking-wider">Bizi Takip Edin</h4>
                    <div class="flex gap-4">
                        <a href="#" class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all hover:scale-110">
                            <i class="fa-brands fa-twitter"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition-all hover:scale-110">
                            <i class="fa-brands fa-instagram"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all hover:scale-110">
                            <i class="fa-brands fa-youtube"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-gray-100 hover:text-black transition-all hover:scale-110">
                            <i class="fa-brands fa-github"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Section: Copyright -->
        <div class="bg-black/20 py-8 border-t border-slate-800/50">
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-slate-500 text-xs">
                    © 2026 TechReview Inc. Tüm hakları saklıdır.
                </p>
                <div class="flex items-center gap-6 text-xs text-slate-500">
                    <a href="privacy.html" class="hover:text-white transition-colors">Gizlilik Politikası</a>
                    <a href="terms.html" class="hover:text-white transition-colors">Kullanım Şartları</a>
                    <a href="cookies.html" class="hover:text-white transition-colors">Çerezler</a>
                </div>
            </div>
        </div>
      </footer>
    `;
  },


  // --- HELPER: YILDIZ OLUŞTURUCU ---
  generateStarRating(rating) {
    let numRating = parseFloat(rating) || 0;

    // Debug log
    console.log(`🌟 generateStarRating(${rating}) -> ${numRating}`);

    if (numRating < 0) numRating = 0;
    if (numRating > 5) numRating = 5;

    const fullStars = Math.floor(numRating);
    const remainder = numRating - fullStars;
    const hasHalf = remainder >= 0.5;

    const stars = Array(5)
      .fill(0)
      .map((_, i) => {
        if (i < fullStars) {
          return '<i class="fa-solid fa-star" style="color: #ff8c00;"></i>';
        } else if (i === fullStars && hasHalf) {
          return '<i class="fa-solid fa-star-half-stroke" style="color: #ff8c00;"></i>';
        } else {
          return '<i class="fa-regular fa-star text-gray-300"></i>';
        }
      })
      .join("");

    console.log(
      `🌟 Stars: ${fullStars} full, ${hasHalf ? "1 half" : "0 half"}, ${
        5 - fullStars - (hasHalf ? 1 : 0)
      } empty`
    );
    return stars;
  },

  // --- ANA SAYFA ---
  async initHome() {
    const container = document.getElementById("products-container");
    const recent = document.getElementById("recent-reviews-placeholder");
    const searchInput = document.getElementById("search-input");

    this.products = [];
    let sortOrder = "desc"; // desc (newest first) or asc (oldest first)
    let currentCategory = "Tümü";

    window.filterCategory = (cat) => {
      currentCategory = cat;
      const theme = this.changeTheme(cat);
      const titleEl = document.getElementById("main-list-title");
      if (titleEl) {
        titleEl.innerText =
          cat === "Tümü" ? "Tüm İncelemeler" : `${cat} Dünyası`;
        titleEl.style.color = theme.primary;
      }

      const term = searchInput ? searchInput.value.toLowerCase() : "";
      let filtered = this.products; // Use global products logic
      if (cat !== "Tümü") filtered = filtered.filter((p) => p.category === cat);
      if (term)
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(term));

      if (container) {
        if (filtered.length === 0) {
          container.innerHTML =
            '<div class="col-span-full text-center py-20 text-gray-400">İçerik bulunamadı.</div>';
        } else {
          container.innerHTML = filtered
            .map((p) => this.createCard(p, false))
            .join("");
        }
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (searchInput)
      searchInput.addEventListener("input", () =>
        window.filterCategory("Tümü")
      );

    // Sort Button Logic
    const sortBtn = document.getElementById("sort-btn");
    if (sortBtn) {
      sortBtn.onclick = () => {
        sortOrder = sortOrder === "desc" ? "asc" : "desc";

        // Icon & Text Update
        sortBtn.innerHTML =
          sortOrder === "desc"
            ? '<i class="fa-solid fa-arrow-down-wide-short"></i> En Yeni'
            : '<i class="fa-solid fa-arrow-up-wide-short"></i> En Eski';

        // Sort logic
        this.products.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

        // Re-render
        window.filterCategory(currentCategory);
      };
    }

    try {
      this.products = await api.get("/products");
      const sorted = [...this.products].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      if (recent && sorted.length > 0) {
        recent.innerHTML = `
                    <div class="fade-in pt-8 border-t border-gray-200">
                        <h2 class="text-lg font-bold mb-4 flex items-center gap-2 text-gray-500 uppercase tracking-widest text-xs">
                            <i class="fa-solid fa-clock-rotate-left"></i> Son Eklenenler
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            ${sorted
                              .slice(0, 4)
                              .map((p) => this.createCard(p, true))
                              .join("")}
                        </div>
                    </div>`;
      }

      window.filterCategory("Tümü");
    } catch (e) {
      console.error("Home initialization failed:", e);
      if (container)
        container.innerHTML = `<p class="col-span-full text-center text-red-500">Veriler yüklenirken bir hata oluştu. (${e.message})</p>`;
    }
  },

  // --- KART TASARIMI ---
  createCard(p, compact = false) {
    const theme = this.themes[p.category] || this.themes["Tümü"];
    const isOwner =
      this.currentUser &&
      (String(this.currentUser.id) === String(p.createdBy) ||
        this.currentUser.role === "admin");
    const delBtn = isOwner
      ? `<button onclick="app.deleteProduct(${p.id}, event)" class="absolute top-3 left-3 bg-white text-red-500 rounded-full w-8 h-8 shadow-md hover:bg-red-50 z-20 flex items-center justify-center transition-colors"><i class="fa-solid fa-trash text-xs"></i></button>`
      : "";
    const link = `product-detail.html?id=${p.id}`;

    // Use real rating from DB, default to 0.0 if empty
    const avgRating = p.avgRating ? Number(p.avgRating).toFixed(1) : "0.0";
    const starsHtml = this.generateStarRating(avgRating);

    // Check if compare is active
    const isCompareActive =
      this.compareList && this.compareList.find((c) => c.id === p.id);
    const compareBtnRequest = isCompareActive
      ? "btn-compare active"
      : "btn-compare";
    const compareBtnText = isCompareActive ? "Eklendi" : "Karşılaştır";

    // Check if category is comparable
    const categorySpec = this.categorySpecs[p.category];
    const isComparable = categorySpec && categorySpec.comparable !== false;


    if (compact)
      return `
          <div class="premium-card cursor-pointer relative h-full flex flex-col group" onclick="window.location.href='${link}'">
              ${delBtn}
              <div class="h-32 bg-slate-100 relative overflow-hidden rounded-t-2xl">
                  <img src="${
                    p.image
                  }" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://placehold.co/400'">
                  <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div class="p-4 flex flex-col flex-1 bg-white rounded-b-2xl border border-t-0 border-gray-100">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">${
                    p.category
                  }</span>
                  <h3 class="font-bold text-sm text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">${
                    p.name
                  }</h3>
                  <div class="star-rating text-xs mb-2">${starsHtml}</div>
                  <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                      <span class="text-xs text-slate-400">${
                        p.username || "Anonim"
                      }</span>
                      <span class="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <i class="fa-solid fa-star text-[10px]" style="color: #ff8c00;"></i> ${avgRating}
                      </span>
                  </div>
              </div>
          </div>`;

    return `
            <div class="premium-card cursor-pointer relative group" onclick="window.location.href='${link}'">
                ${delBtn}
                <div class="h-48 bg-slate-100 relative overflow-hidden">
                    <img src="${
                      p.image
                    }" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='https://placehold.co/600'">
                    <span class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">${
                      p.category
                    }</span>
                </div>
                <div class="p-5">
                    <div class="flex items-center justify-between mb-3">
                        <div class="star-rating">${starsHtml}</div>
                        <div class="flex gap-2">
                             <button onclick="event.stopPropagation(); app.addToCart(${p.id}, event)" class="text-gray-400 hover:text-red-500 transition-colors" title="Sepete/Favorilere Ekle">
                                <i class="fa-regular fa-heart text-xl"></i>
                             </button>
                             <span class="text-sm font-bold text-slate-700 flex items-center gap-1">
                                <i class="fa-solid fa-star text-xs" style="color: #ff8c00;"></i> ${avgRating}
                             </span>
                        </div>
                    </div>
                    <h3 class="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">${
                      p.name
                    }</h3>
                    <p class="text-slate-500 text-sm line-clamp-2 mb-4">${
                      p.description || ""
                    }</p>
                    <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div class="flex items-center gap-2">
                            <div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">${(
                              p.username || "U"
                            )
                              .charAt(0)
                              .toUpperCase()}</div>
                            <span class="text-xs font-medium text-slate-500">${
                              p.username || "Anonim"
                            }</span>
                        </div>
                        <button class="${compareBtnRequest}" onclick="event.stopPropagation(); app.toggleCompare(${
      p.id
    })">
                            ${compareBtnText}
                        </button>
                    </div>
                </div>
            </div>`;
  },

  async deleteProduct(id, e) {
    if (e) e.stopPropagation();
    if (!confirm("Silmek istediğine emin misin?")) return;
    try {
      await api.delete(`/products/${id}`);
      window.location.reload();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  },
  async addToCart(productId, e) {
    if (e) e.stopPropagation();
    if (!this.currentUser) {
        alert("Lütfen önce giriş yapın.");
        window.location.href = "login.html";
        return;
    }
    try {
        await api.post("/cart", { userId: this.currentUser.id, productId });
        alert("Ürün sepetinize/favorilerinize eklendi! ✨");
        // Change icon to solid red
        if (e.target.tagName === 'I') {
            e.target.classList.replace('fa-regular', 'fa-solid');
            e.target.classList.add('text-red-500');
        } else if (e.target.querySelector('i')) {
             e.target.querySelector('i').classList.replace('fa-regular', 'fa-solid');
             e.target.querySelector('i').classList.add('text-red-500');
        }
    } catch (err) {
        alert("Hata: " + (err.message || "Eklenemedi"));
    }
  },
  async removeFromCart(cartId) {
      if (!confirm("Sepetten kaldırmak istiyor musunuz?")) return;
      try {
          await api.delete(`/cart/${cartId}`);
          // Remove element from DOM or reload
           const el = document.getElementById(`cart-item-${cartId}`);
           if (el) el.remove();
           // Also reload to be sure
           // window.location.reload();
           alert("Ürün sepetten çıkarıldı.");
      } catch (err) {
          alert("Hata: " + err.message);
      }
  },
  initLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username.value,
            password: form.password.value,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Giriş başarısız!");
          return;
        }
        localStorage.setItem("current_user_session", JSON.stringify(data));
        window.location.href = "index.html";
      } catch (e) {
        alert("Bağlantı hatası: " + e.message);
      }
    });
  },
  initRegister() {
    const form = document.getElementById("register-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await api.post("/auth/register", {
          username: document.getElementById("username").value,
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
          age: document.getElementById("age")?.value,
          gender: document.getElementById("gender")?.value,
          bio: document.getElementById("bio")?.value,
        });
        const loginData = await api.post("/auth/login", {
          username: document.getElementById("username").value,
          password: document.getElementById("password").value,
        });
        localStorage.setItem("current_user_session", JSON.stringify(loginData));
        window.location.href = "index.html";
      } catch (e) {
        alert("Kayıt başarısız: " + e.message);
      }
    });
  },
  initProductForm() {
  if (!this.currentUser) return (window.location.href = "login.html");
  const form = document.getElementById("product-form");
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  // Load category fields function
  const loadCategoryFields = (category) => {
    const container = document.getElementById("category-specs");
    if (!container) return;

    const specs = this.categorySpecs[category];
    if (!specs || !specs.fields) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
        <h3 class="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-list-check text-blue-600"></i>
          ${category} Özellikleri
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${specs.fields.map(field => `
            <div>
              <label class="block font-bold mb-2 text-sm text-gray-700">
                ${field.label}${field.required ? ' *' : ''}
              </label>
              <input
                type="${field.type}"
                name="spec_${field.name}"
                placeholder="${field.placeholder}"
                class="w-full border-2 border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                ${field.required ? 'required' : ''}
              />
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  // Category change event
  const categorySelect = form.category;
  if (categorySelect) {
    categorySelect.addEventListener("change", (e) => {
      loadCategoryFields(e.target.value);
    });
    
    // Load initial fields if category is selected
    if (categorySelect.value) {
      loadCategoryFields(categorySelect.value);
    }
  }

  if (editId) {
    document.querySelector("h1").innerText = "İncelemeyi Düzenle";
    api.get(`/products/${editId}`).then((p) => {
      form.name.value = p.name;
      form.category.value = p.category;
      form.image.value = p.image;
      form.desc.value = p.description;
      
      // Load category fields
      loadCategoryFields(p.category);
      
      // Fill specifications if exists
      if (p.specifications) {
        try {
          const specs = JSON.parse(p.specifications);
          Object.entries(specs).forEach(([key, value]) => {
            const input = form.querySelector(`[name="spec_${key}"]`);
            if (input) input.value = value;
          });
        } catch (e) {
          console.error("Failed to parse specifications:", e);
        }
      }
    });
  }

  // Star Rating Logic
  const stars = document.querySelectorAll("#form-star-rating i");
  const ratingInput = document.getElementById("rating-input");

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const val = parseInt(star.dataset.value);
      ratingInput.value = val;
      updateStars(val);
    });

    star.addEventListener("mouseenter", () => {
      updateStars(parseInt(star.dataset.value), true);
    });

    star.addEventListener("mouseleave", () => {
      updateStars(parseInt(ratingInput.value || 0));
    });
  });

  function updateStars(val, isHover = false) {
    stars.forEach((s) => {
      const sVal = parseInt(s.dataset.value);
      if (sVal <= val) {
        s.classList.add("text-orange-400");
        if (isHover) s.classList.add("text-orange-300");
      } else {
        s.classList.remove("text-orange-400");
        s.classList.remove("text-orange-300");
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ratingVal = document.getElementById("rating-input").value;
    
    // Collect specifications
    const specifications = {};
    const specInputs = form.querySelectorAll('[name^="spec_"]');
    specInputs.forEach(input => {
      const fieldName = input.name.replace('spec_', '');
      if (input.value) {
        specifications[fieldName] = input.value;
      }
    });

    const payload = {
      name: form.name.value,
      category: form.category.value,
      description: form.desc.value,
      image: form.image.value,
      rating: ratingVal,
      specifications: Object.keys(specifications).length > 0 ? JSON.stringify(specifications) : null,
      createdBy: this.currentUser.id,
      username: this.currentUser.username,
    };
    
    if (editId) await api.put(`/products/${editId}`, payload);
    else await api.post("/products", payload);
    alert("İşlem Başarılı!");
    window.location.href = "profile.html";
  });
},
  initNews() {
    const container = document.getElementById("news-container");
    if (!container) return;

    const isAdmin = this.currentUser && this.currentUser.role === "admin";
    
    // Add "New News" button for admin
    if (isAdmin) {
      const header = document.querySelector("h1");
      if (header && !document.getElementById("add-news-btn")) {
        const btnContainer = document.createElement("div");
        btnContainer.className = "flex justify-center mb-8";
        btnContainer.innerHTML = `
          <a href="news-form.html" id="add-news-btn" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-2">
            <i class="fa-solid fa-plus"></i> Yeni Haber Ekle
          </a>
        `;
        header.after(btnContainer);
      }
    }

    api.get("/news").then((news) => {
      const params = new URLSearchParams(window.location.search);
      const urlCat = params.get("cat");

      const renderNews = (cat) => {
        const filtered =
          !cat || cat === "Tümü"
            ? news
            : news.filter((n) => (n.category || "Genel") === cat);

        container.innerHTML = filtered.length
          ? filtered
              .map(
                (item) =>
                  `<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group relative">
                    <a href="${item.url}" target="_blank" class="block h-48 bg-gray-200 relative overflow-hidden">
                      ${
                        item.image
                          ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">`
                          : ""
                      }
                      <span class="absolute top-4 left-4 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        ${item.category || "Teknoloji"}
                      </span>
                    </a>
                    <div class="p-6 flex flex-col flex-1">
                      <a href="${item.url}" target="_blank">
                        <h3 class="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                          ${item.title}
                        </h3>
                      </a>
                      <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                        ${item.summary || ""}
                      </p>
                      <div class="flex justify-between items-center text-xs text-gray-400 border-t pt-4 mt-auto">
                        <span class="flex items-center gap-1">
                           <i class="fa-regular fa-clock"></i>
                           ${new Date(item.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                        <span>${item.source || "TechReview"}</span>
                      </div>
                      
                      ${isAdmin ? `
                        <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button onclick="window.location.href='news-form.html?id=${item.id}'" class="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg font-bold text-sm hover:bg-blue-200 transition-colors">
                            <i class="fa-solid fa-pen mr-1"></i> Düzenle
                          </button>
                          <button onclick="app.deleteNews(${item.id})" class="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors">
                            <i class="fa-solid fa-trash mr-1"></i> Sil
                          </button>
                        </div>
                      ` : ''}
                    </div>
                  </div>`
              )
              .join("")
          : '<div class="col-span-full text-center py-20 text-gray-500">Bu kategoride haber yok.</div>';
      };

      renderNews(urlCat || "Tümü");
      window.filterNews = renderNews;
    });
  },

  initNewsForm() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      alert('Bu sayfaya erişim yetkiniz yok!');
      return window.location.href = 'news.html';
    }
    
    const form = document.getElementById('news-form');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');
    
    if (editId) {
      document.querySelector("h1").innerText = "Haberi Düzenle";
      api.get(`/news/${editId}`).then(n => {
        form.title.value = n.title;
        form.summary.value = n.summary;
        form.content.value = n.content;
        form.image.value = n.image;
        form.category.value = n.category;
        form.source.value = n.source;
        form.url.value = n.url;
      });
    }
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: form.title.value,
        summary: form.summary.value,
        content: form.content.value,
        image: form.image.value,
        category: form.category.value,
        source: form.source.value,
        url: form.url.value
      };
      
      try {
        if (editId) await api.put(`/news/${editId}`, payload);
        else await api.post('/news', payload);
        
        alert('İşlem başarılı!');
        window.location.href = 'news.html';
      } catch (err) {
        alert('Hata: ' + err.message);
      }
    });
  },

  async deleteNews(id) {
    if (!confirm('Haberi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/news/${id}`);
      window.location.reload();
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  },
  initForum() {
    const container = document.getElementById("topics-container");
    if (!container) return;
    this.changeTheme("Forum");

    // Search logic
    const searchInput = document.getElementById("forum-search");

    api.get("/forum/topics").then((topics) => {
      window.allTopics = topics; // Store for filtering

      const renderTopics = (list) => {
        container.innerHTML = list.length
          ? list
              .map(
                (topic) =>
                  `<div class="p-6 hover:bg-blue-50/50 transition-colors cursor-pointer group border-b border-gray-100 last:border-0" onclick="window.location.href='forum-detail.html?id=${
                    topic.id
                  }'"><div class="flex items-start justify-between gap-4"><div class="flex-1"><span class="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">${
                    topic.category || "Genel"
                  }</span><h3 class="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">${
                    topic.title
                  }</h3><p class="text-sm text-gray-600">Yazar: <span class="font-medium">${
                    topic.username
                  }</span></p></div><i class="fa-solid fa-chevron-right text-gray-300"></i></div></div>`
              )
              .join("")
          : '<div class="text-center py-10 text-gray-500">Konu bulunamadı.</div>';
      };

      // Initial render
      renderTopics(topics);

      // Filter on input
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const term = e.target.value.toLowerCase();
          const filtered = topics.filter(
            (t) =>
              t.title.toLowerCase().includes(term) ||
              (t.category && t.category.toLowerCase().includes(term))
          );
          renderTopics(filtered);
        });
      }
    });
  },

  async initForumDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    this.changeTheme("Forum");

    try {
        const topic = await api.get(`/forum/topics/${id}`);
        const posts = await api.get(`/forum/topics/${id}/posts`);
        
        // Target the main container
        const mainContainer = document.getElementById("forum-detail-container");
        if (mainContainer) {
            mainContainer.innerHTML = `
                <!-- Modernized Topic Header -->
                <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl border border-slate-700 group">
                    <!-- Background Decoration -->
                    <div class="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                        <i class="fa-solid fa-comments text-9xl text-white"></i>
                    </div>
                     <div class="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div class="relative z-10">
                        <!-- Meta Top -->
                        <div class="flex items-center gap-3 mb-6">
                             <a href="forum.html" class="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-sm flex items-center gap-2">
                                <i class="fa-solid fa-arrow-left"></i> Geri
                             </a>
                             <span class="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                                ${topic.category || 'Genel'}
                             </span>
                             <span class="text-slate-400 text-xs flex items-center gap-1 font-medium bg-black/20 px-3 py-1.5 rounded-full">
                                <i class="fa-regular fa-clock"></i> ${new Date(topic.createdAt).toLocaleDateString('tr-TR')}
                             </span>
                        </div>
                        
                        <!-- Title -->
                        <h1 class="text-3xl md:text-5xl font-black mb-8 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-100 drop-shadow-sm">
                            ${topic.title}
                        </h1>
                        
                        <!-- Author Info -->
                        <div class="flex items-center gap-4 border-t border-white/10 pt-6">
                            <div class="flex items-center gap-3">
                                 <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg text-white shadow-lg border-2 border-slate-800 ring-2 ring-indigo-500/30">
                                    ${(topic.username || 'A').charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                    <span class="block text-sm font-bold text-white tracking-wide">${topic.username}</span>
                                    <span class="block text-xs text-indigo-300 font-medium">Konu Sahibi</span>
                                 </div>
                            </div>
                            
                            <div class="h-8 w-px bg-white/10"></div>
                            
                            <div class="flex items-center gap-2 text-xs text-slate-400">
                                <i class="fa-regular fa-comment-dots"></i>
                                <span>${posts.length} Cevap</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Posts List -->
                <div id="posts-container" class="space-y-8 mb-12 relative pl-4 md:pl-0">
                     <!-- Vertical Line for Timeline Effect -->
                     <div class="absolute left-6 md:left-24 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block z-0"></div>
                     
                     ${posts.length === 0 
                        ? '<div class="text-center py-16 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300 relative z-10"><i class="fa-solid fa-wind text-4xl mb-3 text-gray-300 block"></i>Henüz cevap yazılmamış.<br>İlk cevabı sen yaz!</div>' 
                        : posts.map((post, index) => `
                            <div class="relative z-10 flex flex-col md:flex-row gap-6 group">
                                <!-- Mobile Date (Visible only on small screens) -->
                                <div class="md:hidden text-xs text-gray-400 mb-1 pl-2 font-mono">
                                    <i class="fa-regular fa-clock mr-1"></i>${new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                </div>

                                <!-- Desktop Avatar & Timeline Node -->
                                <div class="hidden md:flex flex-col items-center w-48 shrink-0 pt-2">
                                    <div class="w-14 h-14 rounded-2xl bg-white shadow-md border-2 border-white flex items-center justify-center text-xl font-bold text-gray-700 relative z-10 mb-3 group-hover:scale-110 transition-transform duration-300">
                                        ${(post.username || 'U').charAt(0).toUpperCase()}
                                        ${index === 0 ? '<span class="absolute -top-2 -right-2 bg-yellow-400 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm"><i class="fa-solid fa-crown"></i></span>' : ''}
                                    </div>
                                    <div class="text-center">
                                        <p class="font-bold text-sm text-gray-900 truncate max-w-[100px]">${post.username}</p>
                                        <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Üye</p>
                                    </div>
                                    <div class="mt-4 text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                                        #${index + 1}
                                    </div>
                                </div>

                                <!-- Post Content Bubble -->
                                <div class="flex-1 bg-white rounded-2xl rounded-tl-none md:rounded-tl-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
                                    <!-- Mobile Avatar (Inside bubble) -->
                                    <div class="flex items-center gap-3 md:hidden mb-4 border-b border-gray-50 pb-4">
                                        <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                            ${(post.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p class="font-bold text-sm text-gray-900">${post.username}</p>
                                            <p class="text-xs text-gray-500">Üye</p>
                                        </div>
                                        <div class="ml-auto text-xs text-gray-300 font-mono">#${index + 1}</div>
                                    </div>

                                    <!-- Content -->
                                    <div class="prose prose-slate max-w-none text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                                        ${post.content}
                                    </div>
                                    
                                    <!-- Footer (Date/Actions) -->
                                    <div class="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <div class="text-xs text-gray-400 font-medium flex items-center gap-2">
                                            <i class="fa-regular fa-calendar-check text-blue-400"></i>
                                            ${new Date(post.createdAt).toLocaleDateString('tr-TR')} ${new Date(post.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                        <button class="text-gray-400 hover:text-blue-600 transition-colors text-sm">
                                            <i class="fa-regular fa-heart"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                </div>

                <!-- Reply Area -->
                <div class="relative z-20">
                    ${this.currentUser 
                        ? `
                        <div class="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden transform transition-all hover:shadow-2xl hover:border-blue-200">
                            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100 flex items-center justify-between">
                                <h3 class="font-bold text-blue-900 flex items-center gap-2">
                                    <i class="fa-solid fa-pen-nib text-blue-600"></i> 
                                    Cevap Yaz
                                </h3>
                                <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">@${this.currentUser.username}</span>
                            </div>
                            <form id="reply-form" class="p-6">
                                <div class="mb-4">
                                    <textarea 
                                        name="content" 
                                        rows="5" 
                                        class="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-y text-base"
                                        placeholder="Bu konu hakkında ne düşünüyorsun? Fikirlerin değerli..."
                                        required
                                    ></textarea>
                                </div>
                                <div class="flex items-center justify-between">
                                    <p class="text-xs text-gray-400 hidden md:block">
                                        <i class="fa-solid fa-circle-info mr-1"></i> Saygılı ve yapıcı yorumlar topluluğumuzu büyütür.
                                    </p>
                                    <button type="submit" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all flex items-center gap-2 group">
                                        <span>Gönder</span>
                                        <i class="fa-solid fa-paper-plane group-hover:translate-x-1 transition-transform"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                        ` 
                        : `
                        <div class="text-center p-12 bg-gray-50 rounded-3xl border border-gray-200">
                            <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                                <i class="fa-solid fa-lock"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 mb-2">Cevap Yazmak İçin Giriş Yapmalısın</h3>
                            <p class="text-gray-500 mb-6 max-w-md mx-auto">Tartışmalara katılmak ve fikirlerini paylaşmak için hemen giriş yap veya ücretsiz kayıt ol.</p>
                            <div class="flex justify-center gap-4">
                                <a href="login.html" class="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Giriş Yap</a>
                                <a href="register.html" class="bg-white text-gray-900 border border-gray-200 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors">Kayıt Ol</a>
                            </div>
                        </div>
                        `
                    }
                </div>
            `;
        }

        // 3. Reply Form Logic
        const form = document.getElementById("reply-form");
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (!this.currentUser) {
                    alert('Cevap yazmak için giriş yapmalısınız.');
                    window.location.href = 'login.html';
                    return;
                }

                try {
                    await api.post("/forum/posts", {
                        topicId: id,
                        userId: this.currentUser.id,
                        username: this.currentUser.username,
                        content: form.content.value
                    });
                    
                    form.reset(); // Don't use window.location.reload() immediately
                    // this.initForumDetail(); // Re-render logic is redundant but safe, better to just reload
                    window.location.reload();
                } catch (err) {
                    alert('Hata: ' + err.message);
                }
            });
        }

    } catch (e) {
        console.error(e);
        const mainContainer = document.getElementById("forum-detail-container");
        if (mainContainer) {
            mainContainer.innerHTML = '<div class="text-red-500 p-4 bg-red-50 rounded border border-red-200 text-center">Konu yüklenirken hata oluştu.</div>';
        }
    }
  },
  async initProductDetail() {
    console.log("🚀 Custom Log: initProductDetail STARTED");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    try {
      const product = await api.get(`/products/${id}`);
      const reviews = await api.get(`/reviews/${id}`);
      const theme = this.changeTheme(product.category);
      document.getElementById("detail-container").innerHTML = `
        <div class="flex flex-col md:flex-row gap-8 items-start">
            <!-- Left Column: Content + Review Form -->
            <div class="w-full md:w-[60%] lg:w-[65%]">
                <!-- Product Card (Now contains form) -->
                <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div class="h-[600px] relative bg-gray-900 group overflow-hidden">
                        <!-- Blurred Background (Ambience) -->
                        <img src="${
                          product.image
                        }" class="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-110" onerror="this.src='https://placehold.co/800x400?text=Resim+Yok'">
                        
                        <!-- Main Image (Smart Fit) -->
                        <img src="${
                          product.image
                        }" class="relative w-full h-full object-contain z-10 transition-transform duration-500 group-hover:scale-105" onerror="this.src='https://placehold.co/800x400?text=Resim+Yok'">
                        
                        <!-- Gradient Overlay -->
                        <div class="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20 pointer-events-none"></div>
                        
                        <!-- Text Content -->
                        <div class="absolute bottom-10 left-10 text-white z-30 drop-shadow-lg">
                            <span class="px-4 py-1.5 rounded-lg text-xs font-bold uppercase mb-3 inline-block shadow-lg tracking-wider" style="background-color: ${
                              theme.primary
                            }">${product.category}</span>
                            <h1 class="text-5xl font-black leading-tight mb-2 tracking-tight">${
                              product.name
                            }</h1>
                            <div class="flex items-center gap-4 mb-4">
                                <div class="flex items-center bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                    <div class="flex text-yellow-400 text-lg mr-2 filter drop-shadow-sm">
                                        ${this.generateStarRating(
                                          product.avgRating
                                        )}
                                    </div>
                                    <span class="font-bold text-white text-lg">${
                                      product.avgRating
                                        ? Number(product.avgRating).toFixed(1)
                                        : "0.0"
                                    }</span>
                                </div>
                            </div>
                            <p class="text-sm font-medium opacity-95 flex items-center gap-2">
                                <span class="bg-white/20 px-2 py-1 rounded-full"><i class="fa-regular fa-user"></i> ${
                                  product.username || "Anonim"
                                }</span>
                                <span class="w-1 h-1 bg-white rounded-full"></span>
                                <span>${new Date(
                                  product.createdAt
                                ).toLocaleDateString("tr-TR")}</span>
                            </p>
                        </div>
                    </div>
                    <div class="p-8 sm:p-12">

                        ${product.specifications ? `
                          <div class="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
                            <h3 class="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                              <i class="fa-solid fa-list-check text-blue-600"></i>
                              Teknik Özellikler
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                              ${(() => {
                                try {
                                  const specs = JSON.parse(product.specifications);
                                  return Object.entries(specs).map(([key, value]) => `
                                    <div class="bg-white p-4 rounded-xl border border-blue-100 flex justify-between items-center hover:shadow-md transition-shadow">
                                      <span class="font-semibold text-gray-600 text-sm capitalize">${key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                      <span class="font-bold text-gray-900">${value}</span>
                                    </div>
                                  `).join('');
                                } catch(e) {
                                  return '<p class="text-gray-500">Özellikler yüklenemedi</p>';
                                }
                              })()}
                            </div>
                          </div>
                        ` : ''}
                    </div>

                    <!-- Review Form (Merged Inside Card) -->
                  <div class="border-t border-gray-100 bg-gray-50/50 p-8 sm:p-12">
                      ${
                        this.currentUser
                          ? (() => {
                              const userReview = reviews.find(r => r.userId === this.currentUser.id);
                              if (userReview) {
                                return `
                                  <div class="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                                      <div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                      <div class="flex justify-between items-start mb-4">
                                          <div>
                                              <h4 class="font-bold text-gray-800 text-lg mb-1">Senin Değerlendirmen</h4>
                                              <p class="text-xs text-gray-500">Bu ürünü daha önce inceledin.</p>
                                          </div>
                                      </div>
                                      
                                      <div class="flex items-center gap-3 mb-3 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                                          <div class="text-orange-400 text-sm flex gap-0.5">${this.generateStarRating(userReview.rating)}</div>
                                          <span class="font-bold text-gray-700 text-sm">${userReview.rating}/5</span>
                                      </div>
                                      
                                      <p class="text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100 italic mb-3">
                                          "${userReview.content}"
                                      </p>

                                      <div class="flex justify-end gap-2 pt-2 border-t border-gray-50">
                                          <button onclick="app.editReview(${userReview.id}, '${userReview.content.replace(/'/g, "\\'")}', ${userReview.rating})" class="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all">
                                              <i class="fa-solid fa-pen"></i> Düzenle
                                          </button>
                                          <button onclick="app.deleteReview(${userReview.id})" class="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-all">
                                              <i class="fa-solid fa-trash"></i> Sil
                                          </button>
                                      </div>
                                  </div>
                                `;
                              } else {
                                return `
                                  <form id="review-form">
                                      <h4 class="font-bold text-gray-800 mb-3 text-lg">Yorum Yap ve Puan Ver</h4>
                                      
                                      <div class="mb-4">
                                          <label class="block text-sm font-bold text-gray-700 mb-2">Puanınız (1-5)</label>
                                          <div class="flex gap-1 text-2xl text-gray-300 cursor-pointer" id="star-rating">
                                              ${Array(5)
                                                .fill(0)
                                                .map(
                                                  (_, i) =>
                                                    `<i class="fa-solid fa-star transition-colors hover:scale-110" data-value="${
                                                      i + 1
                                                    }"></i>`
                                                )
                                                .join("")}
                                          </div>
                                          <input type="hidden" name="rating" id="rating-input" required>
                                      </div>

                                      <textarea name="content" class="w-full border border-gray-200 p-4 rounded-xl mb-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none resize-none bg-white" rows="3" placeholder="Bu ürün hakkında ne düşünüyorsun?" required></textarea>
                                      <div class="flex justify-end">
                                          <button class="text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95" style="background-color: ${
                                            theme.primary
                                          }">Gönder</button>
                                      </div>
                                  </form>
                                `;
                              }
                            })()
                          : `
                          <div class="text-center">
                              <p class="text-blue-900 font-medium mb-3">Yorum yapmak için giriş yapmalısın.</p>
                              <a href="login.html" class="inline-block text-white bg-blue-600 px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md">Giriş Yap</a>
                          </div>
                      `
                      }
                  </div>
              </div>
          </div>

          <!-- Right Column: Comments List Only -->
          <div class="w-full md:w-[40%] lg:w-[35%]">
              <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                  <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
                        <i class="fa-regular fa-comments text-gray-400"></i>
                        Yorumlar <span class="text-sm bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">${
                          reviews.length
                        }</span>
                  </h3>
                  
                  <div class="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                      ${
                        reviews.length > 0
                          ? reviews
                              .map(
                                (r) => `
                        <div class="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">
                                        ${r.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span class="font-bold text-sm text-gray-900 block leading-tight">${
                                          r.username
                                        }</span>
                                        <span class="text-[10px] text-gray-400 block">${new Date(
                                          r.createdAt
                                        ).toLocaleDateString("tr-TR")}</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1 text-xs">
                                     ${this.generateStarRating(r.rating || 0)}
                                     <span class="ml-1 text-gray-500 font-bold">(${
                                       r.rating || 0
                                     })</span>
                                </div>
                            </div>
                            <p class="text-gray-600 text-sm leading-relaxed">${
                              r.content
                            }</p>
                        </div>
                      `
                              )
                              .join("")
                          : '<p class="text-center text-gray-400 py-4 italic">Henüz yorum yapılmamış.</p>'
                      }
                  </div>
              </div>
          </div>
      </div>
    `;

      // Initialize Star Rating Logic (only if form exists)
      if (this.currentUser) {
        const reviewForm = document.getElementById("review-form");
        const stars = document.querySelectorAll("#star-rating i");
        const ratingInput = document.getElementById("rating-input");

        // Only attach listeners if the form exists (user hasn't reviewed yet)
        if (reviewForm && stars.length > 0 && ratingInput) {

        function updateStarDisplay(val, isHover = false) {
          stars.forEach((s) => {
            const sVal = parseInt(s.dataset.value);
            if (sVal <= val) {
              s.classList.add("text-orange-400");
              if (isHover) s.classList.add("text-yellow-300");
            } else {
              s.classList.remove("text-orange-400");
              s.classList.remove("text-yellow-300");
            }
          });
        }

        stars.forEach((star) => {
          star.addEventListener("click", () => {
            const val = parseInt(star.dataset.value);
            ratingInput.value = val;
            updateStarDisplay(val);
          });

          // Hover effect
          star.addEventListener("mouseenter", () => {
            const val = parseInt(star.dataset.value);
            updateStarDisplay(val, true);
          });

          star.addEventListener("mouseleave", () => {
            const val = parseInt(ratingInput.value || 0);
            updateStarDisplay(val);
          });
        });

        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const rating = ratingInput.value;

            console.log(
              "📤 SUBMIT - ratingInput.value:",
              rating,
              "type:",
              typeof rating
            );

            if (!rating) {
              alert("Lütfen bir puan verin!");
              return;
            }

            const ratingInt = parseInt(rating);
            console.log(
              "📤 SUBMIT - parseInt result:",
              ratingInt,
              "isNaN:",
              isNaN(ratingInt)
            );

            try {
              console.log("📤 Sending review with rating:", ratingInt);
              await api.post("/reviews", {
                productId: id,
                userId: this.currentUser.id,
                username: this.currentUser.username,
                content: e.target.content.value,
                rating: ratingInt,
              });

              // Clear form and reset rating display
              e.target.reset();
              ratingInput.value = "";
              stars.forEach((s) =>
                s.classList.remove("text-orange-400", "text-orange-300")
              );

              alert("Yorumunuz kaydedildi!");
              // Smoother UX: Scroll to top to see updated score, then re-render
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(() => this.initProductDetail(), 500); // Small delay for scroll
            } catch (err) {
              alert("Yorum kaydedilirken hata oluştu: " + err.message);
            }
          });
        }
      }
    } catch (e) {
      console.error("Product detail error:", e);
      console.error("Error stack:", e.stack);
      document.getElementById("detail-container").innerHTML =
        `<div class='text-center py-20 text-red-500'>
          <p class='font-bold mb-2'>Hata oluştu.</p>
          <p class='text-sm text-gray-600'>${e.message}</p>
          <p class='text-xs text-gray-400 mt-2'>Detaylar için konsola bakın.</p>
        </div>`;
    }
  },
  async initForumDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) {
        alert("Konu bulunamadı. Foruma yönlendiriliyorsunuz.");
        window.location.href = "forum.html";
        return;
    }

    try {
      const topic = await api.get(`/forum/topics/${id}`);
      const posts = await api.get(`/forum/topics/${id}/posts`);

      const container = document.getElementById("forum-detail-container");
      if (!topic || !topic.id) {
          container.innerHTML = '<div class="text-center py-20 text-gray-500">Konu bulunamadı veya silinmiş.</div>';
          return;
      }

      container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div class="p-8 border-b border-gray-100 bg-gray-50/30">
                <span class="inline-block bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-md font-bold mb-4 tracking-wide">${topic.category || "Genel"}</span>
                <h1 class="text-3xl font-black text-gray-900 mb-4 leading-tight">${topic.title}</h1>
                <div class="flex items-center gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                            ${(topic.username || "A").charAt(0).toUpperCase()}
                        </div>
                        <span class="font-bold text-gray-700">${topic.username || "Anonim"}</span>
                    </div>
                    <span>&bull;</span>
                    <span>${new Date(topic.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
            </div>

            <div class="p-8 space-y-8">
                 ${posts.length > 0 ? posts.map((p, index) => `
                    <div class="flex gap-4">
                        <div class="flex-shrink-0">
                            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm border-2 border-white shadow-sm">
                                ${(p.username || "A").charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div class="flex-1 bg-gray-50 rounded-2xl p-6 rounded-tl-none relative group hover:shadow-md transition-shadow">
                            <div class="flex items-center justify-between mb-3">
                                <span class="font-bold text-gray-900 text-sm">${p.username || "Anonim"}</span>
                                <span class="text-xs text-gray-400 font-medium">#${index + 1} &bull; ${new Date(p.createdAt).toLocaleString("tr-TR")}</span>
                            </div>
                            <div class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">${p.content}</div>
                            
                            ${(this.currentUser && this.currentUser.id === p.userId) ? `
                             <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-sm">
                                 <button onclick="app.editForumPost(${p.id}, '${p.content.replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "")}')" class="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors" title="Düzenle">
                                     <i class="fa-solid fa-pen text-xs"></i>
                                 </button>
                                 <button onclick="app.deleteForumPost(${p.id})" class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors" title="Sil">
                                     <i class="fa-solid fa-trash text-xs"></i>
                                 </button>
                             </div>
                            ` : ''}
                        </div>
                    </div>
                 `).join("") : '<div class="text-center text-gray-400 italic py-4">Henüz cevap yok. İlk cevabı sen yaz!</div>'}
            </div>
            
            <div class="p-8 bg-gray-50 border-t border-gray-100">
                 <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-reply text-blue-500"></i> Cevap Yaz
                 </h3>
                 <form id="reply-form">
                     <textarea name="content" class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mb-4 transition-all bg-white" rows="4" placeholder="Düşüncelerini paylaş..." required></textarea>
                     <div class="flex justify-end">
                         <button type="submit" class="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-gray-200 transform active:scale-95">
                            Yanıtla
                         </button>
                     </div>
                 </form>
            </div>
        </div>
      `;

      // Handle Reply
      const replyForm = document.getElementById("reply-form");
      if(replyForm) {
          replyForm.addEventListener("submit", async (e) => {
              e.preventDefault();
              if (!this.currentUser) {
                  alert("Cevap yazmak için giriş yapmalısınız.");
                  window.location.href = "login.html";
                  return;
              }
              const content = e.target.content.value;
              try {
                  await api.post("/forum/posts", {
                      topicId: id,
                      userId: this.currentUser.id,
                      username: this.currentUser.username,
                      content
                  });
                  window.location.reload();
              } catch (err) {
                  console.error(err);
                  alert("Hata oluştu: " + err.message);
              }
          });
      }

    } catch (error) {
       console.error("Forum detail error:", error);
       const container = document.getElementById("forum-detail-container");
       if(container) {
           container.innerHTML = `
            <div class='text-center py-20 text-red-500'>
              <p class='font-bold mb-2'>İçerik yüklenirken hata oluştu.</p>
              <p class='text-sm text-gray-600'>${error.message}</p>
            </div>`;
       }
    }
  },
  async initProfile() {
    this.changeTheme("Profil");
    if (!this.currentUser) return (window.location.href = "login.html");
    try {
      // Show loading state implicitly by initial HTML "Yükleniyor..."

      const details = await api.get(`/users/${this.currentUser.id}`);
      const products = await api.get(`/users/${this.currentUser.id}/products`); 
      const reviews = await api.get(`/users/${this.currentUser.id}/reviews`);
      const cart = await api.get(`/cart/${this.currentUser.id}`);

      // Update Header
      const usernameEl = document.getElementById("profile-username");
      if (usernameEl) usernameEl.innerText = this.currentUser.username;

      const emailEl = document.getElementById("profile-email");
      if (emailEl) emailEl.innerText = this.currentUser.email;

      // ADMIN ONLY: User List
      if (this.currentUser.role === 'admin') {
        try {
          const users = await api.get('/users');
          const roleBadge = document.getElementById("profile-role-badge");
          if (roleBadge) {
            roleBadge.innerHTML = '<span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200"><i class="fa-solid fa-shield-halved mr-1"></i>Yönetici</span>';
          }

          const mainContainer = document.querySelector("#page-profile main");
          if (mainContainer && users && users.length > 0) {
             const adminSection = document.createElement("div");
             adminSection.className = "mt-12 glass-card floating-card overflow-hidden";
             adminSection.innerHTML = `
               <div class="p-6 border-b border-white/50 flex justify-between items-center bg-gradient-to-r from-red-50/50 to-white/50">
                  <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                     <span class="bg-red-100 text-red-600 p-2 rounded-lg text-sm"><i class="fa-solid fa-users"></i></span>
                     Kullanıcı Yönetimi
                     <span class="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">${users.length} Kayıt</span>
                  </h2>
               </div>
               <div class="p-0 overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                     <thead>
                        <tr class="text-xs font-bold text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                           <th class="p-4">ID</th>
                           <th class="p-4">Kullanıcı</th>
                           <th class="p-4">Email</th>
                           <th class="p-4">Rol</th>
                           <th class="p-4">Kayıt Tarihi</th>
                        </tr>
                     </thead>
                     <tbody class="text-sm">
                        ${users.map((u, index) => `
                          <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}">
                             <td class="p-4 text-gray-400 font-mono">#${u.id}</td>
                             <td class="p-4 font-bold text-gray-700">
                                <div class="flex items-center gap-2">
                                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs text-gray-500">
                                     ${u.username.charAt(0).toUpperCase()}
                                  </div>
                                  ${u.username}
                                </div>
                             </td>
                             <td class="p-4 text-gray-600">${u.email}</td>
                             <td class="p-4">
                                <span class="px-2 py-1 rounded-md text-xs font-bold ${
                                  u.role === 'admin' ? 'bg-red-100 text-red-600' : 
                                  u.role === 'company' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                                }">
                                  ${u.role === 'admin' ? 'Yönetici' : u.role === 'company' ? 'Satıcı' : 'Üye'}
                                </span>
                             </td>
                             <td class="p-4 text-gray-500 text-xs">
                                ${new Date(u.createdAt).toLocaleDateString('tr-TR')}
                             </td>
                          </tr>
                        `).join('')}
                     </tbody>
                  </table>
               </div>
             `;
             // Insert before the danger zone (last child usually)
             const dangerZone = document.querySelector(".mt-12.max-w-4xl"); // Targeting the danger zone div
             if(dangerZone) {
               mainContainer.insertBefore(adminSection, dangerZone);
             } else {
               mainContainer.appendChild(adminSection);
             }
          }
        } catch (e) {
          console.error("Admin user fetch failed:", e);
        }
      }

      // Update Form
      const form = document.getElementById("profile-form");
      if (form) {
        form.username.value = this.currentUser.username;
        form.bio.value = (details && details.bio) || "";
        form.age.value = (details && details.age) || "";
        form.gender.value = (details && details.gender) || "";

        // Remove old listener to prevent duplicates (though typical usage is page reload)
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          try {
            await api.put(`/users/${this.currentUser.id}`, {
                username: newForm.username.value,
                bio: newForm.bio.value,
                age: newForm.age.value,
                gender: newForm.gender.value,
            });
            
            // Update local storage implementation
            if (newForm.username.value !== this.currentUser.username) {
                 const updatedUser = {...this.currentUser, username: newForm.username.value};
                 localStorage.setItem("current_user_session", JSON.stringify(updatedUser));
                 this.currentUser = updatedUser;
            }

            alert("Profil başarıyla güncellendi.");
            window.location.reload();
          } catch(err) {
              alert("Güncelleme hatası: " + err.message);
          }
        });
      }

      // Render Cart (Favorites)
      const cartList = document.getElementById("my-cart-list");
      if (cartList) {
          if (cart && cart.length > 0) {
              cartList.innerHTML = cart.map(item => `
                <div id="cart-item-${item.cartId}" class="flex items-center gap-4 bg-white p-4 rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-all">
                    <img src="${item.image}" class="w-16 h-16 object-cover rounded-lg bg-gray-100" onerror="this.src='https://placehold.co/100'">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-gray-800 text-sm truncate">${item.name}</h4>
                        <span class="text-xs text-pink-500 font-bold bg-pink-50 px-2 py-0.5 rounded-full">${item.category}</span>
                    </div>
                    <div class="flex gap-2">
                         <button onclick="window.location.href='product-detail.html?id=${item.id}'" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Görüntüle">
                             <i class="fa-solid fa-eye"></i>
                         </button>
                         <button onclick="app.removeFromCart(${item.cartId})" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Kaldır">
                             <i class="fa-solid fa-trash"></i>
                         </button>
                    </div>
                </div>
              `).join('');
          } else {
              cartList.innerHTML = '<div class="col-span-full text-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">Favori listeniz boş.</div>';
          }
      }

      // Render My Forum Posts
      const myForumList = document.getElementById("my-forum-list");
      if (myForumList) {
         try {
             // We need to fetch it first since it wasn't fetched in parallel above (optimized)
             const myPosts = await api.get(`/users/${this.currentUser.id}/forum-posts`);
             if(myPosts && myPosts.length > 0) {
                 myForumList.innerHTML = myPosts.map(p => `
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">${p.topicTitle || 'Konu'}</span>
                            <span class="text-xs text-gray-400">${new Date(p.createdAt).toLocaleDateString("tr-TR")}</span>
                        </div>
                        <p class="text-gray-700 text-sm line-clamp-2 mb-3 leading-relaxed">${p.content}</p>
                        <div class="flex justify-end gap-2 border-t border-gray-100 pt-2">
                            <button onclick="window.location.href='forum-detail.html?id=${p.topicId}'" class="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                                <i class="fa-solid fa-arrow-right mr-1"></i> Git
                            </button>
                            <button onclick="app.editForumPost(${p.id}, '${p.content.replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "")}')" class="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">
                                <i class="fa-solid fa-pen mr-1"></i> Düzenle
                            </button>
                            <button onclick="app.deleteForumPost(${p.id})" class="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                                <i class="fa-solid fa-trash mr-1"></i> Sil
                            </button>
                        </div>
                    </div>
                 `).join('');
             } else {
                 myForumList.innerHTML = '<div class="text-center text-gray-400 text-sm py-4">Henüz forum gönderiniz yok.</div>';
             }
         } catch(e) {
             console.error("Forum posts fetch error:", e);
             myForumList.innerHTML = '<div class="text-center text-red-400 text-sm py-4">Yüklenirken hata oluştu.</div>';
         }
      }

      // Update Stats
      const statProducts = document.getElementById("stat-products");
      if (statProducts && products) statProducts.innerText = products.length;

      const statReviews = document.getElementById("stat-reviews");
      if (statReviews && reviews) statReviews.innerText = reviews.length;

      // Calculate & Update Average Score
      const statScore = document.getElementById("stat-score");
      if (statScore) {
        if (reviews && reviews.length > 0) {
          const total = reviews.reduce(
            (acc, r) => acc + parseFloat(r.rating || 0),
            0
          );
          const avg = total / reviews.length;
          statScore.innerText = avg.toFixed(1);
        } else {
          statScore.innerText = "0.0";
        }
      }

      // Render Products
      const prodList = document.getElementById("my-products-list");
      if (prodList) {
        if (products && products.length > 0) {
          prodList.innerHTML = products
            .map(
              (p) =>
                `<div class="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="w-10 h-10 bg-white rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100 text-gray-400">
                            <i class="fa-solid fa-box"></i>
                        </div>
                        <span class="font-bold text-gray-700 truncate">${p.name}</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.location.href='product-form.html?id=${p.id}'" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="app.deleteProduct(${p.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>`
            )
            .join("");
        } else {
          prodList.innerHTML =
            '<div class="col-span-full text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">Henüz ürün eklemediniz.</div>';
        }
      }

      // Render Reviews
      const revList = document.getElementById("my-reviews-list");
      if (revList) {
        if (reviews && reviews.length > 0) {
          revList.innerHTML = reviews
            .map(
              (r) =>
                `<div class="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group transition-all hover:bg-white hover:shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2">
                             <span class="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Ürün</span>
                             <span class="font-bold text-sm text-gray-800">${
                               r.productName || "Bilinmeyen Ürün"
                             }</span>
                        </div>
                        <div class="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg flex items-center gap-1">
                             ${this.generateStarRating(
                               r.rating || 0
                             )} <span class="text-gray-600 ml-1">${
                  r.rating || 0
                }/5</span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 italic mb-4">"${r.content}"</p>
                    
                    <div class="flex justify-end gap-2 border-t border-gray-100 pt-3 opacity-80 group-hover:opacity-100">
                        <button onclick="app.editReview(${r.id}, '${r.content.replace(/'/g, "\\'")}', ${r.rating})" class="flex items-center gap-2 bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:text-blue-600 hover:border-blue-200 transition-all">
                            <i class="fa-solid fa-pen"></i> Düzenle
                        </button>
                        <button onclick="app.deleteReview(${r.id})" class="flex items-center gap-2 bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:text-red-500 hover:border-red-200 transition-all">
                            <i class="fa-solid fa-trash"></i> Sil
                        </button>
                    </div>
                </div>`
            )
            .join("");
        } else {
          revList.innerHTML =
            '<div class="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">Henüz değerlendirme yapmadınız.</div>';
        }
      }

      // --- Account Deletion Handler ---
      const deleteBtn = document.getElementById("delete-account-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          // Double confirmation for safety
          const confirm1 = confirm(
            "⚠️ DİKKAT!\n\nHesabınızı silmek üzeresiniz.\n\nBu işlem GERİ ALINAMAZ!\n\n• Tüm incelemeleriniz\n• Eklediğiniz ürünler\n• Profil bilgileriniz\n• Forum gönderileriniz\n\nKALICI OLARAK SİLİNECEKTİR.\n\nDevam etmek istiyor musunuz?"
          );
          
          if (!confirm1) return;

          const confirm2 = prompt(
            'Son onay: Hesabınızı silmek için "HESABIMI SIL" yazın:'
          );

          if (confirm2 !== "HESABIMI SIL") {
            alert("İşlem iptal edildi.");
            return;
          }

          try {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Siliniyor...';
            
            await api.delete(`/users/${this.currentUser.id}`);
            
            alert("✅ Hesabınız başarıyla silindi. Yönlendiriliyorsunuz...");
            localStorage.removeItem("current_user_session");
            window.location.href = "index.html";
          } catch (err) {
            alert("❌ Hata: " + err.message);
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Hesabımı Kalıcı Olarak Sil';
          }
        });
      }
    } catch (e) {
      console.error("Profile load error:", e);
      alert("Profil bilgileri yüklenirken bir hata oluştu: " + e.message);

      // Clear loading states
      document.getElementById("profile-username").innerText = "Hata!";
    }
  },
  async deleteReview(id) {
    if (!confirm("Yorum silinsin mi?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      window.location.reload();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  },
  async editReview(id, currentContent, currentRating) {
    // Simple prompt-based editing for now
    const newContent = prompt("Yorumunuzu düzenleyin:", currentContent);
    if (newContent === null) return; // User cancelled

    let newRating = prompt("Yeni puanınız (1-5):", currentRating);
    if (newRating === null) return; // User cancelled
    
    newRating = parseInt(newRating);
    if (isNaN(newRating) || newRating < 1 || newRating > 5) {
        alert("Geçersiz puan! 1 ile 5 arasında bir sayı girin.");
        return;
    }

    try {
        await api.put(`/reviews/${id}`, {
            rating: newRating,
            content: newContent
        });
        alert("Yorumunuz güncellendi!");
        window.location.reload();
    } catch (err) {
        alert("Güncelleme hatası: " + err.message);
    }
  },
  async deleteForumPost(id) {
     if(!confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
     try {
         await api.delete(`/forum/posts/${id}`);
         window.location.reload();
     } catch(e) {
         alert("Silme hatası: " + e.message);
     }
  },
  async editForumPost(id, currentContent) {
      const newContent = prompt("Gönderinizi düzenleyin:", currentContent);
      if(newContent === null) return;
      if(!newContent.trim()) return alert("İçerik boş olamaz.");
      
      try {
          await api.put(`/forum/posts/${id}`, { content: newContent });
          window.location.reload();
      } catch(e) {
          alert("Güncelleme hatası: " + e.message);
      }
  },
  logout() {
    localStorage.removeItem("current_user_session");
    window.location.href = "index.html";
  },
};

window.app = app;
document.addEventListener("DOMContentLoaded", () => app.init());
