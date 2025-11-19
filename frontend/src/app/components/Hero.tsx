"use client";

import { useAuth } from '../contexts/AuthContext';

export default function Hero() {
  const { isLoggedIn } = useAuth();
  return (
    <section className="relative bg-gradient-to-br from-violet-600 via-blue-600 to-indigo-700 text-white overflow-hidden min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-24 h-24 bg-blue-300/10 rounded-full blur-2xl animate-bounce"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-violet-300/10 rounded-full blur-xl animate-pulse delay-700"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8 tracking-tight">
              Học tiếng Anh{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                thông minh
              </span>{" "}
              cùng AI
            </h1>
            <p className="text-xl lg:text-2xl text-gray-200 mb-10 max-w-2xl leading-relaxed font-medium">
              Nâng cao kỹ năng tiếng Anh với trí tuệ nhân tạo. Luyện tập hội thoại, sửa ngữ pháp và học từ vựng một cách hiệu quả nhất.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-16">
              <button 
                onClick={() => window.location.href = isLoggedIn ? '/courses' : '/register'}
                className="bg-white text-violet-600 px-10 py-4 rounded-2xl text-lg font-bold hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-xl"
              >
                🚀 {isLoggedIn ? 'Vào học ngay' : 'Bắt đầu học ngay'}
              </button>
              <button 
                onClick={() => window.location.href = '/features'}
                className="border-2 border-white/80 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:text-violet-600 transition-all duration-300 backdrop-blur-sm"
              >
                📖 Tìm hiểu thêm
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-12 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-yellow-300 group-hover:scale-110 transition-transform duration-300">10K+</div>
                <div className="text-gray-200 font-medium">Học viên</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-yellow-300 group-hover:scale-110 transition-transform duration-300">50+</div>
                <div className="text-gray-200 font-medium">Bài học</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-yellow-300 group-hover:scale-110 transition-transform duration-300">98%</div>
                <div className="text-gray-200 font-medium">Hài lòng</div>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Card */}
              <div className="w-96 h-96 lg:w-[420px] lg:h-[420px] bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <div className="text-8xl mb-6 animate-bounce">🤖</div>
                  <div className="text-3xl font-bold mb-3">AI Assistant</div>
                  <div className="text-gray-200 text-lg font-medium">Trợ lý học tiếng Anh thông minh</div>
                </div>
              </div>
              
              {/* Floating Feature Cards */}
              <div className="absolute -top-6 -left-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-orange-900 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg animate-bounce">
                💬 Chat AI
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-green-400 to-emerald-400 text-green-900 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg animate-pulse">
                ✅ Grammar Check
              </div>
              <div className="absolute top-1/2 -right-12 bg-gradient-to-r from-blue-400 to-cyan-400 text-blue-900 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg animate-bounce delay-300">
                📚 Vocabulary
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120L1440 120L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 120Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
