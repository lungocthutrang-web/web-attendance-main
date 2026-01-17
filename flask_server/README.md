# Flask Server (chạy ngoài Docker)

## 1) Cài Python packages
Mở terminal tại thư mục `flask_server/`:

```bash
pip install -r requirements.txt
```

## 2) Chạy Flask (python file)
```bash
python app.py
```

## 3) Cấu hình quan trọng (ENV)
Mặc định code đã phù hợp với setup của bạn:
- Flask: port 5001
- MySQL trong Docker map ra host port 3307
- Public base URL: http://192.168.102.4:5001

Nếu cần đổi, set ENV trước khi chạy:

### Windows PowerShell
```powershell
$env:FLASK_PORT="5001"
$env:PUBLIC_BASE_URL="http://192.168.102.4:5001"
$env:FLASK_DB_PORT="3307"
python app.py
```

## 4) API endpoints frontend đang gọi
- POST /start-stream  (nhận JSON form: student_id, fullname, ...)
- GET  /video_feed    (MJPEG stream)
- POST /take-image    (chụp ảnh, lưu vào uploads/<id>/avatar_*.jpg)
- DELETE /api/students/<id>/images?avatar=... (Node backend gọi khi xoá sinh viên)
- GET /uploads/<id>/<filename> (serve ảnh)

## 5) Lưu ý
Nếu DB schema khác `students(student_id, fullname, ..., photo_url)` thì hãy gửi schema cho mình để chỉnh SQL cho khớp.
