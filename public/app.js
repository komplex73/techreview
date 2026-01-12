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
        if (pageId === "page-home" && window.filterCategory) {
          window.filterCategory(category);
          // Close mobile sidebar
          const sidebar = document.getElementById("sidebar-nav");
          const overlay = document.getElementById("sidebar-overlay");
          if (window.innerWidth < 768) {
            sidebar.classList.remove("open");
            overlay.classList.remove("show");
          }
        } else {
          // If not home page, redirect to home with category param
          window.location.href = `index.html?cat=${category}`;
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

    navContainer.innerHTML = `
        <nav id="main-navbar" class="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-colors duration-500">
            <div class="w-full px-6 h-16 flex items-center justify-between">
                
                <!-- SOL: HAMBURGER MENÜ (Tüm Cihazlar) + LOGO -->
                <div class="flex items-center gap-4">
                    
                    <!-- Hamburger Menü -->
                    <button id="category-btn" class="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none text-gray-700" aria-label="Menü">
                        <i class="fa-solid fa-bars text-xl"></i>
                    </button>

                    <!-- SENİN ÖZEL LOGON (CSS .techreview-logo ile uyumlu) -->
                    <a href="index.html" class="techreview-logo" aria-label="TechReview Ana Sayfa">
                        <!-- SVG icon (Büyüteçli tasarım) -->
                        <svg class="icon" viewBox="0 0 64 64" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="40" height="40" rx="8" fill="#0b1220"/>
                            <g transform="translate(8,8)" stroke="#0ea5e9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95">
                                <path d="M6 6 H18" />
                                <circle cx="6" cy="6" r="1.6" fill="#0ea5e9" stroke="none"/>
                                <circle cx="18" cy="6" r="1.6" fill="#0ea5e9" stroke="none"/>
                                <path d="M6 18 V12" />
                                <circle cx="6" cy="18" r="1.6" fill="#0ea5e9" stroke="none"/>
                            </g>
                            <g transform="translate(28,28) rotate(-10)">
                                <circle cx="6" cy="6" r="6" stroke="#ffffff" stroke-width="2.4" fill="none" opacity="0.95"/>
                                <rect x="11" y="11" width="9" height="3" rx="1.2" transform="rotate(45 11 11)" fill="#111827" stroke="#ffffff" stroke-width="1.6" />
                            </g>
                            <polygon points="50,8 52.5,13 58,13 53.5,16 55.5,21 50,17 44.5,21 46.5,16 42,13 47.5,13" fill="#facc15" stroke="#f59e0b" stroke-width="0.6"/>
                            <rect x="2" y="2" width="40" height="40" rx="8" fill="none" stroke="rgba(255,255,255,0.03)"/>
                        </svg>

                        <span class="brand">
                            Tech<span class="accent">Review</span>
                        </span>
                    </a>

                </div>

                <!-- ORTA: ARAMA ÇUBUĞU -->
                <div class="hidden md:flex flex-1 max-w-xl mx-4">
                    <div class="relative w-full">
                        <input
                            type="text"
                            id="search-input"
                            placeholder="Search..."
                            class="premium-search"
                        />
                        <i class="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                    </div>
                </div>

                <!-- SAĞ: AUTH -->
                ${userHtml}
            </div>
        </nav>`;

    // Ensure main content has sidebar class for spacing
    const main = document.querySelector("main");
    if (main) main.classList.add("with-sidebar");
  },

  // --- PROFESSIONAL FOOTER ---
  renderFooter() {
    const pageId = document.body.id;
    // Skip footer on auth pages for minimalist look
    if (pageId === "page-login" || pageId === "page-register") return;

    let footerContainer = document.getElementById("footer-container");
    if (!footerContainer) {
      footerContainer = document.createElement("div");
      footerContainer.id = "footer-container";
      document.body.appendChild(footerContainer);
    }

    const currentYear = new Date().getFullYear();

    footerContainer.innerHTML = `
      <footer class="site-footer" role="contentinfo" itemscope itemtype="https://schema.org/WPFooter">
        <div class="footer-main">
          <div class="footer-grid">
            
            <!-- TechReview Hakkında -->
            <div class="footer-section">
              <h3 class="footer-heading">TechReview Hakkında</h3>
              <p class="footer-text">Türkiye'nin en güvenilir teknoloji ürün inceleme platformu. Tarafsız, detaylı ve kullanıcı odaklı incelemelerle doğru satın alma kararı vermenize yardımcı oluyoruz.</p>
              <div class="footer-social">
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter'da TechReview" class="social-link">
                  <i class="fa-brands fa-twitter"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram'da TechReview" class="social-link">
                  <i class="fa-brands fa-instagram"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube'da TechReview" class="social-link">
                  <i class="fa-brands fa-youtube"></i>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub'da TechReview" class="social-link">
                  <i class="fa-brands fa-github"></i>
                </a>
              </div>
            </div>

            <!-- Kategoriler -->
            <div class="footer-section">
              <h3 class="footer-heading">Kategoriler</h3>
              <ul class="footer-links">
                <li><a href="index.html">Tüm İncelemeler</a></li>
                ${Object.keys(this.themes).filter(k => k !== "Tümü").slice(0, 7).map(cat => 
                  `<li><a href="index.html?cat=${cat}"><i class="fa-solid ${this.themes[cat].icon} w-4 mr-1 text-xs"></i> ${cat}</a></li>`
                ).join('')}
              </ul>
            </div>

            <!--İçerik -->
            <div class="footer-section">
              <h3 class="footer-heading">İçerik</h3>
              <ul class="footer-links">
                <li><a href="index.html"><i class="fa-solid fa-magnifying-glass w-4 mr-1 text-xs"></i> İncelemeler</a></li>
                <li><a href="news.html"><i class="fa-regular fa-newspaper w-4 mr-1 text-xs"></i> Haberler</a></li>
                <li><a href="forum.html"><i class="fa-regular fa-comments w-4 mr-1 text-xs"></i> Forum</a></li>
                <li><a href="product-form.html"><i class="fa-solid fa-pen w-4 mr-1 text-xs"></i> İnceleme Yaz</a></li>
                <li><a href="profile.html"><i class="fa-solid fa-user w-4 mr-1 text-xs"></i> Profilim</a></li>
              </ul>
            </div>

            <!-- Yasal & Yardım -->
            <div class="footer-section">
              <h3 class="footer-heading">Yasal & Yardım</h3>
              <ul class="footer-links">
                <li><a href="faq.html"><i class="fa-solid fa-circle-question w-4 mr-1 text-xs"></i> Sık Sorulan Sorular</a></li>
                <li><a href="sitemap.html"><i class="fa-solid fa-sitemap w-4 mr-1 text-xs"></i> Site Haritası</a></li>
                <li><a href="privacy.html"><i class="fa-solid fa-shield-halved w-4 mr-1 text-xs"></i> Gizlilik Politikası</a></li>
                <li><a href="terms.html"><i class="fa-solid fa-file-contract w-4 mr-1 text-xs"></i> Kullanım Şartları</a></li>
                <li><a href="cookies.html"><i class="fa-solid fa-cookie w-4 mr-1 text-xs"></i> Çerez Politikası</a></li>
              </ul>
            </div>


          </div>
        </div>

        <!-- Footer Alt Bilgi -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <div class="footer-legal">
              <p class="copyright">© ${currentYear} TechReview. Tüm hakları saklıdır.</p>
              <p class="affiliate-notice">
                <i class="fa-solid fa-info-circle"></i>
                Bu sitedeki bazı bağlantılar affiliate bağlantılardır. Satın alımlarınızdan komisyon kazanabiliriz. 
                <a href="affiliate.html" class="affiliate-link">Detaylı bilgi</a>
              </p>
            </div>
            <div class="footer-badges">
              <span class="badge">
                <i class="fa-solid fa-shield-halved"></i> Güvenli
              </span>
              <span class="badge">
                <i class="fa-solid fa-certificate"></i> Tarafsız
              </span>
              <span class="badge">
                <i class="fa-solid fa-heart"></i> Türkiye'de
              </span>
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
                        <span class="text-sm font-bold text-slate-700 flex items-center gap-1">
                          <i class="fa-solid fa-star text-xs" style="color: #ff8c00;"></i> ${avgRating}
                        </span>
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
  async initProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    try {
      const product = await api.get(`/products/${id}`);
      const reviews = await api.get(`/reviews/${id}`);
      const theme = this.changeTheme(product.category);
      document.getElementById("detail-container").innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <!-- Left Column: Content + Review Form -->
            <div class="lg:col-span-3">
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
                          ? `
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
                      `
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
          <div class="lg:col-span-2">
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

      // Initialize Star Rating Logic
      if (this.currentUser) {
        const stars = document.querySelectorAll("#star-rating i");
        const ratingInput = document.getElementById("rating-input");

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

        document
          .getElementById("review-form")
          .addEventListener("submit", async (e) => {
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
    } catch (e) {
      console.error(e);
      document.getElementById("detail-container").innerHTML =
        "<div class='text-center py-20 text-red-500'>Hata oluştu.</div>";
    }
  },
  async initForumDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    this.changeTheme("Forum");
    try {
      const topic = await api.get(`/forum/topics/${id}`);
      const posts = await api.get(`/forum/topics/${id}/posts`);
      document.getElementById(
        "forum-detail-container"
      ).innerHTML = `<div class="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 mb-6"><span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded uppercase">${
        topic.category
      }</span><h1 class="text-3xl font-black mt-2 mb-2">${
        topic.title
      }</h1><p class="text-gray-500 text-sm">Başlatan: ${
        topic.username
      } • ${new Date(topic.createdAt).toLocaleDateString(
        "tr-TR"
      )}</p></div><div class="space-y-4 mb-8">${posts
        .map(
          (p) =>
            `<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><div class="flex justify-between mb-2"><span class="font-bold text-gray-900">${
              p.username
            }</span><span class="text-xs text-gray-400">${new Date(
              p.createdAt
            ).toLocaleDateString(
              "tr-TR"
            )}</span></div><p class="text-gray-700">${p.content}</p></div>`
        )
        .join("")}</div>${
        this.currentUser
          ? `<div class="bg-white p-6 rounded-2xl border border-gray-200 sticky bottom-4 shadow-lg"><form id="reply-form" class="flex gap-4"><input name="content" class="flex-1 border p-3 rounded-lg" placeholder="Cevap yaz..." required><button class="bg-indigo-600 text-white px-6 rounded-lg font-bold">Gönder</button></form></div>`
          : ""
      }`;
      if (this.currentUser) {
        document
          .getElementById("reply-form")
          .addEventListener("submit", async (e) => {
            e.preventDefault();
            await api.post("/forum/posts", {
              topicId: id,
              userId: this.currentUser.id,
              username: this.currentUser.username,
              content: e.target.content.value,
            });
            window.location.reload();
          });
      }
    } catch (e) {
      console.error(e);
    }
  },
  async initProfile() {
    this.changeTheme("Profil");
    if (!this.currentUser) return (window.location.href = "login.html");
    try {
      // Show loading state implicitly by initial HTML "Yükleniyor..."

      const details = await api.get(`/users/${this.currentUser.id}`);
      const products = await api.get(`/users/${this.currentUser.id}/products`); // Removes || [] to handle error in catch if needed, but api.get returns [] on error anyway.
      const reviews = await api.get(`/users/${this.currentUser.id}/reviews`);

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
        form.bio.value = (details && details.bio) || "";
        form.age.value = (details && details.age) || "";
        form.gender.value = (details && details.gender) || "";

        // Remove old listener to prevent duplicates (though typical usage is page reload)
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          await api.put(`/users/${this.currentUser.id}`, {
            bio: newForm.bio.value,
            age: newForm.age.value,
            gender: newForm.gender.value,
          });
          alert("Profil başarıyla güncellendi.");
        });
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
                    <button onclick="app.deleteReview(${
                      r.id
                    })" class="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-60 hover:opacity-100" title="Sil">
                        <i class="fa-solid fa-trash"></i>
                    </button>
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
                    <p class="text-sm text-gray-600 italic">"${r.content}"</p>
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
  logout() {
    localStorage.removeItem("current_user_session");
    window.location.href = "index.html";
  },
};

window.app = app;
document.addEventListener("DOMContentLoaded", () => app.init());
