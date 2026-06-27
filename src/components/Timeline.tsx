/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  Trash2, 
  Scissors, 
  Video, 
  Music, 
  Type, 
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Clip, ProjectSettings } from '../types';

interface TimelineProps {
  clips: Clip[];
  currentTime: number;
  selectedClip: Clip | null;
  onSelectClip: (clip: Clip | null) => void;
  onUpdateClip: (clip: Clip) => void;
  onDeleteClip: (id: string) => void;
  onSplitClip: () => void;
  onTimeUpdate: (time: number) => void;
  projectSettings: ProjectSettings;
  zoom: number; // Pixels per second, e.g. 10 to 50
  onZoomIn: () => void;
  onZoomOut: () => void;
  isDark?: boolean;
  theme?: string;
}

export default function Timeline({
  clips,
  currentTime,
  selectedClip,
  onSelectClip,
  onUpdateClip,
  onDeleteClip,
  onSplitClip,
  onTimeUpdate,
  projectSettings,
  zoom,
  onZoomIn,
  onZoomOut,
  isDark = false,
  theme = 'dark'
}: TimelineProps) {
  const timelineTracksRef = useRef<HTMLDivElement | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [draggedClip, setDraggedClip] = useState<{ clip: Clip; startX: number; originalStart: number } | null>(null);
  const [resizingClip, setResizingClip] = useState<{ clip: Clip; edge: 'left' | 'right'; startX: number; originalStart: number; originalEnd: number } | null>(null);

  const maxTimelineWidth = projectSettings.duration * zoom;

  // Sync click/drag on the Time Ruler to seek
  const handleRulerSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineTracksRef.current) return;
    const rect = timelineTracksRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineTracksRef.current.scrollLeft;
    const targetTime = Math.max(0, Math.min(projectSettings.duration, clickX / zoom));
    onTimeUpdate(targetTime);
  };

  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleRulerSeek(e);
  };

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    if (isSeeking) {
      if (!timelineTracksRef.current) return;
      const rect = timelineTracksRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left + timelineTracksRef.current.scrollLeft;
      const targetTime = Math.max(0, Math.min(projectSettings.duration, clickX / zoom));
      onTimeUpdate(targetTime);
    } else if (draggedClip) {
      // Calculate delta movement
      const deltaX = e.clientX - draggedClip.startX;
      const deltaTime = deltaX / zoom;
      let newStart = Math.max(0, draggedClip.originalStart + deltaTime);
      const clipLength = draggedClip.clip.endInTimeline - draggedClip.clip.startInTimeline;
      
      // Ensure it doesn't overshoot maximum duration
      if (newStart + clipLength > projectSettings.duration) {
        newStart = projectSettings.duration - clipLength;
      }

      onUpdateClip({
        ...draggedClip.clip,
        startInTimeline: newStart,
        endInTimeline: newStart + clipLength
      });
    } else if (resizingClip) {
      const deltaX = e.clientX - resizingClip.startX;
      const deltaTime = deltaX / zoom;

      if (resizingClip.edge === 'right') {
        const newEnd = Math.max(resizingClip.clip.startInTimeline + 0.5, resizingClip.originalEnd + deltaTime);
        if (newEnd <= projectSettings.duration) {
          const addedTrim = newEnd - resizingClip.originalEnd;
          onUpdateClip({
            ...resizingClip.clip,
            endInTimeline: newEnd,
            // trimming right decreases available clip length
            trimEnd: Math.max(0, resizingClip.clip.trimEnd - addedTrim)
          });
        }
      } else {
        // resizing left edge
        const newStart = Math.max(0, Math.min(resizingClip.clip.endInTimeline - 0.5, resizingClip.originalStart + deltaTime));
        const addedTrim = newStart - resizingClip.originalStart;
        onUpdateClip({
          ...resizingClip.clip,
          startInTimeline: newStart,
          trimStart: Math.max(0, resizingClip.clip.trimStart + addedTrim)
        });
      }
    }
  };

  const handleGlobalMouseUp = () => {
    setIsSeeking(false);
    setDraggedClip(null);
    setResizingClip(null);
  };

  // Setup time-tick numbers for the ruler (every 5 seconds)
  const renderRulerTicks = () => {
    const ticks = [];
    const interval = zoom < 20 ? 10 : 5; // adjust labels based on zoom density
    for (let i = 0; i <= projectSettings.duration; i += interval) {
      ticks.push(
        <div 
          key={i} 
          className="absolute text-[10px] font-mono text-zinc-500 border-l border-zinc-800 h-3 pt-4 pl-1"
          style={{ left: `${i * zoom}px` }}
        >
          {i}s
        </div>
      );
    }
    return ticks;
  };

  const getTrackIcon = (trackId: string) => {
    switch (trackId) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-cyan-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-pink-400" />;
      case 'image':
      default:
        return <ImageIcon className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const timelinePanelClass = 
    theme === 'cyberpunk' 
      ? 'bg-[#080210] border-purple-950/65 text-[#39ff14]' 
      : theme === 'warm' 
        ? 'bg-[#fcfaf4] border-[#eae2cc] text-[#433422]' 
        : theme === 'sunset' 
          ? 'bg-[#0e0729] border-indigo-950 text-rose-100' 
          : theme === 'emerald'
            ? 'bg-[#03110c] border-emerald-950/65 text-emerald-100'
            : theme === 'royal'
              ? 'bg-[#080312] border-[#200e3a] text-indigo-100'
              : isDark 
                ? 'bg-[#0b0c10] border-zinc-900 text-zinc-200' 
                : 'bg-white border-slate-200 text-slate-800';

  const timelineHeaderClass =
    theme === 'cyberpunk' 
      ? 'border-purple-900/30 bg-purple-950/10' 
      : theme === 'warm' 
        ? 'border-[#eae2cc] bg-[#faf6ee]' 
        : theme === 'sunset' 
          ? 'border-indigo-900/40 bg-[#130d33]/60' 
          : theme === 'emerald'
            ? 'border-emerald-900/30 bg-emerald-950/10'
            : theme === 'royal'
              ? 'border-[#220f3c] bg-[#1a0c35]/20'
              : isDark 
                ? 'border-zinc-900 bg-zinc-950/80' 
                : 'border-slate-200 bg-slate-50';

  return (
    <div 
      id="timeline-panel" 
      className={`border-t flex flex-col h-72 select-none transition-all duration-300 ${timelinePanelClass}`}
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleGlobalMouseUp}
      onMouseLeave={handleGlobalMouseUp}
    >
      {/* 1. Timeline Header / Utility Toolbar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b transition-all duration-300 ${timelineHeaderClass}`}>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}>
            <Clock className="w-4 h-4 text-cyan-500" />
            Timeline tracks
          </span>
          {selectedClip && (
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-lg ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <span className="text-[11px] truncate max-w-44 font-medium">Selected: {selectedClip.name}</span>
              <button 
                onClick={onSplitClip}
                className={`p-1 rounded transition ${
                  isDark ? 'hover:bg-zinc-800 text-cyan-400' : 'hover:bg-slate-200 text-cyan-600'
                }`} 
                title="Split Clip at Playhead"
              >
                <Scissors className="w-3 h-3" />
              </button>
              <button 
                onClick={() => onDeleteClip(selectedClip.id)}
                className={`p-1 rounded transition ${
                  isDark ? 'hover:bg-zinc-800 text-rose-400' : 'hover:bg-slate-200 text-rose-600'
                }`} 
                title="Delete Selected Clip"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Timeline Zoom Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onZoomOut} 
            className={`p-1.5 border rounded-lg transition ${
              isDark 
                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                : 'bg-white hover:bg-slate-50 border-slate-205 text-slate-500 hover:text-slate-800 shadow-3xs'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Zoom</span>
          <button 
            onClick={onZoomIn} 
            className={`p-1.5 border rounded-lg transition ${
              isDark 
                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200' 
                : 'bg-white hover:bg-slate-50 border-slate-205 text-slate-500 hover:text-slate-800 shadow-3xs'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Scrollable tracks Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Track Headers (Left sidebar pane) */}
        <div className={`w-24 border-r flex flex-col pt-8 transition-colors duration-300 ${
          isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-slate-50 border-slate-200'
        }`}>
          {(['video', 'audio', 'text', 'image'] as const).map((trackId) => (
            <div 
              key={trackId}
              className={`h-14 border-b flex flex-col justify-center items-center gap-1 px-2 text-center transition ${
                isDark ? 'border-zinc-900/60 hover:bg-zinc-900/20' : 'border-slate-200 hover:bg-slate-100'
              }`}
            >
              {getTrackIcon(trackId)}
              <span className={`text-[10px] font-bold uppercase tracking-wider capitalize ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>{trackId}</span>
            </div>
          ))}
        </div>

        {/* Scrollable track Lanes & Ruler */}
        <div 
          ref={timelineTracksRef}
          id="timeline-scroller-tracks"
          className={`flex-1 overflow-x-auto overflow-y-hidden relative ${
            isDark ? 'bg-[#09090c]' : 'bg-slate-100/40'
          }`}
        >
          {/* Time Ruler (Upper timeline scale) */}
          <div 
            id="time-ruler-scale"
            onMouseDown={handleRulerMouseDown}
            className={`h-8 border-b relative cursor-ew-resize select-none ${
              isDark ? 'border-zinc-900 bg-zinc-950/40' : 'border-slate-200 bg-slate-50/60'
            }`}
            style={{ width: `${maxTimelineWidth}px` }}
          >
            {renderRulerTicks()}
          </div>

          {/* Track Lanes */}
          <div className="relative" style={{ width: `${maxTimelineWidth}px` }}>
            {(['video', 'audio', 'text', 'image'] as const).map((trackId) => {
              const trackClips = clips.filter((c) => c.trackId === trackId);
              return (
                <div 
                  key={trackId}
                  className={`h-14 border-b relative flex items-center group transition ${
                    isDark ? 'border-zinc-900/60 bg-zinc-900/5' : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Grid background lines */}
                  <div className={`absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none`} />

                  {/* Render clips inside this track */}
                  {trackClips.map((clip) => {
                    const leftPos = clip.startInTimeline * zoom;
                    const clipWidth = (clip.endInTimeline - clip.startInTimeline) * zoom;
                    const isClipSelected = selectedClip?.id === clip.id;

                    const getClipBgColor = () => {
                      if (isClipSelected) return 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]';
                      switch (clip.type) {
                        case 'video':
                          return 'bg-cyan-950/30 border-cyan-850 text-cyan-300 hover:bg-cyan-950/45';
                        case 'audio':
                          return 'bg-emerald-950/30 border-emerald-850 text-emerald-300 hover:bg-emerald-950/45';
                        case 'text':
                          return 'bg-pink-950/30 border-pink-850 text-pink-300 hover:bg-pink-950/45';
                        case 'image':
                        default:
                          return 'bg-rose-950/30 border-rose-850 text-rose-300 hover:bg-rose-950/45';
                      }
                    };

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClip(clip);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          onSelectClip(clip);
                          // Setup Drag to Move
                          setDraggedClip({
                            clip,
                            startX: e.clientX,
                            originalStart: clip.startInTimeline
                          });
                        }}
                        className={`absolute h-10 border rounded-lg flex items-center justify-between px-2 cursor-grab select-none transition-shadow overflow-hidden ${getClipBgColor()}`}
                        style={{ 
                          left: `${leftPos}px`, 
                          width: `${clipWidth}px`,
                          zIndex: isClipSelected ? 10 : 1
                        }}
                      >
                        {/* Trim Drag Handle Left */}
                        <div 
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizingClip({
                              clip,
                              edge: 'left',
                              startX: e.clientX,
                              originalStart: clip.startInTimeline,
                              originalEnd: clip.endInTimeline
                            });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-500/40 hover:bg-cyan-400 cursor-col-resize z-20 flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-40 transition"
                        />

                        {/* Real-looking track decorations inside row card */}
                        {clip.type === 'video' && (
                          <>
                            <div className="absolute inset-x-0 top-0.5 h-1 flex justify-around opacity-25 pointer-events-none select-none">
                              {[...Array(Math.max(2, Math.floor(clipWidth / 10)))].map((_, i) => (
                                <div key={i} className="w-1.5 h-0.75 bg-current rounded-2xs" />
                              ))}
                            </div>
                            <div className="absolute inset-x-0 bottom-0.5 h-1 flex justify-around opacity-25 pointer-events-none select-none">
                              {[...Array(Math.max(2, Math.floor(clipWidth / 10)))].map((_, i) => (
                                <div key={i} className="w-1.5 h-0.75 bg-current rounded-2xs" />
                              ))}
                            </div>
                          </>
                        )}

                        {clip.type === 'audio' && (
                          <div className="absolute inset-0 flex items-center justify-around px-3 opacity-20 pointer-events-none select-none">
                            {[...Array(Math.max(6, Math.floor(clipWidth / 6)))].map((_, i) => {
                              const heights = [15, 45, 70, 30, 85, 40, 60, 20, 95, 50, 35, 75];
                              const h = heights[i % heights.length];
                              return (
                                <div 
                                  key={i} 
                                  className="w-0.5 bg-current rounded-full" 
                                  style={{ height: `${h}%` }}
                                />
                              );
                            })}
                          </div>
                        )}

                        {clip.type === 'text' && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none select-none font-serif text-2xl font-black italic tracking-wider">
                            T
                          </div>
                        )}

                        {clip.type === 'image' && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none select-none">
                            <div className="w-5 h-5 border border-dashed border-current rounded-sm rotate-6 flex items-center justify-center">
                              <div className="w-2.5 h-2 bg-current/40 rounded-3xs" />
                            </div>
                          </div>
                        )}

                        {/* Styled Icon & Name */}
                        <div className="flex items-center gap-1.5 truncate pointer-events-none pr-2 z-10">
                          <span className="scale-75 opacity-70">
                            {getTrackIcon(clip.trackId)}
                          </span>
                          <span className="text-[10px] font-bold tracking-tight truncate leading-none">
                            {clip.name}
                          </span>
                        </div>

                        {/* Mini indicators */}
                        <div className="flex items-center gap-1 pointer-events-none font-mono text-[8px] text-zinc-500 z-10">
                          <span>{clip.speed !== 1 ? `${clip.speed}x` : ''}</span>
                        </div>

                        {/* Trim Drag Handle Right */}
                        <div 
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizingClip({
                              clip,
                              edge: 'right',
                              startX: e.clientX,
                              originalStart: clip.startInTimeline,
                              originalEnd: clip.endInTimeline
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-1.5 bg-cyan-500/40 hover:bg-cyan-400 cursor-col-resize z-20 flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-40 transition"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Red Playhead Seekhead Indicator */}
            <div 
              id="timeline-red-playhead"
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.7)]"
              style={{ left: `${currentTime * zoom}px` }}
            >
              {/* Playhead handle top marker */}
              <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border border-white flex items-center justify-center shadow-lg">
                <span className="w-1 h-1 bg-white rounded-full"></span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Empty Timeline hint if no clips */}
      {clips.length === 0 && (
        <div className="absolute inset-x-0 bottom-10 flex flex-col items-center justify-center pointer-events-none text-zinc-600 gap-2">
          <p className="text-xs font-semibold">Your video editing timeline is empty.</p>
          <p className="text-[10px]">Select presets from the left sidebar or import files to start editing!</p>
        </div>
      )}
    </div>
  );
}
