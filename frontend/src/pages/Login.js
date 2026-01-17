import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLoginSuccess, setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ ƯU TIÊN gọi relative để chạy ổn trong Docker + nginx proxy
  // Login sẽ tự thử các endpoint thường gặp
  const LOGIN_ENDPOINTS = [
    "/api/login",
    "/api/auth/login",
    "/api/admin/login",
    "/api/admin-login",
    "/login",
  ];

  const parseJsonSafe = async (res) => {
    try {
      return await res.json();
    } catch {
      return {};
    }
  };

  const isLoginSuccess = (res, data) => {
    if (!res.ok) return false;

    // nhiều backend trả các kiểu khác nhau
    if (data?.isAuthenticated === true) return true;
    if (data?.success === true) return true;
    if (data?.ok === true) return true;
    if (typeof data?.token === "string" && data.token.length > 0) return true;
    if (typeof data?.accessToken === "string" && data.accessToken.length > 0)
      return true;

    // nếu 200 mà không có cờ thất bại rõ ràng thì coi như OK
    if (data?.isAuthenticated === false) return false;
    if (data?.success === false) return false;

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      username,
      password,
      // ✅ thêm email để tương thích backend yêu cầu email
      email: username,
    };

    let lastErr = "";

    for (const url of LOGIN_ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await parseJsonSafe(res);

        if (isLoginSuccess(res, data)) {
          // ✅ khớp App.js (App đọc key "token")
          localStorage.setItem("token", "true");

          // nếu backend trả token thì lưu thêm (không bắt buộc)
          const realToken = data?.token || data?.accessToken;
          if (realToken) localStorage.setItem("accessToken", realToken);

          if (typeof onLoginSuccess === "function") onLoginSuccess();
          if (typeof setIsAuthenticated === "function") setIsAuthenticated(true);

          setTimeout(() => navigate("/home"), 100);
          return;
        }

        // 404 => thử endpoint khác
        if (res.status === 404) {
          lastErr = `HTTP 404 at ${url}`;
          continue;
        }

        // endpoint đúng nhưng login fail
        lastErr = data?.message
          ? `${data.message} (HTTP ${res.status} at ${url})`
          : `Login failed (HTTP ${res.status} at ${url})`;
        break;
      } catch (err) {
        lastErr = `Cannot connect to server (${url})`;
        // nếu network fail thì không cần thử tiếp nhiều
        break;
      }
    }

    setMessage(lastErr || "Login failed");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">ATTENDANCE SYSTEM</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
          >
            Sign In
          </button>
        </form>

        {message && (
          <p className="text-red-500 text-sm text-center mt-4">{message}</p>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 MySystem. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
