// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ onLogout }) {
  return (
    <aside className="w-64 bg-blue-800 text-white flex flex-col p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Attendance System</h2>
      <nav className="flex flex-col space-y-2">
        <Link to="/home" className="hover:bg-blue-700 px-3 py-2 rounded">🏠 Home</Link>
        <Link to="/students" className="hover:bg-blue-700 px-3 py-2 rounded">📋 Employees</Link>
        <Link to="/attendance" className="hover:bg-blue-700 px-3 py-2 rounded">🕒 Attendance</Link>
      </nav>
      <div className="mt-auto">
        <button
  	 onClick={onLogout}
	 className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded mt-4">
          🔒 Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;