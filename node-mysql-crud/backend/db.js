// Load the required modules.
const Database = require("better-sqlite3");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Load configuration from the .env file.
dotenv.config({ path: path.join(__dirname, ".env") });

// Resolve the database file path.
const databasePath = path.resolve(
    __dirname,
    process.env.DB_PATH || "./products.db"
);

// Open or create the SQLite database.
const db = new Database(databasePath);

// Enable foreign-key enforcement.
db.pragma("foreign_keys = ON");

// Read and execute the database schema.
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);

// Export the database connection for other files.
module.exports = db;

console.log("SQLite database connected successfully.");
console.log(`Database file: ${databasePath}`);