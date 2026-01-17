// backend/routes/face.js
"use strict";

const express = require("express");

module.exports = function createFaceRouter({
  pool,
  axios, // axios instance đã baseURL = FLASK_SERVER
  FLASK_SERVER,
  FACE_MATCH_THRESHOLD,
  dayjs,
}) {
  const router = express.Router();

  // ✅ test route
  router.get("/ping", (req, res) => {
    res.json({
      ok: true,
      message: "face router is working",
      flask: FLASK_SERVER,
      threshold: FACE_MATCH_THRESHOLD,
    });
  });

  // ✅ frontend đang gọi: POST /api/face/recognize
  router.post("/recognize", async (req, res) => {
    try {
      const { image_base64, date } = req.body || {};
      if (!image_base64) {
        return res.status(400).json({ error: "Missing image_base64" });
      }

      // ✅ TẠM THỜI: trả demo để bạn confirm hết 404 trước
      // Sau khi hết 404, mình sẽ giúp bạn gắn logic gọi Flask + match + time in/out
      return res.json({
        matched: false,
        similarity: 0,
        action: "NONE",
        time_in: null,
        time_out: null,
        message:
          "✅ /api/face/recognize OK (demo). Backend chưa gắn logic nhận diện thật.",
        date: date || dayjs().format("YYYY-MM-DD"),
      });
    } catch (err) {
      console.error("❌ POST /api/face/recognize error:", err?.message || err);
      return res.status(500).json({ error: "Recognize failed" });
    }
  });

  return router;
};
