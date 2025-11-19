# English Learning RAG Chatbot v2.0

## 🎯 Tổng Quan

English Learning RAG Chatbot đã được nâng cấp lên phiên bản 2.0 với những cải tiến đáng kể:

- ✅ **SentenceTransformers**: Thay thế Google Gemini Embedding để tránh quota limit
- ✅ **FAQ Dataset**: Sử dụng `faq_dataset.json` với 500+ câu hỏi về tiếng Anh
- ✅ **React Integration**: Tích hợp hoàn chỉnh với React frontend
- ✅ **Better Error Handling**: Xử lý lỗi và fallback responses
- ✅ **CORS Support**: Hỗ trợ cross-origin requests
- ✅ **Health Monitoring**: API health check và monitoring

## 🏗️ Kiến Trúc Hệ Thống

```
backend/chatbot/
├── improved_main.py           # FastAPI server chính
├── create_embeddings_st.py    # Script tạo embeddings
├── start_server.py           # Script khởi động server
├── requirements.txt          # Dependencies
├── .env.example             # Environment template
├── faq_dataset.json         # Dữ liệu FAQ học tiếng Anh (500+ entries)
├── english_qa_embeddings.parquet  # Embeddings (sẽ được tạo)
└── backup_original_main.py  # Backup code cũ

frontend/src/components/chatbot/
├── ChatBot.jsx              # Chat button component
├── ChatWindow.jsx           # Chat interface
└── ragChatBotResponses.js   # API integration
```

## 🚀 Hướng Dẫn Cài Đặt

### 1. Cài Đặt Dependencies

```bash
cd backend/chatbot
pip install -r requirements.txt
```

### 2. Cấu Hình Environment

```bash
# Copy file cấu hình
cp .env.example .env

# Chỉnh sửa .env và thêm Google API key
GOOGLE_API_KEY=your_actual_api_key_here
```

### 3. Tạo Embeddings

```bash
# Chạy script tạo embeddings
python create_embeddings_st.py
```

### 4. Khởi Động Server

```bash
# Cách 1: Sử dụng script tự động
python start_server.py

# Cách 2: Chạy trực tiếp
uvicorn improved_main:app --host 0.0.0.0 --port 8000 --reload
```

## 📡 API Endpoints

### POST `/ask`
Gửi câu hỏi và nhận câu trả lời từ RAG system

**Request:**
```json
{
  "question": "Làm sao để cơm không bị nhão?"
}
```

**Response:**
```json
{
  "llm_answers": "Để cơm không bị nhão, bạn cần...",
  "suggestions": ["Mẹo nấu cơm", "Tỉ lệ nước gạo"],
  "source": "rag",
  "score": 0.85,
  "similar_questions": [...]
}
```

### GET `/health`
Kiểm tra trạng thái hệ thống

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "data_loaded": true,
  "total_questions": 896
}
```

### GET `/`
Thông tin API và endpoints

## 🔧 Cấu Hình

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key | Required |
| `HOST` | Server host | 0.0.0.0 |
| `PORT` | Server port | 8000 |
| `ALLOWED_ORIGINS` | CORS origins | localhost:3000 |

### Model Configuration

- **SentenceTransformer Model**: `paraphrase-multilingual-MiniLM-L12-v2`
- **Embedding Dimension**: 384
- **Similarity Threshold**: 0.3
- **Top K Results**: 5

## 🎨 Frontend Integration

### React Components

1. **ChatBot.jsx**: Floating chat button
2. **ChatWindow.jsx**: Chat interface với typing indicators
3. **ragChatBotResponses.js**: API integration layer

### Sử Dụng

```jsx
import ChatBot from './components/chatbot/ChatBot';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatBot />
    </div>
  );
}
```

## 📊 Dữ Liệu

### FAQ Dataset Structure

```json
{
  "question": "Làm sao để cơm không bị nhão?",
  "answer": "Vo gạo sạch, canh tỉ lệ 1 gạo : 1.2 nước...",
  "category": "cooking",
  "tags": ["cơm", "nhão", "vo gạo", "tỉ lệ nước"]
}
```

### Embeddings

- **Format**: Parquet file
- **Columns**: question, answer, category, tags, embedding
- **Total Records**: 896 câu hỏi về nấu ăn

## 🔍 Monitoring & Debugging

### Health Check

```bash
curl http://localhost:8000/health
```

### Test API

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Làm sao để cơm không bị nhão?"}'
```

### Logs

Server logs sẽ hiển thị:
- 📝 Câu hỏi nhận được
- 🤖 Model loading status
- ✅ Response success với similarity score
- ❌ Errors và fallback responses

## 🚨 Troubleshooting

### Lỗi Thường Gặp

1. **"Model not loaded"**
   - Kiểm tra internet connection
   - Chờ model download hoàn tất

2. **"Embeddings file not found"**
   - Chạy `python create_embeddings_st.py`
   - Kiểm tra file `faq_dataset.json` tồn tại

3. **"CORS error"**
   - Kiểm tra ALLOWED_ORIGINS trong .env
   - Đảm bảo React dev server chạy đúng port

4. **"Google API quota exceeded"**
   - Hệ thống sẽ fallback sang responses cơ bản
   - Kiểm tra API key và quota

### Performance Tips

- **Cold Start**: Lần đầu khởi động mất 1-2 phút để load model
- **Memory Usage**: SentenceTransformer cần ~500MB RAM
- **Response Time**: 1-3 giây cho mỗi câu hỏi

## 🔄 Migration từ v1.0

### Thay Đổi Chính

1. **API Endpoint**: `/chat` → `/ask`
2. **Request Format**: `{query}` → `{question}`
3. **Response Format**: `{answer}` → `{llm_answers}`
4. **Embedding**: Google Gemini → SentenceTransformers
5. **Data Source**: Excel → JSON

### Backup

File `backup_original_main.py` chứa code cũ để tham khảo.

## 📈 Roadmap

- [ ] Add caching với Redis
- [ ] Implement conversation history
- [ ] Add more cooking datasets
- [ ] Multi-language support
- [ ] Docker containerization
- [ ] Production deployment guide

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

---

**Cookify RAG Chatbot v2.0** - Powered by SentenceTransformers & Google Gemini 🍳✨
