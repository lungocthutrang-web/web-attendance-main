# Student Attendance System using Face Recognition

## Introduction
This project develops an **automated student attendance system** using **face recognition**, carried out from **March 2025 – August 2025**.  
A **camera** captures students' faces to record their **check-in and check-out times**.  
Attendance data is stored in **MySQL** and synchronized with **Google Sheets** for easier management.  

Additionally, the system provides a **ReactJS Web App** with an intuitive interface that allows administrators to:
- Manage student profiles (add, edit, delete)
- View attendance records by **day, week, month, or year**
- Visualize data with **Recharts**
- Open detailed **modals** for student information
- Export **multi-page PDF reports** containing charts and tables

## Tech Stack
### Frontend
- React.js + Tailwind CSS
- Recharts (charts & graphs)
- Axios (API calls)
- jsPDF / Puppeteer (PDF export)

### Backend
- Node.js (Express) / Python (Flask/FastAPI)
- MySQL (Server Only)
- Google Sheets API (data sync)

###  Face Recognition
- Python (OpenCV + `face_recognition` or `facenet-pytorch`)
- Face embeddings for identification
- Store event snapshots with IN/OUT logs

### DevOps
- Docker & Docker Compose
- Nginx (reverse proxy)

# Web Attendance System

## Login
![Login Page](https://github.com/minguyenmaiai/Web-Attendance/blob/3b1e62202558588253d189ee62869d83ee798192/Picture1.png)

---

## Home (Charts & Statistics Table)
![Home Page - Chart](https://github.com/minguyenmaiai/Web-Attendance/blob/149dfbd53cd6281ce192adf5aaf4681bcdb4bdd3/Picture2.png)  
![Home Page - Table](https://github.com/minguyenmaiai/Web-Attendance/blob/149dfbd53cd6281ce192adf5aaf4681bcdb4bdd3/Picture3.png)

---

## Work Hours Statistics
**Work Hours Statistics Table of Each Employee by Week/Month/Year**  
![Work Hours](https://github.com/minguyenmaiai/Web-Attendance/blob/505fa721d196f5e01105c9b042bfc19acc4ad0c7/Picture4.png)

---

## Attendance Page
![Attendance](https://github.com/minguyenmaiai/Web-Attendance/blob/970c5bd149f1d3a9430589feec801667ca0cb576/Picture5.png)

---
## Manage Student

In the main content section, the title **“Students List”** represents the core function of the page, which is managing the list of students.  
Below it, there is a search box that allows filtering students by name, along with two functional buttons:  
- **Add Student** → Add a new student  
- **Reload** → Refresh the student data  

![Manage Student - 1](https://github.com/minguyenmaiai/Web-Attendance/blob/8faa1dafb8e108c0f4f49b21f37c562fbc632bea/Picture6.png)  

---

### Add Student
This feature allows the administrator to add new student information into the system.  

![Manage Student - 2](https://github.com/minguyenmaiai/Web-Attendance/blob/8faa1dafb8e108c0f4f49b21f37c562fbc632bea/Picture7.png)  

---

###Submit
After entering the required student details, click **Submit** to save the new student record into the database.  

![Manage Student - 3](https://github.com/minguyenmaiai/Web-Attendance/blob/8faa1dafb8e108c0f4f49b21f37c562fbc632bea/Picture9.png)

