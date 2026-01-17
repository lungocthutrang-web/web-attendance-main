import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      // ✅ gọi relative, nginx proxy /login về backend
      const r = await axios.post(`/login`, { username, password });

      if (r.data?.isAuthenticated) {
        localStorage.setItem("adminAuth", "true");
        const from = location.state?.from || "/employees";
        navigate(from, { replace: true });
      } else {
        setMsg("Login failed");
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white rounded-lg shadow p-6"
      >
        <h1 className="text-xl font-semibold text-blue-800 mb-4">Admin Login</h1>

        {msg && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
            {msg}
          </div>
        )}

        <label className="text-sm text-gray-600">Username</label>
        <input
          className="w-full mt-1 mb-3 px-3 py-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="text-sm text-gray-600">Password</label>
        <input
          type="password"
          className="w-full mt-1 mb-4 px-3 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded">
          Login
        </button>

        <div className="text-xs text-gray-500 mt-3">
          Backend đang check: admin / 1234
        </div>
      </form>
    </div>
  );
}
