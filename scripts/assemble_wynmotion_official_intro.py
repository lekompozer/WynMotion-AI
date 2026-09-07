import os
import subprocess

def run_cmd(cmd):
    print("RUNNING:", cmd)
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print("ERROR:", res.stderr)
        raise RuntimeError(f"Command failed: {cmd}\n{res.stderr}")
    return res.stdout

print("=== STEP 1: Rendering HTML scenes via Playwright ===")
run_cmd("python3 /tmp/render_wynmotion_official_intro.py")

WORK_DIR = "/tmp/intro_build_v2"

print("=== STEP 2: Converting PNG sequences to MP4 ===")
run_cmd(f"ffmpeg -y -framerate 30 -i {WORK_DIR}/scene_1_2_%04d.png -c:v libx264 -pix_fmt yuv420p -r 30 /tmp/clip_1_2.mp4")
run_cmd(f"ffmpeg -y -framerate 30 -i {WORK_DIR}/scene_1_5_%04d.png -c:v libx264 -pix_fmt yuv420p -r 30 /tmp/clip_1_5.mp4")
run_cmd(f"ffmpeg -y -framerate 30 -i {WORK_DIR}/scene_5_%04d.png -c:v libx264 -pix_fmt yuv420p -r 30 /tmp/clip_5.mp4")
run_cmd(f"ffmpeg -y -framerate 30 -i {WORK_DIR}/scene_6_%04d.png -c:v libx264 -pix_fmt yuv420p -r 30 /tmp/clip_6.mp4")
run_cmd(f"ffmpeg -y -framerate 30 -i {WORK_DIR}/scene_7_8_%04d.png -c:v libx264 -pix_fmt yuv420p -r 30 /tmp/clip_7_8.mp4")

print("=== STEP 3: Preparing Video Clips ===")
# Clip 1: 7s Omni Flash video
run_cmd("ffmpeg -y -i /tmp/WynMotion-Video-phase1-7s.mp4 -t 7.0 -vf 'scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280' -r 30 -c:v libx264 -pix_fmt yuv420p -an /tmp/clip_1.mp4")

# Clip 2: Vertical Train (10.5s)
if os.path.exists("/tmp/test_train.mp4"):
    run_cmd("cp /tmp/test_train.mp4 /tmp/clip_2_train.mp4")
else:
    run_cmd('''ffmpeg -y \
      -ss 0 -t 10.5 -i /tmp/strobe.mp4 \
      -ss 0 -t 10.5 -i /tmp/news.mp4 \
      -ss 0 -t 10.5 -i /tmp/whiteboard.mp4 \
      -ss 0 -t 10.5 -i /tmp/science1.mp4 \
      -ss 0 -t 10.5 -i /tmp/stickman.mp4 \
      -filter_complex "
        [0:v]scale=400:711:force_original_aspect_ratio=increase,crop=400:711,pad=420:731:10:10:color=white[v0];
        [1:v]scale=400:711:force_original_aspect_ratio=increase,crop=400:711,pad=420:731:10:10:color=white[v1];
        [2:v]scale=400:711:force_original_aspect_ratio=increase,crop=400:711,pad=420:731:10:10:color=white[v2];
        [3:v]scale=400:711:force_original_aspect_ratio=increase,crop=400:711,pad=420:731:10:10:color=white[v3];
        [4:v]scale=400:711:force_original_aspect_ratio=increase,crop=400:711,pad=420:731:10:10:color=white[v4];
        [v0][v1][v2][v3][v4]vstack=inputs=5[vstacked];
        [vstacked]pad=720:3655:(720-420)/2:0:color=white,pad=720:6215:0:1280:color=white[vfull];
        [vfull]crop=720:1280:0:'t*(4935)/10.5'[vscrolled];
        [vscrolled]drawtext=text='Create Daily 60s AI Videos':fontcolor=black:fontsize=46:x=(w-text_w)/2:y=(h-text_h)/2-30:alpha='if(lt(t,6.0),0,if(lt(t,7.5),(t-6.0)/1.5,if(lt(t,9.0),1,max(0,1-(t-9.0)/1.0))))',drawtext=text='From Just $1.':fontcolor='#0891b2':fontsize=46:x=(w-text_w)/2:y=(h-text_h)/2+30:alpha='if(lt(t,6.0),0,if(lt(t,7.5),(t-6.0)/1.5,if(lt(t,9.0),1,max(0,1-(t-9.0)/1.0))))'[vout]
      " -map '[vout]' -c:v libx264 -pix_fmt yuv420p -r 30 -t 10.5 /tmp/clip_2_train.mp4''')

# Clip 4: Dialogue Scene (8.0s)
run_cmd("ffmpeg -y -i /tmp/dialogue.mp4 -t 8.0 -vf 'scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280' -r 30 -c:v libx264 -pix_fmt yuv420p -an /tmp/clip_4_dialogue.mp4")

print("=== STEP 4: Concatenating all visual clips ===")
concat_list = """
file '/tmp/clip_1.mp4'
file '/tmp/clip_1_2.mp4'
file '/tmp/clip_1_5.mp4'
file '/tmp/clip_2_train.mp4'
file '/tmp/clip_4_dialogue.mp4'
file '/tmp/clip_5.mp4'
file '/tmp/clip_6.mp4'
file '/tmp/clip_7_8.mp4'
"""
with open("/tmp/concat_clips_v2.txt", "w") as f:
    f.write(concat_list.strip())

run_cmd("ffmpeg -y -f concat -safe 0 -i /tmp/concat_clips_v2.txt -c copy /tmp/raw_video_v2.mp4")

# Check total duration
probe = run_cmd("ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 /tmp/raw_video_v2.mp4")
duration = float(probe.strip())
print(f"Assembled video duration: {duration:.2f}s")

# Mix with Intro-Music.mp3 with smooth linear volume fade-out over last 8s
fade_start = max(0.0, duration - 8.0)
print(f"Mixing BGM with fade-out from {fade_start:.2f}s...")
run_cmd(f"ffmpeg -y -i /tmp/raw_video_v2.mp4 -i /tmp/Intro-Music.mp3 -filter_complex '[1:a]afade=t=out:st={fade_start:.2f}:d=8.0[a]' -map 0:v -map '[a]' -c:v copy -c:a aac -b:a 192k -t {duration:.2f} /tmp/WynMotion_Official_Intro_60s.mp4")

print("=== STEP 5: Uploading to Cloudflare R2 CDN ===")
from src.services.r2_storage_service import R2StorageService
r2 = R2StorageService()
with open("/tmp/WynMotion_Official_Intro_60s.mp4", "rb") as f:
    content = f.read()

r2_key = "ai-generated-images/wynmotion/WynMotion_Official_Intro_60s.mp4"
r2.s3_client.put_object(
    Bucket=r2.bucket_name,
    Key=r2_key,
    Body=content,
    ContentType="video/mp4"
)
public_url = r2.get_public_url(r2_key)
print("SUCCESS_EXPORT_URL:" + public_url)
