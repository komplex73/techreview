const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/api' + path, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function debug() {
  try {
    console.log("--- FETCHING PRODUCTS ---");
    const products = await get('/products');
    if (products.length > 0) {
        const p = products[0];
        console.log("First Product:", { id: p.id, name: p.name, avgRating: p.avgRating, type: typeof p.avgRating });
        
        console.log("\n--- FETCHING REVIEWS FOR PRODUCT " + p.id + " ---");
        const reviews = await get('/reviews/' + p.id);
        console.log("Reviews:", reviews.map(r => ({ id: r.id, rating: r.rating, type: typeof r.rating })));
    } else {
        console.log("No products found.");
    }
    
    console.log("\n--- FETCHING USER PRODUCTS (Profile) ---");
    // Assuming user ID 1 exists
    const userProducts = await get('/users/1/products');
    console.log("User 1 Products:", userProducts.map(p => ({ id: p.id, avgRating: p.avgRating, type: typeof p.avgRating })));

  } catch (e) {
    console.error("Error:", e.message);
  }
}

debug();
