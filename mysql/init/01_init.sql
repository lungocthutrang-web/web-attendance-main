CREATE DATABASE IF NOT EXISTS attendance_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE attendance_db;

-- Thông tin người dùng
CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(20) PRIMARY KEY,
  fullname   VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lưu embedding khuôn mặt (JSON)
CREATE TABLE IF NOT EXISTS face_embeddings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  embedding  JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_id (student_id),
  CONSTRAINT fk_face_student FOREIGN KEY (student_id)
    REFERENCES students(student_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Điểm danh
CREATE TABLE IF NOT EXISTS attendance (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  date       DATE NOT NULL,
  time_in    TIME NULL,
  time_out   TIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_student_date (student_id, date),
  INDEX idx_date (date),
  CONSTRAINT fk_att_student FOREIGN KEY (student_id)
    REFERENCES students(student_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);