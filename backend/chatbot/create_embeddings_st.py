"""
Script để tạo embeddings sử dụng SentenceTransformers với faq_dataset.json
"""
import json
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import os
from tqdm import tqdm

def load_faq_data(file_path):
    """Load FAQ data from JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Đã load {len(data)} câu hỏi từ {file_path}")
        return data
    except Exception as e:
        print(f"❌ Lỗi khi đọc file {file_path}: {e}")
        return None

def create_embeddings_with_sentence_transformers(data, model_name='all-MiniLM-L6-v2'):
    """
    Tạo embeddings sử dụng SentenceTransformers
    Model options:
    - 'all-MiniLM-L6-v2': Nhẹ, nhanh, hiệu suất tốt (384 dimensions)
    - 'all-mpnet-base-v2': Hiệu suất cao hơn (768 dimensions)
    - 'paraphrase-multilingual-MiniLM-L12-v2': Hỗ trợ tiếng Việt tốt
    """
    print(f"🤖 Đang load model SentenceTransformers: {model_name}")
    
    # Load model
    model = SentenceTransformer(model_name)
    
    # Chuẩn bị dữ liệu
    questions = []
    answers = []
    categories = []
    tags = []
    
    for item in data:
        questions.append(item['question'])
        answers.append(item['answer'])
        categories.append(item.get('category', 'general'))
        tags.append(item.get('tags', []))
    
    print(f"📝 Đang tạo embeddings cho {len(questions)} câu hỏi...")
    
    # Tạo embeddings cho câu hỏi
    question_embeddings = model.encode(
        questions, 
        show_progress_bar=True,
        batch_size=32,
        convert_to_numpy=True
    )
    
    # Tạo DataFrame
    df = pd.DataFrame({
        'question': questions,
        'answer': answers,
        'category': categories,
        'tags': tags,
        'embedding': question_embeddings.tolist()
    })
    
    print(f"✅ Đã tạo embeddings với shape: {question_embeddings.shape}")
    return df, model

def save_embeddings(df, output_path):
    """Lưu embeddings vào file parquet"""
    try:
        df.to_parquet(output_path, index=False)
        print(f"✅ Đã lưu embeddings vào {output_path}")
        print(f"📊 Số dòng: {len(df)}")
        print(f"🔢 Các cột: {list(df.columns)}")
        return True
    except Exception as e:
        print(f"❌ Lỗi khi lưu file: {e}")
        return False

def main():
    # Đường dẫn files
    faq_file = './faq_dataset.json'
    output_file = './english_qa_embeddings.parquet'
    
    # Kiểm tra file tồn tại
    if not os.path.exists(faq_file):
        print(f"❌ Không tìm thấy file {faq_file}")
        return
    
    # Load dữ liệu
    faq_data = load_faq_data(faq_file)
    if not faq_data:
        return
    
    # Tạo embeddings
    try:
        df, model = create_embeddings_with_sentence_transformers(
            faq_data, 
            model_name='paraphrase-multilingual-MiniLM-L12-v2'  # Tốt cho tiếng Việt
        )
        
        # Lưu kết quả
        if save_embeddings(df, output_file):
            print(f"\n🎉 Hoàn thành! File đã được lưu tại: {output_file}")
            print(f"📏 Embedding dimension: {len(df['embedding'].iloc[0])}")
            print(f"🏷️ Categories: {df['category'].unique()}")
            
            # Hiển thị một vài ví dụ
            print("\n📋 Một vài ví dụ:")
            for i in range(min(3, len(df))):
                print(f"  {i+1}. Q: {df['question'].iloc[i][:50]}...")
                print(f"     A: {df['answer'].iloc[i][:50]}...")
                print(f"     Category: {df['category'].iloc[i]}")
                print()
        
    except Exception as e:
        print(f"❌ Lỗi trong quá trình tạo embeddings: {e}")

if __name__ == "__main__":
    main()
