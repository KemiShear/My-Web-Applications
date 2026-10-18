const db = require("./db");

// Insert sample products only when the table is empty.
const count = db.prepare(
    "SELECT COUNT(*) AS total FROM products"
).get().total;

if (count === 0) {
    const insertProduct = db.prepare(`
        INSERT INTO products
        (product_name, brand, category, price, quantity, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const products = [
        ["EliteBook 845 G8", "HP", "Laptop", 6500, 8,
            "Business laptop for programming and productivity."],
        ["ThinkPad T14", "Lenovo", "Laptop", 7200, 5,
            "Durable laptop for work and software development."],
        ["Galaxy A55", "Samsung", "Smartphone", 4800, 12,
            "Smartphone with a high-quality display."],
        ["iPhone 15", "Apple", "Smartphone", 10500, 4,
            "Smartphone for communication and multimedia."],
        ["Redmi Note 13", "Xiaomi", "Smartphone", 2800, 10,
            "Affordable smartphone for everyday use."],
        ["WH-1000XM5", "Sony", "Headphones", 5500, 6,
            "Wireless noise-cancelling headphones."],
        ["MX Master 3S", "Logitech", "Accessories", 1800, 9,
            "Wireless mouse for productivity."],
        ["T7 Portable SSD", "Samsung", "Storage", 1600, 15,
            "Portable solid-state drive for file storage."],
        ["iPad Air", "Apple", "Tablet", 8500, 3,
            "Tablet for study, drawing, and entertainment."],
        ["27-inch Monitor", "Dell", "Monitor", 3200, 7,
            "External monitor for office and development work."]
    ];

    const insertMany = db.transaction((items) => {
        for (const product of items) {
            insertProduct.run(...product);
        }
    });

    insertMany(products);

    console.log("10 sample products inserted successfully.");
} else {
    console.log(`Seeding skipped: ${count} product records already exist.`);
}

db.close();