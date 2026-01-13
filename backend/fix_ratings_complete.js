const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database open error:", err);
    process.exit(1);
  }
});

db.serialize(() => {
  console.log("🔧 Veritabanı düzeltme işlemi başlamıştır...\n");

  // 1. Rating sütununu ekle (zaten varsa ignore et)
  db.run(`ALTER TABLE reviews ADD COLUMN rating INTEGER DEFAULT 5`, (err) => {
    if (err) {
      if (err.message.includes("duplicate column")) {
        console.log("✅ Rating sütunu zaten mevcut");
      } else {
        console.error("❌ Rating sütunu eklenirken hata:", err.message);
      }
    } else {
      console.log("✅ Rating sütunu başarıyla eklendi");
    }
  });

  // 2. NULL veya 0 olan ratings'leri 5 olarak güncelle
  db.run(
    `UPDATE reviews SET rating = 5 WHERE rating IS NULL OR rating = 0`,
    function (err) {
      if (err) {
        console.error("❌ NULL ratings güncellenirken hata:", err.message);
      } else {
        console.log(
          `✅ ${this.changes} adet NULL/0 rating → 5 olarak güncellendi`
        );
      }
    }
  );

  // 3. Tüm reviews'ın rating'lerini kontrol et
  setTimeout(() => {
    db.all(
      `
      SELECT id, productId, userId, username, rating, content, createdAt 
      FROM reviews 
      ORDER BY productId DESC
    `,
      [],
      (err, rows) => {
        if (err) {
          console.error("❌ Reviews kontrol edilirken hata:", err);
        } else {
          console.log("\n📊 Reviews Özeti:");
          console.log("═".repeat(80));

          const summary = {
            total: rows.length,
            withRating: rows.filter((r) => r.rating && r.rating > 0).length,
            withoutRating: rows.filter((r) => !r.rating || r.rating === 0)
              .length,
            avgRating:
              rows.length > 0
                ? (
                    rows.reduce(
                      (sum, r) => sum + (parseInt(r.rating) || 0),
                      0
                    ) / rows.length
                  ).toFixed(2)
                : 0,
          };

          console.log(`Toplam Yorum: ${summary.total}`);
          console.log(`Puanı olan: ${summary.withRating}`);
          console.log(`Puanı olmayan: ${summary.withoutRating}`);
          console.log(`Ortalama Puan: ${summary.avgRating}/5`);
          console.log("═".repeat(80));

          if (rows.length > 0) {
            console.log("\n📝 Son 5 Yorum:");
            rows.slice(0, 5).forEach((r) => {
              console.log(
                `  • ID: ${r.id} | Ürün: ${r.productId} | Puan: ${
                  r.rating || "❌ Yok"
                } | Kullanıcı: ${r.username}`
              );
            });
          }
        }

        // 4. Products tablosundaki avgRating'leri kontrol et
        setTimeout(() => {
          db.all(
            `
          SELECT 
            p.id,
            p.name,
            AVG(r.rating) as calcAvgRating,
            COUNT(r.id) as reviewCount
          FROM products p
          LEFT JOIN reviews r ON p.id = r.productId
          GROUP BY p.id
          ORDER BY p.id DESC
        `,
            [],
            (err, products) => {
              if (err) {
                console.error("❌ Products kontrol edilirken hata:", err);
              } else {
                console.log("\n📦 Ürünler ve Puan Ortalamaları:");
                console.log("═".repeat(80));

                if (products.length === 0) {
                  console.log("   (Ürün bulunamadı)");
                } else {
                  products.slice(0, 5).forEach((p) => {
                    console.log(`  • ${p.name}`);
                    console.log(
                      `    └─ Puan Ortalaması: ${
                        p.calcAvgRating
                          ? Number(p.calcAvgRating).toFixed(1)
                          : "Yok"
                      }/5 (${p.reviewCount} yorum)`
                    );
                  });
                  if (products.length > 5) {
                    console.log(`  ... ve ${products.length - 5} tane daha`);
                  }
                }
                console.log("═".repeat(80));
              }

              console.log("\n✨ Veritabanı düzeltme tamamlandı!");
              db.close();
            }
          );
        }, 100);
      }
    );
  }, 100);
});

db.on("error", (err) => {
  console.error("Database error:", err);
  process.exit(1);
});
