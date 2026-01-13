const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- STATIC FILES CONFIGURATION ---
// Base directory is now one level up from 'backend/'
const baseDir = path.join(__dirname, '..');

// Serve CSS from /css
app.use('/css', express.static(path.join(baseDir, 'public', 'css')));

// Serve JS from /js
app.use('/js', express.static(path.join(baseDir, 'public', 'js')));

// Serve Uploads/Images from /public (legacy support)
app.use('/public', express.static(path.join(baseDir, 'public')));

// Serve HTML as root
const htmlDir = path.join(baseDir, 'public', 'html');
console.log("📂 Static HTML Directory:", htmlDir);
console.log("📂 Base Directory:", baseDir);

app.use(express.static(htmlDir, { extensions: ['html', 'htm'] }));


// --- DATABASE SETUP ---
const DB_SOURCE = path.join(baseDir, "database.db");
const USER_DB_DIR = path.join(baseDir, "user_dbs");

if (!fs.existsSync(USER_DB_DIR)) {
  fs.mkdirSync(USER_DB_DIR, { recursive: true });
}

let db = new sqlite3.Database(DB_SOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Diğer tablolar (Standart)
    db.run(
      `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user', status TEXT DEFAULT 'active', companyName TEXT, taxId TEXT, createdAt TEXT)`
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS user_details (userId INTEGER PRIMARY KEY, gender TEXT, bio TEXT, age INTEGER, FOREIGN KEY(userId) REFERENCES users(id))`
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, category TEXT, description TEXT, image TEXT, createdAt TEXT, createdBy INTEGER, username TEXT, specifications TEXT)`
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER, userId INTEGER, user TEXT, username TEXT, rating INTEGER, comment TEXT, content TEXT, date TEXT, createdAt TEXT, FOREIGN KEY(productId) REFERENCES products(id), FOREIGN KEY(userId) REFERENCES users(id))`
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS forum_topics (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, userId INTEGER, username TEXT, createdAt TEXT, viewCount INTEGER DEFAULT 0)`
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS forum_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, topicId INTEGER, userId INTEGER, username TEXT, content TEXT, createdAt TEXT, FOREIGN KEY(topicId) REFERENCES forum_topics(id))`
    );

    // --- SEPET TABLOSU (İstek Listesi) ---
    db.run(
      `CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          productId INTEGER,
          createdAt TEXT,
          FOREIGN KEY(userId) REFERENCES users(id),
          FOREIGN KEY(productId) REFERENCES products(id)
      )`
    );

// HABERLER TABLOSU
    db.run(
      `CREATE TABLE IF NOT EXISTS news (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          summary TEXT,
          content TEXT,
          image TEXT,
          category TEXT,
          source TEXT,
          url TEXT, 
          createdAt TEXT
      )`,
      function (err) {
        // Sadece tablo boşsa verileri ekle
        if (!err) {
          db.get("SELECT COUNT(*) as count FROM news", (err, row) => {
            if (!err && row.count === 0) {
              seedNews();
            }
          });
        }
      }
    );

    // FORUM TOPIK TABLOSU (Seed ile)
    db.run(
       `CREATE TABLE IF NOT EXISTS forum_topics (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, userId INTEGER, username TEXT, createdAt TEXT, viewCount INTEGER DEFAULT 0)`,
       function(err) {
           if(!err) {
               db.get("SELECT COUNT(*) as count FROM forum_topics", (err, row) => {
                   if (!err && row.count === 0) {
                        seedForum();
                   }
               });
           }
       }
    );
  });
}


// GERÇEK HABER İÇERİKLERİ (Kategoriler Çeşitlendirildi)
function seedNews() {
  const newsData = [
    {
      title: "Yapay Zeka Dünyayı Değiştiriyor: GPT-5 Beklentileri",
      summary:
        "OpenAI'ın yeni dil modelinden beklentiler büyük. Peki hayatımızda neleri değiştirecek?",
      content: "Yapay zeka teknolojilerindeki hızlı ilerleme devam ediyor...",
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop",
      category: "Yapay Zeka",
      source: "Webtekno",
      url: "https://www.webtekno.com/haber/yapay-zeka",
    },
    {
      title: "Apple Vision Pro İncelemesi: Gelecek Burada mı?",
      summary:
        "Apple'ın uzamsal bilgisayarı Vision Pro'yu derinlemesine inceledik.",
      content:
        "Sanal gerçeklik ve artırılmış gerçeklik dünyasında kartlar yeniden dağıtılıyor...",
      image:
        "https://images.unsplash.com/photo-1706696144878-a029302636a0?w=600&auto=format&fit=crop",
      category: "Donanım", // Yeni Kategori
      source: "ShiftDelete",
      url: "https://shiftdelete.net/",
    },
    {
      title: "2025 Yılında Okumanız Gereken 10 Bilim Kurgu Kitabı",
      summary:
        "Dune serisinden Üç Cisim Problemi'ne, zihninizi açacak kitap önerileri.",
      content: "Bilim kurgu edebiyatı altın çağını yaşıyor...",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
      category: "Kültür & Sanat", // Yeni Kategori
      source: "Kitap Yurdu",
      url: "https://www.kitapyurdu.com/",
    },
    {
      title: "NASA'dan 2025 İçin Yeni Uzay Görevi Duyurusu",
      summary: "Ay'a dönüş projesi Artemis kapsamında kritik adımlar atılıyor.",
      content:
        "NASA, 2025 yılı içinde Ay yüzeyine insanlı iniş için hazırlıklarını hızlandırdı...",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop",
      category: "Bilim", // Yeni Kategori
      source: "TRT Haber",
      url: "https://www.trthaber.com/haber/bilim-teknoloji/",
    },
  ];

  const stmt = db.prepare(
    "INSERT INTO news (title, summary, content, image, category, source, url, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  newsData.forEach((n) => {
    stmt.run(
      n.title,
      n.summary,
      n.content,
      n.image,
      n.category,
      n.source,
      n.url,
      new Date().toISOString()
    );
  });
  stmt.finalize();
  console.log("✅ Gerçek haber verileri yüklendi.");
}

function seedForum() {
  const topics = [
    { title: "Genel Sohbet", category: "Genel", content: "Teknoloji dünyasından genel sohbetler." },
    { title: "Telefon Önerileri", category: "Telefon", content: "Hangi telefonu almalıyım? Önerilerinizi bekliyorum." },
    { title: "Dizüstü Bilgisayarlar", category: "Laptop", content: "İş ve oyun için laptop tavsiyeleri." },
    { title: "Yapay Zeka Gelişmeleri", category: "Yapay Zeka", content: "AI dünyasındaki son yenilikleri tartışıyoruz." },
    { title: "Oyun Dünyası", category: "Oyun", content: "Favori oyunlarınız ve beklentileriniz." }
  ];

  const stmt = db.prepare(
    "INSERT INTO forum_topics (title, category, userId, username, createdAt) VALUES (?, ?, ?, ?, ?)"
  );

  topics.forEach((t) => {
    stmt.run(
      t.title,
      t.category,
      1, // System User ID
      "Sistem",
      new Date().toISOString()
    );
  });
  stmt.finalize();
  console.log("✅ Forum verileri yüklendi.");
}


// --- ROTALAR ---
app.get("/api/users", (req, res) =>
  db.all(
    "SELECT id, username, email, role, createdAt FROM users ORDER BY id DESC",
    [],
    (err, rows) => res.json(rows || [])
  )
);
app.get("/api/users/:id", (req, res) =>
  db.get(
    "SELECT * FROM user_details WHERE userId = ?",
    [req.params.id],
    (err, row) => res.json(row || {})
  )
);

// UPDATE USER (Now supports username update)
app.put("/api/users/:id", (req, res) => {
  const { bio, age, gender, username } = req.body; // Added username

  // 1. Update User Details
  db.run(
    "INSERT OR REPLACE INTO user_details (userId, bio, age, gender) VALUES (?, ?, ?, ?)",
    [req.params.id, bio, age, gender],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // 2. Update Username (if provided)
      if (username) {
        db.run(
          "UPDATE users SET username = ? WHERE id = ?",
          [username, req.params.id],
          (err) => {
             if (err) console.error("Username update failed:", err);
             // Even if username fails (e.g. duplicate?), we return success for details
             res.json({ success: true }); 
          }
        );
      } else {
        res.json({ success: true });
      }
    }
  );
});
app.post("/api/users/:id/apply", (req, res) => {
  const { companyName, taxId } = req.body;
  db.run(
    "UPDATE users SET role='company', status='pending', companyName=?, taxId=? WHERE id=?",
    [companyName, taxId, req.params.id],
    (err) => res.json({ success: true })
  );
});

// GET all users (Admin only)
app.get("/api/users", (req, res) => {
  db.all("SELECT id, username, email, role, createdAt FROM users ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// DELETE account - cascade delete all user data
app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  
  // Delete all user-related data in order (foreign key constraints)
  db.serialize(() => {
    db.run("DELETE FROM forum_posts WHERE userId = ?", [userId]);
    db.run("DELETE FROM forum_topics WHERE userId = ?", [userId]);
    db.run("DELETE FROM reviews WHERE userId = ?", [userId]);
    db.run("DELETE FROM products WHERE createdBy = ?", [userId]);
    db.run("DELETE FROM user_details WHERE userId = ?", [userId]);
    db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
      if (err) {
        return res.status(500).json({ error: "Hesap silinirken hata oluştu." });
      }
      res.json({ success: true, deleted: this.changes });
    });
  });
});

app.get("/api/products", (req, res) =>
  db.all(
    `
    SELECT products.*, 
    COALESCE(AVG(CAST(reviews.rating AS FLOAT)), 0) as avgRating, 
    COUNT(CASE WHEN reviews.rating > 0 THEN 1 END) as reviewCount 
    FROM products 
    LEFT JOIN reviews ON products.id = reviews.productId
    GROUP BY products.id 
    ORDER BY products.createdAt DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error("Error fetching products:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log("Products with ratings:", rows);
      res.json(rows);
    }
  )
);
app.get("/api/products/:id", (req, res) =>
  db.get(
    `
    SELECT products.*, 
    COALESCE(AVG(CAST(reviews.rating AS FLOAT)), 0) as avgRating, 
    COUNT(CASE WHEN reviews.rating > 0 THEN 1 END) as reviewCount 
    FROM products 
    LEFT JOIN reviews ON products.id = reviews.productId 
    WHERE products.id = ?
    GROUP BY products.id
    `,
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error("Error fetching product:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log("Product detail with rating:", row);
      res.json(row);
    }
  )
);
app.post("/api/products", (req, res) => {
  const { name, category, description, image, createdBy, username, rating, specifications } =
    req.body;
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO products (name, category, description, image, specifications, createdAt, createdBy, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, category, description, image, specifications, createdAt, createdBy, username],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const newProductId = this.lastID;

      // Automatically create a review for the creator
      if (description || rating) {
        db.run(
          `INSERT INTO reviews (productId, userId, username, content, rating, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            newProductId,
            createdBy,
            username,
            description,
            rating || 0,
            createdAt,
          ],
          function (err) {
            if (err) console.error("Auto-review creation failed:", err);
          }
        );
      }

      res.json({ id: newProductId });
    }
  );
});
app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM reviews WHERE productId = ?", [id], () =>
    db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
      res.json({ deleted: this.changes });
    })
  );
});
app.get("/api/reviews/:productId", (req, res) =>
  db.all(
    "SELECT id, productId, userId, username, rating, content, createdAt FROM reviews WHERE productId = ? ORDER BY createdAt DESC",
    [req.params.productId],
    (err, rows) => res.json(rows || [])
  )
);
app.post("/api/reviews", (req, res) => {
  const { productId, userId, username, content, rating } = req.body;
  const createdAt = new Date().toISOString();

  // Validate rating
  const finalRating = parseInt(rating);

  // Strict validation: Must be an integer 1-5
  if (isNaN(finalRating) || finalRating < 1 || finalRating > 5) {
      console.error(`❌ Invalid rating attempt: ${rating}`);
      return res.status(400).json({ error: "Lütfen 1 ile 5 arasında bir puan verin." });
  }



  console.log(
    `📝 New Review - Product: ${productId}, User: ${username}, Rating Input: ${rating}, Final: ${finalRating}`
  );

  db.run(
    `INSERT INTO reviews (productId, userId, username, content, rating, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    [productId, userId, username, content, finalRating, createdAt],
    function (err) {
      if (err) {
        console.error("❌ Review insert error:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log(
        `✅ Review saved - ID: ${this.lastID}, Rating: ${finalRating}`
      );
      res.json({ id: this.lastID });
    }
  );
});
app.delete("/api/reviews/:id", (req, res) =>
  db.run("DELETE FROM reviews WHERE id = ?", [req.params.id], () =>
    res.json({ deleted: true })
  )
);
app.get("/api/users/:userId/reviews", (req, res) => {
  db.all(
    `SELECT reviews.id, reviews.rating, reviews.content, reviews.createdAt, reviews.productId, products.name as productName 
     FROM reviews 
     JOIN products ON reviews.productId = products.id 
     WHERE reviews.userId = ? 
     ORDER BY reviews.createdAt DESC`,
    [req.params.userId],
    (err, rows) => res.json(rows || [])
  );
});
app.get("/api/users/:userId/products", (req, res) => {
  db.all(
    `SELECT products.*, 
     COALESCE(AVG(CAST(reviews.rating AS FLOAT)), 0) as avgRating 
     FROM products 
     LEFT JOIN reviews ON products.id = reviews.productId 
     WHERE products.createdBy = ?
     GROUP BY products.id
     ORDER BY products.createdAt DESC`,
    [req.params.userId],
    (err, rows) => {
      if (err) {
        console.error("Error fetching user products:", err);
        return res.status(500).json({ error: err.message });
      }
      console.log("User products with ratings:", rows);
      res.json(rows);
    }
  );
});
app.put("/api/products/:id", (req, res) => {
  const { name, category, description, image, rating, specifications } = req.body;

  // 1. Update Product Info (including specifications)
  db.run(
    "UPDATE products SET name = ?, category = ?, description = ?, image = ?, specifications = ? WHERE id = ?",
    [name, category, description, image, specifications, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // 2. Update the Creator's Review (if rating is provided)
      // We find the review linked to this product AND the creator (to avoid changing others' reviews)
      // Since we don't pass userId in PUT body for security ideally, we first need to know WHO created it or just update the review matches product+creator.
      // Simplified approach: Update the review that belongs to this product's creator.

      // First get the product to find createdBy
      db.get(
        "SELECT createdBy FROM products WHERE id = ?",
        [req.params.id],
        (err, product) => {
          if (product && rating) {
            db.run(
              "UPDATE reviews SET rating = ?, content = ? WHERE productId = ? AND userId = ?",
              [rating, description, req.params.id, product.createdBy],
              (err) => {
                if (err)
                  console.error(
                    "Failed to update linked review during product edit",
                    err
                  );
              }
            );
          }
        }
      );

      res.json({ updated: true });
    }
  );
});
app.get("/api/news", (req, res) =>
  db.all("SELECT * FROM news ORDER BY createdAt DESC", [], (err, rows) =>
    res.json(rows)
  )
);
app.get("/api/news/:id", (req, res) =>
  db.get("SELECT * FROM news WHERE id = ?", [req.params.id], (err, row) =>
    res.json(row || {})
  )
);
app.post("/api/news", (req, res) => {
  const { title, summary, content, image, category, source, url } = req.body;
  const createdAt = new Date().toISOString();
  
  db.run(
    `INSERT INTO news (title, summary, content, image, category, source, url, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, summary, content, image, category, source, url, createdAt],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});
app.put("/api/news/:id", (req, res) => {
  const { title, summary, content, image, category, source, url } = req.body;
  
  db.run(
    `UPDATE news SET title=?, summary=?, content=?, image=?, category=?, source=?, url=? 
     WHERE id=?`,
    [title, summary, content, image, category, source, url, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});
app.delete("/api/news/:id", (req, res) => {
  db.run("DELETE FROM news WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// --- CART ENDPOINTS ---
app.get("/api/cart/:userId", (req, res) => {
  db.all(
    `SELECT cart.id as cartId, products.* 
     FROM cart 
     JOIN products ON cart.productId = products.id 
     WHERE cart.userId = ? 
     ORDER BY cart.createdAt DESC`,
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post("/api/cart", (req, res) => {
  const { userId, productId } = req.body;
  
  // Check if already in cart
  db.get("SELECT id FROM cart WHERE userId = ? AND productId = ?", [userId, productId], (err, row) => {
    if (row) return res.status(400).json({ error: "Ürün zaten listede ekli." });
    
    db.run(
      "INSERT INTO cart (userId, productId, createdAt) VALUES (?, ?, ?)",
      [userId, productId, new Date().toISOString()],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

app.delete("/api/cart/:id", (req, res) => {
  db.run("DELETE FROM cart WHERE id = ?", req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.get("/api/forum/topics", (req, res) =>
  db.all(
    "SELECT t.*, COUNT(p.id) as postCount FROM forum_topics t LEFT JOIN forum_posts p ON t.id = p.topicId GROUP BY t.id ORDER BY t.createdAt DESC",
    [],
    (err, rows) => res.json(rows)
  )
);
app.get("/api/forum/topics/:id", (req, res) =>
  db.get(
    "SELECT * FROM forum_topics WHERE id = ?",
    [req.params.id],
    (err, row) => res.json(row)
  )
);
app.get("/api/forum/topics/:id/posts", (req, res) =>
  db.all(
    "SELECT * FROM forum_posts WHERE topicId = ?",
    [req.params.id],
    (err, rows) => res.json(rows)
  )
);
app.post("/api/forum/topics", (req, res) => {
  const { title, category, userId, username } = req.body;
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO forum_topics (title, category, userId, username, createdAt) VALUES (?, ?, ?, ?, ?)`,
    [title, category, userId, username, createdAt],
    function (err) {
      res.json({ id: this.lastID });
    }
  );
});
app.post("/api/forum/posts", (req, res) => {
  const { topicId, userId, username, content } = req.body;
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO forum_posts (topicId, userId, username, content, createdAt) VALUES (?, ?, ?, ?, ?)`,
    [topicId, userId, username, content, createdAt],
    function (err) {
      res.json({ id: this.lastID });
    }
  );
});

app.get("/api/users/:userId/forum-posts", (req, res) => {
    const userId = req.params.userId;
    db.all(
        `SELECT p.*, t.title as topicTitle 
         FROM forum_posts p 
         JOIN forum_topics t ON p.topicId = t.id 
         WHERE p.userId = ? 
         ORDER BY p.createdAt DESC`,
        [userId],
        (err, rows) => {
            if(err) return res.status(500).json({error: err.message});
            res.json(rows);
        }
    );
});

app.put("/api/forum/posts/:id", (req, res) => {
    const { content } = req.body;
    db.run(
        "UPDATE forum_posts SET content = ? WHERE id = ?",
        [content, req.params.id],
        function(err) {
            if(err) return res.status(500).json({error: err.message});
            res.json({updated: this.changes});
        }
    );
});

app.delete("/api/forum/posts/:id", (req, res) => {
    db.run(
        "DELETE FROM forum_posts WHERE id = ?",
        [req.params.id],
        function(err) {
            if(err) return res.status(500).json({error: err.message});
            res.json({deleted: this.changes});
        }
    );
});
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?`,
    [username, username, password],
    (err, user) => {
      if (!user) return res.status(401).json({ error: "Hatalı bilgi." });
      res.json(user);
    }
  );
});
app.post("/api/auth/register", (req, res) => {
  const { username, email, password, age, gender, bio } = req.body;
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO users (username, email, password, role, status, createdAt) VALUES (?, ?, ?, 'user', 'active', ?)`,
    [username, email, password, createdAt],
    function (err) {
      if (err) return res.status(400).json({ error: "Kayıt hatası." });

      const newUserId = this.lastID;

      // Create User-Specific Database
      const userDbPath = path.join(USER_DB_DIR, `${username}.sqlite`);
      const userDb = new sqlite3.Database(userDbPath, (err) => {
        if (err) {
          console.error("Failed to create user DB:", err);
        } else {
          console.log(`Created private DB for ${username}`);
          userDb.serialize(() => {
            userDb.run(`CREATE TABLE IF NOT EXISTS user_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action TEXT,
                    details TEXT,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )`);
            userDb.run(
              `INSERT INTO user_logs (action, details) VALUES (?, ?)`,
              ["REGISTER", "User account created successfully"]
            );
          });
          userDb.close();
        }
      });

      if (bio || age || gender)
        db.run(
          `INSERT INTO user_details (userId, gender, bio, age) VALUES (?, ?, ?, ?)`,
          [newUserId, gender, bio, age]
        );
      res.json({ id: newUserId, username, email });
    }
  );
});

// DEBUG: List files in public/html
app.get('/api/debug-files', (req, res) => {
    const htmlDir = path.join(baseDir, 'public', 'html');
    fs.readdir(htmlDir, (err, files) => {
        if (err) return res.status(500).json({ error: err.message, path: htmlDir });
        res.json({ files, path: htmlDir });
    });
});

// EXPLICIT ROUTES for Static Files (Fix for Render static serving issues)
app.get(['/about.html', '/about'], (req, res) => {
    res.sendFile(path.join(baseDir, 'public', 'html', 'about.html'));
});
app.get(['/contact.html', '/contact'], (req, res) => {
    res.sendFile(path.join(baseDir, 'public', 'html', 'contact.html')); // Note: contact.html might not exist, checking support.html
});
app.get(['/support.html', '/support'], (req, res) => {
    res.sendFile(path.join(baseDir, 'public', 'html', 'support.html'));
});

// Catch-All for 404 (Optional debugging)
app.use((req, res, next) => {
    console.log(`404 Not Found: ${req.url}`);
    next();
});

app.listen(PORT, () =>
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`)
);
