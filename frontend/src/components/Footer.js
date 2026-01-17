import React from 'react';

function Footer() {
  return (
    <footer className="bg-blue-600 text-white text-sm mt-10">
      {/* Container nội dung căn giữa */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* About */}
        <div>
          <h3 className="font-semibold mb-2">📘 About</h3>
          <p>
            A smart attendance system for managing check-ins with real-time analytics.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-2">✉ Contact</h3>
          <p>Email: <a href="mailto:attendancemaneger@gmail.com" className="underline hover:text-gray-200">attendancemaneger@gmail.com</a></p>
          <p>Phone: 0942949884</p>
        </div>
      </div>

      <div className="text-center text-gray-200 text-xs border-t border-blue-500 py-3">
        © {new Date().getFullYear()} Attendance System. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;

