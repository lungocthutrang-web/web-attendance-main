import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }) {
  const location = useLocation();

  const ok = localStorage.getItem("adminAuth") === "true";

  // debug nhanh
  // console.log("AdminRoute:", { ok, path: location.pathname, adminAuth: localStorage.getItem("adminAuth") });

  if (!ok) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
