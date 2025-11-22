import os
from fastapi import FastAPI, HTTPException, APIRouter, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from typing import List, Optional
import logging
from dotenv import load_dotenv
import asyncio
import time
from datetime import datetime, timedelta
import threading
from contextlib import asynccontextmanager
import re

# Load environment variables từ .env file
load_dotenv()

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    logger.warning('GOOGLE_API_KEY not set in environment; Gemini calls may fail')
else:
    os.environ['GOOGLE_API_KEY'] = GOOGLE_API_KEY
    genai.configure(api_key=GOOGLE_API_KEY)

# Models
gemini_model = genai.GenerativeModel('models/gemini-2.0-flash')
sentence_model = None  # Sẽ được load sau

# Load dữ liệu embeddings
parquet_path = './english_qa_embeddings.parquet'
lessons_parquet = './english_lessons_embeddings.parquet'
df = None

# Auto sync configuration
LAST_SYNC_TIME = None
SYNC_INTERVAL_MINUTES = 30  # Sync every 30 minutes
AUTO_SYNC_ENABLED = True

# Mongo config for optional admin indexing (optional)
try:
    from pymongo import MongoClient
    from bson import ObjectId
    MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    MONGO_DB = os.getenv('MONGODB_DB', 'english_learning')
    MONGO_COLL = os.getenv('MONGODB_COLLECTION', 'lessons')
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    lessons_coll = mongo_client[MONGO_DB][MONGO_COLL]
    logger.info("✅ MongoDB connected (optional feature)")
except Exception as mongo_error:
    logger.warning(f"⚠️ MongoDB không khả dụng (optional): {mongo_error}")
    mongo_client = None
    lessons_coll = None
    MongoClient = None
    ObjectId = None

def load_data():
    global df, sentence_model
    try:
        # Load FAQ embeddings
        if os.path.exists(parquet_path):
            df_faq = pd.read_parquet(parquet_path)
            df_faq['source_type'] = 'faq'
            logger.info(f"✅ Đã load {len(df_faq)} câu hỏi từ {parquet_path}")
        else:
            logger.warning(f"⚠️ Không tìm thấy file {parquet_path}. Vui lòng chạy create_embeddings_st.py trước.")
            df_faq = pd.DataFrame()

        # Load lesson embeddings if exist
        if os.path.exists(lessons_parquet):
            df_lessons = pd.read_parquet(lessons_parquet)
            df_lessons['source_type'] = 'lessons'
            logger.info(f"✅ Đã load {len(df_lessons)} lesson embeddings từ {lessons_parquet}")
        else:
            df_lessons = pd.DataFrame()

        # Normalize/concat
        if not df_faq.empty and not df_lessons.empty:
            # Ensure both have common columns
            df = pd.concat([df_faq, df_lessons], ignore_index=True)
        elif not df_faq.empty:
            df = df_faq.copy()
        elif not df_lessons.empty:
            df = df_lessons.copy()
        else:
            df = pd.DataFrame()

        # Load SentenceTransformer model
        logger.info("🤖 Đang load SentenceTransformer model...")
        sentence_model = SentenceTransformer(os.getenv('SENTENCE_MODEL_NAME', 'paraphrase-multilingual-MiniLM-L12-v2'))
        logger.info("✅ Đã load SentenceTransformer model")

    except Exception as e:
        logger.error(f"❌ Lỗi khi load dữ liệu: {e}")
        df = pd.DataFrame()
        sentence_model = None


async def retry_gemini_call(prompt: str, max_retries: int = 3, base_delay: float = 1.0) -> str:
    """Retry Gemini API call with exponential backoff"""
    for attempt in range(max_retries):
        try:
            response = gemini_model.generate_content(prompt)
            return response.text
        except Exception as e:
            error_msg = str(e)
            logger.warning(f"Gemini API attempt {attempt + 1} failed: {error_msg}")
            
            # Check if it's a quota error
            if "429" in error_msg or "quota" in error_msg.lower():
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)  # Exponential backoff
                    logger.info(f"Quota exceeded, waiting {delay} seconds before retry...")
                    await asyncio.sleep(delay)
                    continue
                else:
                    logger.error("Max retries reached for Gemini API")
                    raise e
            else:
                # For non-quota errors, raise immediately
                raise e
    
    raise Exception("Max retries exceeded")


def sync_courses_from_mongodb():
    """Sync course data from MongoDB to local embeddings"""
    global df, LAST_SYNC_TIME
    
    if lessons_coll is None:
        logger.warning("MongoDB not available for sync")
        return False
    
    try:
        logger.info("🔄 Starting auto sync from MongoDB...")
        
        # Get all lessons from MongoDB
        cursor = lessons_coll.find({})
        lessons = list(cursor)
        
        if not lessons:
            logger.info("No lessons found in MongoDB")
            return True
        
        logger.info(f"Found {len(lessons)} lessons in MongoDB")
        
        # Process lessons and create embeddings
        new_rows = []
        for lesson in lessons:
            try:
                text = build_text_for_embedding(lesson)
                if sentence_model:
                    embedding = sentence_model.encode([text])[0].astype(np.float32)
                    
                    new_row = {
                        'question': text,
                        'answer': (lesson.get('content') or lesson.get('description') or lesson.get('explanation') or '')[:2000],
                        'category': lesson.get('category', 'lessons'),
                        'embedding': embedding.tolist(),
                        'meta': {'lesson_id': str(lesson.get('_id')), 'title': lesson.get('title'), 'source': 'lessons'},
                        'source_type': 'lessons'
                    }
                    new_rows.append(new_row)
            except Exception as e:
                logger.warning(f"Failed to process lesson {lesson.get('_id')}: {e}")
                continue
        
        if new_rows:
            # Save to parquet
            df_new_lessons = pd.DataFrame(new_rows)
            df_new_lessons.to_parquet(lessons_parquet, index=False)
            
            # Update in-memory df
            if df is None or df.empty:
                df = df_new_lessons.copy()
            else:
                # Remove old lessons and add new ones
                df_filtered = df[df['source_type'] != 'lessons']
                df = pd.concat([df_filtered, df_new_lessons], ignore_index=True)
            
            logger.info(f"✅ Synced {len(new_rows)} lessons from MongoDB")
        
        LAST_SYNC_TIME = datetime.now()
        return True
        
    except Exception as e:
        logger.error(f"❌ Error during MongoDB sync: {e}")
        return False


def should_sync() -> bool:
    """Check if it's time to sync"""
    if not AUTO_SYNC_ENABLED or LAST_SYNC_TIME is None:
        return True
    
    time_since_sync = datetime.now() - LAST_SYNC_TIME
    return time_since_sync > timedelta(minutes=SYNC_INTERVAL_MINUTES)


def background_sync_task():
    """Background task for periodic sync"""
    while AUTO_SYNC_ENABLED:
        try:
            if should_sync():
                sync_courses_from_mongodb()
            time.sleep(60)  # Check every minute
        except Exception as e:
            logger.error(f"Background sync error: {e}")
            time.sleep(300)  # Wait 5 minutes on error


def build_text_for_embedding(lesson):
    title = lesson.get('title') or lesson.get('name') or ''
    topics = lesson.get('topics', [])
    if isinstance(topics, list):
        topics_text = ', '.join([str(t) for t in topics])
    else:
        topics_text = str(topics)
    content = lesson.get('content', '') or lesson.get('description', '') or lesson.get('explanation', '')
    content_snip = content[:2000]
    text = f"Title: {title}\nTopics: {topics_text}\nContent: {content_snip}"
    return text


# Admin router for indexing
admin_router = APIRouter(prefix='/admin')


def clean_markdown_response(text):
    """Clean up excessive markdown formatting from AI responses"""
    if not text:
        return text
    
    # Remove excessive bold formatting (more than 2 consecutive **)
    text = re.sub(r'\*{3,}', '', text)
    
    # Convert proper bold (**text**) to normal text for cleaner display
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    
    # Remove excessive asterisks at line beginnings
    text = re.sub(r'^\*\s+', '', text, flags=re.MULTILINE)
    
    # Clean up multiple consecutive asterisks (but keep single ones for emphasis)
    text = re.sub(r'\*{2,}', '', text)
    
    # Fix spacing around punctuation
    text = re.sub(r'\s+([.,!?])', r'\1', text)
    
    # Remove excessive newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Clean up bullet points with excessive asterisks
    text = re.sub(r'^\*{2,}\s+', '• ', text, flags=re.MULTILINE)
    
    # Remove other markdown formatting
    text = re.sub(r'__(.*?)__', r'\1', text)
    text = re.sub(r'_(.*?)_', r'\1', text)
    text = re.sub(r'`(.*?)`', r'\1', text)
    text = re.sub(r'~~(.*?)~~', r'\1', text)
    
    return text.strip()


@admin_router.post('/index_lesson')
async def index_lesson(payload: dict):
    """Index a single lesson from MongoDB into the lesson parquet and update in-memory df.
    payload expects: { 'lesson_id': '<id string>' }
    """
    if lessons_coll is None:
        raise HTTPException(status_code=503, detail='MongoDB not available')
    
    lesson_id = payload.get('lesson_id')
    if not lesson_id:
        raise HTTPException(status_code=400, detail='lesson_id required')

    # try to convert to ObjectId
    try:
        oid = ObjectId(lesson_id)
    except Exception:
        # use as string id
        oid = lesson_id

    doc = lessons_coll.find_one({'_id': oid}) if isinstance(oid, ObjectId) else lessons_coll.find_one({'_id': lesson_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Lesson not found in MongoDB')

    # Build text and create embedding
    if sentence_model is None:
        raise HTTPException(status_code=500, detail='Sentence model not loaded')

    text = build_text_for_embedding(doc)
    embedding = sentence_model.encode([text])[0].astype(np.float32)

    new_row = {
        'question': text,
        'answer': (doc.get('content') or doc.get('description') or doc.get('explanation') or '')[:2000],
        'category': doc.get('category', 'lessons'),
        'embedding': embedding.tolist(),
        'meta': {'lesson_id': str(doc.get('_id')), 'title': doc.get('title'), 'source': 'lessons'},
        'source_type': 'lessons'
    }

    # Append to lessons_parquet
    try:
        if os.path.exists(lessons_parquet):
            df_existing = pd.read_parquet(lessons_parquet)
            df_new = pd.concat([df_existing, pd.DataFrame([new_row])], ignore_index=True)
        else:
            df_new = pd.DataFrame([new_row])
        df_new.to_parquet(lessons_parquet, index=False)
    except Exception as e:
        logger.error(f'Failed to append lesson parquet: {e}')
        raise HTTPException(status_code=500, detail='Failed to save lesson embedding')

    # Update in-memory df
    global df
    try:
        if df is None or df.empty:
            df = pd.DataFrame([new_row])
        else:
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    except Exception as e:
        logger.warning(f'Failed to update in-memory df: {e}')

    return {'ok': True, 'lesson_id': str(doc.get('_id'))}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting English Learning RAG Chatbot...")
    
    # Start background sync task
    if AUTO_SYNC_ENABLED and lessons_coll is not None:
        sync_thread = threading.Thread(target=background_sync_task, daemon=True)
        sync_thread.start()
        logger.info("🔄 Background sync task started")
        
        # Initial sync
        try:
            sync_courses_from_mongodb()
        except Exception as e:
            logger.warning(f"Initial sync failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down English Learning RAG Chatbot...")


app = FastAPI(
    title="English Learning RAG Chatbot API",
    description="API cho chatbot tư vấn học tiếng Anh sử dụng RAG với SentenceTransformers",
    version="2.1.0",
    lifespan=lifespan
)

# Cấu hình CORS cho React frontend
allowed = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register admin router
app.include_router(admin_router)

# Load dữ liệu khi khởi động
load_data()

class Question(BaseModel):
    question: str

class ChatResponse(BaseModel):
    llm_answers: str
    suggestions: Optional[List[str]] = []
    source: str = "rag"
    score: Optional[float] = None
    similar_questions: Optional[List[dict]] = []

def search_similar_embeddings(query_embedding: np.ndarray, df: pd.DataFrame, top_k: int = 5, threshold: float = 0.3) -> pd.DataFrame:
    """Tìm kiếm câu hỏi tương đồng sử dụng cosine similarity"""
    if df.empty:
        return pd.DataFrame()
    
    try:
        query_vector = np.array(query_embedding, dtype=np.float32).reshape(1, -1)
        embedding_matrix = np.array(df['embedding'].tolist(), dtype=np.float32)
        
        similarities = cosine_similarity(query_vector, embedding_matrix)[0]
        
        # Gán similarity vào DataFrame
        df_with_similarity = df.copy()
        df_with_similarity['similarity'] = similarities
        
        # Lọc theo ngưỡng và sắp xếp
        result = (
            df_with_similarity[df_with_similarity['similarity'] >= threshold]
            .sort_values(by='similarity', ascending=False)
            .head(top_k)
        )
        
        return result[['question', 'answer', 'category', 'similarity']]
    
    except Exception as e:
        logger.error(f"Lỗi trong search_similar_embeddings: {e}")
        return pd.DataFrame()

@app.post("/ask", response_model=ChatResponse)
async def receive_question(data: Question, background_tasks: BackgroundTasks):
    """API endpoint để xử lý câu hỏi từ chatbot"""
    try:
        question = data.question.strip()
        
        if not question:
            raise HTTPException(status_code=400, detail="Câu hỏi không được để trống")
        
        logger.info(f"📝 Nhận câu hỏi: {question}")
        
        # Trigger sync if needed (non-blocking)
        if should_sync():
            background_tasks.add_task(sync_courses_from_mongodb)
        
        # Kiểm tra model và dữ liệu
        if sentence_model is None or df.empty:
            return ChatResponse(
                llm_answers="Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau! 😅",
                source="error",
                suggestions=["Thử lại", "Hỏi câu khác"]
            )
        
        # Tạo embedding cho câu hỏi
        question_embedding = sentence_model.encode([question])[0]
        
        # Tìm kiếm câu hỏi tương đồng
        retrieval_docs = search_similar_embeddings(
            query_embedding=question_embedding, 
            df=df, 
            top_k=5, 
            threshold=0.3
        )
        
        # Tạo context từ các câu hỏi tương đồng
        if not retrieval_docs.empty:
            document = "\n\n".join(
                f"Câu hỏi: {row['question']}\nTrả lời: {row['answer']}\nDanh mục: {row['category']}"
                for _, row in retrieval_docs.iterrows()
            )
            
            # Tạo suggestions từ các câu hỏi tương đồng
            suggestions = [
                row['question'][:50] + "..." if len(row['question']) > 50 else row['question']
                for _, row in retrieval_docs.head(3).iterrows()
            ]
            
            similar_questions = [
                {
                    "question": row['question'],
                    "answer": row['answer'][:100] + "..." if len(row['answer']) > 100 else row['answer'],
                    "similarity": float(row['similarity']),
                    "category": row['category']
                }
                for _, row in retrieval_docs.head(3).iterrows()
            ]
            
            max_similarity = float(retrieval_docs['similarity'].max())
            
        else:
            document = "Không tìm thấy thông tin liên quan trong cơ sở dữ liệu."
            suggestions = ["Ngữ pháp cơ bản", "Từ vựng thông dụng", "Phát âm tiếng Anh"]
            similar_questions = []
            max_similarity = 0.0
        
        # Tạo prompt cho Gemini
        prompt = f"""
Bạn là English AI Assistant - một trợ lý ảo chuyên về học tiếng Anh. 
Hãy trả lời câu hỏi của người dùng một cách thân thiện, hữu ích và chính xác.

QUAN TRỌNG: Trả lời bằng văn bản thuần túy, KHÔNG dùng định dạng markdown (không dùng **bold**, *italic*, `code`, headers, v.v.).

Nếu có thông tin từ cơ sở dữ liệu, hãy sử dụng và tham khảo. 
Nếu không có thông tin cụ thể, hãy đưa ra lời khuyên chung về học tiếng Anh dựa trên kiến thức của bạn.
Luôn trả lời bằng tiếng Việt và giữ giọng điệu thân thiện, hỗ trợ học tập.

Bạn có thể giúp về:
- Ngữ pháp tiếng Anh (grammar)
- Từ vựng (vocabulary) 
- Phát âm (pronunciation)
- Kỹ năng giao tiếp
- Luyện thi IELTS/TOEFL
- Các mẹo học tiếng Anh hiệu quả

Câu hỏi: {question}

Thông tin tham khảo:
{document}

Hãy trả lời một cách ngắn gọn, dễ hiểu và hữu ích cho việc học tiếng Anh.
"""
        
        # Gọi Gemini API với retry logic
        try:
            raw_answer = await retry_gemini_call(prompt, max_retries=3, base_delay=2.0)
            # Clean up markdown formatting
            answer = clean_markdown_response(raw_answer)
            source = "rag" if not retrieval_docs.empty else "general"
            
        except Exception as gemini_error:
            logger.error(f"Lỗi Gemini API: {gemini_error}")
            # Enhanced fallback response
            if not retrieval_docs.empty:
                # Use the best matching answer from RAG
                best_match = retrieval_docs.iloc[0]
                answer = f"""Dựa trên thông tin tôi có về "{best_match['category']}":

{best_match['answer']}

💡 Lưu ý: Đây là câu trả lời từ cơ sở dữ liệu do hệ thống AI tạm thời không khả dụng."""
                source = "fallback_rag"
            else:
                # Generic helpful response when no RAG data available
                answer = """Xin lỗi, hệ thống AI tạm thời không khả dụng. 

Tuy nhiên, tôi có thể gợi ý một số chủ đề học tiếng Anh phổ biến:
• Ngữ pháp cơ bản (Basic Grammar)
• Từ vựng hàng ngày (Daily Vocabulary) 
• Phát âm tiếng Anh (Pronunciation)
• Giao tiếp cơ bản (Basic Communication)

Vui lòng thử lại sau hoặc hỏi về các chủ đề cụ thể! 😊"""
                source = "fallback_general"
        
        logger.info(f"✅ Trả lời thành công với similarity: {max_similarity:.3f}")
        
        return ChatResponse(
            llm_answers=answer,
            suggestions=suggestions,
            source=source,
            score=max_similarity,
            similar_questions=similar_questions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Lỗi không mong muốn: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại!"
        )

@app.get("/health")
async def health_check():
    """Enhanced health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": sentence_model is not None,
        "data_loaded": not df.empty if df is not None else False,
        "total_questions": len(df) if df is not None and not df.empty else 0,
        "mongodb_connected": lessons_coll is not None,
        "auto_sync_enabled": AUTO_SYNC_ENABLED,
        "last_sync": LAST_SYNC_TIME.isoformat() if LAST_SYNC_TIME else None,
        "gemini_api_configured": GOOGLE_API_KEY is not None
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "English Learning RAG Chatbot API",
        "version": "2.1.0",
        "description": "API cho chatbot tư vấn học tiếng Anh với auto sync",
        "endpoints": {
            "/ask": "POST - Gửi câu hỏi về tiếng Anh",
            "/health": "GET - Kiểm tra trạng thái",
            "/sync": "POST - Trigger manual sync from MongoDB",
            "/sync/status": "GET - Check sync status",
            "/docs": "GET - API documentation"
        }
    }


@app.post("/sync")
async def manual_sync():
    """Manually trigger sync from MongoDB"""
    try:
        result = sync_courses_from_mongodb()
        if result:
            return {
                "status": "success",
                "message": "Sync completed successfully",
                "last_sync": LAST_SYNC_TIME.isoformat() if LAST_SYNC_TIME else None,
                "total_records": len(df) if df is not None else 0
            }
        else:
            return {
                "status": "failed",
                "message": "Sync failed - check logs for details"
            }
    except Exception as e:
        logger.error(f"Manual sync error: {e}")
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@app.get("/sync/status")
async def sync_status():
    """Get current sync status"""
    return {
        "auto_sync_enabled": AUTO_SYNC_ENABLED,
        "sync_interval_minutes": SYNC_INTERVAL_MINUTES,
        "last_sync_time": LAST_SYNC_TIME.isoformat() if LAST_SYNC_TIME else None,
        "next_sync_due": should_sync(),
        "mongodb_connected": lessons_coll is not None,
        "total_records": len(df) if df is not None and not df.empty else 0,
        "lesson_records": len(df[df['source_type'] == 'lessons']) if df is not None and not df.empty and 'source_type' in df.columns else 0,
        "faq_records": len(df[df['source_type'] == 'faq']) if df is not None and not df.empty and 'source_type' in df.columns else 0
    }