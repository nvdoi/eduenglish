"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

interface Feature {
  icon: string;
  title: string;
  description: string;
  details: string[];
  color: string;
  href?: string;
}

export default function FeaturesPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const features: Feature[] = [
    {
      icon: "💬",
      title: "Chat AI thông minh",
      description: "Trò chuyện với AI chatbot được huấn luyện chuyên sâu về tiếng Anh. Luyện tập hội thoại tự nhiên, cải thiện phát âm và ngữ điệu.",
      details: [
        "Hỗ trợ 24/7 không giới hạn",
        "Nhận xét chi tiết về phát âm",
        "Chủ đề đa dạng từ cơ bản đến nâng cao",
        "Ghi nhớ tiến độ học tập cá nhân"
      ],
      color: "from-violet-500 to-purple-600",
      href: "/chat"
    },
    {
      icon: "✍️",
      title: "Sửa ngữ pháp AI",
      description: "AI phân tích và sửa lỗi ngữ pháp trong thời gian thực. Giải thích chi tiết từng lỗi để bạn hiểu và không lặp lại.",
      details: [
        "Phát hiện lỗi ngữ pháp chính xác 98%",
        "Giải thích lý do và cách sửa",
        "Gợi ý cách viết hay hơn",
        "Hỗ trợ nhiều thể loại văn bản"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "📚",
      title: "Sổ tay từ vựng",
      description: "Lưu trữ và quản lý những từ vựng yêu thích của bạn. Tìm kiếm, phân loại và ôn tập dễ dàng mọi lúc mọi nơi.",
      details: [
        "Lưu từ vựng yêu thích từ các khóa học",
        "Tìm kiếm và lọc theo loại từ",
        "Xem nghĩa, phiên âm và ví dụ",
        "Quản lý sổ tay cá nhân của bạn"
      ],
      color: "from-green-500 to-emerald-500",
      href: "/vocabulary"
    },
    {
      icon: "🔊",
      title: "Phát âm IPA",
      description: "Học phát âm chuẩn với bảng ký hiệu phiên âm quốc tế IPA. Nghe và luyện tập từng âm tiết một cách chính xác.",
      details: [
        "Bảng IPA đầy đủ nguyên âm và phụ âm",
        "Phát âm chuẩn từng ký hiệu",
        "Ví dụ minh họa dễ hiểu",
        "Luyện tập phát âm tương tác"
      ],
      color: "from-pink-500 to-rose-500",
      href: "/ipa"
    },
    {
      icon: "📊",
      title: "Báo cáo tiến độ",
      description: "Theo dõi tiến độ học tập chi tiết với biểu đồ trực quan. AI phân tích và đưa ra lời khuyên cải thiện.",
      details: [
        "Biểu đồ tiến độ trực quan",
        "Thống kê chi tiết theo kỹ năng",
        "So sánh với người học khác",
        "Đề xuất cải thiện cá nhân"
      ],
      color: "from-indigo-500 to-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Tính năng <span className="text-yellow-300">đột phá</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8">
            Khám phá những công nghệ AI tiên tiến giúp bạn học tiếng Anh hiệu quả gấp 10 lần
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              ✨ 98% độ chính xác
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              🚀 Học nhanh gấp 10x
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              🎯 Cá nhân hóa 100%
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => {
                    const target = feature.href
                      || (feature.title === "Sửa ngữ pháp AI" ? '/grammar-checker'
                      : feature.title === "Báo cáo tiến độ" ? '/progress-report'
                      : feature.title === "Sổ tay từ vựng" ? '/vocabulary'
                      : feature.title === "Phát âm IPA" ? '/ipa'
                      : undefined);

                    if (!target) {
                      toast('Tính năng đang được phát triển');
                      return;
                    }

                    if (!isLoggedIn) {
                      router.push(`/login?redirect=${encodeURIComponent(target)}`);
                    } else {
                      router.push(target);
                    }
                  }}
                  className={`w-full mt-8 bg-gradient-to-r ${feature.color} text-white py-3 px-6 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg`}
                >
                  Trải nghiệm ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-violet-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Sẵn sàng trải nghiệm tất cả tính năng?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Đăng ký miễn phí 7 ngày để khám phá sức mạnh của AI trong việc học tiếng Anh
          </p>
          <button className="bg-white text-violet-600 px-8 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-xl">
            🚀 Bắt đầu miễn phí
          </button>
        </div>
      </section>

    </div>
  );
}
