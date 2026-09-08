'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Upload, CheckCircle, Loader2, Download, Play, Pause, Film, Image as ImageIcon, Type, Music, Plus, Trash2, Globe, Sliders } from 'lucide-react';
import { wynmotionService, ModernMotionParams, MotionProject } from '@/services/wynmotionService';
import { convertModernMotionParamsToMotionProject, DEFAULT_LANGUAGE_FLAGS, DEFAULT_MODERN_MOTION_BGM } from '@/services/modernMotionProjectAdapter';

const V9_URL = 'https://static.wordai.pro/ai-generated-images/wynmotion/WynMotion_Official_Intro_v9.mp4';

interface PhaseDefinition {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  startSec: number;
  endSec: number;
  type: 'video_upload' | 'image_upload' | 'text' | 'text_multi' | 'special';
  paramKey?: keyof ModernMotionParams;
  paramKeys?: (keyof ModernMotionParams)[];
  placeholders?: string[];
  labels?: string[];
  required?: boolean;
  maxDurationSec?: number;
  hint?: string;
}

const PHASES: PhaseDefinition[] = [
  { id:'phase_1',    label:'Clip 1',       title:'Phase 1 — Hero Video Chính (7s)',           subtitle:'Video chính xuất hiện đầu tiên. Full screen 9:16.',           startSec:0,    endSec:7,    type:'video_upload', paramKey:'main_video_1',  maxDurationSec:7,  required:true, hint:'Upload video ≥7s — backend tự cắt lấy 7s đầu' },
  { id:'phase_1_5',  label:'By Brand',     title:'Phase 1.5 — By [Tên Công Ty] + Logo (2s)',  subtitle:'Nền trắng. Tên công ty lớn + Logo bên dưới. Fade in + scale.',  startSec:7,    endSec:9,    type:'special',      required:true },
  { id:'phase_1_6a', label:'Title',        title:'Phase 1.6a — Tiêu Đề Chính (1.2s)',         subtitle:'Nền trắng. Từng chữ slide vào từ dưới lên, font 80px light.',   startSec:9,    endSec:10.2, type:'text',         paramKey:'title_primary', placeholders:['VD: AI Video Studio'],     labels:['Tiêu đề chính'], required:true },
  { id:'phase_1_6b', label:'Taglines',     title:'Phase 1.6b — Taglines Gradient (1.2s)',     subtitle:'Nền trắng. 2 dòng tagline gradient Cyan→Blue→Purple.',          startSec:10.2, endSec:11.4, type:'text_multi',   paramKeys:['tagline_1','tagline_2'], placeholders:['VD: NEXT-GEN','VD: CREATIVE SUITE'], labels:['Tagline dòng 1','Tagline dòng 2'], required:true },
  { id:'phase_2',    label:'Header',       title:'Phase 2 — Discover Templates Header (1s)',   subtitle:'Nền đen. Text header uppercase, letter-spacing rộng.',           startSec:11.9, endSec:12.9, type:'text',         paramKey:'templates_header', placeholders:['VD: DISCOVER OUR TEMPLATES'], labels:['Header text (IN HOA)'] },
  { id:'phase_2_1',  label:'Cat 1',        title:'Phase 2.1 — Category 1 (0.7s)',             subtitle:'Nền đen. Tên category 72px trắng + chấm cyan glowing.',        startSec:12.9, endSec:13.6, type:'text',         paramKey:'category_1', placeholders:['VD: Business.'], labels:['Category 1'] },
  { id:'phase_2_2',  label:'Cat 2',        title:'Phase 2.2 — Category 2 (0.7s)',             subtitle:'Nền đen. Tương tự Category 1.',                               startSec:13.6, endSec:14.3, type:'text',         paramKey:'category_2', placeholders:['VD: News.'],       labels:['Category 2'] },
  { id:'phase_2_3',  label:'Cat 3',        title:'Phase 2.3 — Category 3 (0.7s)',             subtitle:'Nền đen. Tương tự Category 1.',                               startSec:14.3, endSec:15.0, type:'text',         paramKey:'category_3', placeholders:['VD: Illustrative.'], labels:['Category 3'] },
  { id:'phase_2_4',  label:'Cat 4',        title:'Phase 2.4 — Category 4 + Phụ đề (1.4s)',   subtitle:'Nền đen. Dòng trên trắng 52px + dòng dưới cyan 56px.',        startSec:15.0, endSec:16.4, type:'text_multi',   paramKeys:['category_4','category_4_sub'], placeholders:['VD: Motion & Explainer','VD: Videos'], labels:['Category 4','Phụ đề cyan'] },
  { id:'phase_3',    label:'Carousel',     title:'Phase 3 — Template Carousel 5 Videos (9s)', subtitle:'5 clip xếp dọc scroll từ dưới lên. Mỗi clip 380px wide.',     startSec:16.4, endSec:25.4, type:'video_upload',  paramKey:'train_videos', maxDurationSec:9, required:true, hint:'Upload 5 video (mỗi clip ≥9s) — backend cắt 9s đầu mỗi clip' },
  { id:'phase_4',    label:'Audio Title',  title:'Phase 4 — AI Audio Studio Title (1.2s)',     subtitle:'Nền trắng. "AI" hộp đen + text slide lên, font 76px.',        startSec:25.4, endSec:26.6, type:'text',         paramKey:'audio_title', placeholders:['VD: AI Audio Studio'], labels:['Tiêu đề Audio Studio'] },
  { id:'phase_4_1',  label:'Audio Tags',   title:'Phase 4.1 — Audio Taglines (1.4s)',          subtitle:'Nền trắng. 3 cặp từ stagger slide in.',                       startSec:26.6, endSec:28.0, type:'special'  },
  { id:'phase_4_2',  label:'Flags Beat',   title:'Phase 4.2 — Lá Cờ Ngôn Ngữ Beat Sync (1.5s)', subtitle:'Nền trắng. Cờ và tên ngôn ngữ nhảy zoom đập nhanh theo từng nhịp beat.', startSec:28.0, endSec:29.5, type:'special', hint:'Tùy chỉnh các quốc gia / ngôn ngữ muốn xuất hiện trong hiệu ứng đập beat.' },
  { id:'phase_4_5',  label:'Clip 2',       title:'Phase 4.5 — Hero Video 2 (9s)',              subtitle:'Video thứ hai full screen 9:16 sau phần Audio Studio.',       startSec:29.5, endSec:38.5, type:'video_upload',  paramKey:'main_video_2', maxDurationSec:9, required:true, hint:'Upload video ≥9s — backend cắt lấy 9s đầu' },
  { id:'phase_5_5',  label:'Headline',     title:'Phase 5.5 — Editor Headline (1.6s)',         subtitle:'Nền đen. 2 dòng text IN HOA stagger từng chữ, font 58px.',   startSec:38.5, endSec:40.1, type:'text_multi',   paramKeys:['editor_headline_1','editor_headline_2'], placeholders:['VD: A COMPLETE','VD: VIDEO EDITOR.'], labels:['Dòng 1 (IN HOA)','Dòng 2 (IN HOA)'] },
  { id:'phase_6',    label:'Clip 3',       title:'Phase 6 — Hero Video 3, Fast-forward (5s)', subtitle:'3s đầu chạy 2.67× + 2s cuối bình thường = 5s output.',       startSec:40.1, endSec:45.1, type:'video_upload',  paramKey:'main_video_3', maxDurationSec:10, required:true, hint:'⚠️ Cần video ≥10s — backend lấy 0-10s rồi fast-forward thành 5s' },
  { id:'phase_7',    label:'Slogan',       title:'Phase 7 — Slogan Blur-in (2s)',             subtitle:'Nền đen. Từng chữ blur vào. Giá tiền màu xanh lá cuối.',     startSec:45.1, endSec:47.1, type:'text_multi',   paramKeys:['slogan_text','slogan_price'], placeholders:['VD: Create Daily 60s AI Videos From Just','VD: $1'], labels:['Câu slogan (không gồm giá)','Giá / CTA (màu xanh lá)'] },
];

interface UploadSlot { file?: File; localUrl?: string; remoteUrl?: string; uploading?: boolean; error?: string; durationSec?: number; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isVietnamese?: boolean;
  onOpenStudio?: (project: MotionProject) => void;
  user?: any;
}

export const ModernMotionWizard: React.FC<Props> = ({
  isOpen,
  onClose,
  isVietnamese = true,
  onOpenStudio,
  user,
}) => {
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [view, setView] = useState<'wizard'|'result'>('wizard');
  const [params, setParams] = useState<ModernMotionParams>({
    brand_company:'', brand_name:'', title_primary:'', tagline_1:'', tagline_2:'',
    templates_header:'DISCOVER OUR TEMPLATES', category_1:'Business.', category_2:'News.',
    category_3:'Illustrative.', category_4:'Motion & Explainer', category_4_sub:'Videos',
    audio_title:'AI Audio Studio', audio_taglines:['Natural voices.','Every language.','Every conversation.'],
    language_flags: [...DEFAULT_LANGUAGE_FLAGS],
    editor_headline_1:'A COMPLETE', editor_headline_2:'VIDEO EDITOR.',
    slogan_text:'Create Daily 60s AI Videos From Just', slogan_price:'$1', bgm_url:DEFAULT_MODERN_MOTION_BGM,
  });
  const [clip1, setClip1] = useState<UploadSlot>({});
  const [clip2, setClip2] = useState<UploadSlot>({});
  const [clip3, setClip3] = useState<UploadSlot>({});
  const [logo, setLogo]   = useState<UploadSlot>({});
  const [carousel, setCarousel] = useState<UploadSlot[]>([{},{},{},{},{}]);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle'|'saving'|'queued'|'rendering'|'completed'|'failed'>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [mp4Url, setMp4Url] = useState<string|null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpeningStudio, setIsOpeningStudio] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const phase = PHASES[currentPhaseIdx];

  useEffect(() => {
    if (!previewRef.current || view !== 'wizard') return;
    previewRef.current.currentTime = phase.startSec;
    setPreviewPlaying(false);
    previewRef.current.pause();
  }, [currentPhaseIdx, view, phase.startSec]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  if (!isOpen) return null;

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append('file', file);
    const res = await wynmotionService.uploadMedia(fd);
    if (!res.url) throw new Error('Upload thất bại');
    return res.url;
  };

  const getVideoDuration = (file: File): Promise<number> => new Promise(resolve => {
    const v = document.createElement('video'); v.preload = 'metadata';
    v.onloadedmetadata = () => { resolve(v.duration); URL.revokeObjectURL(v.src); };
    v.onerror = () => resolve(0);
    v.src = URL.createObjectURL(file);
  });

  const handleSingleVideo = async (file: File, setter: React.Dispatch<React.SetStateAction<UploadSlot>>, pKey: keyof ModernMotionParams) => {
    const localUrl = URL.createObjectURL(file);
    const dur = await getVideoDuration(file);
    setter({ file, localUrl, uploading:true, durationSec:dur });
    try {
      const url = await uploadFile(file);
      setter({ file, localUrl, remoteUrl:url, durationSec:dur });
      setParams(p => ({ ...p, [pKey]: url }));
    } catch(e:any) { setter({ file, localUrl, error:e.message, durationSec:dur }); }
  };

  const handleCarousel = async (file: File, idx: number) => {
    const localUrl = URL.createObjectURL(file);
    const dur = await getVideoDuration(file);
    setCarousel(prev => { const n=[...prev]; n[idx]={file,localUrl,uploading:true,durationSec:dur}; return n; });
    try {
      const url = await uploadFile(file);
      setCarousel(prev => { const n=[...prev]; n[idx]={file,localUrl,remoteUrl:url,durationSec:dur}; return n; });
      setParams(p => { const urls=[...(p.train_videos||['','','','',''])]; urls[idx]=url; return {...p,train_videos:urls}; });
    } catch(e:any) {
      setCarousel(prev => { const n=[...prev]; n[idx]={file,localUrl,error:(e as any).message,durationSec:dur}; return n; });
    }
  };

  const handleLogo = async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    setLogo({ file, localUrl, uploading:true });
    try {
      const url = await uploadFile(file);
      setLogo({ file, localUrl, remoteUrl:url });
      setParams(p => ({ ...p, brand_logo_url:url }));
    } catch(e:any) { setLogo({ file, localUrl, error:(e as any).message }); }
  };

  const togglePreview = () => {
    const v = previewRef.current; if (!v) return;
    if (previewPlaying) { v.pause(); setPreviewPlaying(false); }
    else { v.currentTime = phase.startSec; v.play(); setPreviewPlaying(true); }
  };

  const canGoNext = () => {
    if (!phase.required) return true;
    if (phase.id === 'phase_1')   return !!clip1.remoteUrl;
    if (phase.id === 'phase_1_5') return !!(params.brand_company?.trim() && logo.remoteUrl);
    if (phase.id === 'phase_1_6a') return !!params.title_primary?.trim();
    if (phase.id === 'phase_1_6b') return !!(params.tagline_1?.trim() && params.tagline_2?.trim());
    if (phase.id === 'phase_3')   return carousel.every(s => !!s.remoteUrl);
    if (phase.id === 'phase_4_5') return !!clip2.remoteUrl;
    if (phase.id === 'phase_6')   return !!clip3.remoteUrl;
    return true;
  };

  const handleExport = async () => {
    setExportStatus('saving'); setIsSaving(true);
    try {
      const r1 = await wynmotionService.saveModernMotionProject(params);
      setExportStatus('queued');
      const r2 = await wynmotionService.exportModernMotionMp4(r1.project_id);
      setExportStatus('rendering'); setExportProgress(5);
      pollRef.current = setInterval(async () => {
        try {
          const st = await wynmotionService.getModernMotionExportStatus(r2.job_id);
          setExportProgress(st.progress||0);
          if (st.status==='completed' && st.mp4_url) { clearInterval(pollRef.current!); setMp4Url(st.mp4_url); setExportStatus('completed'); }
          if (st.status==='failed') { clearInterval(pollRef.current!); setExportStatus('failed'); }
        } catch {}
      }, 4000);
    } catch { setExportStatus('failed'); }
    finally { setIsSaving(false); }
  };

  const handleOpenStudio = async () => {
    setIsOpeningStudio(true);
    try {
      const motionProject = convertModernMotionParamsToMotionProject(params, undefined, user);
      // Persist directly into MongoDB db.wynmotion_projects so it is saved in Recent Projects & Library
      await wynmotionService.updateProject(motionProject.project_id, motionProject);
      if (onOpenStudio) {
        onOpenStudio(motionProject);
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi mở Studio:', err);
      // Fallback: still open studio even if background save had network glitch
      const motionProject = convertModernMotionParamsToMotionProject(params, undefined, user);
      if (onOpenStudio) {
        onOpenStudio(motionProject);
      }
      onClose();
    } finally {
      setIsOpeningStudio(false);
    }
  };

  const isExporting = ['saving','queued','rendering'].includes(exportStatus);

  const renderPhaseInput = () => {
    if (phase.id === 'phase_1')   return <VideoZone slot={clip1} max={7}  onFile={f=>handleSingleVideo(f,setClip1,'main_video_1')} />;
    if (phase.id === 'phase_4_5') return <VideoZone slot={clip2} max={9}  onFile={f=>handleSingleVideo(f,setClip2,'main_video_2')} />;
    if (phase.id === 'phase_6')   return <VideoZone slot={clip3} max={10} onFile={f=>handleSingleVideo(f,setClip3,'main_video_3')} />;
    if (phase.id === 'phase_3') return (
      <div className="space-y-2">
        {[0,1,2,3,4].map(i => (
          <div key={i}>
            <div className="text-[10px] text-white/50 font-bold mb-1">🎬 Video Mẫu {i+1} (9s)</div>
            <VideoZone slot={carousel[i]} max={9} compact onFile={f=>handleCarousel(f,i)} />
          </div>
        ))}
      </div>
    );
    if (phase.id === 'phase_1_5') return (
      <div className="space-y-3">
        <Field label="Tên công ty (brand_company)" value={params.brand_company||''} placeholder="VD: Nike" onChange={v=>setParams(p=>({...p,brand_company:v}))} />
        <Field label="Tên thương hiệu (brand_name — dùng Outro)" value={params.brand_name||''} placeholder="VD: NikePro" onChange={v=>setParams(p=>({...p,brand_name:v}))} />
        <div className="space-y-1">
          <div className="text-[10px] text-white/50 font-bold">Logo PNG (nền trắng/trong)</div>
          <ImageZone slot={logo} onFile={handleLogo} />
        </div>
      </div>
    );
    if (phase.id === 'phase_4_1') {
      const tags = params.audio_taglines||['','',''];
      return (
        <div className="space-y-3">
          {[0,1,2].map(i => <Field key={i} label={`Tagline ${i+1}`} value={tags[i]||''} placeholder={['VD: Natural voices.','VD: Every language.','VD: Every conversation.'][i]} onChange={v=>{const n=[...tags];n[i]=v;setParams(p=>({...p,audio_taglines:n}));}} />)}
        </div>
      );
    }
    if (phase.id === 'phase_4_2') {
      const flags = params.language_flags || DEFAULT_LANGUAGE_FLAGS;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/70">Danh sách Quốc kỳ & Ngôn ngữ</span>
            <button
              type="button"
              onClick={() => setParams(p => ({ ...p, language_flags: [...(p.language_flags || DEFAULT_LANGUAGE_FLAGS), { flag: '🌐', name: 'Global' }] }))}
              className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20 active:opacity-70"
            >
              <Plus className="w-3 h-3" /> Thêm cờ
            </button>
          </div>
          <div className="space-y-2">
            {flags.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <input
                  type="text"
                  value={item.flag}
                  onChange={e => {
                    const n = [...flags];
                    n[idx] = { ...n[idx], flag: e.target.value };
                    setParams(p => ({ ...p, language_flags: n }));
                  }}
                  className="w-12 py-1.5 text-center text-lg bg-black/40 border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="🇻🇳"
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={e => {
                    const n = [...flags];
                    n[idx] = { ...n[idx], name: e.target.value };
                    setParams(p => ({ ...p, language_flags: n }));
                  }}
                  className="flex-1 py-1.5 px-3 text-xs bg-black/40 border border-white/15 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Tên ngôn ngữ"
                />
                {flags.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      const n = flags.filter((_, i) => i !== idx);
                      setParams(p => ({ ...p, language_flags: n }));
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (phase.type === 'text' && phase.paramKey) return (
      <Field label={phase.labels?.[0]||String(phase.paramKey)} value={(params[phase.paramKey]as string)||''} placeholder={phase.placeholders?.[0]||''} onChange={v=>setParams(p=>({...p,[phase.paramKey!]:v}))} />
    );
    if (phase.type === 'text_multi' && phase.paramKeys) return (
      <div className="space-y-3">
        {phase.paramKeys.map((k,i)=><Field key={k} label={phase.labels?.[i]||k} value={(params[k]as string)||''} placeholder={phase.placeholders?.[i]||''} onChange={v=>setParams(p=>({...p,[k]:v}))} />)}
      </div>
    );
    return null;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#08090f] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-white/10 shrink-0">
        <button onClick={view==='result'?()=>setView('wizard'):()=>{if(currentPhaseIdx>0)setCurrentPhaseIdx(i=>i-1);else onClose();}} className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold active:opacity-70 min-h-[36px]">
          <ArrowLeft className="w-3.5 h-3.5" />
          {view==='result'?'Sửa lại':'Quay lại'}
        </button>
        <div className="text-center">
          <div className="text-[9px] text-white/30 uppercase tracking-widest">Modern Motion Suite</div>
          {view==='wizard'&&<div className="text-xs font-black text-white mt-0.5">{currentPhaseIdx+1}/{PHASES.length}</div>}
          {view==='result'&&<div className="text-xs font-black text-cyan-400 mt-0.5">Kết Quả & Lựa Chọn Chỉnh Sửa</div>}
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 active:opacity-70"><X className="w-4 h-4"/></button>
      </div>

      {/* Progress */}
      {view==='wizard'&&<div className="h-0.5 bg-white/10 shrink-0"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300" style={{width:`${((currentPhaseIdx+1)/PHASES.length)*100}%`}}/></div>}

      {/* WIZARD VIEW */}
      {view==='wizard'&&(
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Phase title */}
          <div className="px-4 pt-4 pb-2 shrink-0">
            <div className="text-sm font-black text-white leading-tight">{phase.title}</div>
            <div className="text-[11px] text-white/45 mt-1 leading-relaxed">{phase.subtitle}</div>
            {phase.hint&&<div className="mt-1.5 text-[10px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">💡 {phase.hint}</div>}
          </div>

          {/* Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            {/* Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-black mx-auto" style={{aspectRatio:'9/16',maxHeight:'34vh'}}>
              <video ref={previewRef} src={V9_URL} className="w-full h-full object-cover" playsInline muted onEnded={()=>{setPreviewPlaying(false);if(previewRef.current)previewRef.current.currentTime=phase.startSec;}}/>
              <div className="absolute inset-0 flex flex-col pointer-events-none">
                <div className="p-2"><span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-cyan-500/80 text-black">{phase.startSec.toFixed(1)}s–{phase.endSec.toFixed(1)}s</span></div>
                <div className="flex-1 flex items-center justify-center pointer-events-auto">
                  <button onClick={togglePreview} className="w-11 h-11 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform">
                    {previewPlaying?<Pause className="w-4 h-4"/>:<Play className="w-4 h-4 ml-0.5"/>}
                  </button>
                </div>
                <div className="px-2 pb-2 bg-gradient-to-t from-black/70 to-transparent"><div className="text-[8px] text-white/50 text-center">▲ Phase này trong clip gốc v9</div></div>
              </div>
            </div>

            {/* Input */}
            {renderPhaseInput()}
          </div>

          {/* Bottom nav */}
          <div className="px-4 pb-8 pt-3 bg-[#08090f] border-t border-white/10 shrink-0 space-y-2">
            <button onClick={()=>{if(currentPhaseIdx<PHASES.length-1)setCurrentPhaseIdx(i=>i+1);else setView('result');}} disabled={!canGoNext()}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${canGoNext()?'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/30':'bg-white/10 text-white/30 cursor-not-allowed'}`}>
              {currentPhaseIdx<PHASES.length-1?<><span>Tiếp: {PHASES[currentPhaseIdx+1].label}</span><ArrowRight className="w-4 h-4"/></>:<span>✅ Xem kết quả & Lựa chọn</span>}
            </button>
            {/* Dot pills */}
            <div className="flex gap-1 justify-center flex-wrap pt-0.5">
              {PHASES.map((_,i)=><button key={i} onClick={()=>setCurrentPhaseIdx(i)} className={`rounded-full transition-all ${i===currentPhaseIdx?'bg-cyan-400 w-3 h-3':'bg-white/20 w-2 h-2'}`}/>)}
            </div>
          </div>
        </div>
      )}

      {/* RESULT VIEW */}
      {view==='result'&&(
        <>
          <div className="flex-1 overflow-y-auto pb-48">
            {/* Summary banner */}
            <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-purple-500/10 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-cyan-400"/><span className="text-sm font-black text-white">Dự án Modern Motion Suite 50.1s</span></div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[['3','Hero Clips'],['5','Carousel'],['19','Scenes Studio']].map(([v,l],i)=>(
                  <div key={i} className="bg-white/5 rounded-xl p-2"><div className="text-base font-black text-cyan-400">{v}</div><div className="text-[9px] text-white/40">{l}</div></div>
                ))}
              </div>
            </div>
            {/* BGM */}
            <div className="mx-4 mt-3 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Music className="w-4 h-4 text-cyan-400 shrink-0"/>
              <div className="flex-1"><div className="text-xs font-bold text-white">BGM: Intro-Music.mp3</div><div className="text-[10px] text-white/40">Nhạc nền mặc định 50.1s beat sync & fade out</div></div>
              <span className="text-[9px] text-cyan-400">Default ✓</span>
            </div>

            {/* Quick Actions Callout */}
            <div className="mx-4 mt-3 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3">
              <div className="text-xs text-white">
                <div className="font-black text-cyan-300">Tùy biến sâu từng Scene trong Studio?</div>
                <div className="text-[10px] text-white/60 mt-0.5">Tách thành 19 scene độc lập để xoá/thêm/sửa và đổi thứ tự.</div>
              </div>
              <button
                onClick={handleOpenStudio}
                disabled={isOpeningStudio}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 shrink-0 active:scale-95"
              >
                {isOpeningStudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sliders className="w-3.5 h-3.5" />}
                Mở Studio 🎬
              </button>
            </div>

            {/* 19 scene cards */}
            <div className="px-4 mt-4 space-y-2">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-3">19 Scenes Độc Lập — Modern Motion 50.1s</div>
              {[
                {label:'Phase 1 — Hero Clip 1 (7s)',            icon:'video', slot:clip1, extra:'', phaseIdx:0 },
                {label:'Phase 1.5 — By Brand + Logo (2s)',      icon:'brand', slot:logo,  extra:`${params.brand_company||'—'} / ${params.brand_name||'—'}`, phaseIdx:1},
                {label:'Phase 1.6 — Title + Taglines (2.4s)',   icon:'text',  slot:null,  extra:`${params.title_primary||'—'} / ${params.tagline_1||'—'}`, phaseIdx:2},
                {label:'Phase 2 — Discover Header (1s)',        icon:'text',  slot:null,  extra:params.templates_header||'—', phaseIdx:4},
                {label:'Phase 2.1–2.4 — Categories (3.5s)',     icon:'text',  slot:null,  extra:`${params.category_1||'—'} ${params.category_2||'—'} ${params.category_3||'—'}`, phaseIdx:5},
                {label:'Phase 3 — Carousel 5 Videos (9s)',      icon:'carousel',slot:null,extra:`${carousel.filter(c=>!!c.remoteUrl).length}/5 clips`, phaseIdx:9},
                {label:'Phase 4 — AI Audio Title (1.2s)',       icon:'text',  slot:null,  extra:params.audio_title||'—', phaseIdx:10},
                {label:'Phase 4.1 — Audio Taglines (1.4s)',     icon:'text',  slot:null,  extra:(params.audio_taglines||[]).join(' · '), phaseIdx:11},
                {label:'Phase 4.2 — Language Flags Beat (1.5s)',icon:'flag',  slot:null,  extra:(params.language_flags||DEFAULT_LANGUAGE_FLAGS).map(f=>f.flag).join(' '), phaseIdx:12},
                {label:'Phase 4.5 — Hero Clip 2 (9s)',          icon:'video', slot:clip2, extra:'', phaseIdx:13},
                {label:'Phase 5.5 — Editor Headline (1.6s)',    icon:'text',  slot:null,  extra:`${params.editor_headline_1||'—'} ${params.editor_headline_2||'—'}`, phaseIdx:14},
                {label:'Phase 6 — Hero Clip 3, Fast-fwd (5s)', icon:'video', slot:clip3, extra:'', phaseIdx:15},
                {label:'Phase 7+7.5 — Slogan + Outro (5s)',    icon:'text',  slot:null,  extra:`${params.slogan_text||'—'} ${params.slogan_price||'—'}`, phaseIdx:16},
              ].map((s,i)=>(
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-black/40 shrink-0 flex items-center justify-center">
                    {s.icon==='video'&&(s.slot as UploadSlot)?.localUrl?<video src={(s.slot as UploadSlot).localUrl} className="w-full h-full object-cover" muted playsInline/>:s.icon==='brand'&&logo.localUrl?<img src={logo.localUrl} className="w-full h-full object-cover bg-white" alt="logo"/>:s.icon==='carousel'?<Film className="w-4 h-4 text-cyan-400/60"/>:s.icon==='flag'?<Globe className="w-4 h-4 text-emerald-400/60"/>:<Type className="w-4 h-4 text-blue-400/60"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-white leading-tight">{s.label}</div>
                    <div className="text-[9px] text-white/35 mt-0.5 truncate">{s.extra||((s.slot as UploadSlot)?.remoteUrl?'✓ Upload xong':'⚠️ Chưa upload')}</div>
                  </div>
                  <button onClick={()=>{setCurrentPhaseIdx(s.phaseIdx);setView('wizard');}} className="text-[9px] text-cyan-400 font-bold px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0 active:opacity-70">Sửa</button>
                </div>
              ))}
            </div>
          </div>

          {/* Dual Action Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-8 pt-3 bg-[#08090f]/95 backdrop-blur-xl border-t border-white/10 space-y-2">
            {isExporting&&(
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>{exportStatus==='saving'?'Đang lưu project...':exportStatus==='queued'?'Đang chờ render...':'Đang render MP4 (50.1s)...'}</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500" style={{width:`${exportProgress}%`}}/></div>
              </div>
            )}
            {exportStatus==='failed'&&<div className="text-[10px] text-red-400 text-center">❌ Render thất bại — thử lại</div>}
            {exportStatus==='completed'&&mp4Url&&(
              <a href={mp4Url} download="ModernMotion_50s.mp4" target="_blank" rel="noopener noreferrer" className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 active:scale-[0.98]">
                <Download className="w-4 h-4"/><span>Tải xuống MP4 (50.1s)</span>
              </a>
            )}
            {exportStatus!=='completed'&&(
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleOpenStudio}
                  disabled={isOpeningStudio || isExporting}
                  className="py-3.5 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/30 active:scale-[0.98] disabled:opacity-50"
                >
                  {isOpeningStudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
                  Mở trong Studio 🎬
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || isOpeningStudio}
                  className="py-3.5 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all bg-white/10 hover:bg-white/15 border border-white/15 text-white active:scale-[0.98] disabled:opacity-50"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4 text-cyan-400" />}
                  Xuất MP4 Nhanh ⚡
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── Reusable Field ──────────────────────────────────────────────────────────
const Field: React.FC<{label:string;value:string;placeholder:string;onChange:(v:string)=>void}> = ({label,value,placeholder,onChange}) => (
  <div className="space-y-1.5">
    <div className="text-[10px] text-white/50 font-bold">{label}</div>
    <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-cyan-400 transition-colors"/>
  </div>
);

// ── VideoZone ───────────────────────────────────────────────────────────────
const VideoZone: React.FC<{slot:UploadSlot;max?:number;compact?:boolean;onFile:(f:File)=>void}> = ({slot,max,compact,onFile}) => {
  const ref = useRef<HTMLInputElement>(null);
  const short = typeof slot.durationSec==='number' && max && slot.durationSec<max;
  return (
    <div onClick={()=>ref.current?.click()} className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${slot.remoteUrl?'border-cyan-500/50 bg-cyan-500/5':'border-white/15 bg-white/4 hover:border-white/30'} ${compact?'p-3':'p-5'}`}>
      <input ref={ref} type="file" accept="video/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f);e.target.value='';}}/>
      {slot.uploading&&<div className="flex items-center gap-2"><Loader2 className="w-4 h-4 text-cyan-400 animate-spin"/><span className="text-xs text-cyan-300">Đang upload lên R2...</span></div>}
      {!slot.uploading&&!slot.localUrl&&<div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center shrink-0"><Film className="w-5 h-5 text-white/40"/></div><div><div className="text-xs font-bold text-white/70">Chọn video</div>{max&&<div className="text-[10px] text-white/35 mt-0.5">Cần ≥{max}s</div>}</div></div>}
      {!slot.uploading&&slot.localUrl&&<div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black overflow-hidden shrink-0"><video src={slot.localUrl} className="w-full h-full object-cover" muted playsInline/></div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate">{slot.file?.name}</div>
          <div className={`text-[10px] mt-0.5 ${slot.remoteUrl?'text-cyan-400':slot.error?'text-red-400':'text-white/35'}`}>{slot.remoteUrl?'✓ Upload xong':slot.error||'Đang xử lý...'}</div>
          {typeof slot.durationSec==='number'&&<div className={`text-[10px] mt-0.5 ${short?'text-amber-400':'text-white/25'}`}>{short?`⚠️ Video ngắn hơn ${max}s (${slot.durationSec.toFixed(1)}s)`:`${slot.durationSec.toFixed(1)}s`}</div>}
        </div>
        {slot.remoteUrl&&<CheckCircle className="w-4 h-4 text-cyan-400 shrink-0"/>}
      </div>}
    </div>
  );
};

// ── ImageZone ───────────────────────────────────────────────────────────────
const ImageZone: React.FC<{slot:UploadSlot;onFile:(f:File)=>void}> = ({slot,onFile}) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div onClick={()=>ref.current?.click()} className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all p-4 ${slot.remoteUrl?'border-cyan-500/50 bg-cyan-500/5':'border-white/15 bg-white/4 hover:border-white/30'}`}>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f);e.target.value='';}}/>
      <div className="flex items-center gap-3">
        {slot.localUrl?<img src={slot.localUrl} alt="logo" className="w-12 h-12 rounded-xl object-cover bg-white shrink-0"/>:<div className="w-12 h-12 rounded-xl bg-white/8 flex items-center justify-center shrink-0"><ImageIcon className="w-6 h-6 text-white/35"/></div>}
        <div><div className="text-xs font-bold text-white/75">{slot.remoteUrl?'✓ Logo đã upload':'Chọn logo PNG'}</div><div className={`text-[10px] mt-0.5 ${slot.remoteUrl?'text-cyan-400':'text-white/35'}`}>{slot.uploading?'Đang upload...':slot.remoteUrl?slot.file?.name:'PNG nền trắng hoặc trong suốt'}</div></div>
        {slot.uploading&&<Loader2 className="w-4 h-4 text-cyan-400 animate-spin ml-auto"/>}
        {slot.remoteUrl&&<CheckCircle className="w-4 h-4 text-cyan-400 ml-auto"/>}
      </div>
    </div>
  );
};

export default ModernMotionWizard;
