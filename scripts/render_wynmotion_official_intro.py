import os
import sys
import asyncio
import subprocess
import base64
import math
from playwright.async_api import async_playwright

WIDTH = 720
HEIGHT = 1280
FPS = 30
WORK_DIR = "/tmp/intro_build_v2"
os.makedirs(WORK_DIR, exist_ok=True)

# Load WynAI Logo as Base64 to guarantee it renders 100% in Chromium
with open("/tmp/iconApp-WynAI-512.png", "rb") as f:
    WYNAI_LOGO_B64 = "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")

async def render_all_scenes():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = await browser.new_page(viewport={"width": WIDTH, "height": HEIGHT})

        # =========================================================================
        # SCENE 1.2: By WynAI Trailer Interlude (2.0s = 60 frames)
        # =========================================================================
        print("Rendering Scene 1.2 (By WynAI 2.0s)...")
        for i in range(60):
            t = i / 30.0
            if t < 0.35:
                opacity = t / 0.35
            elif t > 1.65:
                opacity = max(0.0, 1.0 - (t - 1.65) / 0.35)
            else:
                opacity = 1.0
            scale = 0.95 + 0.08 * (t / 2.0)

            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{
                  background: #ffffff;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
                }}
                .container {{
                  opacity: {opacity:.3f};
                  transform: scale({scale:.3f});
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  text-align: center;
                }}
                .by-text {{
                  font-size: 30px;
                  font-weight: 700;
                  color: #94a3b8;
                  text-transform: uppercase;
                  letter-spacing: 8px;
                }}
                .wynai-text {{
                  font-size: 78px;
                  font-weight: 600;
                  color: #1d1d1f;
                  letter-spacing: -2px;
                  margin-top: 6px;
                }}
                .logo-box {{
                  width: 140px;
                  height: 140px;
                  margin-top: 36px;
                  border-radius: 32px;
                  box-shadow: 0 20px 45px rgba(0,0,0,0.12);
                  border: 2px solid rgba(0,0,0,0.06);
                  padding: 4px;
                  background: white;
                  overflow: hidden;
                }}
                .logo-img {{
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  border-radius: 28px;
                }}
              </style>
            </head>
            <body>
              <div class="container">
                <div class="by-text">By</div>
                <div class="wynai-text">WynAI</div>
                <div class="logo-box">
                  <img class="logo-img" src="{WYNAI_LOGO_B64}" />
                </div>
              </div>
            </body>
            </html>
            """
            await page.set_content(html)
            await page.screenshot(path=f"{WORK_DIR}/scene_1_2_{i:04d}.png")

        # =========================================================================
        # SCENE 1.5: 5 Sequential Apple Typography Cards (9.0s = 270 frames, 54 frames each)
        # =========================================================================
        print("Rendering Scene 1.5 (5 Apple Sequential Cards 9.0s)...")
        cards = [
            {"title": "AI Video Studio", "sub": "Next-Gen Creative Suite"},
            {"title": "Business Short Videos Daily", "sub": "22s Promo & Strobe Teaser"},
            {"title": "News Short Videos", "sub": "60s Fast Daily Updates"},
            {"title": "Illustrative Videos", "sub": "Hand-drawn Whiteboard & Stickman"},
            {"title": "Motion & Explainer Videos", "sub": "Code STEM Simulations & Dialogue"},
        ]

        for i in range(270):
            card_idx = min(4, i // 54)
            card_frame = i % 54
            card_t = card_frame / 30.0 # 0.0 to 1.8s
            card_data = cards[card_idx]

            # Fade in 0.3s, hold 1.2s, fade out 0.3s
            if card_t < 0.3:
                opacity = card_t / 0.3
                y = 16 * (1.0 - opacity)
            elif card_t > 1.5:
                opacity = max(0.0, 1.0 - (card_t - 1.5) / 0.3)
                y = -14 * (1.0 - opacity)
            else:
                opacity = 1.0
                y = 0.0

            font_size = "64px" if card_idx == 0 else "50px"

            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{
                  background: #ffffff;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
                  padding: 40px;
                }}
                .card {{
                  opacity: {opacity:.3f};
                  transform: translateY({y:.2f}px);
                  text-align: center;
                  max-width: 620px;
                }}
                .title {{
                  font-size: {font_size};
                  font-weight: 300;
                  color: #1d1d1f;
                  letter-spacing: -2px;
                  line-height: 1.15;
                }}
                .sub {{
                  font-size: 18px;
                  font-weight: 600;
                  color: #0284c7;
                  letter-spacing: 3px;
                  text-transform: uppercase;
                  margin-top: 14px;
                }}
              </style>
            </head>
            <body>
              <div class="card">
                <div class="title">{card_data['title']}</div>
                <div class="sub">{card_data['sub']}</div>
              </div>
            </body>
            </html>
            """
            await page.set_content(html)
            await page.screenshot(path=f"{WORK_DIR}/scene_1_5_{i:04d}.png")

        # =========================================================================
        # SCENE 5: Built on Agentic AI Technology Animation (9.0s = 270 frames)
        # =========================================================================
        print("Rendering Scene 5 (Agentic AI Director Animation 9.0s)...")
        for i in range(270):
            t = i / 30.0 # 0.0s to 9.0s
            dash_offset = (i * 4) % 40
            pulse_scale = 1.0 + 0.05 * math.sin(t * 5.0)

            # Node highlight index cycling
            active_node = int(t * 1.5) % 5

            # Convergence progress (starts at 4.5s)
            is_converged = t >= 4.5
            conv_opacity = min(1.0, max(0.0, (t - 4.5) / 0.8))

            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{
                  background: #070b14;
                  color: #ffffff;
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  align-items: center;
                  padding: 60px 30px;
                  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
                  overflow: hidden;
                  position: relative;
                }}
                .bg-glow {{
                  position: absolute;
                  top: 35%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 550px;
                  height: 550px;
                  background: radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%);
                  border-radius: 50%;
                }}
                .header {{
                  position: relative;
                  z-index: 10;
                  text-align: center;
                }}
                .badge {{
                  display: inline-block;
                  background: rgba(8, 145, 178, 0.25);
                  border: 1px solid rgba(6, 182, 212, 0.4);
                  color: #38bdf8;
                  font-size: 13px;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 3px;
                  padding: 6px 18px;
                  border-radius: 999px;
                }}
                .main-title {{
                  font-size: 38px;
                  font-weight: 300;
                  letter-spacing: -1.5px;
                  margin-top: 14px;
                  color: #ffffff;
                }}
                .subtitle {{
                  font-size: 16px;
                  color: #94a3b8;
                  font-weight: 300;
                  margin-top: 6px;
                }}
                .canvas-area {{
                  position: relative;
                  z-index: 10;
                  width: 100%;
                  max-width: 640px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }}
                .director-hub {{
                  transform: scale({pulse_scale:.3f});
                  background: linear-gradient(135deg, #0284c7, #2563eb);
                  border: 2px solid #38bdf8;
                  box-shadow: 0 0 40px rgba(56, 189, 248, 0.45);
                  padding: 14px 30px;
                  border-radius: 999px;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  font-size: 18px;
                  font-weight: 700;
                  letter-spacing: 1px;
                }}
                .svg-beams {{
                  width: 100%;
                  height: 90px;
                }}
                .nodes-row {{
                  display: grid;
                  grid-template-columns: repeat(5, 1fr);
                  gap: 10px;
                  width: 100%;
                }}
                .node-box {{
                  background: rgba(15, 23, 42, 0.9);
                  border: 1.5px solid rgba(56, 189, 248, 0.25);
                  border-radius: 18px;
                  padding: 14px 6px;
                  text-align: center;
                  transition: all 0.3s;
                }}
                .node-box.active {{
                  border-color: #38bdf8;
                  box-shadow: 0 0 25px rgba(56, 189, 248, 0.4);
                  background: rgba(30, 41, 59, 0.95);
                  transform: scale(1.06);
                }}
                .node-icon {{
                  font-size: 26px;
                  margin-bottom: 6px;
                }}
                .node-name {{
                  font-size: 14px;
                  font-weight: 700;
                  color: #ffffff;
                }}
                .node-tech {{
                  font-size: 10px;
                  color: #38bdf8;
                  font-family: monospace;
                  margin-top: 2px;
                }}
                .result-box {{
                  opacity: {conv_opacity:.3f};
                  transform: translateY({(1.0 - conv_opacity) * 20:.1f}px);
                  margin-top: 15px;
                  background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(6,78,59,0.5));
                  border: 2px solid #10b981;
                  box-shadow: 0 0 35px rgba(16, 185, 129, 0.35);
                  border-radius: 24px;
                  padding: 18px 24px;
                  width: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                }}
                .result-title {{
                  font-size: 18px;
                  font-weight: 800;
                  color: #ffffff;
                  letter-spacing: 0.5px;
                }}
                .result-sub {{
                  font-size: 12px;
                  color: #6ee7b7;
                  margin-top: 4px;
                }}
                .footer-text {{
                  position: relative;
                  z-index: 10;
                  font-size: 13px;
                  color: #64748b;
                  font-weight: 300;
                  text-align: center;
                }}
              </style>
            </head>
            <body>
              <div class="bg-glow"></div>

              <div class="header">
                <div class="badge">Agentic AI Architecture</div>
                <div class="main-title">Built on Agentic AI Technology</div>
                <div class="subtitle">AI Director điều phối: Image • Motion • Audio • Code • Video</div>
              </div>

              <div class="canvas-area">
                <div class="director-hub">
                  <span>🎬</span>
                  <span>AI DIRECTOR ORCHESTRATOR</span>
                  <span style="width:10px; height:10px; border-radius:50%; background:#10b981; box-shadow:0 0 10px #10b981;"></span>
                </div>

                <svg class="svg-beams" viewBox="0 0 500 90" preserveAspectRatio="none">
                  <line x1="250" y1="0" x2="50" y2="90" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                  <line x1="250" y1="0" x2="150" y2="90" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                  <line x1="250" y1="0" x2="250" y2="90" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                  <line x1="250" y1="0" x2="350" y2="90" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                  <line x1="250" y1="0" x2="450" y2="90" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                </svg>

                <div class="nodes-row">
                  <div class="node-box {'active' if active_node == 0 else ''}">
                    <div class="node-icon">📸</div>
                    <div class="node-name">Image</div>
                    <div class="node-tech">Diffusion</div>
                  </div>
                  <div class="node-box {'active' if active_node == 1 else ''}">
                    <div class="node-icon">⚡</div>
                    <div class="node-name">Motion</div>
                    <div class="node-tech">Physics</div>
                  </div>
                  <div class="node-box {'active' if active_node == 2 else ''}">
                    <div class="node-icon">🎙️</div>
                    <div class="node-name">Audio</div>
                    <div class="node-tech">48kHz Voice</div>
                  </div>
                  <div class="node-box {'active' if active_node == 3 else ''}">
                    <div class="node-icon">💻</div>
                    <div class="node-name">Code</div>
                    <div class="node-tech">STEM 3D</div>
                  </div>
                  <div class="node-box {'active' if active_node == 4 else ''}">
                    <div class="node-icon">🎞️</div>
                    <div class="node-name">Video</div>
                    <div class="node-tech">60fps GLSL</div>
                  </div>
                </div>

                <svg class="svg-beams" style="height:60px; margin-top:8px;" viewBox="0 0 500 60" preserveAspectRatio="none">
                  <line x1="50" y1="0" x2="250" y2="60" stroke="#10b981" stroke-width="2" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                  <line x1="150" y1="0" x2="250" y2="60" stroke="#10b981" stroke-width="2" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                  <line x1="250" y1="0" x2="250" y2="60" stroke="#10b981" stroke-width="2" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                  <line x1="350" y1="0" x2="250" y2="60" stroke="#10b981" stroke-width="2" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                  <line x1="450" y1="0" x2="250" y2="60" stroke="#10b981" stroke-width="2" stroke-dasharray="8 6" stroke-dashoffset="{dash_offset}" />
                </svg>

                <div class="result-box">
                  <div>
                    <div class="result-title">⚡ RESULT VIDEO (60s – 90s)</div>
                    <div class="result-sub">Tự động ghép nhạc, hiệu ứng và đồng bộ timeline</div>
                  </div>
                  <div style="background:#10b981; color:#0f172a; font-weight:800; font-size:13px; padding:6px 14px; border-radius:12px;">
                    SYNTHESIZED ✓
                  </div>
                </div>
              </div>

              <div class="footer-text">
                Powered by Gemini 3.7 Vision • GLSL Motion Engine • Multi-track Compositor
              </div>
            </body>
            </html>
            """
            await page.set_content(html)
            await page.screenshot(path=f"{WORK_DIR}/scene_5_{i:04d}.png")

        # =========================================================================
        # SCENE 6: Interactive Edit Studio Animation (9.0s = 270 frames)
        # =========================================================================
        print("Rendering Scene 6 (Interactive Edit Studio Animation 9.0s)...")
        prompt_text = '✨ "Đổi style sang Bảng Trắng Vẽ Tay & thêm GLSL Glitch"'

        for i in range(270):
            t = i / 30.0 # 0.0s to 9.0s

            # Phase 6a (0 - 2.5s): Typing
            if t < 2.5:
                char_count = int((t / 2.5) * len(prompt_text))
                current_prompt = prompt_text[:char_count]
                cursor_visible = True
                cursor_x = 220
                cursor_y = 920
                is_clicked = False
                is_transformed = False
            # Phase 6b (2.5 - 4.5s): Mouse moving to Apply button
            elif t < 4.5:
                current_prompt = prompt_text
                progress = (t - 2.5) / 2.0
                cursor_x = 220 + (520 - 220) * progress
                cursor_y = 920 + (840 - 920) * progress
                is_clicked = False
                is_transformed = False
            # Phase 6c (4.5 - 5.5s): Mouse CLICK!
            elif t < 5.5:
                current_prompt = prompt_text
                cursor_x = 520
                cursor_y = 840
                is_clicked = True
                is_transformed = False
            # Phase 6d (5.5 - 9.0s): Result displayed after click!
            else:
                current_prompt = prompt_text
                cursor_x = 550
                cursor_y = 860
                is_clicked = False
                is_transformed = True

            preview_bg = "#1e293b" if not is_transformed else "#f8fafc"
            preview_border = "#0ea5e9" if not is_transformed else "#10b981"
            preview_content = """
              <div style="font-size:68px; margin-bottom:12px;">🧬</div>
              <div style="font-size:22px; font-weight:700; color:#38bdf8;">Science Explainer 3D</div>
              <div style="font-size:14px; color:#94a3b8; margin-top:4px;">Timeline gốc trước khi chỉnh sửa</div>
            """ if not is_transformed else """
              <div style="font-size:68px; margin-bottom:12px;">✏️</div>
              <div style="font-size:22px; font-weight:700; color:#0f172a;">Hand-drawn Whiteboard (Đã Áp Dụng)</div>
              <div style="font-size:14px; color:#10b981; font-weight:600; margin-top:4px;">✓ 125 Hiệu Ứng GLSL Glitch Đã Được Cập Nhật</div>
            """

            button_scale = "0.9" if is_clicked else "1.0"
            button_bg = "#10b981" if is_transformed else ("#059669" if is_clicked else "#0284c7")
            btn_text = "✓ Đã áp dụng" if is_transformed else ("Đang xử lý..." if is_clicked else "Áp dụng")

            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{
                  background: #f1f5f9;
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  align-items: center;
                  padding: 50px 30px;
                  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
                  position: relative;
                }}
                .header {{
                  text-align: center;
                }}
                .badge {{
                  display: inline-block;
                  background: #e0f2fe;
                  border: 1px solid #7dd3fc;
                  color: #0369a1;
                  font-size: 13px;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 3px;
                  padding: 6px 18px;
                  border-radius: 999px;
                }}
                .main-title {{
                  font-size: 38px;
                  font-weight: 300;
                  letter-spacing: -1.5px;
                  margin-top: 12px;
                  color: #0f172a;
                }}
                .subtitle {{
                  font-size: 16px;
                  color: #64748b;
                  font-weight: 300;
                  margin-top: 6px;
                }}
                .studio-window {{
                  width: 100%;
                  max-width: 620px;
                  background: #ffffff;
                  border-radius: 28px;
                  border: 1.5px solid #cbd5e1;
                  box-shadow: 0 25px 60px rgba(0,0,0,0.12);
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                }}
                .window-topbar {{
                  background: #f8fafc;
                  border-bottom: 1px solid #e2e8f0;
                  padding: 14px 20px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                }}
                .dots {{
                  display: flex;
                  gap: 8px;
                }}
                .dot {{
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                }}
                .preview-container {{
                  height: 380px;
                  background: {preview_bg};
                  border-bottom: 2px solid {preview_border};
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  position: relative;
                  transition: all 0.4s;
                }}
                .chat-bar {{
                  padding: 20px;
                  background: #ffffff;
                  display: flex;
                  flex-direction: column;
                  gap: 14px;
                }}
                .input-row {{
                  display: flex;
                  gap: 12px;
                }}
                .input-box {{
                  flex: 1;
                  background: #f8fafc;
                  border: 1.5px solid #cbd5e1;
                  border-radius: 16px;
                  padding: 14px 18px;
                  font-size: 14px;
                  font-family: monospace;
                  color: #0f172a;
                  display: flex;
                  align-items: center;
                }}
                .apply-btn {{
                  background: {button_bg};
                  transform: scale({button_scale});
                  color: white;
                  font-weight: 700;
                  font-size: 15px;
                  padding: 0 24px;
                  border-radius: 16px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 8px 20px rgba(2, 132, 199, 0.25);
                }}
                .cursor-pointer-box {{
                  position: absolute;
                  left: {cursor_x:.1f}px;
                  top: {cursor_y:.1f}px;
                  z-index: 100;
                  pointer-events: none;
                }}
                .cursor-svg {{
                  width: 38px;
                  height: 38px;
                  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35));
                }}
                .ripple {{
                  position: absolute;
                  left: 485px;
                  top: 805px;
                  width: 70px;
                  height: 70px;
                  border: 3px solid #06b6d4;
                  border-radius: 50%;
                  animation: ripple 0.8s ease-out;
                }}
                .footer-text {{
                  font-size: 14px;
                  color: #64748b;
                  font-weight: 300;
                  text-align: center;
                }}
              </style>
            </head>
            <body>
              <div class="header">
                <div class="badge">Interactive Multi-Track Studio</div>
                <div class="main-title">Chỉnh Sửa Hoạt Họa Bằng Trò Chuyện</div>
                <div class="subtitle">Nhập lệnh, click nút để biến đổi hoạt họa ngay tức thì</div>
              </div>

              <div class="studio-window">
                <div class="window-topbar">
                  <div class="dots">
                    <div class="dot" style="background:#f43f5e;"></div>
                    <div class="dot" style="background:#f59e0b;"></div>
                    <div class="dot" style="background:#10b981;"></div>
                  </div>
                  <span style="font-size:13px; font-weight:700; color:#475569;">WynMotion AI Studio — Video Editor</span>
                  <span style="font-size:12px; font-family:monospace; color:#94a3b8;">00:24 / 01:00</span>
                </div>

                <div class="preview-container">
                  {preview_content}
                </div>

                <div class="chat-bar">
                  <div class="input-row">
                    <div class="input-box">
                      <span>{current_prompt}</span>
                      <span style="display:inline-block; width:2px; height:18px; background:#0284c7; margin-left:4px;"></span>
                    </div>
                    <div class="apply-btn">
                      {btn_text}
                    </div>
                  </div>

                  <div style="display:flex; align-items:center; gap:8px; font-size:11px; font-family:monospace; color:#94a3b8;">
                    <span>00:00</span>
                    <div style="flex:1; height:6px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                      <div style="width:{'75%' if is_transformed else '35%'}; height:100%; background:linear-gradient(90deg, #0284c7, #2563eb);"></div>
                    </div>
                    <span>01:00</span>
                  </div>
                </div>
              </div>

              <!-- Mouse Cursor -->
              <div class="cursor-pointer-box">
                <svg class="cursor-svg" viewBox="0 0 24 24" fill="#0f172a" stroke="#ffffff" stroke-width="1.5">
                  <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z"/>
                </svg>
              </div>

              {'<div class="ripple"></div>' if is_clicked else ''}

              <div class="footer-text">
                ✨ Tùy chỉnh hoạt họa, thay đổi màu sắc, dịch ngôn ngữ & hiệu ứng 125 GLSL
              </div>
            </body>
            </html>
            """
            await page.set_content(html)
            await page.screenshot(path=f"{WORK_DIR}/scene_6_{i:04d}.png")

        # =========================================================================
        # SCENE 7 & 8: Slogan & Grand Outro (8.5s = 255 frames)
        # =========================================================================
        print("Rendering Scene 7 & 8 (Slogan & Grand Outro 8.5s)...")
        words_line1 = ["The", "most", "powerful", "AI", "motion", "studio"]
        words_line2 = ["you've", "ever", "opened."]

        for i in range(255):
            t = i / 30.0 # 0.0 to 8.5s

            # 0.0 to 3.5s: Apple Word Blur In Slogan
            if t < 3.5:
                mode = "slogan"
            # 3.5 to 5.2s: Logo WynAI & WynMotion AI
            elif t < 5.2:
                mode = "logo"
            # 5.2 to 8.5s: Grand Outro
            else:
                mode = "outro"

            if mode == "slogan":
                # Word delays
                slogan_html = '<div style="display:flex; flex-direction:column; align-items:center; gap:12px;">'
                slogan_html += '<div style="display:flex; flex-wrap:wrap; justify-content:center; gap:12px;">'
                for idx, w in enumerate(words_line1):
                    delay = idx * 0.15
                    w_op = min(1.0, max(0.0, (t - delay) / 0.4))
                    w_blur = max(0.0, (1.0 - w_op) * 10)
                    slogan_html += f'<span style="font-size:46px; font-weight:300; color:#1d1d1f; opacity:{w_op:.2f}; filter:blur({w_blur:.1f}px);">{w}</span>'
                slogan_html += '</div><div style="display:flex; flex-wrap:wrap; justify-content:center; gap:12px;">'
                for idx, w in enumerate(words_line2):
                    delay = (len(words_line1) + idx) * 0.15
                    w_op = min(1.0, max(0.0, (t - delay) / 0.4))
                    w_blur = max(0.0, (1.0 - w_op) * 10)
                    slogan_html += f'<span style="font-size:46px; font-weight:300; color:#1d1d1f; opacity:{w_op:.2f}; filter:blur({w_blur:.1f}px);">{w}</span>'
                slogan_html += '</div></div>'

                html = f"""
                <html>
                <body style="margin:0; background:#ffffff; height:100vh; display:flex; justify-content:center; align-items:center; font-family:-apple-system,sans-serif; padding:40px; box-sizing:border-box;">
                  {slogan_html}
                </body>
                </html>
                """
            elif mode == "logo":
                logo_t = t - 3.5
                logo_op = min(1.0, logo_t / 0.4)
                html = f"""
                <html>
                <body style="margin:0; background:#ffffff; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family:-apple-system,sans-serif;">
                  <div style="opacity:{logo_op:.2f}; display:flex; flex-direction:column; align-items:center;">
                    <div style="width:140px; height:140px; border-radius:32px; box-shadow:0 20px 50px rgba(0,0,0,0.12); border:2px solid rgba(0,0,0,0.06); padding:4px; background:white; overflow:hidden;">
                      <img src="{WYNAI_LOGO_B64}" style="width:100%; height:100%; border-radius:28px; object-fit:cover;" />
                    </div>
                    <div style="font-size:52px; font-weight:700; color:#1d1d1f; margin-top:24px; letter-spacing:-1.5px;">WynMotion AI</div>
                    <div style="font-size:18px; font-weight:500; color:#94a3b8; margin-top:6px;">by WynAI</div>
                  </div>
                </body>
                </html>
                """
            else:
                outro_t = t - 5.2
                outro_op = min(1.0, outro_t / 0.4)
                html = f"""
                <html>
                <body style="margin:0; background:#fbfbfd; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family:-apple-system,sans-serif; padding:40px; box-sizing:border-box;">
                  <div style="opacity:{outro_op:.2f}; max-width:580px; width:100%; display:flex; flex-direction:column; align-items:center; text-align:center;">
                    <div style="width:90px; height:90px; border-radius:28px; background:linear-gradient(135deg, #06b6d4, #2563eb); display:flex; align-items:center; justify-content:center; font-size:46px; box-shadow:0 20px 40px rgba(6,182,212,0.3); color:white;">
                      ✨
                    </div>
                    
                    <div style="font-size:16px; font-weight:800; color:#0284c7; text-transform:uppercase; letter-spacing:4px; margin-top:24px;">
                      WynMotion AI Studio
                    </div>
                    
                    <div style="font-size:44px; font-weight:900; color:#0f172a; line-height:1.15; margin-top:12px; letter-spacing:-1.5px;">
                      Create Daily 60s AI Videos<br />
                      <span style="color:#0284c7;">From Just $1</span>
                    </div>

                    <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:24px; padding:24px; width:100%; text-align:left; margin-top:28px; box-shadow:0 10px 30px rgba(0,0,0,0.05); display:flex; flex-direction:column; gap:14px;">
                      <div style="display:flex; gap:14px; align-items:flex-start;">
                        <span style="font-size:24px;">✏️</span>
                        <div style="font-size:16px; color:#334155; line-height:1.4;">
                          <strong style="color:#0f172a;">Video Giáo Dục Bảng Trắng Vẽ Tay</strong> (Hand-drawn Whiteboard) chuyên sâu cho bài giảng.
                        </div>
                      </div>
                      <div style="display:flex; gap:14px; align-items:flex-start;">
                        <span style="font-size:24px;">🔬</span>
                        <div style="font-size:16px; color:#334155; line-height:1.4;">
                          <strong style="color:#0f172a;">Mô Phỏng Khoa Học STEM Bằng Code 3D</strong> (Science Explainer) cho hiện tượng tự nhiên & lý hóa sinh.
                        </div>
                      </div>
                    </div>

                    <div style="margin-top:32px; width:100%; padding:20px; background:linear-gradient(135deg, #06b6d4, #2563eb); border-radius:22px; color:white; font-size:20px; font-weight:800; box-shadow:0 15px 35px rgba(6,182,212,0.35);">
                      Bắt Đầu Sáng Tạo Ngay ➔
                    </div>
                  </div>
                </body>
                </html>
                """
            await page.set_content(html)
            await page.screenshot(path=f"{WORK_DIR}/scene_7_8_{i:04d}.png")

        await browser.close()
        print("All scenes rendered to PNG frames successfully!")

if __name__ == "__main__":
    asyncio.run(render_all_scenes())
