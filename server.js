const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Ensure user_dbs directory exists
const USER_DB_DIR = path.join(__dirname, "user_dbs");
if (!fs.existsSync(USER_DB_DIR)) {
  fs.mkdirSync(USER_DB_DIR);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("Veritabanı hatası:", err.message);
  else {
    console.log("SQLite veritabanına bağlanıldı.");
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
      `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, category TEXT, description TEXT, image TEXT, createdAt TEXT, createdBy INTEGER, username TEXT)`
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

    // --- HABERLER TABLOSU ---
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
app.put("/api/users/:id", (req, res) => {
  const { bio, age, gender } = req.body;
  db.run(
    `INSERT INTO user_details (userId, bio, age, gender) VALUES (?, ?, ?, ?) ON CONFLICT(userId) DO UPDATE SET bio=excluded.bio, age=excluded.age, gender=excluded.gender`,
    [req.params.id, bio, age, gender],
    (err) => res.json({ success: true })
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
app.get("/api/products", (req, res) =>
  db.all(
    `
    SELECT products.*, 
    AVG(reviews.rating) as avgRating, 
    COUNT(reviews.id) as reviewCount 
    FROM products 
    LEFT JOIN reviews ON products.id = reviews.productId 
    GROUP BY products.id 
    ORDER BY products.createdAt DESC
    `,
    [],
    (err, rows) => res.json(rows)
  )
);
app.get("/api/products/:id", (req, res) =>
  db.get(
    `
    SELECT products.*, 
    AVG(reviews.rating) as avgRating, 
    COUNT(reviews.id) as reviewCount 
    FROM products 
    LEFT JOIN reviews ON products.id = reviews.productId 
    WHERE products.id = ?
    GROUP BY products.id
    `,
    [req.params.id],
    (err, row) => res.json(row)
  )
);
app.post("/api/products", (req, res) => {
  const { name, category, description, image, createdBy, username, rating } =
    req.body;
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO products (name, category, description, image, createdAt, createdBy, username) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, category, description, image, createdAt, createdBy, username],
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
  db.run(
    `INSERT INTO reviews (productId, userId, username, content, rating, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      productId,
      userId,
      username,
      content,
      rating && rating > 0 ? rating : 5,
      createdAt,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
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
     AVG(reviews.rating) as avgRating 
     FROM products 
     LEFT JOIN reviews ON products.id = reviews.productId 
     WHERE products.createdBy = ? 
     GROUP BY products.id
     ORDER BY products.createdAt DESC`,
    [req.params.userId],
    (err, rows) => res.json(rows)
  );
});
app.put("/api/products/:id", (req, res) => {
  const { name, category, description, image, rating } = req.body;

  // 1. Update Product Info
  db.run(
    "UPDATE products SET name = ?, category = ?, description = ?, image = ? WHERE id = ?",
    [name, category, description, image, req.params.id],
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

app.listen(PORT, () =>
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`)
);
