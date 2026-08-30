#!/usr/bin/env python3
"""
WynMotion Cloudflare R2 Upload Script
Uploads all processed audio files and music_library.json to Cloudflare R2 / S3-compatible storage.
"""

import os
import sys
import glob
import mimetypes

# Optional: Using boto3 for S3/R2 API
try:
    import boto3
    from botocore.config import Config
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

def print_upload_instructions():
    print("""
===================================================================
☁️  HƯỚNG DẪN TẢI KHO NHẠC WYNMOTION LÊN CLOUDFLARE R2
===================================================================

Cách 1: Dùng Wrangler CLI (Nhanh nhất nếu đã cài wrangler)
------------------------------------------------------------
1. Đăng nhập Cloudflare:
   npx wrangler login

2. Tạo bucket R2 (nếu chưa có):
   npx wrangler r2 bucket create wynmotion-music

3. Tải toàn bộ thư mục âm thanh lên:
   rclone sync ~/Documents/wynmotion_processed_music r2:wynmotion-music/music --progress

------------------------------------------------------------
Cách 2: Dùng Python Boto3 (S3 API tương thích Cloudflare R2)
------------------------------------------------------------
Cấu hình các biến môi trường sau:
  export R2_ACCOUNT_ID="your_cloudflare_account_id"
  export R2_ACCESS_KEY_ID="your_r2_access_key"
  export R2_SECRET_ACCESS_KEY="your_r2_secret_key"
  export R2_BUCKET_NAME="wynmotion-music"

Sau đó chạy lại script này:
  python3 scripts/upload_to_cloudflare_r2.py

===================================================================
""")

def upload_with_boto3(source_dir: str):
    account_id = os.environ.get("R2_ACCOUNT_ID")
    access_key = os.environ.get("R2_ACCESS_KEY_ID")
    secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    bucket_name = os.environ.get("R2_BUCKET_NAME", "wynmotion-music")
    
    if not all([account_id, access_key, secret_key]):
        print("❌ Chưa tìm thấy đầy đủ R2 credentials trong biến môi trường.")
        print_upload_instructions()
        return False
        
    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"
    
    s3 = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4")
    )
    
    files_to_upload = []
    for root, _, files in os.walk(source_dir):
        for f in files:
            if not f.startswith('.'):
                files_to_upload.append(os.path.join(root, f))
                
    print(f"🚀 Bắt đầu tải {len(files_to_upload)} files lên Cloudflare R2 ({bucket_name})...")
    
    for idx, local_file in enumerate(files_to_upload):
        rel_path = os.path.relpath(local_file, source_dir)
        r2_key = f"music/{rel_path}"
        content_type, _ = mimetypes.guess_type(local_file)
        if not content_type:
            content_type = "audio/mpeg" if local_file.endswith('.mp3') else "application/json"
            
        try:
            s3.upload_file(
                local_file,
                bucket_name,
                r2_key,
                ExtraArgs={
                    "ContentType": content_type,
                    "CacheControl": "public, max-age=31536000, immutable"
                }
            )
            if (idx + 1) % 20 == 0 or idx == len(files_to_upload) - 1:
                print(f"  ✔ [{idx+1}/{len(files_to_upload)}] {r2_key}")
        except Exception as e:
            print(f"  ❌ Lỗi tải {local_file}: {e}")
            
    print("🎉 Tải toàn bộ kho nhạc lên Cloudflare R2 thành công!")
    return True

if __name__ == "__main__":
    SOURCE_DIR = os.path.expanduser("~/Documents/wynmotion_processed_music")
    if BOTO3_AVAILABLE and os.environ.get("R2_ACCOUNT_ID"):
        upload_with_boto3(SOURCE_DIR)
    else:
        print_upload_instructions()
