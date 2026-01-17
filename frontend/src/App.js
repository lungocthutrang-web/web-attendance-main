import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import Attendance from "./pages/Attendance";
import FaceKiosk from "./pages/FaceKiosk";

import PrivateRoute from "./components/PrivateRoute";

function App() {
  // Đọc token 1 lần khi app load
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });

  // Login thành công -> set token + state
  const handleLoginSuccess = () => {
    localStorage.setItem("token", "true");
    setIsAuthenticated(true);
  };

  // Logout -> xoá token + state
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      {/* Vào web là vào home */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Home không cần login */}
      <Route path="/home" element={<Home />} />

      {/* Login */}
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />

      {/* Logout (tuỳ chọn) */}
      <Route path="/logout" element={<LogoutPage onLogout={handleLogout} />} />

      {/* Các trang cần login */}
      <Route
        path="/students"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Students onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      <Route
        path="/add-student"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <AddStudent onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Attendance onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      <Route
        path="/face-kiosk"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <FaceKiosk onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function LogoutPage({ onLogout }) {
  React.useEffect(() => {
    onLogout?.();
  }, [onLogout]);

  return <Navigate to="/login" replace />;
}

export default App;
