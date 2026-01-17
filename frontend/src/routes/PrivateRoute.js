import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();

  if (!isAuthenticated) {
    // chưa login -> về /login và nhớ trang đang muốn vào (vd: /employee)
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
