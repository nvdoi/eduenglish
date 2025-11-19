"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Features() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const features = [
    {
      icon: "🤖",
      title: "Chat AI thông minh",
      description: "Trò chuyện với AI chatbot thông minh để luyện tập hội thoại tiếng Anh tự nhiên và cải thiện kỹ năng giao tiếp.",
      color: "from-violet-500 to-blue-500",
      link: "/chat-ai"
    },
    {
      icon: "✍️",
      title: "Sửa ngữ pháp",
      description: "AI phân tích và sửa lỗi ngữ pháp trong văn bản của bạn, giải thích chi tiết để bạn học hỏi và cải thiện.",
      color: "from-blue-500 to-cyan-500",
      link: "/grammar-check"
    },
    {
      icon: "📚",
      title: "Sổ tay từ vựng",
      description: "Lưu trữ và quản lý những từ vựng yêu thích của bạn, tìm kiếm và phân loại dễ dàng để ôn tập hiệu quả.",
      color: "from-cyan-500 to-teal-500",
      link: "/vocabulary"
    },
    {
      icon: "🎯",
      title: "Luyện thi IELTS/TOEIC",
      description: "Bài tập luyện thi chuyên sâu với đề thi thực tế, AI chấm điểm và đưa ra lời khuyên cải thiện.",
      color: "from-teal-500 to-green-500",
      link: "/exam-prep"
    },
    {
      icon: "🎧",
      title: "Luyện nghe nâng cao",
      description: "Luyện nghe với nhiều giọng điệu khác nhau, từ cơ bản đến nâng cao, có phụ đề và bài tập tương tác.",
      color: "from-green-500 to-emerald-500",
      link: "/listening"
    },
    {
      icon: "📊",
      title: "Báo cáo tiến độ",
      description: "Theo dõi quá trình học tập với biểu đồ chi tiết, thống kê điểm số và lộ trình học tập cá nhân hóa.",
      color: "from-emerald-500 to-purple-500",
      link: "/progress"
    }
  ];

  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Tính năng nổi bật
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Khám phá những công cụ AI mạnh mẽ giúp bạn học tiếng Anh hiệu quả và thú vị hơn bao giờ hết
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100/50 relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-violet-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8 font-medium">
                {feature.description}
              </p>

              {/* CTA */}
              <button 
                onClick={() => {
                  const target = feature.link;
                  if (!target) return;
                  if (!isLoggedIn) {
                    router.push(`/login?redirect=${encodeURIComponent(target)}`);
                  } else {
                    router.push(target);
                  }
                }}
                className={`w-full bg-gradient-to-r ${feature.color} hover:shadow-lg text-white py-4 px-6 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-md`}
              >
                Thử ngay
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl max-w-5xl mx-auto border border-gray-100/50">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">
              🎯 Tại sao chọn English AI?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Học nhanh</h4>
                <p className="text-gray-600 font-medium">AI cá nhân hóa giúp bạn học hiệu quả gấp 3 lần</p>
              </div>
              <div className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Chính xác</h4>
                <p className="text-gray-600 font-medium">Độ chính xác 98% trong việc sửa lỗi và gợi ý</p>
              </div>
              <div className="group text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🌟</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Thú vị</h4>
                <p className="text-gray-600 font-medium">Giao diện thân thiện, học tập không nhàm chán</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
