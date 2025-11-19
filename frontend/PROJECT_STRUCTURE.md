# English AI - Frontend Project Structure

## 📁 App Router Structure

### 🏠 Main Pages
- **`/`** - Homepage (Hero, Features, CTA)
- **`/features`** - Trang giới thiệu tính năng
- **`/contact`** - Trang liên hệ

### 📚 Courses Module
- **`/courses`** - Danh sách khóa học
- **`/courses/[id]`** - Chi tiết khóa học cụ thể
- **`/courses/demo`** - Khóa học demo với flashcard

### ✍️ Grammar Check
- **`/grammar-check`** - ⚠️ KHÔNG HOẠT ĐỘNG (code bị comment)
- **`/grammar-checker`** - ✅ ĐANG HOẠT ĐỘNG (trang chính thức)

### 🎯 Other Features
- **`/exam-prep`** - Trang luyện thi IELTS/TOEIC
- **`/listening`** - Trang luyện nghe
- **`/test`** - Trang kiểm tra trình độ
- **`/progress`** - Trang theo dõi tiến độ
- **`/login`** - Trang đăng nhập
- **`/register`** - Trang đăng ký

## 🔧 Technical Notes

### Next.js App Router
- Tất cả route files PHẢI có tên `page.tsx`
- Mỗi thư mục có file README.md mô tả chức năng
- Dynamic routes sử dụng `[id]` syntax

### Backend Integration
- Backend chạy trên port 5001 (auto-switch từ 5000)
- API endpoints được định nghĩa trong `/src/config/api.ts`
- MongoDB database: EnglishAI

### Key Features
- **Flashcard System**: Interactive 3D flip animations
- **Text-to-Speech**: Smart English voice selection
- **Responsive Design**: Mobile-first approach
- **AI Integration**: Grammar checking, course content

## 🚨 Important Notes

1. **Grammar Check Confusion**: 
   - `/grammar-check` có code bị comment → KHÔNG SỬ DỤNG
   - `/grammar-checker` là trang chính thức → SỬ DỤNG

2. **File Naming**: 
   - Không được đổi tên `page.tsx` thành tên khác
   - Sử dụng README.md để mô tả chức năng thay thế

3. **Navigation Links**:
   - Features page đã link đúng đến `/grammar-checker`
   - Tất cả routes đã được restore về cấu trúc chuẩn

## 📊 Current Status
✅ All routes working properly
✅ Backend connected (port 5001)
✅ MongoDB connected
✅ File structure organized with README files
