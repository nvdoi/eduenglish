"""
Script để khởi động server với cấu hình tự động
"""
import os
import sys
import subprocess
import time
from pathlib import Path

def check_requirements():
    """Kiểm tra và cài đặt requirements"""
    print("🔍 Kiểm tra dependencies...")
    
    try:
        import sentence_transformers
        import fastapi
        import uvicorn
        print("✅ Các dependencies đã được cài đặt")
        return True
    except ImportError as e:
        print(f"❌ Thiếu dependency: {e}")
        print("📦 Đang cài đặt requirements...")
        
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
            print("✅ Đã cài đặt dependencies thành công")
            return True
        except subprocess.CalledProcessError:
            print("❌ Lỗi khi cài đặt dependencies")
            return False

def check_embeddings():
    """Kiểm tra file embeddings"""
    embeddings_file = Path('./english_qa_embeddings.parquet')
    faq_file = Path('./faq_dataset.json')
    
    if not faq_file.exists():
        print(f"❌ Không tìm thấy {faq_file}")
        print("💡 Tip: File này nên nằm trong thư mục chatbot/")
        return False
    
    if not embeddings_file.exists():
        print("⚠️ Chưa có file embeddings. Bạn có muốn tạo không?")
        response = input("Nhập 'y' để tạo embeddings (mất ~2 phút): ")
        if response.lower() == 'y':
            try:
                print("\n🔄 Đang tạo embeddings...")
                result = subprocess.run(
                    [sys.executable, 'create_embeddings_st.py'],
                    capture_output=True,
                    text=True
                )
                print(result.stdout)
                if result.returncode == 0:
                    print("✅ Đã tạo embeddings thành công")
                    return True
                else:
                    print(f"❌ Lỗi: {result.stderr}")
                    return False
            except Exception as e:
                print(f"❌ Lỗi khi tạo embeddings: {e}")
                return False
        else:
            print("❌ Không thể khởi động server mà không có embeddings")
            return False
    
    print("✅ File embeddings đã tồn tại")
    return True

def setup_environment():
    """Thiết lập environment variables"""
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if not env_file.exists() and env_example.exists():
        print("⚙️ Tạo file .env từ .env.example...")
        with open(env_example, 'r', encoding='utf-8') as f:
            content = f.read()
        
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✅ Đã tạo file .env")
        print("⚠️ Vui lòng cập nhật GOOGLE_API_KEY trong file .env")
    
    # Load environment variables
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv()
        print("✅ Đã load environment variables")

def start_server():
    """Khởi động FastAPI server"""
    print("🚀 Khởi động English Learning RAG Chatbot Server...")
    print("📡 Server sẽ chạy tại: http://localhost:8000")
    print("📖 API docs tại: http://localhost:8000/docs")
    print("❤️ Health check tại: http://localhost:8000/health")
    print("\n" + "="*50)
    
    try:
        # Khởi động với uvicorn
        subprocess.run([
            sys.executable, '-m', 'uvicorn', 
            'improved_main:app',
            '--host', '0.0.0.0',
            '--port', '8000',
            '--reload',
            '--log-level', 'info'
        ])
    except KeyboardInterrupt:
        print("\n👋 Server đã dừng")
    except Exception as e:
        print(f"❌ Lỗi khi khởi động server: {e}")

def main():
    """Main function"""
    print("📚 English Learning RAG Chatbot Server Setup")
    print("="*45)
    
    # Kiểm tra requirements
    if not check_requirements():
        print("❌ Không thể tiếp tục do thiếu dependencies")
        return
    
    # Thiết lập environment
    setup_environment()
    
    # Kiểm tra embeddings
    if not check_embeddings():
        print("❌ Không thể tiếp tục do thiếu dữ liệu embeddings")
        return
    
    # Khởi động server
    start_server()

if __name__ == "__main__":
    main()
