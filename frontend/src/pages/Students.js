import React, { useEffect, useMemo, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api, { API_BASE } from "../lib/api";

function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/");
  };

  // ✅ Base của BACKEND để load ảnh uploads (tránh dính API_BASE=3003)
  // Ưu tiên env, nếu không có thì default 5050
  const BACKEND_BASE =
    process.env.REACT_APP_API_URL ||
    `http://${window.location.hostname}:${process.env.REACT_APP_API_PORT || "5050"}`;

  // ✅ Chuẩn hoá record để UI không undefined
  // (backend có thể trả student_id/employee_id, name/fullname, faculty/position, phone_number/phone...)
  const normalizeStudent = (s) => {
    const student_id = s?.student_id ?? s?.employee_id ?? "";
    return {
      student_id,
      photo_url: s?.photo_url ?? s?.photo ?? "",
      name: s?.name ?? s?.fullname ?? "",
      email: s?.email ?? "",
      gender: s?.gender ?? "",
      faculty: s?.faculty ?? s?.position ?? "",
      phone_number: s?.phone_number ?? s?.phone ?? "",
    };
  };

  // ✅ Resolve ảnh ổn định:
  // - DB đang lưu: /uploads/xxx.jpg
  // - Ảnh phục vụ bởi backend: http://localhost:5050/uploads/xxx.jpg
  const resolvePhotoUrl = (student) => {
    const p = student?.photo_url;
    if (!p) return "";
    const s = String(p).trim();
    if (!s) return "";

    // absolute rồi thì dùng luôn
    if (s.startsWith("http://") || s.startsWith("https://")) return s;

    const path = s.startsWith("/") ? s : `/${s}`;

    // Nếu là uploads -> luôn dùng BACKEND_BASE
    if (path.startsWith("/uploads/")) {
      return `${BACKEND_BASE}${path}`;
    }

    // Nếu tương lai bạn lưu kiểu /static/... hoặc /images/... thì vẫn fallback API_BASE
    return `${API_BASE}${path}`;
  };

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);

      // api instance sẽ gọi đúng theo ../lib/api của bạn (có thể là /api proxy hoặc 5050)
      const res = await api.get("/api/students");

      const arr = Array.isArray(res.data) ? res.data : [];
      setStudents(arr.map(normalizeStudent));
    } catch (err) {
      console.error("❌ Error fetching students:", err);
      toast.error(
        err?._prettyMessage || err?.message || "Failed to load student data."
      );
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (studentId) => {
    if (!studentId) return;

    const ok = window.confirm(
      `Are you sure you want to delete employee ID: ${studentId}?`
    );
    if (!ok) return;

    try {
      const res = await api.delete(`/api/students/${studentId}`);
      setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
      toast.success(res.data?.message || "Deleted.");
    } catch (err) {
      console.error("❌ Error deleting:", err);
      toast.error(
        `❌ Failed to delete: ${err?._prettyMessage || err?.message || "Error"}`
      );
    }
  };

  const filteredStudents = useMemo(() => {
    const key = searchTerm.trim().toLowerCase();
    if (!key) return students;

    return students.filter((student) =>
      Object.values(student).some((value) =>
        String(value ?? "").toLowerCase().includes(key)
      )
    );
  }, [students, searchTerm]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 bg-gray-100 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-blue-800">Students List</h1>

          <div className="flex items-center gap-3">
            <div className="text-gray-600">Hello, Admin 👋</div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-6 flex-1">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-700">Manage Students</h2>

            <div className="flex gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                onClick={() => navigate("/add-student")}
              >
                Add Student
              </button>

              <button
                onClick={fetchStudents}
                disabled={isLoading}
                className={`bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2 ${
                  isLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                      />
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>Reload</>
                )}
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />

          <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
            {isLoading ? (
              <p className="text-gray-500">Loading data...</p>
            ) : filteredStudents.length === 0 ? (
              <p>No students found.</p>
            ) : (
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-200 text-gray-700 text-left">
                  <tr>
                    <th className="p-2 border">#</th>
                    <th className="p-2 border">Face</th>
                    <th className="p-2 border">Employee ID</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Gender</th>
                    <th className="p-2 border">Faculty</th>
                    <th className="p-2 border">Phone Number</th>
                    <th className="p-2 border text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student, index) => {
                    const imgUrl = resolvePhotoUrl(student);

                    return (
                      <tr
                        key={student.student_id || `${index}`}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          navigate(`/students/${student.student_id}`, {
                            state: { index },
                          })
                        }
                      >
                        <td className="p-2 border">{index + 1}</td>

                        <td className="p-2 border">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt="face"
                              className="w-10 h-10 rounded-full object-cover border"
                              onClick={(e) => e.stopPropagation()}
                              onError={(e) => {
                                // fallback: hiện chữ nếu ảnh lỗi
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.insertAdjacentHTML(
                                    "beforeend",
                                    `<span class="text-xs text-gray-400">No image</span>`
                                  );
                                }
                              }}
                            />
                          ) : (
                            <span className="text-xs text-gray-400">No image</span>
                          )}
                        </td>

                        <td className="p-2 border">{student.student_id}</td>
                        <td className="p-2 border">{student.name}</td>
                        <td className="p-2 border">{student.gender}</td>
                        <td className="p-2 border">{student.faculty}</td>
                        <td className="p-2 border">{student.phone_number}</td>

                        <td className="p-2 border text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(student.student_id);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm p-1"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <div>
              API base (requests): <span className="font-mono">{API_BASE}</span>
            </div>
            <div>
              Backend base (images): <span className="font-mono">{BACKEND_BASE}</span>
            </div>
          </div>
        </main>

        <ToastContainer position="top-right" autoClose={3000} />
        <Footer />
      </div>
    </div>
  );
}

export default Students;
