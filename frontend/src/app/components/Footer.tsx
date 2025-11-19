export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent mb-6">
              English AI
            </h3>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed font-medium text-lg">
              Học tiếng Anh thông minh với trí tuệ nhân tạo. Nâng cao kỹ năng ngôn ngữ của bạn một cách hiệu quả và thú vị.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Facebook"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="GitHub"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Liên kết</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-violet-400 transition-colors duration-300 font-medium">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-violet-400 transition-colors duration-300 font-medium">
                  Tính năng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-violet-400 transition-colors duration-300 font-medium">
                  Giá cả
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-violet-400 transition-colors duration-300 font-medium">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Hỗ trợ</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-violet-400 transition-colors duration-300 font-medium">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-violet-400 transition-colors duration-300 font-medium">
                  Điều khoản
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-violet-400 transition-colors duration-300 font-medium">
                  Chính sách
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-violet-400 transition-colors duration-300 font-medium">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-lg font-medium">
            © 2025 English AI. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
