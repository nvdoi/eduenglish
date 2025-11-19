"use client";

import { useAuth } from '../contexts/AuthContext';

export default function CTA() {
  const { isLoggedIn } = useAuth();
  return (
    <section className="relative bg-violet-800 text-white py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-800 via-purple-800 to-indigo-900"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-300/10 rounded-full blur-xl animate-bounce"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl sm:text-6xl font-bold mb-8 tracking-tight leading-tight">
            {isLoggedIn ? 'Tiếp tục hành trình học tiếng Anh!' : 'Sẵn sàng bắt đầu hành trình học tiếng Anh?'}
          </h2>
          <p className="text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            {isLoggedIn 
              ? 'Khám phá các khóa học mới và nâng cao kỹ năng tiếng Anh của bạn với English AI.'
              : 'Tham gia cùng hàng nghìn học viên đã cải thiện tiếng Anh với English AI. Đăng ký miễn phí ngay hôm nay!'
            }
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🆓</div>
              <h3 className="text-xl font-bold mb-3">Miễn phí 7 ngày</h3>
              <p className="text-gray-200 font-medium">Trải nghiệm đầy đủ tính năng không mất phí</p>
            </div>
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h3 className="text-xl font-bold mb-3">Kết quả nhanh</h3>
              <p className="text-gray-200 font-medium">Cải thiện tiếng Anh chỉ sau 1 tuần</p>
            </div>
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-xl font-bold mb-3">Cá nhân hóa</h3>
              <p className="text-gray-200 font-medium">AI học theo phong cách riêng của bạn</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-6 mb-16">
            <button 
              onClick={() => window.location.href = isLoggedIn ? '/courses' : '/register'}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-12 py-5 rounded-2xl text-2xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
            >
              🚀 {isLoggedIn ? 'Vào học ngay' : 'Đăng ký miễn phí ngay'}
            </button>
            <p className="text-gray-300 text-lg font-medium">
              {isLoggedIn ? 'Tiếp tục hành trình học tập của bạn' : 'Không cần thẻ tín dụng • Hủy bất cứ lúc nào'}
            </p>
          </div>

          {/* Social Proof */}
          <div className="pt-8 border-t border-white/20">
            <p className="text-gray-300 mb-8 text-lg font-medium">Được tin tưởng bởi</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="bg-white/10 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors duration-300">
                <span className="font-bold text-lg">10,000+ học viên</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors duration-300">
                <span className="font-bold text-lg">⭐ 4.9/5 đánh giá</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors duration-300">
                <span className="font-bold text-lg">🏆 App của năm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
