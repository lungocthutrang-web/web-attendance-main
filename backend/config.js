require("dotenv").config();

function trimSlash(s) {
  if (!s) return s;
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

const config = {
  server: {
    port: Number(process.env.PORT || 5050),
  },
  db: {
    host: process.env.DB_HOST || "mysql",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "attendance_user",
    password: process.env.DB_PASSWORD || "attendance_pass",
    database: process.env.DB_NAME || "attendance_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  flask: {
    // ✅ FLASK_URL là base, ví dụ http://flask:5001
    url: trimSlash(process.env.FLASK_URL || "http://flask:5001"),
  },
  mail: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
};

module.exports = config;
