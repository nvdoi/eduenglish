"use client";

export default function ListeningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Luyện nghe tiếng Anh
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Tính năng đang được phát triển. Sẽ sớm ra mắt!
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-6xl mb-4">🎧</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Đang phát triển
            </h2>
            <p className="text-gray-600 mb-6">
              Chúng tôi đang xây dựng hệ thống luyện nghe với AI. 
              Hãy quay lại sau nhé!
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              🏠 Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
