#!/usr/bin/env python3
"""
WynMotion Cloudflare R2 Upload Script (Multi-threaded & High Speed)
Uploads all processed audio files (1,188 files) and catalog JSON to Cloudflare R2 storage.
"""

import os
import sys
import json
import time
import mimetypes
from concurrent.futures import ThreadPoolExecutor, as_completed
import boto3
from botocore.config import Config
import dotenv

# Load environment credentials from wordai-aiservice
env_path = "/Users/user/Code/wordai-aiservice/.env"
if os.path.exists(env_path):
    dotenv.load_dotenv(env_path)

SOURCE_DIR = os.path.expanduser("~/Documents/wynmotion_processed_music")
CDN_PUBLIC_BASE = os.getenv("R2_PUBLIC_URL", "https://static.wordai.pro").rstrip("/") + "/music"

def update_catalog_urls(catalog_path: str, frontend_catalog_path: str, new_base_url: str):
    """Update CDN URLs in music_library.json to match active Cloudflare R2 domain."""
    with open(catalog_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    old_base = data.get("cdn_base_url", "https://cdn.wynmotion.com/music")
    data["cdn_base_url"] = new_base_url
    
    for track in data.get("tracks", []):
        for dur_key, dur_obj in track.get("durations", {}).items():
            if "url" in dur_obj and dur_obj["url"].startswith(old_base):
                dur_obj["url"] = dur_obj["url"].replace(old_base, new_base_url)
                
    with open(catalog_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    with open(frontend_catalog_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"✔ Updated CDN URLs to {new_base_url} in both catalog files.")
    return data

def upload_single_file(s3_client, bucket_name, local_path, r2_key):
    content_type, _ = mimetypes.guess_type(local_path)
    if not content_type:
        content_type = "audio/mpeg" if local_path.endswith(".mp3") else "application/json"
        
    try:
        s3_client.upload_file(
            local_path,
            bucket_name,
            r2_key,
            ExtraArgs={
                "ContentType": content_type,
                "CacheControl": "public, max-age=31536000, immutable"
            }
        )
        return True, r2_key
    except Exception as e:
        return False, f"{r2_key}: {e}"

def upload_all_to_r2():
    access_key = os.getenv("R2_ACCESS_KEY_ID")
    secret_key = os.getenv("R2_SECRET_ACCESS_KEY")
    endpoint_url = os.getenv("R2_ENDPOINT")
    bucket_name = os.getenv("R2_BUCKET_NAME", "wordai")
    
    if not all([access_key, secret_key, endpoint_url]):
        print("❌ Missing R2 credentials in environment or .env file.")
        return False
        
    s3_client = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4", max_pool_connections=32),
        region_name="auto"
    )
    
    # 1. Update URLs in JSON catalogs
    local_json_path = os.path.join(SOURCE_DIR, "music_library.json")
    frontend_json_path = "/Users/user/Code/WynMotion-AI/src/data/music_library.json"
    update_catalog_urls(local_json_path, frontend_json_path, CDN_PUBLIC_BASE)
    
    # 2. Gather all files
    files_to_upload = []
    for root, _, files in os.walk(SOURCE_DIR):
        for f in files:
            if not f.startswith("."):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, SOURCE_DIR)
                r2_key = f"music/{rel_path}"
                files_to_upload.append((full_path, r2_key))
                
    total = len(files_to_upload)
    print(f"🚀 Uploading {total} files to Cloudflare R2 bucket '{bucket_name}' via 16 parallel threads...")
    
    start_time = time.time()
    success_count = 0
    errors = []
    
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(upload_single_file, s3_client, bucket_name, lp, rk): rk for lp, rk in files_to_upload}
        for count, future in enumerate(as_completed(futures), 1):
            success, msg = future.result()
            if success:
                success_count += 1
            else:
                errors.append(msg)
                
            if count % 50 == 0 or count == total:
                elapsed = time.time() - start_time
                rate = count / elapsed if elapsed > 0 else 0
                print(f"  ✔ [{count}/{total}] Uploaded ({rate:.1f} files/sec)")
                
    print(f"\n🎉 UPLOAD COMPLETED in {time.time() - start_time:.1f}s!")
    print(f"✔ Success: {success_count}/{total} files")
    if errors:
        print(f"⚠ Errors ({len(errors)}):", errors[:5])
    print(f"🌐 Public CDN Base: {CDN_PUBLIC_BASE}/")
    return len(errors) == 0

if __name__ == "__main__":
    upload_all_to_r2()
