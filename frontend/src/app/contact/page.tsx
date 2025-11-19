"use client";

export default function ContactPage() {
  const contactMethods = [
    {
      icon: "📧",
      title: "Email",
      description: "Gửi email cho chúng tôi",
      contact: "support@englishai.vn",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "📞",
      title: "Điện thoại",
      description: "Gọi hotline hỗ trợ",
      contact: "1900 1234",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat trực tiếp với tư vấn viên",
      contact: "Có mặt 24/7",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: "📍",
      title: "Văn phòng",
      description: "Đến trực tiếp văn phòng",
      contact: "123 Nguyễn Huệ, Q1, TP.HCM",
      color: "from-orange-500 to-red-500"
    }
  ];

  const team = [
    {
      name: "Nguyễn Văn A",
      role: "CEO & Founder",
      image: "👨‍💼",
      description: "10+ năm kinh nghiệm trong giáo dục và công nghệ AI"
    },
    {
      name: "Trần Thị B",
      role: "Head of Education",
      image: "👩‍🏫",
      description: "Chuyên gia giảng dạy tiếng Anh với 15 năm kinh nghiệm"
    },
    {
      name: "Lê Văn C",
      role: "AI Engineer",
      image: "👨‍💻",
      description: "Chuyên gia AI và Machine Learning từ Google"
    },
    {
      name: "Phạm Thị D",
      role: "Customer Success",
      image: "👩‍💼",
      description: "Đảm bảo trải nghiệm học tập tốt nhất cho học viên"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Liên hệ với <span className="text-yellow-300">chúng tôi</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn trong hành trình học tiếng Anh
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <p className="text-lg font-semibold">⚡ Phản hồi trong vòng 2 giờ</p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Nhiều cách để liên hệ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chọn cách liên hệ phù hợp nhất với bạn. Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giải đáp mọi thắc mắc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${method.color} flex items-center justify-center text-2xl mb-6 mx-auto shadow-lg`}>
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {method.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {method.description}
                </p>
                <p className="font-semibold text-gray-900">
                  {method.contact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Gửi tin nhắn cho chúng tôi
            </h2>
            <p className="text-xl text-gray-600">
              Điền form bên dưới và chúng tôi sẽ phản hồi trong vòng 24 giờ
            </p>
          </div>

          <form className="bg-gray-50 rounded-3xl p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chủ đề
                </label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300">
                  <option>Tư vấn gói học</option>
                  <option>Hỗ trợ kỹ thuật</option>
                  <option>Phản hồi dịch vụ</option>
                  <option>Hợp tác kinh doanh</option>
                  <option>Khác</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tin nhắn *
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                placeholder="Nhập tin nhắn của bạn..."
              ></textarea>
            </div>

            <div className="text-center">
              <button 
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-xl"
              >
                📤 Gửi tin nhắn
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Đội ngũ chuyên gia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gặp gỡ những con người đứng sau thành công của English AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center"
              >
                <div className="text-6xl mb-6">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-violet-600 font-semibold mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Vị trí văn phòng
            </h2>
            <p className="text-xl text-gray-600">
              Chúng tôi có mặt tại trung tâm thành phố, dễ dàng di chuyển
            </p>
          </div>

          <div className="bg-gray-200 rounded-3xl h-96 flex items-center justify-center shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Bản đồ văn phòng
              </p>
              <p className="text-gray-600">
                123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
              </p>
              <button 
                onClick={() => window.open('https://maps.google.com/?q=123+Nguyen+Hue+District+1+Ho+Chi+Minh+City', '_blank')}
                className="mt-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                Xem trên Google Maps
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-violet-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Sẵn sàng bắt đầu học tiếng Anh?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Đừng chần chừ nữa! Hãy liên hệ ngay để được tư vấn miễn phí
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/register'}
              className="bg-white text-violet-600 px-8 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-xl"
            >
              🚀 Dùng thử miễn phí
            </button>
            <button 
              onClick={() => window.open('tel:+84901234567')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white hover:text-violet-600 transition-all duration-300"
            >
              📞 Gọi tư vấn ngay
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
