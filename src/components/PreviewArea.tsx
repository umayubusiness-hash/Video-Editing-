/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef,useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Settings,
  Tv,
  Sparkles
} from 'lucide-react';
import { Clip, ProjectSettings } from '../types';
import { drawProceduralVideo, drawProceduralImage, playProceduralAudio, stopProceduralAudio } from '../utils/presets';

interface PreviewAreaProps {
  clips: Clip[];
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayToggle: () => void;
  onStop: () => void;
  projectSettings: ProjectSettings;
  playbackVolume: number;
  onVolumeChange: (vol: number) => void;
  isDark?: boolean;
  theme?: string;
}

export default function PreviewArea({
  clips,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayToggle,
  onStop,
  projectSettings,
  playbackVolume,
  onVolumeChange,
  isDark = false,
  theme = 'dark'
}: PreviewAreaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // HTML Video elements pool to play imported videos
  const videoElementsPool = useRef<{ [clipId: string]: HTMLVideoElement }>({});
  const imageElementsPool = useRef<{ [clipId: string]: HTMLImageElement }>({});

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [preMuteVolume, setPreMuteVolume] = useState(0.8);

  // Auto clean old pools
  useEffect(() => {
    return () => {
      // Pause all playing videos
      Object.values(videoElementsPool.current).forEach((vid) => {
        const videoEl = vid as HTMLVideoElement;
        videoEl.pause();
        videoEl.src = '';
      });
      stopProceduralAudio();
    };
  }, []);

  // Sync Video Elements and Trigger Canvas Rendering
  useEffect(() => {
    renderCanvasFrame();
    syncAudioAndVideoPlayback();
  }, [clips, currentTime, isPlaying]);

  // Sync external elements (videos, synthesizers)
  const syncAudioAndVideoPlayback = () => {
    clips.forEach((clip) => {
      const isClipActive = currentTime >= clip.startInTimeline && currentTime <= clip.endInTimeline;
      const relativeTime = (currentTime - clip.startInTimeline) * clip.speed + clip.trimStart;

      // 1. Handle actual uploaded video playback synchronization
      if (clip.type === 'video' && !clip.sourceUrl.startsWith('procedural-')) {
        let videoEl = videoElementsPool.current[clip.id];
        if (!videoEl) {
          videoEl = document.createElement('video');
          videoEl.src = clip.sourceUrl;
          videoEl.crossOrigin = 'anonymous';
          videoEl.muted = true; // render video frames onto canvas, play audio separately or mute
          videoEl.playsInline = true;
          videoElementsPool.current[clip.id] = videoEl;
        }

        if (isClipActive) {
          // Keep current time synchronized
          if (Math.abs(videoEl.currentTime - relativeTime) > 0.15) {
            videoEl.currentTime = relativeTime;
          }
          if (isPlaying && videoEl.paused) {
            videoEl.play().catch(() => {});
          } else if (!isPlaying && !videoEl.paused) {
            videoEl.pause();
          }
        } else {
          if (!videoEl.paused) {
            videoEl.pause();
          }
        }
      }

      // 2. Handle procedural synthesizers playing in real-time
      if (clip.type === 'audio' && clip.sourceUrl.startsWith('procedural-')) {
        let fadeVolumeFactor = 1.0;
        if (isClipActive) {
          const elapsed = currentTime - clip.startInTimeline;
          const remaining = clip.endInTimeline - currentTime;
          if (clip.fadeIn && clip.fadeIn > 0) {
            fadeVolumeFactor *= Math.min(1, elapsed / clip.fadeIn);
          }
          if (clip.fadeOut && clip.fadeOut > 0) {
            fadeVolumeFactor *= Math.min(1, remaining / clip.fadeOut);
          }
        }

        playProceduralAudio(
          clip.sourceUrl,
          relativeTime,
          isClipActive && isPlaying,
          isMuted ? 0 : clip.volume * playbackVolume * fadeVolumeFactor
        );
      }
    });

    // Handle turning off non-active procedural audio
    const activeProceduralAudios = clips.filter(
      (c) => c.type === 'audio' && c.sourceUrl.startsWith('procedural-') && currentTime >= c.startInTimeline && currentTime <= c.endInTimeline
    );
    if (activeProceduralAudios.length === 0 || !isPlaying) {
      stopProceduralAudio();
    }
  };

  // Build the Canvas frame rendering pipeline
  const renderCanvasFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get Target Dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, width, height);

    // Filter clips active at the current seekhead frame, sorting by type layer:
    // Audio (ignored visually) -> Video -> Image -> Text
    const sortedClips = [...clips].sort((a, b) => {
      const priority = { video: 1, image: 2, text: 3, audio: 0 };
      return (priority[a.type] || 0) - (priority[b.type] || 0);
    });

    sortedClips.forEach((clip) => {
      const isActive = currentTime >= clip.startInTimeline && currentTime <= clip.endInTimeline;
      if (!isActive) return;

      const clipTime = (currentTime - clip.startInTimeline) * clip.speed + clip.trimStart;

      ctx.save();

      // Configure global filters for the clip (Brightness, Contrast, Saturation, Blur, Hue, etc.)
      const f = clip.filters;
      let filterString = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hueRotate}deg) invert(${f.invert}%)`;
      ctx.filter = filterString;

      // Configure spatial transforms (translate, scale, rotate, flip)
      ctx.translate(width / 2, height / 2); // Translate to center for anchor transformation

      // Flip transforms
      const scaleX = clip.transform.flipX ? -clip.transform.scale : clip.transform.scale;
      const scaleY = clip.transform.flipY ? -clip.transform.scale : clip.transform.scale;
      ctx.scale(scaleX, scaleY);

      // Rotation transform
      if (clip.transform.rotation !== 0) {
        ctx.rotate((clip.transform.rotation * Math.PI) / 180);
      }

      // Translate by offsets
      const offsetX = (clip.transform.x / 100) * width;
      const offsetY = (clip.transform.y / 100) * height;
      ctx.translate(offsetX, offsetY);

      // Configure Opacity with dynamic Fade In/Out
      let currentOpacity = clip.transform.opacity;
      const elapsed = currentTime - clip.startInTimeline;
      const remaining = clip.endInTimeline - currentTime;
      if (clip.fadeIn && clip.fadeIn > 0) {
        currentOpacity *= Math.min(1, elapsed / clip.fadeIn);
      }
      if (clip.fadeOut && clip.fadeOut > 0) {
        currentOpacity *= Math.min(1, remaining / clip.fadeOut);
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, currentOpacity));

      // Draw depending on type
      if (clip.type === 'video') {
        if (clip.sourceUrl.startsWith('procedural-')) {
          // Draw high-fidelity animated backgrounds
          drawProceduralVideo(ctx, clip.sourceUrl, clipTime, width, height);
        } else {
          // Draw standard uploaded HTML Video Frame
          const videoEl = videoElementsPool.current[clip.id];
          if (videoEl && videoEl.readyState >= 2) {
            ctx.drawImage(videoEl, -width / 2, -height / 2, width, height);
          } else {
            // Loading placeholder
            ctx.fillStyle = '#1e1e24';
            ctx.fillRect(-width / 2, -height / 2, width, height);
            ctx.fillStyle = '#06b6d4';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Syncing Frame...', 0, 0);
          }
        }
      } else if (clip.type === 'image') {
        if (clip.sourceUrl.startsWith('procedural-img-')) {
          // Draw procedural stickers
          drawProceduralImage(ctx, clip.sourceUrl, clipTime, width, height);
        } else {
          // Draw loaded uploaded Image
          let imgEl = imageElementsPool.current[clip.id];
          if (!imgEl) {
            imgEl = new Image();
            imgEl.src = clip.sourceUrl;
            imgEl.crossOrigin = 'anonymous';
            imageElementsPool.current[clip.id] = imgEl;
          }
          if (imgEl.complete) {
            // Draw image scaled down safely to avoid overflow
            const imgWidth = width * 0.5;
            const imgHeight = (imgEl.height / imgEl.width) * imgWidth;
            ctx.drawImage(imgEl, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
          }
        }
      } else if (clip.type === 'text' && clip.textStyle) {
        // Draw elegant rich Text overlays
        const style = clip.textStyle;
        ctx.font = `bold ${style.fontSize}px ${style.fontFamily || 'sans-serif'}`;
        ctx.textAlign = style.textAlign;
        ctx.textBaseline = 'middle';

        // Shadows
        if (style.shadowBlur > 0) {
          ctx.shadowColor = style.shadowColor;
          ctx.shadowBlur = style.shadowBlur;
        }

        const textWidth = ctx.measureText(style.content).width;
        const textHeight = style.fontSize * 1.2;

        // Draw translucent background box if configured
        if (style.backgroundColor && style.backgroundColor !== 'transparent') {
          ctx.fillStyle = style.backgroundColor;
          ctx.fillRect(-textWidth / 2 - 14, -textHeight / 2, textWidth + 28, textHeight);
        }

        // Fill text content
        ctx.fillStyle = style.color;
        ctx.fillText(style.content, 0, 0);
      }

      ctx.restore();
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch((e) => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(preMuteVolume);
      setIsMuted(false);
    } else {
      setPreMuteVolume(playbackVolume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  // Formatter for video timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  // Determine Aspect Ratio Classes
  const getAspectRatioClass = () => {
    switch (projectSettings.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] h-[360px] md:h-[460px]';
      case '1:1':
        return 'aspect-square h-[300px] md:h-[380px]';
      case '4:3':
        return 'aspect-[4/3] w-full max-w-xl';
      case '16:9':
      default:
        return 'aspect-[16/9] w-full max-w-2xl';
    }
  };

  return (
    <div 
      id="preview-panel-outer" 
      className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 border-zinc-900 text-zinc-200' : 'bg-white border-slate-205 text-zinc-850 shadow-2xs'
      }`}
    >
      
      {/* 1. Video Monitor Frame */}
      <div 
        ref={containerRef}
        id="video-player-container"
        className={`relative bg-[#050507] rounded-xl overflow-hidden shadow-2xl border flex items-center justify-center transition-all duration-300 ${
          isDark ? 'border-zinc-900/60' : 'border-slate-250 shadow-xs'
        } ${getAspectRatioClass()}`}
      >
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          id="preview-studio-canvas"
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Ambient Canvas Glow Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] text-zinc-300 border border-zinc-800 font-mono tracking-wider">
          <Tv className="w-3.5 h-3.5 text-cyan-400" />
          RENDER OUT: {projectSettings.aspectRatio}
        </div>

        {/* Overlay Play Indicator when paused */}
        {!isPlaying && (
          <button
            onClick={onPlayToggle}
            className="absolute p-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 scale-100 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
          >
            <Play className="w-6 h-6 fill-current" />
          </button>
        )}
      </div>

      {/* 2. Audio Meter / Scrub Controls */}
      <div id="playback-hud-controls" className="w-full max-w-2xl mt-4 space-y-3">
        
        {/* Seekhead slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-bold text-cyan-500">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={projectSettings.duration}
            step="0.05"
            value={currentTime}
            onChange={(e) => onTimeUpdate(parseFloat(e.target.value))}
            className={`flex-1 accent-cyan-500 rounded-lg appearance-none h-1.5 cursor-pointer ${
              isDark ? 'bg-zinc-900' : 'bg-slate-200'
            }`}
          />
          <span className="text-[11px] font-mono font-semibold text-zinc-500">
            {formatTime(projectSettings.duration)}
          </span>
        </div>

        {/* Player Actions Bar */}
        <div className={`flex items-center justify-between border-t pt-3 transition-colors duration-300 ${
          theme === 'cyberpunk' 
            ? 'border-purple-900/30' 
            : theme === 'warm' 
              ? 'border-[#eae2cc]' 
              : theme === 'sunset' 
                ? 'border-indigo-900/40' 
                : theme === 'emerald'
                  ? 'border-emerald-950/40'
                  : theme === 'royal'
                    ? 'border-[#220f3c]'
                    : isDark 
                      ? 'border-zinc-900' 
                      : 'border-slate-100'
        }`}>
          {/* Left: Volume & Audio Mutes */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleMuteToggle}
              className={`p-2 rounded-lg transition ${
                theme === 'cyberpunk'
                  ? 'bg-purple-950/40 text-fuchsia-450 hover:bg-purple-900/60'
                  : theme === 'warm'
                    ? 'bg-[#faf2e0] hover:bg-[#eae2cc]/40 text-[#8c7355]'
                    : theme === 'sunset'
                      ? 'bg-indigo-950/40 text-rose-300 hover:bg-indigo-900/40'
                      : theme === 'emerald'
                        ? 'bg-[#0d3326] text-amber-300 hover:bg-[#124433]'
                        : theme === 'royal'
                          ? 'bg-[#220e3a] text-amber-300 hover:bg-[#2d144d]'
                          : isDark 
                            ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || playbackVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-500" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={playbackVolume}
              onChange={(e) => {
                onVolumeChange(parseFloat(e.target.value));
                if (parseFloat(e.target.value) > 0) {
                  setIsMuted(false);
                }
              }}
              className={`w-20 accent-cyan-500 rounded-lg appearance-none h-1 cursor-pointer ${
                isDark ? 'bg-zinc-900' : 'bg-slate-200'
              }`}
            />
          </div>

          {/* Center: Play, Pause, Stop */}
          <div className={`flex items-center gap-3 p-1 px-3 rounded-full border transition-all duration-300 ${
            theme === 'cyberpunk' 
              ? 'bg-purple-950/40 border-pink-500/30' 
              : theme === 'warm' 
                ? 'bg-[#faf2e0] border-[#eae2cc]' 
                : theme === 'sunset' 
                  ? 'bg-indigo-950/40 border-indigo-500/20' 
                  : theme === 'emerald'
                    ? 'bg-[#0d3326] border-emerald-500/30'
                    : theme === 'royal'
                      ? 'bg-[#220e3a] border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.1)]'
                      : isDark 
                        ? 'bg-zinc-900/60 border-zinc-900/50' 
                        : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={onStop}
              className={`p-2 transition-colors ${
                isDark ? 'text-zinc-400 hover:text-rose-500' : 'text-slate-500 hover:text-rose-500'
              }`}
              title="Stop & Reset"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
            
            <button
              onClick={onPlayToggle}
              className="p-3 bg-cyan-500 hover:bg-cyan-400 rounded-full text-zinc-950 hover:scale-105 active:scale-95 transition-all shadow-md shadow-cyan-500/10"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </button>
          </div>

          {/* Right: Fullscreen & Status */}
          <div className="flex items-center gap-2">
            <div className={`hidden md:flex items-center gap-1 text-[10px] border rounded px-2 py-0.5 font-mono ${
              isDark ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              LIVE ENG: CANVAS2D
            </div>
            
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg transition ${
                isDark 
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
              }`}
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
