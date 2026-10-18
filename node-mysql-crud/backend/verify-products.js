
const db = require("./db");

const products = db.prepare(`
    SELECT id, product_name, brand, category, price, quantity, description
    FROM products
    ORDER BY id
`).all();

console.table(products);

console.log("Total products:", products.length);

db.close();
