import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import api, { API_BASE } from "../lib/api";

export default function AddStudent() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    email: "",
    gender: "",
    faculty: "",
    phone_number: "",
  });

  // ✅ file state
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    const employee_id = String(form.employee_id || "").trim();
    const name = String(form.name || "").trim();

    if (!employee_id || !name) {
      toast.error("Employee ID và Name là bắt buộc.");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();

      /**
       * ✅ BACKEND của bạn đang đọc: req.body.student_id
       * -> Giữ UI là employee_id nhưng gửi student_id cho backend
       */
      fd.append("student_id", employee_id);

      /**
       * (Tuỳ chọn) Nếu bạn muốn backend tương lai vẫn nhận employee_id
       * thì cứ gửi thêm field này cũng không sao.
       */
      fd.append("employee_id", employee_id);

      fd.append("name", name);

      // optional fields
      fd.append("email", String(form.email || "").trim());
      fd.append("gender", String(form.gender || "").trim());
      fd.append("faculty", String(form.faculty || "").trim());
      fd.append("phone_number", String(form.phone_number || "").trim());

      /**
       * ✅ BACKEND multer: upload.single("face_image")
       * -> file key PHẢI là "face_image"
       */
      if (photo) fd.append("face_image", photo);

      // ✅ gọi relative /api để đi qua nginx proxy
      await api.post("/api/students", fd);

      toast.success("Saved successfully!");
      setTimeout(() => navigate("/employees"), 400);
    } catch (err) {
      console.error("❌ Save error:", err);

      // nếu backend trả json {error:"..."} thì ưu tiên hiển thị
      const msg =
        err?.response?.data?.error ||
        err?._prettyMessage ||
        err?.message ||
        "Network Error";

      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 bg-gray-100 flex flex-col">
        <main className="p-6 flex-1">
          <h1 className="text-2xl font-semibold text-blue-800 mb-4">
            Add Student
          </h1>

          <form
            onSubmit={onSubmit}
            className="bg-white p-6 rounded-lg shadow max-w-3xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  name="employee_id"
                  value={form.employee_id}
                  onChange={onChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="Enter employee id"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Gender</label>
                <input
                  name="gender"
                  value={form.gender}
                  onChange={onChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="Enter gender"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Faculty</label>
                <input
                  name="faculty"
                  value={form.faculty}
                  onChange={onChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="Enter faculty"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Phone Number</label>
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={onChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Face Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className="w-full mt-1"
                />
                {photo && (
                  <div className="text-xs text-gray-500 mt-1">
                    Selected: {photo.name}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded ${
                  saving ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/employees")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded"
              >
                Cancel
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              API base: <span className="font-mono">{API_BASE}</span>
            </div>
          </form>
        </main>

        <ToastContainer position="top-right" autoClose={3000} />
        <Footer />
      </div>
    </div>
  );
}
