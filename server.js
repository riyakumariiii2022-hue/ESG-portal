const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Database
const db = new Database("esg-database.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        company TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    name: "esg.sid",
    secret: process.env.SESSION_SECRET || "replace-this-with-a-long-random-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 60 * 60 * 1000
    }
}));

// Serve project files
app.use(express.static(path.join(__dirname)));

// Register a new user
app.post("/api/register", async (req, res) => {
    try {
        const { fullName, company, email, password, confirmPassword } = req.body;

        if (
            typeof fullName !== "string" ||
            typeof company !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof confirmPassword !== "string" ||
            !fullName.trim() ||
            !company.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                message: "Please complete all fields."
            });
        }

        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                message: "Password must be between 8 and 72 characters."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = db.prepare(
            "SELECT id FROM users WHERE email = ?"
        ).get(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = db.prepare(`
            INSERT INTO users
            (full_name, company, email, password_hash)
            VALUES (?, ?, ?, ?)
        `).run(
            fullName.trim(),
            company.trim(),
            normalizedEmail,
            passwordHash
        );

        req.session.userId = result.lastInsertRowid;

        res.status(201).json({
            message: "Account created successfully!",
            redirect: "/dashboard.html"
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Could not create your account. Please try again."
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`ESG Truth Engine running at http://localhost:${PORT}`);
});