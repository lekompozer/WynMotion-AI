"""
render_modern_motion_export.py — Dynamic MP4 Export Engine for Modern Motion Suite (Apple Style 50.1s)
Supports custom media slots (3 main videos, 5 carousel videos, 1 brand logo) and all customizable text slots.
Includes second-8 'By [Company]' and Brand Logo customization.
"""

import os, sys, json, asyncio, subprocess, base64, time
from typing import Dict, Any, List, Optional
from playwright.async_api import async_playwright

WIDTH, HEIGHT, FPS = 720, 1280, 30
WORK = "/tmp/modern_motion_build"
CDN = "https://static.wordai.pro/ai-generated-images/wynmotion/templates"

DEFAULT_PARAMS = {
    "brand_company": "WynAI",
    "brand_name": "WynMotion",
    "brand_logo_url": f"{CDN}/iconApp-WynAI-512.png",
    "title_primary": "AI Video Studio",
    "tagline_1": "NEXT-GEN",
    "tagline_2": "CREATIVE SUITE",
    "templates_header": "DISCOVER OUR TEMPLATES",
    "category_1": "Business.",
    "category_2": "News.",
    "category_3": "Illustrative.",
    "category_4": "Motion & Explainer",
    "category_4_sub": "Videos",
    "audio_title": "AI Audio Studio",
    "audio_taglines": ["Natural voices.", "Every language.", "Every conversation."],
    "editor_headline_1": "A COMPLETE",
    "editor_headline_2": "VIDEO EDITOR.",
    "slogan_text": "Create Daily 60s AI Videos From Just",
    "slogan_price": "$1",
    "main_video_1": f"{CDN}/WynMotion-Video-phase1-7s.mp4",
    "main_video_2": f"{CDN}/Wynmotion_video_phase4.5.mp4",
    "main_video_3": f"{CDN}/WynMotion_Video_Phase6.mp4",
    "train_videos": [
        f"{CDN}/cinematic_showcase_demo.mp4",
        f"{CDN}/science_explainer_rendered_demo2.mp4",
        f"{CDN}/whiteboard_stream_en_demo.mp4",
        f"{CDN}/video_animate_image_demo.mp4",
        f"{CDN}/WynMotion_character_animation_stickman_en_demo.mp4",
    ],
    "bgm_url": f"{CDN}/Intro-Music.mp3",
}

FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Segoe UI',sans-serif"

def run_cmd(cmd: str, check: bool = True) -> str:
    print("→", cmd[:140])
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and r.returncode != 0:
        print("ERR:", r.stderr[-600:])
        raise RuntimeError(cmd[:80])
    return r.stdout

def download_file(src: str, dst: str):
    if os.path.exists(dst) and os.path.getsize(dst) > 2000:
        with open(dst, "rb") as f:
            header = f.read(20)
        if not header.startswith(b"<!doctype") and not header.startswith(b"<html"):
            return
        os.remove(dst)
    
    base = os.path.basename(src)
    candidates = [src, f"/tmp/{base}"]
    if "cinematic" in base:
        candidates.extend(["/tmp/v2_cinematic.mp4", "/tmp/test_cine.mp4"])
    for c in candidates:
        if os.path.exists(c) and os.path.getsize(c) > 2000:
            run_cmd(f"cp '{c}' '{dst}'")
            return
    if src.startswith("http"):
        run_cmd(f"curl -sL '{src}' -o '{dst}'")
    else:
        run_cmd(f"cp '{src}' '{dst}'")
    
    if os.path.exists(dst):
        with open(dst, "rb") as f:
            hdr = f.read(20)
        if hdr.startswith(b"<!doctype") or hdr.startswith(b"<html"):
            os.remove(dst)
            raise RuntimeError(f"Downloaded file {src} is an HTML error page!")

async def render_text_frames(params: Dict[str, Any]):
    os.makedirs(WORK, exist_ok=True)
    
    # Download logo to local base64
    logo_path = f"{WORK}/brand_logo.png"
    download_file(params.get("brand_logo_url", DEFAULT_PARAMS["brand_logo_url"]), logo_path)
    with open(logo_path, "rb") as f:
        logo_b64 = "data:image/png;base64," + base64.b64encode(f.read()).decode()

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = await browser.new_page(viewport={"width": WIDTH, "height": HEIGHT})

        # ── Scene 1.2: By [Company] + Brand Logo (2.0s = 60f) ───────────
        print("Rendering Scene 1.2 (By Brand + Logo)...")
        company = params.get("brand_company", "WynAI")
        for i in range(60):
            t = i / FPS
            op = t / 0.35 if t < 0.35 else (max(0, 1 - (t - 1.65) / 0.35) if t > 1.65 else 1.0)
            sc = 0.94 + 0.08 * (t / 2.0)
            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:{FONT};}}
.c{{opacity:{op:.3f};transform:scale({sc:.3f});display:flex;flex-direction:column;align-items:center;text-align:center;}}
.by{{font-size:28px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:9px;}}
.wyn{{font-size:80px;font-weight:600;color:#1d1d1f;letter-spacing:-2px;margin-top:6px;}}
.logo{{width:140px;height:140px;margin-top:36px;border-radius:32px;box-shadow:0 20px 48px rgba(0,0,0,0.12);border:2px solid rgba(0,0,0,0.06);padding:5px;background:white;overflow:hidden;}}
.logo img{{width:100%;height:100%;object-fit:cover;border-radius:27px;}}
</style></head><body><div class="c"><div class="by">By</div><div class="wyn">{company}</div>
<div class="logo"><img src="{logo_b64}"/></div></div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s12_{i:04d}.png")

        # ── Scene 1.5a: Title Primary (1.2s = 36f) ──────────────────────
        print("Rendering Scene 1.5a (Title)...")
        words = params.get("title_primary", "AI Video Studio").split()
        for i in range(36):
            t = i / FPS
            spans = []
            for w_idx, w in enumerate(words):
                dt = t - (w_idx * 0.12)
                if dt < 0:
                    op, ty, tx = 0.0, 40.0, 0.0
                elif dt < 0.12:
                    p = 1.0 - (1.0 - dt / 0.12) ** 3
                    op, ty, tx = p, 40.0 * (1.0 - p), 0.0
                else:
                    op, ty, tx = 1.0, 0.0, 0.0
                if t >= 0.95:
                    ep = min(1.0, (t - 0.95) / 0.25)
                    tx = -50.0 * ep
                    op *= (1.0 - ep)
                spans.append(f'<span style="opacity:{op:.3f};transform:translate({tx:.1f}px,{ty:.1f}px);display:inline-block;">{w}</span>')
            
            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:{FONT};}}
.box{{display:flex;gap:18px;align-items:baseline;font-size:80px;font-weight:300;color:#1d1d1f;letter-spacing:-2px;}}
</style></head><body><div class="box">{"".join(spans)}</div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s15a_{i:04d}.png")

        # ── Scene 1.5b: Taglines (1.2s = 36f) ───────────────────────────
        print("Rendering Scene 1.5b (Taglines)...")
        t1 = params.get("tagline_1", "NEXT-GEN")
        t2 = params.get("tagline_2", "CREATIVE SUITE")
        for i in range(36):
            t = i / FPS
            op = min(1.0, t / 0.18) if t < 0.95 else max(0, 1.0 - (t - 0.95) / 0.25)
            ty = 40.0 * (1.0 - min(1.0, t / 0.18))
            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:{FONT};}}
.grad{{background:linear-gradient(135deg,#06b6d4 0%,#2563eb 45%,#9333ea 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;opacity:{op:.3f};transform:translateY({ty:.1f}px);line-height:1.05;}}
.w1{{font-size:76px;font-weight:900;letter-spacing:-2px;}}
.w2{{font-size:62px;font-weight:900;letter-spacing:-1.5px;margin-top:8px;}}
</style></head><body><div class="grad"><div class="w1">{t1}</div><div class="w2">{t2}</div></div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s15b_{i:04d}.png")

        # ── Scene 1.5trans: Circle Expand (0.5s = 15f) ──────────────────
        print("Rendering Scene 1.5trans (Circle Expand)...")
        for i in range(15):
            t = i / FPS
            p = 1.0 - (1.0 - t / 0.5) ** 3
            sz = int(p * 2200)
            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#fff;height:100vh;overflow:hidden;position:relative;}}
.dot{{position:absolute;left:50%;top:50%;width:{sz}px;height:{sz}px;transform:translate(-50%,-50%);border-radius:50%;background:#000;}}
</style></head><body><div class="dot"></div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s15trans_{i:04d}.png")

        # ── Scene 1.5c: Discover Templates (1.0s = 30f) ─────────────────
        print("Rendering Scene 1.5c (Templates Header)...")
        head = params.get("templates_header", "DISCOVER OUR TEMPLATES")
        for i in range(30):
            t = i / FPS
            op = min(1.0, t / 0.15) if t < 0.85 else max(0, 1.0 - (t - 0.85) / 0.15)
            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#000;display:flex;justify-content:center;align-items:center;height:100vh;font-family:{FONT};}}
.h{{font-size:28px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:4px;opacity:{op:.3f};}}
</style></head><body><div class="h">{head}</div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s15c_{i:04d}.png")

        # ── Scene 1.5d,e,f: Categories 1, 2, 3 ──────────────────────────
        for seg, key, dur in [("s15d", "category_1", 21), ("s15e", "category_2", 21), ("s15f", "category_3", 21)]:
            cat_text = params.get(key, "Category.")
            for i in range(dur):
                t = i / FPS
                op = min(1.0, t / 0.12) if t < (dur / FPS - 0.12) else max(0, 1.0 - (t - (dur / FPS - 0.12)) / 0.12)
                ty = 30.0 * (1.0 - min(1.0, t / 0.12))
                html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#000;display:flex;justify-content:center;align-items:center;height:100vh;font-family:{FONT};}}
.w{{display:flex;align-items:center;gap:14px;opacity:{op:.3f};transform:translateY({ty:.1f}px);}}
.txt{{font-size:72px;font-weight:700;color:#fff;letter-spacing:-1.5px;}}
.dot{{width:14px;height:14px;border-radius:50%;background:#38bdf8;box-shadow:0 0 16px #38bdf8;}}
</style></head><body><div class="w"><div class="txt">{cat_text}</div><div class="dot"></div></div></body></html>"""
                await page.set_content(html)
                await page.screenshot(path=f"{WORK}/{seg}_{i:04d}.png")

        # ── Scene 1.5g: Category 4 + Subtitle (1.4s = 42f) ──────────────
        c4 = params.get("category_4", "Motion & Explainer")
        c4s = params.get("category_4_sub", "Videos")
        for i in range(42):
            t = i / FPS
            op = min(1.0, t / 0.12) if t < 1.25 else max(0, 1.0 - (t - 1.25) / 0.15)
            op2 = min(1.0, max(0, (t - 0.3) / 0.15))
            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#000;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:{FONT};}}
.box{{display:flex;flex-direction:column;align-items:center;opacity:{op:.3f};}}
.m{{font-size:52px;font-weight:700;color:#fff;}}
.v{{font-size:56px;font-weight:700;color:#38bdf8;opacity:{op2:.3f};margin-top:8px;}}
</style></head><body><div class="box"><div class="m">{c4}</div><div class="v">{c4s}</div></div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s15g_{i:04d}.png")

        # ── Scene 4a: AI Audio Studio (1.2s = 36f) ───────────────────────
        print("Rendering Scene 4a (Audio Studio)...")
        a_title = params.get("audio_title", "AI Audio Studio").split()
        for i in range(36):
            t = i / FPS
            op = min(1.0, t / 0.18) if t < 0.95 else max(0, 1.0 - (t - 0.95) / 0.25)
            ty = 35.0 * (1.0 - min(1.0, t / 0.18))
            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:{FONT};}}
.aud{{opacity:{op:.3f};transform:translateY({ty:.1f}px);display:flex;gap:16px;font-size:76px;font-weight:600;color:#1d1d1f;letter-spacing:-2px;}}
.ai{{background:#1d1d1f;color:#fff;padding:0 18px;border-radius:18px;line-height:1.2;}}
</style></head><body><div class="aud"><span class="ai">{a_title[0] if a_title else "AI"}</span><span>{' '.join(a_title[1:]) if len(a_title)>1 else 'Audio Studio'}</span></div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s4a_{i:04d}.png")

        # ── Scene 4b: Tagline Tight (1.4s = 42f) ─────────────────────────
        print("Rendering Scene 4b (Taglines)...")
        taglines = [["Natural", "voices."], ["Every", "language."], ["Every", "conversation."]]
        for i in range(42):
            t = i / FPS
            rows = ""
            for li, line in enumerate(taglines):
                cols = ""
                for wi, word in enumerate(line):
                    delay = (li * 2 + wi) * 0.10
                    if t < delay:
                        op, ty, tx = 0.0, 12.0, 0.0
                    elif t < delay + 0.15:
                        p = (t - delay) / 0.15
                        op, ty, tx = p, 12.0 * (1.0 - p), 0.0
                    elif t < 1.05:
                        op, ty, tx = 1.0, 0.0, 0.0
                    elif t < 1.35:
                        p = (t - 1.05) / 0.30
                        op = 1.0 - p
                        tx = -25.0 * p
                        ty = 0.0
                    else:
                        op, ty, tx = 0.0, 0.0, -25.0
                    cols += f'<span style="display:inline-block;opacity:{op:.3f};transform:translateY({ty:.1f}px) translateX({tx:.1f}px);">{word}</span> '
                rows += f'<div style="display:flex;gap:12px;justify-content:center;">{cols}</div>'
            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:{FONT};padding:40px;}}
.tag{{display:flex;flex-direction:column;gap:6px;font-size:44px;font-weight:300;color:#1d1d1f;letter-spacing:-1px;text-align:center;}}
</style></head><body><div class="tag">{rows}</div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s4b_{i:04d}.png")

        # ── Scene 4c: Languages 2X SPEED (1.5s = 45f) ────────────────────
        print("Rendering Scene 4c (Languages)...")
        langs = [
            ("🇻🇳", "Tiếng Việt"),
            ("🇺🇸", "English"),
            ("🇨🇳", "中文"),
            ("🇯🇵", "日本語"),
            ("🇰🇷", "한국어"),
            ("🇪🇸", "Español")
        ]
        for i in range(45):
            li = min(5, int(i / 7.5))
            lt = (i % 7.5) / FPS
            flag, name = langs[li]

            zoom_in_dur = 0.08
            settle_dur = 0.07
            fade_dur = 0.10

            if lt < zoom_in_dur:
                p = 1.0 - (1.0 - (lt / zoom_in_dur)) ** 3
                op, sc = p, 0.20 + 0.95 * p
            elif lt < zoom_in_dur + settle_dur:
                p = (lt - zoom_in_dur) / settle_dur
                op, sc = 1.0, 1.15 - 0.15 * p
            else:
                p = min(1.0, (lt - zoom_in_dur - settle_dur) / fade_dur)
                op, sc = max(0.0, 1.0 - p), 1.0 + 0.25 * p

            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:{FONT};gap:20px;}}
.lg{{opacity:{op:.3f};transform:scale({sc:.3f});display:flex;flex-direction:column;align-items:center;gap:16px;}}
.flag{{font-size:130px;line-height:1;}}.name{{font-size:48px;font-weight:600;color:#1d1d1f;letter-spacing:-1.5px;}}
</style></head><body><div class="lg"><div class="flag">{flag}</div><div class="name">{name}</div></div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s4c_{i:04d}.png")

        # ── Scene 6pre: A COMPLETE VIDEO EDITOR (1.6s = 48f) ─────────────
        print("Rendering Scene 6pre (A Complete Video Editor)...")
        h1 = params.get("editor_headline_1", "A COMPLETE").split()
        h2 = params.get("editor_headline_2", "VIDEO EDITOR.").split()
        words_r1 = [(w, idx * 0.12) for idx, w in enumerate(h1)]
        words_r2 = [(w, (len(h1) + idx) * 0.12) for idx, w in enumerate(h2)]
        for i in range(48):
            t = i / FPS
            def get_sp(w, start_t):
                dt = t - start_t
                if dt < 0:
                    return 0.0, 35.0, 0.0
                elif dt < 0.12:
                    p = 1.0 - (1.0 - (dt / 0.12)) ** 3
                    return p, 35.0 * (1.0 - p), 0.0
                else:
                    tx, op = 0.0, 1.0
                    if t >= 1.25:
                        ep = (t - 1.25) / 0.35
                        tx, op = -50.0 * ep, max(0.0, 1.0 - ep)
                    return op, 0.0, tx

            r1_spans = " ".join([f'<span style="display:inline-block;opacity:{get_sp(w, st)[0]:.3f};transform:translate({get_sp(w, st)[2]:.1f}px,{get_sp(w, st)[1]:.1f}px);">{w}</span>' for w, st in words_r1])
            r2_spans = " ".join([f'<span style="display:inline-block;opacity:{get_sp(w, st)[0]:.3f};transform:translate({get_sp(w, st)[2]:.1f}px,{get_sp(w, st)[1]:.1f}px);">{w}</span>' for w, st in words_r2])

            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#000;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:{FONT};text-align:center;gap:12px;}}
.r1{{font-size:58px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;display:flex;gap:16px;justify-content:center;}}
.r2{{font-size:58px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;display:flex;gap:16px;justify-content:center;}}
</style></head><body><div class="r1">{r1_spans}</div><div class="r2">{r2_spans}</div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s6pre_{i:04d}.png")

        # ── Scene 7a: Slogan Blur-in (2.0s = 60f) ────────────────────────
        print("Rendering Scene 7a (Slogan)...")
        slog = params.get("slogan_text", "Create Daily 60s AI Videos From Just").split()
        price = params.get("slogan_price", "$1")
        sw = slog + [price]
        for i in range(60):
            t = i / FPS
            spans = ""
            for idx, word in enumerate(sw):
                dt = t - idx * 0.08
                if dt < 0:
                    op, blr, sc = 0.0, 16.0, 0.70
                elif dt < 0.12:
                    p = dt / 0.12
                    op, blr, sc = p, 16.0 * (1.0 - p), 0.70 + 0.30 * p
                else:
                    op, blr, sc = 1.0, 0.0, 1.0
                if t > 1.6:
                    op *= max(0.0, 1.0 - (t - 1.6) / 0.40)
                is_price = (word == price)
                col = "#22c55e" if is_price else "#fff"
                spans += f'<span style="display:inline-block;opacity:{op:.3f};filter:blur({blr:.1f}px);transform:scale({sc:.3f});color:{col};font-weight:{"900" if is_price else "700"};margin-right:12px;">{word}</span>'

            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#000;display:flex;justify-content:center;align-items:center;height:100vh;font-family:{FONT};padding:40px;}}
.bx{{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;font-size:52px;line-height:1.25;text-align:center;max-width:680px;}}
</style></head><body><div class="bx">{spans}</div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s7a_{i:04d}.png")

        # ── Scene 7b: Outro Brand Logo + Name + Byline (3.0s = 90f) ──────
        print("Rendering Scene 7b (Outro Brand)...")
        b_name = params.get("brand_name", "WynMotion")
        b_comp = params.get("brand_company", "WynAI")
        for i in range(90):
            t = i / FPS
            op = min(1.0, t / 0.25)
            sc = 0.96 + 0.04 * (t / 3.0)
            html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{{margin:0;padding:0;box-sizing:border-box;}}
body{{background:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-family:{FONT};}}
.box{{opacity:{op:.3f};transform:scale({sc:.3f});display:flex;flex-direction:column;align-items:center;text-align:center;}}
.logo{{width:120px;height:120px;border-radius:28px;box-shadow:0 16px 40px rgba(0,0,0,0.1);border:2px solid rgba(0,0,0,0.06);padding:4px;background:#fff;overflow:hidden;margin-bottom:24px;}}
.logo img{{width:100%;height:100%;object-fit:cover;border-radius:24px;}}
.n{{font-size:72px;font-weight:700;color:#1d1d1f;letter-spacing:-2px;}}
.by{{font-size:32px;font-weight:300;color:#1d1d1f;letter-spacing:0.5px;margin-top:4px;}}
</style></head><body><div class="box"><div class="logo"><img src="{logo_b64}"/></div><div class="n">{b_name}</div><div class="by">by {b_comp}</div></div></body></html>"""
            await page.set_content(html)
            await page.screenshot(path=f"{WORK}/s7b_{i:04d}.png")

        await browser.close()
    print("✅ All 16 text animation frame sequences rendered successfully!")

def assemble_final_video(params: Dict[str, Any], output_path: str):
    def f2c(prefix, n, out):
        run_cmd(f"ffmpeg -y -framerate 30 -i {WORK}/{prefix}_%04d.png -vf 'scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280' -c:v libx264 -pix_fmt yuv420p -r 30 {out}")

    def v2c(src, dur, out):
        tmp = out + ".raw.mp4"
        download_file(src, tmp)
        run_cmd(f"ffmpeg -y -i {tmp} -t {dur} -vf 'scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280' -r 30 -c:v libx264 -pix_fmt yuv420p -an {out}")

    print("=== Assembling Clips ===")
    f2c("s12", 60, "/tmp/mm_c12.mp4")
    f2c("s15a", 36, "/tmp/mm_c15a.mp4")
    f2c("s15b", 36, "/tmp/mm_c15b.mp4")
    f2c("s15trans", 15, "/tmp/mm_c15trans.mp4")
    f2c("s15c", 30, "/tmp/mm_c15c.mp4")
    f2c("s15d", 21, "/tmp/mm_c15d.mp4")
    f2c("s15e", 21, "/tmp/mm_c15e.mp4")
    f2c("s15f", 21, "/tmp/mm_c15f.mp4")
    f2c("s15g", 42, "/tmp/mm_c15g.mp4")
    f2c("s4a", 36, "/tmp/mm_c4a.mp4")
    f2c("s4b", 42, "/tmp/mm_c4b.mp4")
    f2c("s4c", 45, "/tmp/mm_c4c.mp4")
    f2c("s6pre", 48, "/tmp/mm_c6pre.mp4")
    f2c("s7a", 60, "/tmp/mm_c7a.mp4")
    f2c("s7b", 90, "/tmp/mm_c7b.mp4")

    # Main video 1 (7s)
    v2c(params.get("main_video_1", DEFAULT_PARAMS["main_video_1"]), 7.0, "/tmp/mm_c1.mp4")
    # Main video 2 (9s)
    v2c(params.get("main_video_2", DEFAULT_PARAMS["main_video_2"]), 9.0, "/tmp/mm_c5.mp4")
    
    # Main video 3 with 3s fast-forward + 2s ending text hold (Total 5.0s)
    v3_src = params.get("main_video_3", DEFAULT_PARAMS["main_video_3"])
    tmp_v3 = "/tmp/mm_v3_raw.mp4"
    download_file(v3_src, tmp_v3)
    run_cmd(f'''ffmpeg -y -i {tmp_v3} -filter_complex "
      [0:v]trim=start=0:end=8,setpts=0.375*PTS,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[v1];
      [0:v]trim=start=8:end=10,setpts=PTS-STARTPTS,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[v2];
      [v1][v2]concat=n=2:v=1:a=0[v]
    " -map '[v]' -t 5.0 -r 30 -c:v libx264 -pix_fmt yuv420p -an /tmp/mm_c6.mp4''')

    # 5-Video Marquee Train (9s)
    train_clips = params.get("train_videos", DEFAULT_PARAMS["train_videos"])
    for idx, t_url in enumerate(train_clips[:5]):
        download_file(t_url, f"/tmp/mm_train_{idx}.mp4")

    run_cmd('''ffmpeg -y \
      -ss 0 -t 9 -i /tmp/mm_train_0.mp4 -ss 0 -t 9 -i /tmp/mm_train_1.mp4 \
      -ss 0 -t 9 -i /tmp/mm_train_2.mp4 -ss 0 -t 9 -i /tmp/mm_train_3.mp4 \
      -ss 0 -t 9 -i /tmp/mm_train_4.mp4 \
      -filter_complex "
        [0:v]scale=380:676:force_original_aspect_ratio=increase,crop=380:676,pad=400:696:10:10:color=black[v0];
        [1:v]scale=380:676:force_original_aspect_ratio=increase,crop=380:676,pad=400:696:10:10:color=black[v1];
        [2:v]scale=380:676:force_original_aspect_ratio=increase,crop=380:676,pad=400:696:10:10:color=black[v2];
        [3:v]scale=380:676:force_original_aspect_ratio=increase,crop=380:676,pad=400:696:10:10:color=black[v3];
        [4:v]scale=380:676:force_original_aspect_ratio=increase,crop=380:676,pad=400:696:10:10:color=black[v4];
        [v0][v1][v2][v3][v4]vstack=inputs=5[vstacked];
        [vstacked]pad=720:3480:(720-400)/2:0:color=black[vfull];
        color=black:s=720x1280:d=9[bg];
        [bg][vfull]overlay=x=0:y='t*(-3480+1280)/9'[vout]
      " -map '[vout]' -c:v libx264 -pix_fmt yuv420p -r 30 -t 9 /tmp/mm_c2.mp4''')

    # Concat all 19 clips
    concat_list = """file '/tmp/mm_c1.mp4'
file '/tmp/mm_c12.mp4'
file '/tmp/mm_c15a.mp4'
file '/tmp/mm_c15b.mp4'
file '/tmp/mm_c15trans.mp4'
file '/tmp/mm_c15c.mp4'
file '/tmp/mm_c15d.mp4'
file '/tmp/mm_c15e.mp4'
file '/tmp/mm_c15f.mp4'
file '/tmp/mm_c15g.mp4'
file '/tmp/mm_c2.mp4'
file '/tmp/mm_c4a.mp4'
file '/tmp/mm_c4b.mp4'
file '/tmp/mm_c4c.mp4'
file '/tmp/mm_c5.mp4'
file '/tmp/mm_c6pre.mp4'
file '/tmp/mm_c6.mp4'
file '/tmp/mm_c7a.mp4'
file '/tmp/mm_c7b.mp4'
"""
    with open("/tmp/mm_concat.txt", "w") as f:
        f.write(concat_list.strip())

    run_cmd("ffmpeg -y -f concat -safe 0 -i /tmp/mm_concat.txt -c copy /tmp/mm_raw.mp4")
    dur = float(run_cmd("ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 /tmp/mm_raw.mp4").strip())
    print(f"Total Duration: {dur:.2f}s")
    fade_st = max(0, dur - 6)

    # Audio with fadeout
    bgm_file = "/tmp/mm_bgm.mp3"
    download_file(params.get("bgm_url", DEFAULT_PARAMS["bgm_url"]), bgm_file)
    run_cmd(f"ffmpeg -y -i /tmp/mm_raw.mp4 -i {bgm_file} -filter_complex '[1:a]afade=t=out:st={fade_st:.2f}:d=6.0[a]' -map 0:v -map '[a]' -c:v copy -c:a aac -b:a 192k -t {dur:.2f} {output_path}")
    print(f"🎉 Exported MP4 successfully to {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    params = DEFAULT_PARAMS.copy()
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1]) as f:
            custom = json.load(f)
            params.update(custom)
    
    out_file = sys.argv[2] if len(sys.argv) > 2 else "/tmp/ModernMotion_Custom_Export.mp4"
    print(f"🚀 Starting Modern Motion Suite Export with {len(params)} parameters...")
    print(f"Brand: {params.get('brand_company')} - {params.get('brand_name')}")
    print(f"Output: {out_file}")

    asyncio.run(render_text_frames(params))
    assemble_final_video(params, out_file)
