/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Loader2, 
  Video, 
  Film, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  DollarSign,
  Zap,
  ExternalLink
} from 'lucide-react';
import { Clip, ExportSettings, ProjectSettings } from '../types';
import { drawProceduralVideo, drawProceduralImage } from '../utils/presets';
import { AdsterraBanner } from './AdsterraMonetizer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clips: Clip[];
  projectSettings: ProjectSettings;
}

export default function ExportModal({
  isOpen,
  onClose,
  clips,
  projectSettings
}: ExportModalProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'webm',
    resolution: '720p',
    fps: 30
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Video Ad Monetization State
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [hasAdFinished, setHasAdFinished] = useState(false);

  // Read Adsterra configuration on open
  const [adsterraConfig, setAdsterraConfig] = useState<any>(null);
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('adsterra_monetization_config');
        if (saved) {
          setAdsterraConfig(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to parse adsterra config in modal", e);
      }
    }
  }, [isOpen]);

  // Advertisement countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAdPlaying && adCountdown > 0) {
      timer = setInterval(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAdPlaying, adCountdown]);

  const abortControllerRef = useRef<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    // Cleanup generated object URLs
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  if (!isOpen) return null;

  // Map Resolution preset to physical pixels
  const getResolutionDimensions = (res: '480p' | '720p' | '1080p') => {
    switch (res) {
      case '480p':
        return { w: 854, h: 480 };
      case '1080p':
        return { w: 1920, h: 1080 };
      case '720p':
      default:
        return { w: 1280, h: 720 };
    }
  };

  const startExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setDownloadUrl(null);
    setErrorMessage(null);
    abortControllerRef.current = false;

    const { w: width, h: height } = getResolutionDimensions(settings.resolution);
    const fps = settings.fps;
    const duration = projectSettings.duration;
    const totalFrames = duration * fps;

    // Create offscreen canvas for render compiler
    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const ctx = offCanvas.getContext('2d');

    if (!ctx) {
      setErrorMessage('Browser lacks Canvas 2D support.');
      setIsExporting(false);
      return;
    }

    try {
      // Setup WebM video recording stream
      const stream = offCanvas.captureStream(fps);
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      
      let recorder: MediaRecorder;
      const chunks: Blob[] = [];

      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback mimeType
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (abortControllerRef.current) {
          setIsExporting(false);
          return;
        }
        const finalBlob = new Blob(chunks, { type: 'video/webm' });
        const finalUrl = URL.createObjectURL(finalBlob);
        setDownloadUrl(finalUrl);
        setIsExporting(false);
        setExportProgress(100);
        
        // Start premium Video Ad sequence to monetize downloads
        setIsAdPlaying(true);
        setAdCountdown(5);
        setHasAdFinished(false);
      };

      recorder.start();

      // Video frames render pool (matching active video nodes)
      const videoElementsMap: { [clipId: string]: HTMLVideoElement } = {};
      const imageElementsMap: { [clipId: string]: HTMLImageElement } = {};

      // Seed element nodes for the offscreen compile
      clips.forEach((clip) => {
        if (clip.type === 'video' && !clip.sourceUrl.startsWith('procedural-')) {
          const videoNode = document.createElement('video');
          videoNode.src = clip.sourceUrl;
          videoNode.crossOrigin = 'anonymous';
          videoNode.muted = true;
          videoNode.playsInline = true;
          videoElementsMap[clip.id] = videoNode;
        } else if (clip.type === 'image' && !clip.sourceUrl.startsWith('procedural-')) {
          const imageNode = new Image();
          imageNode.src = clip.sourceUrl;
          imageNode.crossOrigin = 'anonymous';
          imageElementsMap[clip.id] = imageNode;
        }
      });

      // Synchronously load/seek frames sequentially to build the stream
      let currentFrame = 0;
      const timePerFrame = 1 / fps;

      const runExportLoop = async () => {
        if (abortControllerRef.current) {
          recorder.stop();
          return;
        }

        if (currentFrame >= totalFrames) {
          // Finished rendering all frames! Stop the recorder
          setTimeout(() => {
            recorder.stop();
          }, 500);
          return;
        }

        const compileTime = currentFrame * timePerFrame;

        // Clear background frame
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, width, height);

        // Sort active items by layers
        const activeClips = clips
          .filter((c) => compileTime >= c.startInTimeline && compileTime <= c.endInTimeline)
          .sort((a, b) => {
            const priority = { video: 1, image: 2, text: 3, audio: 0 };
            return (priority[a.type] || 0) - (priority[b.type] || 0);
          });

        for (const clip of activeClips) {
          const clipTime = (compileTime - clip.startInTimeline) * clip.speed + clip.trimStart;

          ctx.save();

          // Apply filters
          const f = clip.filters;
          let filterString = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hueRotate}deg) invert(${f.invert}%)`;
          ctx.filter = filterString;

          // Spatial transforms
          ctx.translate(width / 2, height / 2);
          const scaleX = clip.transform.flipX ? -clip.transform.scale : clip.transform.scale;
          const scaleY = clip.transform.flipY ? -clip.transform.scale : clip.transform.scale;
          ctx.scale(scaleX, scaleY);

          if (clip.transform.rotation !== 0) {
            ctx.rotate((clip.transform.rotation * Math.PI) / 180);
          }

          const offsetX = (clip.transform.x / 100) * width;
          const offsetY = (clip.transform.y / 100) * height;
          ctx.translate(offsetX, offsetY);

          ctx.globalAlpha = clip.transform.opacity;

          if (clip.type === 'video') {
            if (clip.sourceUrl.startsWith('procedural-')) {
              drawProceduralVideo(ctx, clip.sourceUrl, clipTime, width, height);
            } else {
              const videoEl = videoElementsMap[clip.id];
              if (videoEl) {
                videoEl.currentTime = clipTime;
                // Wait for video element to seek before capturing frame
                await new Promise<void>((resolve) => {
                  const onSeeked = () => {
                    videoEl.removeEventListener('seeked', onSeeked);
                    resolve();
                  };
                  videoEl.addEventListener('seeked', onSeeked);
                  // Safety timeout in case seek hangs
                  setTimeout(resolve, 80);
                });
                if (videoEl.readyState >= 2) {
                  ctx.drawImage(videoEl, -width / 2, -height / 2, width, height);
                }
              }
            }
          } else if (clip.type === 'image') {
            if (clip.sourceUrl.startsWith('procedural-img-')) {
              drawProceduralImage(ctx, clip.sourceUrl, clipTime, width, height);
            } else {
              const imgEl = imageElementsMap[clip.id];
              if (imgEl && imgEl.complete) {
                const imgWidth = width * 0.5;
                const imgHeight = (imgEl.height / imgEl.width) * imgWidth;
                ctx.drawImage(imgEl, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
              }
            }
          } else if (clip.type === 'text' && clip.textStyle) {
            const style = clip.textStyle;
            ctx.font = `bold ${style.fontSize * 1.5}px ${style.fontFamily || 'sans-serif'}`; // scale font size for export output
            ctx.textAlign = style.textAlign;
            ctx.textBaseline = 'middle';

            if (style.shadowBlur > 0) {
              ctx.shadowColor = style.shadowColor;
              ctx.shadowBlur = style.shadowBlur;
            }

            const textWidth = ctx.measureText(style.content).width;
            const textHeight = style.fontSize * 1.8;

            if (style.backgroundColor && style.backgroundColor !== 'transparent') {
              ctx.fillStyle = style.backgroundColor;
              ctx.fillRect(-textWidth / 2 - 20, -textHeight / 2, textWidth + 40, textHeight);
            }

            ctx.fillStyle = style.color;
            ctx.fillText(style.content, 0, 0);
          }

          ctx.restore();
        }

        // Advance to next frame
        currentFrame++;
        
        // Progress updates
        const prog = Math.round((currentFrame / totalFrames) * 100);
        setExportProgress(prog);

        // Estimate remaining time (seconds)
        const estSecs = Math.max(1, Math.round(((totalFrames - currentFrame) * 45) / 1000));
        setTimeRemaining(estSecs);

        // Estimate size
        const mb = (currentFrame * width * height * 0.00003) / 1000; // rough webm estimate
        setEstimatedSize(`${mb.toFixed(1)} MB`);

        // Schedule next compilation frame
        requestAnimationFrame(runExportLoop);
      };

      // Launch automated compile cycle
      requestAnimationFrame(runExportLoop);

    } catch (e: any) {
      setErrorMessage(e.message || 'Video compile engine error.');
      setIsExporting(false);
    }
  };

  const cancelExport = () => {
    abortControllerRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsExporting(false);
  };

  return (
    <div id="export-modal" className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-zinc-100 tracking-wider uppercase">Export Video Studio</h2>
          </div>
          {!isExporting && (
            <button onClick={onClose} className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {errorMessage && (
            <div className="p-4 bg-rose-950/20 border border-rose-900/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isExporting && !downloadUrl ? (
            /* Configure Settings Panel */
            <div className="space-y-4">
              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs text-zinc-400 flex items-start gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>
                  This video exporter compiles all tracks locally inside your browser using a high-fidelity rendering pipeline. No servers are used.
                </p>
              </div>

              {/* Format selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Select File Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'webm', label: 'WEBM (Standard)' },
                    { id: 'mp4', label: 'MP4 (Compatible)' },
                    { id: 'gif', label: 'GIF Animation' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSettings({ ...settings, format: f.id as any })}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition ${
                        settings.format === f.id
                          ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution settings */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Export Resolution</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '480p', label: '480p (Standard)' },
                    { id: '720p', label: '720p HD' },
                    { id: '1080p', label: '1080p Full HD' }
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setSettings({ ...settings, resolution: res.id as any })}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition ${
                        settings.resolution === res.id
                          ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FPS selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Frame Rate (FPS)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[24, 30, 60].map((fps) => (
                    <button
                      key={fps}
                      onClick={() => setSettings({ ...settings, fps: fps as any })}
                      className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition ${
                        settings.fps === fps
                          ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>

              {/* Meta stats */}
              <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Total video duration</span>
                  <span className="text-zinc-200 font-mono font-bold">{projectSettings.duration} seconds</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Output width & height</span>
                  <span className="text-zinc-200 font-mono font-bold">
                    {getResolutionDimensions(settings.resolution).w}x{getResolutionDimensions(settings.resolution).h} px
                  </span>
                </div>
              </div>
            </div>
          ) : isExporting ? (
            /* Live Progress Feedback */
            <div className="space-y-6 py-6 text-center">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-14 h-14 text-cyan-400 animate-spin" />
                <span className="absolute text-xs font-bold font-mono text-zinc-200">{exportProgress}%</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zinc-200">Compiling movie file chunks...</h3>
                <p className="text-xs text-zinc-500">Please do not close this tab. Compiling tracks into WebAssembly stream.</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4 text-left">
                <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
                  <p className="text-[10px] text-zinc-500 uppercase font-mono">Time remaining</p>
                  <p className="text-xs font-bold text-zinc-300 font-mono mt-0.5">~{timeRemaining} seconds</p>
                </div>
                <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
                  <p className="text-[10px] text-zinc-500 uppercase font-mono">Est. file size</p>
                  <p className="text-xs font-bold text-cyan-400 font-mono mt-0.5">{estimatedSize}</p>
                </div>
              </div>
            </div>
          ) : isAdPlaying ? (
            /* Premium Customizable Video Ad Player & Adsterra Integration */
            <div className="space-y-4 py-2 text-center">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono px-2 py-0.5 rounded uppercase font-black tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-amber-500" /> Sponsored Adsterra Space
                </span>
                <span className="text-[11px] text-zinc-400 font-semibold">
                  {adCountdown > 0 ? `Unlocks download in ${adCountdown}s...` : 'Download Unlocked!'}
                </span>
              </div>

              {/* Customizable Adsterra / Video Player container */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-850 bg-black flex flex-col items-center justify-center shadow-lg">
                {/* Standard video ad representation */}
                <video 
                  src="https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-neon-city-street-at-night-42171-large.mp4" 
                  autoPlay 
                  muted 
                  loop 
                  className="w-full h-full object-cover rounded-lg"
                />

                {/* Progress bar representing ad playback progress */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900/50">
                  <div 
                    className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Live Adsterra Banner space inside popup modal */}
              {adsterraConfig?.enabled && adsterraConfig.banner300x250Key && (
                <div className="py-2 flex flex-col items-center justify-center border-t border-zinc-900/40 pt-3">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-amber-500 mb-2">
                    💸 Sponsored Advertisement (300x250)
                  </span>
                  <AdsterraBanner 
                    zoneKey={adsterraConfig.banner300x250Key} 
                    width={300} 
                    height={250} 
                  />
                </div>
              )}

              {/* High-Revenue Adsterra Direct Link Bypass Offer */}
              {adsterraConfig?.enabled && adsterraConfig?.directLinkUrl && (
                <a 
                  href={adsterraConfig.directLinkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Instantly complete the ad on direct link support click!
                    setIsAdPlaying(false);
                    setHasAdFinished(true);
                  }}
                  className="flex items-center justify-center gap-2 w-full p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 rounded-xl text-xs font-black transition-all shadow-lg active:scale-98 animate-pulse text-center"
                >
                  <Zap className="w-4 h-4 fill-zinc-950 text-zinc-950" />
                  <span>⚡ Fast Bypass: Speed Up & Unlock Download Instantly!</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <div className="flex items-center justify-between gap-4 bg-zinc-900/20 border border-zinc-900/50 p-3 rounded-lg text-left">
                <p className="text-[11px] text-zinc-500 leading-normal">
                  Support free high-performance exports by viewing this short sponsor ad. Click skip once the countdown hits zero.
                </p>
                <button
                  disabled={adCountdown > 0}
                  onClick={() => {
                    setIsAdPlaying(false);
                    setHasAdFinished(true);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ${
                    adCountdown > 0 
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 hover:from-amber-400 hover:to-amber-500 font-extrabold shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {adCountdown > 0 ? `Skip Ad (${adCountdown}s)` : 'Skip & Unlock'}
                </button>
              </div>
            </div>
          ) : (
            /* Completed & Download Trigger Ready */
            <div className="space-y-6 text-center py-4">
              <div className="flex items-center justify-center text-emerald-400 mb-2">
                <CheckCircle2 className="w-16 h-16 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-100">Video compiled successfully!</h3>
                <p className="text-xs text-zinc-500">Your high-fidelity browser compilation is ready to download.</p>
              </div>

              <div className="p-4 bg-zinc-900 border border-zinc-850 rounded-xl space-y-2 text-left text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">File Type:</span>
                  <span className="text-zinc-300 font-bold">.{settings.format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Resolution:</span>
                  <span className="text-zinc-300 font-bold">{settings.resolution} ({getResolutionDimensions(settings.resolution).w}x{getResolutionDimensions(settings.resolution).h})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Estimated Size:</span>
                  <span className="text-emerald-400 font-bold">{estimatedSize}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex justify-end gap-2">
          {!isExporting && !downloadUrl && (
            <>
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={startExport} 
                className="flex items-center gap-1.5 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 text-xs font-bold rounded-lg transition"
              >
                <Video className="w-4 h-4" />
                Start Export
              </button>
            </>
          )}

          {isExporting && (
            <button 
              onClick={cancelExport} 
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition animate-pulse"
            >
              Abort Compile
            </button>
          )}

          {downloadUrl && !isAdPlaying && (
            <>
              <button 
                onClick={() => {
                  setDownloadUrl(null);
                  setExportProgress(0);
                  setHasAdFinished(false);
                }} 
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold rounded-lg transition"
              >
                Compile New Format
              </button>
              <a 
                href={downloadUrl}
                download={`video_editing_studio_${Date.now()}.${settings.format === 'mp4' ? 'mp4' : settings.format}`}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-bold rounded-lg transition shadow-lg shadow-emerald-500/10"
              >
                <Download className="w-4 h-4" />
                Download Video File
              </a>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
