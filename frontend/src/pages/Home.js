import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function YourFace() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const [scanLoading, setScanLoading] = useState(false);
  const [result, setResult] = useState(null); // kết quả nhận diện + attendance

  const ENDPOINT_RECOGNIZE = `/api/face/recognize`;

  const startCamera = async () => {
    setError("");
    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setOpen(true);
    } catch (e) {
      setOpen(false);
      setError(
        e?.name === "NotAllowedError"
          ? "Bạn đã từ chối quyền camera. Hãy cho phép camera trong trình duyệt."
          : e?.name === "NotFoundError"
          ? "Không tìm thấy camera trên thiết bị."
          : `Không mở được camera: ${e?.message || e}`
      );
    }
  };

  const stopCamera = () => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) videoRef.current.srcObject = null;

    setOpen(false);
  };

  const captureBase64 = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return null;
    if (!open) return null;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, w, h);

    // data:image/jpeg;base64,....
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    return dataUrl;
  };

  const scanFace = async () => {
    setError("");
    setScanLoading(true);

    try {
      const image_base64 = captureBase64();
      if (!image_base64) {
        setError("Chưa mở camera hoặc không chụp được ảnh từ camera.");
        setScanLoading(false);
        return;
      }

      const now = new Date();
      const ymd = now.toISOString().slice(0, 10); // YYYY-MM-DD

      // ✅ THÊM DÒNG BẠN YÊU CẦU Ở ĐÂY
      const res = await axios.post(ENDPOINT_RECOGNIZE, { image_base64, date: ymd });
      console.log("RECOGNIZE RESPONSE:", res.data);
      setResult(res.data || null);
    } catch (e) {
      console.error(e);
      setResult(null);
      setError(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          `Scan thất bại: ${e?.message || e}`
      );
    } finally {
      setScanLoading(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matched = !!result?.matched;
  const empId =
    result?.employee?.employee_id ||
    result?.employee?.student_id ||
    result?.employee_id ||
    result?.student_id;
  const empName = result?.employee?.name || result?.name;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 bg-gray-50 flex flex-col">
          <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-blue-800">Your Face</h1>
            <div className="text-gray-600">Hello, Admin 👋</div>
          </header>

          <main className="p-6 space-y-6 flex-1">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={startCamera}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  📷 Open camera
                </button>

                {open && (
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    ⛔ Tắt camera
                  </button>
                )}

                <button
                  onClick={scanFace}
                  disabled={!open || scanLoading}
                  className={`px-4 py-2 rounded text-sm font-medium text-white ${
                    !open || scanLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {scanLoading ? "🔄 Scanning..." : "📸 Scan face"}
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Camera thường hoạt động tốt trên https hoặc http://localhost
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded border border-red-200 shadow-sm inline-block">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CAMERA CARD */}
              <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-4 space-y-3">
                <h2 className="text-base font-semibold text-gray-700">
                  📷 Camera Preview
                </h2>

                <div className="rounded-lg overflow-hidden bg-black w-full aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>

                {!open && (
                  <div className="text-sm text-gray-600">
                    Nhấn <span className="font-semibold">“📷 Open camera”</span>{" "}
                    để mở camera.
                  </div>
                )}

                {/* canvas ẩn để chụp frame */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* RESULT CARD */}
              <div className="bg-white rounded-lg shadow ring-1 ring-gray-200 p-4 space-y-3">
                <h2 className="text-base font-semibold text-gray-700">
                  ✅ Recognition & Attendance
                </h2>

                {!result ? (
                  <div className="text-sm text-gray-600">
                    Sau khi mở camera, nhấn{" "}
                    <span className="font-semibold">“📸 Scan face”</span> để quét
                    khuôn mặt và ghi time in / time out.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`px-4 py-2 rounded border shadow-sm inline-block ${
                        matched
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {matched
                        ? "✅ Match: Tìm thấy nhân viên"
                        : "⚠️ Không match: Chưa có nhân viên phù hợp"}
                    </div>

                    <div className="text-sm text-gray-700 space-y-1">
                      <div>
                        <span className="font-semibold">Employee ID:</span>{" "}
                        {empId || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold">Name:</span>{" "}
                        {empName || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold">Similarity:</span>{" "}
                        {typeof result?.similarity === "number"
                          ? result.similarity.toFixed(4)
                          : "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold">Action:</span>{" "}
                        {result?.action || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold">Time In:</span>{" "}
                        {result?.time_in || "N/A"}
                      </div>
                      <div>
                        <span className="font-semibold">Time Out:</span>{" "}
                        {result?.time_out || "N/A"}
                      </div>
                    </div>

                    {result?.message && (
                      <div className="text-sm text-gray-600">
                        💬 {result.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
