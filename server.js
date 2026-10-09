const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const app = express();
const PORT = 3000;

// ==========================================
// 1. DATABASE SETUP
// ==========================================

const db = new Database(
    path.join(__dirname, "esg-database.db")
);

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

// ==========================================
// 2. MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        name: "esg.sid",
        secret:
            process.env.SESSION_SECRET ||
            "development-only-change-this-secret-before-deployment",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 60 * 60 * 1000
        }
    })
);

// ==========================================
// 3. PDF UPLOAD CONFIGURATION
// ==========================================

const uploadDirectory = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (req, file, callback) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            ".pdf";

        callback(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {
        const isPdf =
            file.mimetype === "application/pdf" &&
            path.extname(file.originalname).toLowerCase() === ".pdf";

        if (!isPdf) {
            return callback(
                new Error("Please upload a PDF file only.")
            );
        }

        callback(null, true);
    }
});

// ==========================================
// 4. REGISTER API
// ==========================================

app.post("/api/register", async (req, res) => {
    try {
        const {
            fullName,
            company,
            email,
            password,
            confirmPassword
        } = req.body;

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

        // Log the user in after successful registration
        req.session.userId = Number(result.lastInsertRowid);

        res.status(201).json({
            message: "Account created successfully!",
            redirect: "/dashboard.html"
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        res.status(500).json({
            message: "Could not create your account. Please try again."
        });
    }
});

// ==========================================
// 5. LOGIN API — THIS IS THE SECTION YOU NEED
// ==========================================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check whether the required fields are provided
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Please enter your email and password."
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find the registered user
        const user = db.prepare(`
            SELECT
                id,
                full_name,
                company,
                email,
                password_hash
            FROM users
            WHERE email = ?
        `).get(normalizedEmail);

        // Check whether the account exists
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Compare the entered password with the stored password hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Regenerate the session after successful authentication
        req.session.regenerate((error) => {
            if (error) {
                console.error("Session error:", error);

                return res.status(500).json({
                    message: "Could not start your session. Please try again."
                });
            }

            // Store the user's ID in the new session
            req.session.userId = Number(user.id);

            // Save the session before sending the response
            req.session.save((saveError) => {
                if (saveError) {
                    console.error("Session save error:", saveError);

                    return res.status(500).json({
                        message: "Could not save your session. Please try again."
                    });
                }

                res.json({
                    message: "Login successful!",
                    redirect: "/dashboard.html"
                });
            });
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Something went wrong. Please try again."
        });
    }
});

// ==========================================
// 6. LOGOUT API
// ==========================================

app.post("/api/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                message: "Could not log out. Please try again."
            });
        }

        res.clearCookie("esg.sid");

        res.json({
            message: "Logged out successfully!",
            redirect: "/login.html"
        });
    });
});

// ==========================================
// 7. PDF UPLOAD AND TEXT EXTRACTION API
// ==========================================

app.post("/api/reports/upload", (req, res) => {
    upload.single("report")(req, res, async (error) => {

        if (error) {
            const message =
                error.code === "LIMIT_FILE_SIZE"
                    ? "The PDF must be smaller than 10 MB."
                    : error.message || "PDF upload failed.";

            return res.status(400).json({
                message: message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a PDF file."
            });
        }

        try {
            // Read the uploaded file
            const fileBuffer = fs.readFileSync(req.file.path);

            // Check the PDF signature
            if (fileBuffer.subarray(0, 5).toString() !== "%PDF-") {
                fs.unlinkSync(req.file.path);

                return res.status(400).json({
                    message: "The uploaded file is not a valid PDF."
                });
            }

            let extractedText = "";

            // Support common pdf-parse API versions
            if (typeof pdfParse === "function") {

                const result = await pdfParse(fileBuffer);
                extractedText = result.text || "";

            } else if (typeof pdfParse.PDFParse === "function") {

                const parser = new pdfParse.PDFParse({
                    data: fileBuffer
                });

                try {
                    const result = await parser.getText();
                    extractedText = result.text || "";
                } finally {
                    await parser.destroy();
                }

            } else {
                throw new Error(
                    "Unsupported pdf-parse API version."
                );
            }

            extractedText = extractedText.trim();

            const wordCount = extractedText
                ? extractedText.split(/\s+/).length
                : 0;

            res.json({
                message: "PDF processed successfully.",
                fileName: req.file.originalname,
                characterCount: extractedText.length,
                wordCount: wordCount,
                text: extractedText
            });

        } catch (error) {
            console.error("PDF processing error:", error);

            if (
                req.file &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                message:
                    "Could not read this PDF. Please try another PDF."
            });
        }
    });
});

// ==========================================
// 8. SERVE FRONTEND FILES
// ==========================================

// Serve frontend files from the project directory
// Open the login page when someone visits the homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// Serve other frontend files
app.use(express.static(__dirname, {
    dotfiles: "ignore",
    index: false
}));
// ==========================================
// 9. HANDLE UNKNOWN API ROUTES
// ==========================================

app.use("/api", (req, res) => {
    res.status(404).json({
        message: "API endpoint not found."
    });
});

// ==========================================
// 10. START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log("---------------------------------------");
    console.log("BBSR Intelligence server is running!");
    console.log(`Open: http://localhost:${PORT}`);
    console.log("---------------------------------------");
});