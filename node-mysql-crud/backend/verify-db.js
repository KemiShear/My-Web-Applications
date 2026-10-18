const db = require("./db");

console.log("Checking database tables...");

const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type = ?"
).all("table");

console.log("Tables found:", tables);

const products = tables.find(
    (table) => table.name === "products"
);

if (products) {
    console.log("SUCCESS: products table exists.");

    const columns = db.prepare(
        "PRAGMA table_info(products)"
    ).all();

    console.log("Columns:", columns.map((column) => column.name));
} else {
    console.log("ERROR: products table was not found.");
}

db.close();