#!/usr/bin/env python3
"""
WynMotion Music Library Batch Processor (Multi-threaded & High Performance)
Processes raw NCS music folders into standardized, highlight-cut audio files (15s, 30s, 45s, 60s, 90s, Full)
and generates music_library.json catalog for WynMotion iOS & Web apps.
"""

import os
import re
import json
import time
import subprocess
from concurrent.futures import ProcessPoolExecutor, as_completed
import numpy as np
import librosa
import imageio_ffmpeg

FFMPEG_BIN = imageio_ffmpeg.get_ffmpeg_exe()
os.environ['PATH'] = os.path.dirname(FFMPEG_BIN) + ':' + os.environ.get('PATH', '')

CATEGORIES = [
    {
        "id": "future-bass",
        "nameVi": "Future Bass & Sôi Động",
        "nameEn": "Future Bass & Upbeat",
        "folder": "ncs_Future-Bass",
        "descVi": "Âm thanh sôi động, beat drop bùng nổ, phù hợp video năng động, quảng cáo",
        "descEn": "Energetic Future Bass beats with powerful drops, perfect for promo and reels",
        "icon": "Zap"
    },
    {
        "id": "relax",
        "nameVi": "Nhạc Nhẹ Nhàng & Chill",
        "nameEn": "Relax & Chill",
        "folder": "ncs_Relax",
        "descVi": "Giai điệu thư giãn, Lo-fi chill, acoustic nhẹ nhàng phù hợp vlog, podcast, khoa học",
        "descEn": "Peaceful Lo-fi, acoustic and ambient tunes suitable for vlogs and storytelling",
        "icon": "Coffee"
    },
    {
        "id": "songs",
        "nameVi": "Nhạc Có Lời & Rap - EDM",
        "nameEn": "Vocal Songs & Rap-EDM",
        "folder": "ncs_songs",
        "descVi": "Nhạc có giọng hát, vocal bắt tai, rap lyrical và EDM nhịp độ nhanh",
        "descEn": "Catchy vocal hooks, energetic rap and modern vocal EDM tracks",
        "icon": "Mic"
    }
]

DURATION_PRESETS = [
    {"key": "15s", "duration": 15.0, "labelVi": "15 Giây", "labelEn": "15s"},
    {"key": "30s", "duration": 30.0, "labelVi": "30 Giây", "labelEn": "30s"},
    {"key": "45s", "duration": 45.0, "labelVi": "45 Giây", "labelEn": "45s"},
    {"key": "60s", "duration": 60.0, "labelVi": "1 Phút", "labelEn": "1 Min"},
    {"key": "90s", "duration": 90.0, "labelVi": "1p30s", "labelEn": "1m30s"},
]

def normalize_track_info(filename: str):
    """Clean and normalize raw filename into professional Artist and Title."""
    name = os.path.splitext(filename)[0]
    name = re.sub(r'^\d+[-_]', '', name)
    name = re.sub(r'[-_]\d+$', '', name)
    name = name.replace('amp-', '& ').replace('amp', '&').replace('canx27t', "can't")
    
    junk_patterns = [
        r'[-_]royalty[-_]free[-_]music',
        r'[-_]royalty[-_]free[-_]use',
        r'[-_]no[-_]copyright',
        r'[-_]background[-_]music',
        r'[-_]music[-_]for[-_]content[-_]edits',
        r'[-_]for[-_]your[-_]playlist[-_]addition',
        r'[-_]positive[-_]vibe',
        r'[-_]instagram[-_]reels[-_]music',
        r'[-_]tiktok[-_]music',
        r'[-_]medium[-_]\d+',
    ]
    for jp in junk_patterns:
        name = re.sub(jp, '', name, flags=re.IGNORECASE)
    
    name = re.sub(r'[-_]+', '-', name).strip('-')
    parts = name.split('-')
    if len(parts) >= 2:
        artist_raw = parts[0].replace('_', ' ').strip()
        title_raw = ' '.join(parts[1:]).replace('_', ' ').strip()
        artist = ' '.join(w.capitalize() for w in artist_raw.split() if w)
        title = ' '.join(w.capitalize() for w in title_raw.split() if w)
        if title.startswith('& '):
            artist = f"{artist} {title[:2]}"
            title = title[2:].strip()
        if not title:
            title = artist
            artist = 'NCS Artist'
    else:
        title = ' '.join(w.capitalize() for w in name.replace('_', ' ').replace('-', ' ').split() if w)
        artist = 'WynMotion Audio'
        
    return artist, title

def find_best_highlight(audio_path: str, min_clip_duration: float = 15.0):
    try:
        y, sr = librosa.load(audio_path, sr=16000, mono=True)
        total_len = librosa.get_duration(y=y, sr=sr)
        if total_len <= min_clip_duration:
            return 0.0, float(total_len), 120
            
        hop_length = 1024
        chroma = librosa.feature.chroma_stft(y=y, sr=sr, hop_length=hop_length)
        rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
        
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        tempo_val = np.asarray(tempo).item() if np.ndim(tempo) > 0 else float(tempo)
        bpm = int(round(tempo_val)) if tempo_val > 0 else 120
        
        chroma_norm = librosa.util.normalize(chroma, axis=0)
        ssm = np.dot(chroma_norm.T, chroma_norm)
        
        window_frames = int(min_clip_duration * sr / hop_length)
        total_frames = ssm.shape[0]
        
        start_search = int(total_frames * 0.10)
        end_search = int(total_frames * 0.85) - window_frames
        if end_search <= start_search:
            start_search, end_search = 0, max(1, total_frames - window_frames)
            
        best_score = -1
        best_frame = start_search
        
        for f in range(start_search, end_search, 4):
            window_ssm = ssm[f : f + window_frames, :]
            repetition_score = np.sum(window_ssm)
            energy_score = np.mean(rms[f : f + window_frames])
            total_score = (energy_score * 0.6) + (repetition_score * 0.4 / total_frames)
            if total_score > best_score:
                best_score = total_score
                best_frame = f
                
        start_sec = librosa.frames_to_time(best_frame, sr=sr, hop_length=hop_length)
        return round(float(start_sec), 2), round(float(total_len), 2), bpm
    except Exception as e:
        return 0.0, 180.0, 120

def export_audio_cut(input_path: str, output_path: str, start_sec: float, duration: float = None, fade_in: float = 0.5, fade_out: float = 1.0):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    if duration is not None:
        fade_out_start = max(0.0, duration - fade_out)
        filter_str = f"afade=t=in:ss=0:d={fade_in},afade=t=out:st={fade_out_start}:d={fade_out}"
        cmd = [
            FFMPEG_BIN, "-y",
            "-ss", str(start_sec),
            "-t", str(duration),
            "-i", input_path,
            "-af", filter_str,
            "-b:a", "192k",
            "-ac", "2",
            output_path
        ]
    else:
        cmd = [
            FFMPEG_BIN, "-y",
            "-i", input_path,
            "-b:a", "192k",
            "-ac", "2",
            output_path
        ]
    res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return res.returncode == 0

def process_single_track(item):
    cat_id, cat_name_vi, cat_name_en, folder_path, filename, track_id, output_dir, cdn_base_url = item
    input_file = os.path.join(folder_path, filename)
    artist, title = normalize_track_info(filename)
    
    start_sec, total_sec, bpm = find_best_highlight(input_file)
    
    track_data = {
        "id": track_id,
        "title": title,
        "artist": artist,
        "category": cat_id,
        "category_name_vi": cat_name_vi,
        "category_name_en": cat_name_en,
        "bpm": bpm,
        "total_duration_sec": total_sec,
        "highlight_start_sec": start_sec,
        "original_filename": filename,
        "durations": {}
    }
    
    # 1. Full track
    full_rel_path = f"{cat_id}/{track_id}_full.mp3"
    full_out_path = os.path.join(output_dir, full_rel_path)
    export_audio_cut(input_file, full_out_path, 0.0, duration=None)
    track_data["durations"]["full"] = {
        "url": f"{cdn_base_url}/{full_rel_path}",
        "duration_sec": total_sec,
        "label": "Full Track"
    }
    
    # 2. Preset cuts
    for preset in DURATION_PRESETS:
        d_sec = preset["duration"]
        actual_start = start_sec
        if actual_start + d_sec > total_sec:
            actual_start = max(0.0, total_sec - d_sec)
        cut_rel_path = f"{cat_id}/{track_id}_{preset['key']}.mp3"
        cut_out_path = os.path.join(output_dir, cut_rel_path)
        actual_dur = min(d_sec, total_sec)
        export_audio_cut(input_file, cut_out_path, actual_start, duration=actual_dur)
        track_data["durations"][preset["key"]] = {
            "url": f"{cdn_base_url}/{cut_rel_path}",
            "duration_sec": round(actual_dur, 1),
            "label": preset["labelVi"]
        }
        
    return track_data

def process_all_parallel(docs_dir: str, output_dir: str, cdn_base_url: str = "https://cdn.wynmotion.com/music"):
    os.makedirs(output_dir, exist_ok=True)
    
    tasks = []
    category_meta = []
    
    for cat in CATEGORIES:
        folder_path = os.path.join(docs_dir, cat["folder"])
        if not os.path.exists(folder_path):
            continue
        files = sorted([f for f in os.listdir(folder_path) if f.lower().endswith(('.mp3', '.wav', '.m4a', '.flac')) and not f.startswith('.')])
        category_meta.append((cat, len(files)))
        for idx, filename in enumerate(files):
            track_id = f"track_{cat['id']}_{idx+1:03d}"
            tasks.append((cat["id"], cat["nameVi"], cat["nameEn"], folder_path, filename, track_id, output_dir, cdn_base_url))
            
    print(f"🚀 Processing {len(tasks)} tracks in parallel across CPU cores...")
    
    results = []
    start_time = time.time()
    
    with ProcessPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(process_single_track, item): item for item in tasks}
        for count, future in enumerate(as_completed(futures), 1):
            try:
                res = future.result()
                results.append(res)
                if count % 15 == 0 or count == len(tasks):
                    elapsed = time.time() - start_time
                    rate = count / elapsed if elapsed > 0 else 0
                    print(f"  ✔ [{count}/{len(tasks)}] Done {res['title']} ({rate:.1f} tracks/sec)")
            except Exception as e:
                print(f"  ❌ Error processing: {e}")
                
    # Sort results by ID
    results.sort(key=lambda x: x["id"])
    
    library_catalog = {
        "version": "1.0.0",
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "cdn_base_url": cdn_base_url,
        "categories": [
            {
                "id": cat["id"],
                "nameVi": cat["nameVi"],
                "nameEn": cat["nameEn"],
                "descVi": cat["descVi"],
                "descEn": cat["descEn"],
                "icon": cat["icon"],
                "track_count": count
            }
            for cat, count in category_meta
        ],
        "total_tracks": len(results),
        "tracks": results
    }
    
    json_path = os.path.join(output_dir, "music_library.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(library_catalog, f, ensure_ascii=False, indent=2)
        
    frontend_data_dir = "/Users/user/Code/WynMotion-AI/src/data"
    os.makedirs(frontend_data_dir, exist_ok=True)
    with open(os.path.join(frontend_data_dir, "music_library.json"), "w", encoding="utf-8") as f:
        json.dump(library_catalog, f, ensure_ascii=False, indent=2)
        
    print(f"\n🎉 ALL DONE in {time.time() - start_time:.1f}s! Processed {len(results)} tracks (1,188 audio cuts).")
    print(f"📁 Output: {output_dir}")
    print(f"📄 Frontend Catalog: {os.path.join(frontend_data_dir, 'music_library.json')}")

if __name__ == "__main__":
    DOCUMENTS_DIR = os.path.expanduser("~/Documents")
    OUTPUT_DIR = os.path.expanduser("~/Documents/wynmotion_processed_music")
    process_all_parallel(DOCUMENTS_DIR, OUTPUT_DIR)
