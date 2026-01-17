// backend/server.js
"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axiosLib = require("axios");
const mysql2 = require("mysql2/promise");
const dayjs = require("dayjs");

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const isoWeek = require("dayjs/plugin/isoWeek");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const nodemailer = require("nodemailer");
const config = require("./config");

// ✅ đúng: students router
const createStudentsRouter = require("./routes/students");
// ✅ thêm: face router
const createFaceRouter = require("./routes/face");

const app = express();

// ===================== CONFIG =====================
const PORT = Number(process.env.BACKEND_PORT || config?.server?.port || 5050);

// ✅ ưu tiên biến bạn đang dùng trong compose: FLASK_URL
const FLASK_SERVER =
  process.env.FLASK_URL ||
  process.env.FLASK_SERVER ||
  config?.flask?.url ||
  "http://flask:5001";

const FACE_MATCH_THRESHOLD = Number(process.env.FACE_MATCH_THRESHOLD || 0.38);

// ===================== MIDDLEWARE =====================
app.use(cors({ origin: "*" }));
app.options("*", cors()); // ✅ tránh lỗi preflight/OPTIONS
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ✅ Health check
app.get("/", (req, res) => res.send("✅ Backend is running"));

// ===================== UPLOADS =====================
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ Serve ảnh tĩnh: http://localhost:5050/uploads/<file>
app.use("/uploads", express.static(UPLOAD_DIR));

// ✅ Multer config (an toàn + chỉ nhận ảnh)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext)
      ? ext
      : ".jpg";
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const ok =
      file.mimetype?.startsWith("image/") ||
      file.mimetype === "application/octet-stream";
    if (!ok) return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});

// ===================== MySQL CONFIG (Ưu tiên .env) =====================
const DB_CONFIG = {
  host:
    process.env.DB_HOST ||
    process.env.MYSQL_HOST ||
    config?.db?.host ||
    "localhost",
  port: Number(
    process.env.DB_PORT || process.env.MYSQL_PORT || config?.db?.port || 3306
  ),
  user: process.env.DB_USER || process.env.MYSQL_USER || config?.db?.user || "root",
  password:
    (process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD) ??
    (config?.db?.password ?? ""),
  database:
    process.env.DB_NAME ||
    process.env.MYSQL_DATABASE ||
    config?.db?.database ||
    "attendance_db",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0,
};

const pool = mysql2.createPool(DB_CONFIG);

// Log connect test
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ Đã kết nối MySQL:", DB_CONFIG.database);
  } catch (err) {
    console.error("❌ Lỗi kết nối MySQL:", err?.message || err);
  }
})();

// ===================== INIT TABLES (face_embeddings) =====================
async function ensureFaceEmbeddingTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS face_embeddings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(50) NOT NULL,
      embedding JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_student (student_id),
      INDEX idx_student (student_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(sql);
  console.log("✅ Checked/Created table: face_embeddings");
}
ensureFaceEmbeddingTable().catch((e) =>
  console.error("❌ ensureFaceEmbeddingTable error:", e?.message || e)
);

// ===================== AXIOS (Flask client) =====================
// ✅ tăng timeout để tránh 504 khi Flask xử lý lâu
const axios = axiosLib.create({
  baseURL: FLASK_SERVER,
  timeout: 180000, // 180s
});

// ===================== LOGIN =====================
app.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === "admin" && password === "1234") {
    return res.json({ isAuthenticated: true, message: "Login successful" });
  }
  return res
    .status(401)
    .json({ isAuthenticated: false, message: "Invalid credentials" });
});

// ===================== STUDENTS ROUTER =====================
// ✅ Truyền đúng axios instance (để route students gọi flask ổn định)
app.use(
  "/api/students",
  createStudentsRouter({ pool, upload, UPLOAD_DIR, FLASK_SERVER, axios, fs, path })
);

// ===================== FACE ROUTER =====================
app.use(
  "/api/face",
  createFaceRouter({
    pool,
    axios,
    FLASK_SERVER,
    FACE_MATCH_THRESHOLD,
    dayjs,
  })
);

// ===================== TABLES LIST =====================
app.get("/api/tables", async (req, res) => {
  try {
    const [result] = await pool.query("SHOW TABLES");
    const tableNames = result
      .map((row) => Object.values(row)[0])
      .filter((name) => String(name).startsWith("attendance_"));
    res.json(tableNames);
  } catch (err) {
    console.error("❌ Lỗi truy vấn SHOW TABLES:", err?.message || err);
    return res.status(500).json({ error: "Không thể lấy danh sách bảng" });
  }
});

app.get("/api/table/:tableName", async (req, res) => {
  const { tableName } = req.params;
  if (!/^attendance_[\w]+$/.test(tableName)) {
    return res.status(400).json({ error: "Tên bảng không hợp lệ" });
  }

  try {
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
    res.json(rows);
  } catch (err) {
    console.error(`❌ Lỗi truy vấn bảng ${tableName}:`, err?.message || err);
    return res.status(500).json({ error: "Không thể truy vấn bảng" });
  }
});

// ===================== STATS DAY =====================
app.get("/api/stats-day", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "Missing date" });

  const tableName = `attendance_${dayjs(date).format("DDMMYYYY")}`;

  try {
    const [exists] = await pool.query("SHOW TABLES LIKE ?", [tableName]);
    if (exists.length === 0) return res.json([]);

    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);

    const result = rows.map((row) => {
      const inTime = dayjs(`${date} ${row.time_in}`, "YYYY-MM-DD HH:mm:ss");
      const outTime = dayjs(`${date} ${row.time_out}`, "YYYY-MM-DD HH:mm:ss");

      const hours =
        outTime.isValid() && inTime.isValid()
          ? outTime.diff(inTime, "minute") / 60
          : 0;

      const lateThreshold = dayjs(`${date} 08:00:00`, "YYYY-MM-DD HH:mm:ss");
      const late = inTime.isValid() ? inTime.isAfter(lateThreshold) : false;
      const earlyLeave =
        outTime.isValid() && inTime.isValid()
          ? outTime.diff(inTime, "second") < 8 * 3600
          : false;

      return {
        student_id: row.student_id,
        fullname: row.fullname || "",
        time_in: row.time_in || "-",
        time_out: row.time_out || "-",
        hours: hours.toFixed(2),
        late,
        early_leave: earlyLeave,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("❌ Lỗi tại /api/stats-day:", error?.message || error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===================== ERROR HANDLER =====================
app.use((err, req, res, next) => {
  if (!err) return next();
  console.error("❌ Global error:", err?.message || err);
  return res.status(400).json({ ok: false, error: err?.message || "Bad Request" });
});

// ===================== START =====================
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend đang chạy tại http://0.0.0.0:${PORT}`);
  console.log(
    `✅ Using DB: ${DB_CONFIG.database} @ ${DB_CONFIG.host}:${DB_CONFIG.port}`
  );
  console.log(`✅ Flask server base: ${FLASK_SERVER}`);
  console.log(`✅ Upload dir: ${UPLOAD_DIR}`);
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}, shutting down...`);
  try {
    server.close(() => console.log("✅ HTTP server closed"));
    await pool.end();
    console.log("✅ MySQL pool closed");
  } catch (e) {
    console.error("❌ Shutdown error:", e?.message || e);
  } finally {
    process.exit(0);
  }
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
