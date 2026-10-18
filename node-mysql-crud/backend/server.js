
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow frontend requests and accept JSON request bodies.
app.use(cors());
app.use(express.json());

// Confirm that the API server is running.
app.get("/", (req, res) => {
    res.json({
        message: "Product CRUD API is running."
    });
});

// GET: Retrieve all products.
app.get("/api/products", (req, res) => {
    try {
        const products = db.prepare(
            "SELECT * FROM products ORDER BY id"
        ).all();

        res.json(products);
    } catch (error) {
        console.error("Error retrieving products:", error.message);
        res.status(500).json({
            error: "Failed to retrieve products."
        });
    }
});

// GET: Retrieve one product by ID.
app.get("/api/products/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Product ID must be a positive integer."
            });
        }

        const product = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(id);

        if (!product) {
            return res.status(404).json({
                error: "Product not found."
            });
        }

        res.json(product);
    } catch (error) {
        console.error("Error retrieving product:", error.message);
        res.status(500).json({
            error: "Failed to retrieve product."
        });
    }
});

 // POST: Create a new product.
app.post("/api/products", (req, res) => {
    try {
        const {
            product_name,
            brand,
            category,
            price,
            quantity,
            description
        } = req.body;

        // Validate required fields.
        if (
            typeof product_name !== "string" || !product_name.trim() ||
            typeof brand !== "string" || !brand.trim() ||
            typeof category !== "string" || !category.trim() ||
            typeof description !== "string" || !description.trim() ||
            price === undefined || price === null || price === "" ||
            quantity === undefined || quantity === null || quantity === ""
        ) {
            return res.status(400).json({
                error: "All product fields are required."
            });
        }

        const parsedPrice = Number(price);
        const parsedQuantity = Number(quantity);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({
                error: "Price must be a valid non-negative number."
            });
        }

        if (
            !Number.isInteger(parsedQuantity) ||
            parsedQuantity < 0
        ) {
            return res.status(400).json({
                error: "Quantity must be a non-negative whole number."
            });
        }

        const result = db.prepare(`
            INSERT INTO products
            (product_name, brand, category, price, quantity, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            product_name.trim(),
            brand.trim(),
            category.trim(),
            parsedPrice,
            parsedQuantity,
            description.trim()
        );

        const newProduct = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(result.lastInsertRowid);

        return res.status(201).json({
            message: "Product created successfully.",
            product: newProduct
        });
    } catch (error) {
        console.error("Error creating product:", error.message);
        return res.status(500).json({
            error: "Failed to create product."
        });
    }
});


 // PUT: Update an existing product.
app.put("/api/products/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Product ID must be a positive integer."
            });
        }

        const existingProduct = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(id);

        if (!existingProduct) {
            return res.status(404).json({
                error: "Product not found."
            });
        }

        const {
            product_name,
            brand,
            category,
            price,
            quantity,
            description
        } = req.body || {};

        if (
            typeof product_name !== "string" || !product_name.trim() ||
            typeof brand !== "string" || !brand.trim() ||
            typeof category !== "string" || !category.trim() ||
            typeof description !== "string" || !description.trim() ||
            price === undefined || price === null || price === "" ||
            quantity === undefined || quantity === null || quantity === ""
        ) {
            return res.status(400).json({
                error: "All product fields are required."
            });
        }

        const parsedPrice = Number(price);
        const parsedQuantity = Number(quantity);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({
                error: "Price must be a valid non-negative number."
            });
        }

        if (
            !Number.isInteger(parsedQuantity) ||
            parsedQuantity < 0
        ) {
            return res.status(400).json({
                error: "Quantity must be a non-negative whole number."
            });
        }

        db.prepare(`
            UPDATE products
            SET product_name = ?,
                brand = ?,
                category = ?,
                price = ?,
                quantity = ?,
                description = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            product_name.trim(),
            brand.trim(),
            category.trim(),
            parsedPrice,
            parsedQuantity,
            description.trim(),
            id
        );

        const updatedProduct = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(id);

        return res.json({
            message: "Product updated successfully.",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error.message);
        return res.status(500).json({
            error: "Failed to update product."
        });
    }
});


 // DELETE: Remove a product by ID.
app.delete("/api/products/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Product ID must be a positive integer."
            });
        }

        const product = db.prepare(
            "SELECT * FROM products WHERE id = ?"
        ).get(id);

        if (!product) {
            return res.status(404).json({
                error: "Product not found."
            });
        }

        db.prepare(
            "DELETE FROM products WHERE id = ?"
        ).run(id);

        return res.json({
            message: "Product deleted successfully.",
            product
        });
    } catch (error) {
        console.error("Error deleting product:", error.message);
        return res.status(500).json({
            error: "Failed to delete product."
        });
    }
});


// Start the API server.
app.listen(PORT, () => {
    console.log(`Product API running at http://localhost:${PORT}`);
});
