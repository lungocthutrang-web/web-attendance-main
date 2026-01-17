import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";

function Attendance() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTables = () => {
    axios
      .get(`/api/tables`)
      .then((res) => setTables(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err);
        toast.error("Lỗi khi tải danh sách bảng");
      });
  };

  const fetchTableData = (tableName) => {
    setLoading(true);
    setSelectedTable(tableName);

    axios
      .get(`/api/table/${tableName}`)
      .then((res) => setTableData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err);
        setTableData([]);
        toast.error(`Không tìm thấy bảng ${tableName}`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 bg-gray-50 flex flex-col">
          <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-blue-800">
              Attendance List
            </h1>
            <div className="text-gray-600">Hello, Admin 👋</div>
          </header>

          <main className="p-6 space-y-6 flex-1">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <button
                onClick={fetchTables}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                🔄 Refresh Tables
              </button>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="date"
                  className="text-sm font-medium text-gray-700"
                >
                  📅 Select date:
                </label>
                <input
                  type="date"
                  id="date"
                  className="border border-gray-300 rounded px-3 py-1 text-sm shadow-sm"
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    if (isNaN(selected)) return;
                    const formatted = format(selected, "ddMMyyyy");
                    const tableName = `attendance_${formatted}`;
                    fetchTableData(tableName);
                  }}
                />
              </div>
            </div>

            {!selectedTable && (
              <div>
                <h2 className="text-base font-semibold text-gray-600 mb-2">
                  📋 Attendance Tables
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tables.map((table) => {
                    const formattedDate = String(table)
                      .replace("attendance_", "")
                      .replace(/^(\d{2})(\d{2})(\d{4})$/, "$1/$2/$3");

                    return (
                      <button
                        key={table}
                        onClick={() => fetchTableData(table)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border shadow-sm transition ${
                          selectedTable === table
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white hover:bg-blue-50"
                        }`}
                      >
                        📅 Attendance {formattedDate}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTable && (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                >
                  📋 Attendance Tables
                </button>

                <h2 className="text-lg font-semibold text-blue-700">
                  📅 Data from:{" "}
                  <span className="font-mono">{selectedTable}</span>
                </h2>

                {loading ? (
                  <div className="text-gray-600">🔄 Loading...</div>
                ) : tableData.length === 0 ? (
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow-sm inline-block">
                    ⚠️ Table <span className="font-semibold">{selectedTable}</span>{" "}
                    does not exist or contains no data.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg shadow ring-1 ring-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                      <thead className="bg-blue-50 text-blue-800 text-sm font-semibold">
                        <tr>
                          <th className="px-4 py-3 text-left">#</th>
                          <th className="px-4 py-3 text-left">Employee ID</th>
                          <th className="px-4 py-3 text-left">Fullname</th>
                          <th className="px-4 py-3 text-left">Gender</th>
                          <th className="px-4 py-3 text-left">Time In</th>
                          <th className="px-4 py-3 text-left">Time Out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {tableData.map((row, index) => (
                          <tr
                            key={index}
                            className="hover:bg-blue-50 transition-colors even:bg-gray-50"
                          >
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{row.student_id || "N/A"}</td>
                            <td className="px-4 py-2">{row.fullname || "N/A"}</td>
                            <td className="px-4 py-2">{row.gender || "N/A"}</td>
                            <td className="px-4 py-2">{row.time_in || "N/A"}</td>
                            <td className="px-4 py-2">{row.time_out || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>

          <ToastContainer position="top-right" autoClose={3000} />
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Attendance;
