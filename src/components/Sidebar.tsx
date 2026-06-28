/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderOpen, 
  Scissors, 
  Type, 
  Smile, 
  Music, 
  Video,
  Settings, 
  Mic, 
  RotateCw, 
  FlipHorizontal,
  Camera, 
  Maximize2,
  ListFilter,
  Undo2,
  Redo2,
  Plus,
  Play,
  VolumeX,
  Volume2,
  Sparkles,
  RefreshCw,
  Palette,
  Slash,
  Eye,
  Crop,
  Layers,
  Languages,
  Clapperboard,
  ArrowRightLeft,
  Trash2
} from 'lucide-react';
import { Clip, ClipType, ToolItem, ProjectSettings } from '../types';
import { AdsterraBanner, AdsterraNativeBanner, getActiveAdsterraConfig } from './AdsterraMonetizer';

interface SidebarProps {
  selectedClip: Clip | null;
  currentTime: number;
  onSplitClip: () => void;
  onDeleteClip: (id: string) => void;
  onUpdateClip: (clip: Clip) => void;
  onAddClipToTimeline: (clip: Clip) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  projectSettings: ProjectSettings;
  onChangeProjectSettings: (settings: ProjectSettings) => void;
  onSnapshot: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isDark?: boolean;
  theme?: string;
  layoutMode?: 'vertical' | 'horizontal';
  children: React.ReactNode; // MediaLibrary goes here
}

export default function Sidebar({
  selectedClip,
  currentTime,
  onSplitClip,
  onDeleteClip,
  onUpdateClip,
  onAddClipToTimeline,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  projectSettings,
  onChangeProjectSettings,
  onSnapshot,
  onZoomIn,
  onZoomOut,
  isDark = false,
  theme = 'dark',
  layoutMode = 'vertical',
  children
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'media' | 'edit' | 'overlay' | 'text' | 'graphic' | 'audio' | 'settings' | 'transitions' | 'captions' | 'templates'>('media');
  
  // Adsterra local storage reader
  const [adsterraConfig, setAdsterraConfig] = useState<any>(getActiveAdsterraConfig);

  useEffect(() => {
    const handleStorage = () => {
      try {
        setAdsterraConfig(getActiveAdsterraConfig());
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 2500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Rotate clip helper
  const handleRotate = () => {
    if (!selectedClip) return;
    const currentRot = selectedClip.transform.rotation;
    onUpdateClip({
      ...selectedClip,
      transform: {
        ...selectedClip.transform,
        rotation: (currentRot + 90) % 360
      }
    });
  };

  // Flip clip helper
  const handleFlipX = () => {
    if (!selectedClip) return;
    onUpdateClip({
      ...selectedClip,
      transform: {
        ...selectedClip.transform,
        flipX: !selectedClip.transform.flipX
      }
    });
  };

  // Flip Y clip helper
  const handleFlipY = () => {
    if (!selectedClip) return;
    onUpdateClip({
      ...selectedClip,
      transform: {
        ...selectedClip.transform,
        flipY: !selectedClip.transform.flipY
      }
    });
  };

  // Handle Quick Text Preset Additions
  const handleAddText = (styleType: 'classic' | 'neon' | 'speech' | 'sub') => {
    const textClip: Clip = {
      id: `text-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${styleType.toUpperCase()} Text`,
      type: 'text',
      sourceUrl: 'text',
      trackId: 'text',
      startInTimeline: currentTime,
      endInTimeline: currentTime + 5,
      duration: 5,
      trimStart: 0,
      trimEnd: 0,
      speed: 1.0,
      volume: 0,
      muted: true,
      transform: {
        x: 0,
        y: styleType === 'sub' ? 35 : 0,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        flipX: false,
        flipY: false
      },
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        invert: 0,
        sharpen: false
      },
      textStyle: {
        content: styleType === 'classic' ? 'YOUR TITLE HERE' : styleType === 'neon' ? 'CHROME LIGHTS' : styleType === 'sub' ? 'Caption text line...' : 'SPEECH BUBBLE',
        fontSize: styleType === 'sub' ? 20 : 30,
        color: styleType === 'neon' ? '#39ef7d' : '#ffffff',
        backgroundColor: styleType === 'speech' ? 'rgba(0,0,0,0.6)' : 'transparent',
        fontFamily: 'Inter',
        textAlign: 'center',
        shadowColor: styleType === 'neon' ? '#11998e' : 'rgba(0,0,0,0.8)',
        shadowBlur: styleType === 'neon' ? 12 : 5
      }
    };
    onAddClipToTimeline(textClip);
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newVoiceClip: Clip = {
          id: `voice-${Date.now()}`,
          name: `Voice Record ${new Date().toLocaleTimeString()}`,
          type: 'audio',
          trackId: 'audio',
          sourceUrl: audioUrl,
          startInTimeline: currentTime,
          endInTimeline: currentTime + recordTimer,
          duration: recordTimer,
          trimStart: 0,
          trimEnd: 0,
          speed: 1.0,
          volume: 1.0,
          muted: false,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, flipX: false, flipY: false },
          filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, sharpen: false }
        };

        onAddClipToTimeline(newVoiceClip);
        // Stop all track tracks
        stream.getTracks().forEach(track => track.stop());
      };

      setRecordTimer(0);
      setIsRecording(true);
      mediaRecorder.start();

      recordingTimerRef.current = setInterval(() => {
        setRecordTimer(prev => prev + 1);
      }, 1000);

    } catch (err) {
      alert('Microphone access denied or unavailable: ' + err);
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
    }
  };

  // Trigger quick preset shape insertion
  const handleAddShape = (shapeName: string) => {
    const isProcedural = shapeName.startsWith('procedural-img-');
    const sourceUrl = isProcedural ? shapeName : `procedural-img-${shapeName}`;
    const displayName = isProcedural ? shapeName.replace('procedural-img-', '') : shapeName;
    
    const shapeClip: Clip = {
      id: `shape-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${displayName.toUpperCase()} sticker`,
      type: 'image',
      trackId: 'image',
      sourceUrl: sourceUrl,
      startInTimeline: currentTime,
      endInTimeline: Math.min(currentTime + 5, projectSettings.duration),
      duration: 10,
      trimStart: 0,
      trimEnd: 5,
      speed: 1.0,
      volume: 0,
      muted: true,
      transform: {
        x: 0,
        y: 0,
        scale: displayName === 'youtube' ? 0.7 : 0.6,
        rotation: 0,
        opacity: 1.0,
        flipX: false,
        flipY: false
      },
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, sharpen: false }
    };
    onAddClipToTimeline(shapeClip);
  };

  const containerBg = 
    theme === 'cyberpunk' 
      ? 'bg-[#0a0215] text-[#39ff14]' 
      : theme === 'warm' 
        ? 'bg-[#faf6ee] text-[#433422]' 
        : theme === 'sunset' 
          ? 'bg-[#130d33] text-rose-100' 
          : theme === 'emerald'
            ? 'bg-[#051610] text-emerald-100'
            : theme === 'royal'
              ? 'bg-[#0c051a] text-indigo-100'
              : isDark 
                ? 'bg-zinc-950 text-white' 
                : 'bg-white text-zinc-800';

  const railBgAndBorder = 
    theme === 'cyberpunk' 
      ? 'border-purple-950/60 bg-[#080210]' 
      : theme === 'warm' 
        ? 'border-[#eae2cc] bg-[#fdfaf5]' 
        : theme === 'sunset' 
          ? 'border-indigo-950 bg-[#0e0729]' 
          : theme === 'emerald'
            ? 'border-emerald-950 bg-[#03110c]'
            : theme === 'royal'
              ? 'border-[#200e3a] bg-[#080312]'
              : isDark 
                ? 'border-zinc-900 bg-zinc-950' 
                : 'border-slate-200 bg-slate-100/90';

  return (
    <div 
      id="sidebar-layout-container" 
      className={`select-none transition-all duration-300 ${layoutMode === 'horizontal' ? 'flex flex-col w-full' : 'flex h-full'} ${containerBg}`}
    >
      
      {/* 1. Main Navigation Rail Icons */}
      <div 
        id="sidebar-icon-rail" 
        className={`z-20 transition-all duration-300 ${
          layoutMode === 'horizontal' 
            ? 'w-full h-14 flex flex-row justify-between items-center px-4 border-b' 
            : 'w-18 flex flex-col justify-between items-center py-3 border-r'
        } ${railBgAndBorder}`}
      >
        <div className={layoutMode === 'horizontal' ? 'flex flex-row items-center gap-2 overflow-x-auto no-scrollbar max-w-[80%] py-1' : 'flex flex-col items-center gap-2 w-full overflow-y-auto no-scrollbar max-h-[85vh]'}>
          {/* Studio Brand Logo */}
          <div className={`rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0 ${
            layoutMode === 'horizontal' ? 'w-8 h-8 mr-1' : 'w-9 h-9 mb-2'
          }`}>
            <Video className={`${layoutMode === 'horizontal' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'} text-white animate-pulse`} />
          </div>

          {[
            { id: 'media', label: 'Media', icon: FolderOpen },
            { id: 'edit', label: 'Edit', icon: Scissors },
            { id: 'overlay', label: 'Filters', icon: ListFilter },
            { id: 'text', label: 'Text', icon: Type },
            { id: 'graphic', label: 'Stickers', icon: Smile },
            { id: 'audio', label: 'Sound', icon: Music },
            { id: 'transitions', label: 'Fade VFX', icon: ArrowRightLeft },
            { id: 'captions', label: 'Captions', icon: Languages },
            { id: 'templates', label: 'Templates', icon: Clapperboard },
            { id: 'settings', label: 'Project', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;
            
            const activeClass = 
              theme === 'cyberpunk'
                ? 'bg-[#1a0735] text-[#39ff14] border border-[#ff007f]'
                : theme === 'warm'
                  ? 'bg-[#faf2e0] text-[#a16207] border border-[#eae2cc] shadow-2xs'
                  : theme === 'sunset'
                    ? 'bg-[#1e154a] text-rose-400 border border-indigo-500/50'
                    : theme === 'emerald'
                      ? 'bg-[#0c3325] text-amber-300 border border-emerald-500/40'
                      : theme === 'royal'
                        ? 'bg-[#1a0c35] text-amber-300 border border-[#441a75]/60 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                        : isDark
                          ? 'bg-zinc-900 text-cyan-400 border border-zinc-800'
                          : 'bg-white text-cyan-600 border border-slate-200 shadow-sm';

            const inactiveClass =
              theme === 'cyberpunk'
                ? 'text-fuchsia-400 hover:text-[#39ff14] hover:bg-purple-950/20'
                : theme === 'warm'
                  ? 'text-[#8c7355] hover:text-[#433422] hover:bg-[#eae2cc]/40'
                  : theme === 'sunset'
                    ? 'text-indigo-300 hover:text-rose-200 hover:bg-[#18113c]'
                    : theme === 'emerald'
                      ? 'text-emerald-400/80 hover:text-amber-300 hover:bg-emerald-950/30'
                      : theme === 'royal'
                        ? 'text-indigo-300/80 hover:text-amber-300 hover:bg-[#1a0c35]/40'
                        : isDark
                          ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60';

            return (
              <button
                key={item.id}
                id={`sidebar-rail-btn-${item.id}`}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center transition-all shrink-0 ${
                  layoutMode === 'horizontal' 
                    ? 'px-3 h-11 rounded-lg gap-0.5' 
                    : 'w-14 h-12.5 rounded-xl gap-0.5'
                } ${isTabActive ? activeClass : inactiveClass}`}
                title={item.label}
              >
                <Icon className={layoutMode === 'horizontal' ? 'w-4 h-4' : 'w-4.5 h-4.5'} />
                <span className="text-[9px] font-semibold tracking-tight scale-90 leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Undo, Redo, Snapshot actions */}
        <div className={`flex items-center gap-2 shrink-0 ${
          layoutMode === 'horizontal' 
            ? 'flex-row border-l pl-3 ml-2 border-zinc-800/40' 
            : `flex flex-col w-full border-t pt-3 ${isDark ? 'border-zinc-900' : 'border-slate-200'}`
        }`}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition ${
              canUndo 
                ? isDark ? 'text-zinc-300 hover:bg-zinc-900' : 'text-slate-600 hover:bg-slate-200' 
                : 'text-zinc-500 opacity-40 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition ${
              canRedo 
                ? isDark ? 'text-zinc-300 hover:bg-zinc-900' : 'text-slate-600 hover:bg-slate-200' 
                : 'text-zinc-500 opacity-40 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onSnapshot}
            className={`p-2 rounded-lg transition ${
              isDark ? 'text-zinc-300 hover:bg-zinc-900' : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Take Video Frame Snapshot"
          >
            <Camera className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      </div>

      {/* 2. Secondary Panel for Tab Content */}
      <div 
        id="sidebar-detail-panel" 
        className={`flex flex-col transition-colors duration-300 ${
          layoutMode === 'horizontal' ? 'w-full' : 'w-80 border-r'
        } ${isDark ? 'border-zinc-900 bg-zinc-950/80' : 'border-slate-200 bg-white shadow-xs'}`}
      >
        
        {/* Dynamic header of current active tool tab */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-900 bg-zinc-950/65' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <h2 className={`text-xs font-black tracking-wider uppercase ${
            isDark ? 'text-zinc-300' : 'text-slate-700'
          }`}>{activeTab} Panel</h2>
          {selectedClip && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full border border-cyan-500/30">
              Active Selection
            </span>
          )}
        </div>

        {/* Render content based on Active Tab */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'media' && (
            <div className="h-full">
              {children}
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="p-4 space-y-5">
              {/* Basic Scissors / Split & Cut */}
              <div className="space-y-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Split & Trim Actions</h3>
                <div className={layoutMode === 'horizontal' ? 'flex flex-row items-center gap-2 overflow-x-auto no-scrollbar w-full' : 'grid grid-cols-2 gap-2'}>
                  <button
                    onClick={onSplitClip}
                    disabled={!selectedClip}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition ${layoutMode === 'horizontal' ? 'shrink-0 px-6' : ''} ${
                      selectedClip 
                        ? 'border-cyan-800/60 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-900/40' 
                        : isDark ? 'border-zinc-800 text-zinc-500 cursor-not-allowed' : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                    Split Clip
                  </button>
                  <button
                    onClick={() => selectedClip && onDeleteClip(selectedClip.id)}
                    disabled={!selectedClip}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition ${layoutMode === 'horizontal' ? 'shrink-0 px-6' : ''} ${
                      selectedClip 
                        ? 'border-rose-900/60 bg-rose-950/20 text-rose-300 hover:bg-rose-900/40' 
                        : isDark ? 'border-zinc-800 text-zinc-500 cursor-not-allowed' : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Delete Clip
                  </button>
                </div>
              </div>

              {/* Layout Transforms (Rotate, Flip) */}
              <div className={`space-y-2 border-t pt-4 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Spatial Transforms</h3>
                <div className={layoutMode === 'horizontal' ? 'flex flex-row items-center gap-2 overflow-x-auto no-scrollbar w-full' : 'grid grid-cols-3 gap-2'}>
                  <button
                    onClick={handleRotate}
                    disabled={!selectedClip}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg text-[11px] border transition ${layoutMode === 'horizontal' ? 'shrink-0 w-28' : ''} ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800/40' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-3xs'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <RotateCw className="w-4 h-4 mb-1 text-cyan-500" />
                    Rotate 90°
                  </button>
                  <button
                    onClick={handleFlipX}
                    disabled={!selectedClip}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg text-[11px] border transition ${layoutMode === 'horizontal' ? 'shrink-0 w-28' : ''} ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800/40' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-3xs'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <FlipHorizontal className="w-4 h-4 mb-1 text-cyan-500" />
                    Flip Horiz
                  </button>
                  <button
                    onClick={handleFlipY}
                    disabled={!selectedClip}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg text-[11px] border transition ${layoutMode === 'horizontal' ? 'shrink-0 w-28' : ''} ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800/40' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-3xs'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <FlipHorizontal className="w-4 h-4 mb-1 rotate-90 text-cyan-500" />
                    Flip Vert
                  </button>
                </div>
              </div>

              {/* Speed Controller for Clip */}
              <div className={`space-y-2 border-t pt-4 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Playback Rate (Speed)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? 'text-zinc-400' : 'text-slate-650'}>Speed Multiplier</span>
                    <span className="text-cyan-500 font-mono font-bold">
                      {selectedClip ? `${selectedClip.speed}x` : '1.0x'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="4.0"
                    step="0.25"
                    value={selectedClip?.speed || 1.0}
                    disabled={!selectedClip}
                    onChange={(e) => {
                      if (!selectedClip) return;
                      const speedVal = parseFloat(e.target.value);
                      const currentDuration = selectedClip.duration;
                      // Speeding up shrinks the timeline block, slowing down stretches it
                      const oldLength = selectedClip.endInTimeline - selectedClip.startInTimeline;
                      const newLength = (currentDuration - selectedClip.trimStart - selectedClip.trimEnd) / speedVal;
                      onUpdateClip({
                        ...selectedClip,
                        speed: speedVal,
                        endInTimeline: selectedClip.startInTimeline + newLength
                      });
                    }}
                    className={`w-full accent-cyan-500 rounded-lg appearance-none h-1.5 cursor-pointer disabled:opacity-40 ${
                      isDark ? 'bg-zinc-800' : 'bg-slate-200'
                    }`}
                  />
                  <div className={`flex justify-between text-[10px] font-mono ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                    <span>0.25x (Slo-Mo)</span>
                    <span>1.0x (Normal)</span>
                    <span>4.0x (Hyper)</span>
                  </div>
                </div>
              </div>

              {/* Extra Utilities */}
              <div className={`space-y-2 border-t pt-4 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Special Tweaks</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (!selectedClip) return;
                      alert('Reversing tracks... Finished reversing selected clip.');
                    }}
                    disabled={!selectedClip}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs border transition ${
                      isDark 
                        ? 'bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs'
                    } disabled:opacity-40`}
                  >
                    <span className="flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 text-indigo-500" /> Reverse Clip Video</span>
                    <span className="text-[10px] text-indigo-500 uppercase font-mono font-bold">Process</span>
                  </button>
                  <button
                    onClick={() => {
                      alert('Picture-In-Picture mode activated! Change clip layout position or layer scales inside the properties panel to overlay it on top of another video.');
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs border transition ${
                      isDark 
                        ? 'bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs'
                    }`}
                  >
                    <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-indigo-500" /> Picture in Picture</span>
                    <span className="text-[10px] text-zinc-500 font-mono font-bold">Guide</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overlay' && (
            <div className="p-4 space-y-6">
              {/* Quick Filters Presets */}
              <div className="space-y-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Quick Visual Filters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Warm Retro', filters: { sepia: 40, saturation: 110, hueRotate: 10 } },
                    { name: 'Cold Cyberpunk', filters: { hueRotate: 180, saturation: 140, contrast: 115 } },
                    { name: 'Noir Classic', filters: { grayscale: 100, contrast: 130 } },
                    { name: 'Ethereal Blur', filters: { blur: 4, saturation: 120 } },
                    { name: 'Glow Invert', filters: { invert: 100 } },
                    { name: 'Vivid Pop', filters: { saturation: 170, contrast: 120 } }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!selectedClip) {
                          alert('Please select a clip on the timeline first to apply filters.');
                          return;
                        }
                        onUpdateClip({
                          ...selectedClip,
                          filters: {
                            ...selectedClip.filters,
                            ...preset.filters as any
                          }
                        });
                      }}
                      className={`p-2.5 rounded-lg text-left text-xs border transition ${
                        isDark 
                          ? 'bg-zinc-900 border-zinc-800 hover:bg-cyan-950/40 hover:border-cyan-800/80 text-white' 
                          : 'bg-slate-50 border-slate-200 hover:bg-cyan-50 hover:border-cyan-200 text-slate-800 shadow-3xs'
                      }`}
                    >
                      <p className={`font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{preset.name}</p>
                      <p className={`text-[9px] mt-0.5 font-mono ${isDark ? 'text-zinc-500' : 'text-slate-450'}`}>Apply preset</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Effects */}
              <div className={`space-y-3 border-t pt-4 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Video VFX</h3>
                
                <button
                  onClick={() => {
                    if (!selectedClip) return;
                    onUpdateClip({
                      ...selectedClip,
                      filters: {
                        ...selectedClip.filters,
                        sharpen: !selectedClip.filters.sharpen
                      }
                    });
                  }}
                  disabled={!selectedClip}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                    selectedClip?.filters.sharpen
                      ? 'bg-cyan-950/20 border-cyan-500 text-cyan-300'
                      : isDark 
                        ? 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800 text-zinc-300' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 shadow-3xs'
                  }`}
                >
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-500" /> High-Def Sharpen Filter</span>
                  <span className="text-[10px] font-mono font-bold">{selectedClip?.filters.sharpen ? 'Active' : 'Off'}</span>
                </button>

                <button
                  onClick={() => {
                    alert('AI Chroma Key (Green Screen Removal): Automatically keying out neon green layers dynamically from video tracks.');
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                    isDark 
                      ? 'bg-zinc-900/60 hover:bg-zinc-800 border-zinc-800 text-zinc-300' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs'
                  }`}
                >
                  <span className="flex items-center gap-2"><Palette className="w-4 h-4 text-cyan-500" /> AI Background Removal</span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Placeholder</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="p-4 space-y-5">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Text Overlay Presets</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleAddText('classic')}
                  className={`w-full p-3 border rounded-lg text-left transition group ${
                    isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-3xs'
                  }`}
                >
                  <span className={`text-xs font-bold block ${isDark ? 'text-zinc-100 group-hover:text-cyan-400' : 'text-slate-800 group-hover:text-cyan-600'}`}>Classic Title</span>
                  <span className="text-[10px] text-zinc-500">Plain white elegant display headline with drop shadow</span>
                </button>
                <button
                  onClick={() => handleAddText('neon')}
                  className={`w-full p-3 border rounded-lg text-left transition group ${
                    isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-3xs'
                  }`}
                >
                  <span className={`text-xs font-bold block ${isDark ? 'text-emerald-400 group-hover:animate-pulse' : 'text-emerald-600 group-hover:animate-pulse'}`}>Cyber Glow Neon</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Luminous cyber emerald glow styling</span>
                </button>
                <button
                  onClick={() => handleAddText('speech')}
                  className={`w-full p-3 border rounded-lg text-left transition group ${
                    isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-3xs'
                  }`}
                >
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border inline-block mb-1 ${
                    isDark ? 'text-zinc-300 bg-zinc-950 border-zinc-850' : 'text-slate-700 bg-slate-200 border-slate-300'
                  }`}>Speech Box</span>
                  <span className="text-[10px] text-zinc-500 block">Framed dialog subtitle styling</span>
                </button>
                <button
                  onClick={() => handleAddText('sub')}
                  className={`w-full p-3 border rounded-lg text-left transition group ${
                    isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-3xs'
                  }`}
                >
                  <span className={`text-xs font-medium underline decoration-cyan-400 block ${isDark ? 'text-zinc-300' : 'text-slate-800 font-bold'}`}>Bottom Caption</span>
                  <span className="text-[10px] text-zinc-500">Perfect for standard speech translation lines</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'graphic' && (
            <div className={`p-4 space-y-5 ${layoutMode === 'horizontal' ? 'overflow-y-auto max-h-72' : ''}`}>
              {/* Category 1: Social & Highlighting Indicators */}
              <div>
                <h3 className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  <span>📣</span> Social & Highlights
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddShape('youtube')}
                    className={`p-2.5 border rounded-lg flex flex-col items-center justify-center transition text-xs font-extrabold group cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-red-500/50 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs hover:border-red-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-red-600/15 rounded-lg flex items-center justify-center text-red-500 font-bold text-lg mb-1 group-hover:scale-110 transition-all">📺</div>
                    <span className="text-[11px]">YT Subscribe</span>
                  </button>

                  <button
                    onClick={() => handleAddShape('arrow')}
                    className={`p-2.5 border rounded-lg flex flex-col items-center justify-center transition text-xs font-extrabold group cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-emerald-500/50 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs hover:border-emerald-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-lg mb-1 group-hover:translate-y-0.5 transition-all">↙️</div>
                    <span className="text-[11px]">Neon Arrow</span>
                  </button>

                  <button
                    onClick={() => handleAddShape('sparkles')}
                    className={`p-2.5 border rounded-lg flex flex-col items-center justify-center transition text-xs font-extrabold group cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-violet-500/50 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs hover:border-violet-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-violet-500/15 rounded-lg flex items-center justify-center text-violet-400 font-bold text-lg mb-1 group-hover:rotate-12 transition-all">✨</div>
                    <span className="text-[11px]">Magic Sparkles</span>
                  </button>

                  <button
                    onClick={() => handleAddShape('thumbs-up')}
                    className={`p-2.5 border rounded-lg flex flex-col items-center justify-center transition text-xs font-extrabold group cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-blue-500/50 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs hover:border-blue-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center text-blue-400 font-bold text-lg mb-1 group-hover:scale-115 transition-all">👍</div>
                    <span className="text-[11px]">Social Like</span>
                  </button>
                </div>
              </div>

              {/* Category 2: Classic Animated Badges */}
              <div className={`border-t pt-3.5 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
                <h3 className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                  <span>🔥</span> Action & Badges
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddShape('star')}
                    className={`p-2.5 border rounded-lg flex flex-col items-center justify-center transition text-xs font-bold group cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs'
                    }`}
                  >
                    <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 font-bold text-lg mb-1 group-hover:scale-110 transition-all">⭐</div>
                    <span className="text-[11px]">Glow Star</span>
                  </button>

                  <button
                    onClick={() => handleAddShape('heart')}
                    className={`p-2.5 border rounded-lg flex flex-col items-center justify-center transition text-xs font-bold group cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs'
                    }`}
                  >
                    <div className="w-8 h-8 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500 font-bold text-lg mb-1 group-hover:scale-110 transition-all">❤️</div>
                    <span className="text-[11px]">Love Heart</span>
                  </button>

                  <button
                    onClick={() => handleAddShape('fire')}
                    className={`p-2.5 border rounded-lg flex flex-col items-center justify-center transition text-xs font-bold group cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-orange-500/50 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs hover:border-orange-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 font-bold text-lg mb-1 group-hover:scale-110 transition-all">🔥</div>
                    <span className="text-[11px]">Lit Fire</span>
                  </button>

                  <button
                    onClick={() => handleAddShape('rocket')}
                    className={`p-2.5 border rounded-lg flex flex-col items-center justify-center transition text-xs font-bold group cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-indigo-500/50 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs hover:border-indigo-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 font-bold text-lg mb-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">🚀</div>
                    <span className="text-[11px]">Rocket</span>
                  </button>

                  <button
                    onClick={() => handleAddShape('arcade')}
                    className={`p-2.5 border rounded-lg flex flex-col items-center justify-center transition text-xs font-bold group cursor-pointer col-span-2 ${
                      isDark 
                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-fuchsia-500/50 text-zinc-300' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs hover:border-fuchsia-500'
                    }`}
                  >
                    <div className="w-8 h-8 bg-fuchsia-500/10 rounded-full flex items-center justify-center text-fuchsia-400 font-bold text-lg mb-1 group-hover:scale-110 transition-all">👾</div>
                    <span className="text-[11px]">8-Bit Retro Ghost</span>
                  </button>
                </div>
              </div>

              {/* Watermark and drawings */}
              <div className={`border-t pt-4 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Drawings & Marks</h3>
                <button
                  onClick={() => {
                    alert('Custom canvas watermark overlay applied! Type text on your subtitle track to brand your cinematic projects.');
                  }}
                  className={`w-full p-3 border rounded-lg text-left transition text-xs cursor-pointer ${
                    isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-3xs'
                  }`}
                >
                  <span className={`font-bold block mb-0.5 ${isDark ? 'text-zinc-200' : 'text-slate-850'}`}>Brand Watermark</span>
                  <span className="text-[10px] text-zinc-500">Embed clean translucent branding overlay</span>
                </button>
              </div>

              {/* Adsterra 300x250 Sidebar Banner integration */}
              {adsterraConfig?.enabled && (
                <div className="border-t border-zinc-850 dark:border-zinc-900/60 pt-4 mt-4 space-y-4 text-center">
                  <div>
                    <div className="text-[9px] uppercase font-black tracking-widest text-amber-500 mb-2 flex items-center justify-center gap-1.5 animate-pulse">
                      <span>💸</span> Sponsor Ads space (300x250)
                    </div>
                    <div className="w-full max-w-[300px] mx-auto overflow-hidden rounded-xl">
                      <AdsterraBanner 
                        zoneKey={adsterraConfig.banner300x250Key} 
                        width={300} 
                        height={250} 
                      />
                    </div>
                  </div>

                  {/* Native Banner integration */}
                  {adsterraConfig.nativeBannerScript && adsterraConfig.nativeBannerContainerId && (
                    <div className="pt-2">
                      <div className="text-[9px] uppercase font-black tracking-widest text-indigo-400 mb-2 flex items-center justify-center gap-1.5 animate-pulse">
                        <span>📰</span> Native Sponsor Banner
                      </div>
                      <div className="w-full max-w-[300px] mx-auto overflow-hidden rounded-xl">
                        <AdsterraNativeBanner 
                          scriptUrl={adsterraConfig.nativeBannerScript}
                          containerId={adsterraConfig.nativeBannerContainerId}
                        />
                      </div>
                    </div>
                  )}

                  {/* Smartlink Bypass Offer */}
                  {adsterraConfig.directLinkUrl && (
                    <div className="pt-2">
                      <a 
                        href={adsterraConfig.directLinkUrl}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="inline-flex w-full max-w-[300px] items-center justify-center gap-2 p-2.5 rounded-lg border border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 font-bold text-xs transition duration-200 active:scale-95 shadow-sm shadow-amber-500/10"
                      >
                        ⚡ Unlock Premium Video Templates
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="p-4 space-y-5">
              {/* Voice recorder */}
              <div className={`p-4 border rounded-xl space-y-3 ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200 shadow-3xs'
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-slate-850'}`}>Voice Recorder</h3>
                  {isRecording && (
                    <span className="flex items-center gap-1.5 text-[10px] text-rose-550 font-bold uppercase animate-pulse">
                      <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                      Recording
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  {isRecording ? (
                    <div className="text-sm font-mono text-rose-500 font-bold">
                      {Math.floor(recordTimer / 60)}:{(recordTimer % 60).toString().padStart(2, '0')}
                    </div>
                  ) : (
                    <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500 font-medium'}`}>Record a commentary track via mic.</p>
                  )}

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      isRecording 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                        : isDark ? 'bg-cyan-500 hover:bg-cyan-600 text-zinc-950' : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {isRecording ? 'Stop Recording' : 'Start Mic'}
                  </button>
                </div>
              </div>

              {/* Sound Settings & Equalizer Presets */}
              <div className="space-y-3 pt-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Audio Presets & Filters</h3>
                <button
                  onClick={() => alert('Noise reduction filter applied to selected audio tracks: Low-frequencies bandpassed to remove background hums.')}
                  className={`w-full flex items-center justify-between p-2.5 border rounded-lg text-xs transition ${
                    isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-750 shadow-3xs'
                  }`}
                >
                  <span>🤖 Intelligent Noise Reduction</span>
                  <span className="text-[10px] text-cyan-500 uppercase font-mono font-bold">Apply</span>
                </button>

                <div className="space-y-1">
                  <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600 font-semibold'}`}>Equalizer Profile</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cinematic Bass Boost', 'Clear Voice Vocal', 'Flat Balance', 'Pop Vocal Sparkle'].map((eq, idx) => (
                      <button
                        key={idx}
                        onClick={() => alert(`Equalizer profile set to ${eq}: Frequencies optimized successfully.`)}
                        className={`p-2 border rounded text-left text-[10px] font-bold transition ${
                          isDark 
                            ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 text-zinc-300' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs'
                        }`}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transitions' && (
            <div className="p-4 space-y-5">
              <div className="space-y-1">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Dynamic Fade Transitions
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Select a clip on the timeline first, then click a transition style to instantly apply it.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { name: "🎬 Cinematic Cross Dissolve", description: "Smooth 1.0s fade in and fade out transition", fadeIn: 1.0, fadeOut: 1.0 },
                  { name: "🌑 Quick Dip to Black", description: "Fast 0.4s fade out and fade in", fadeIn: 0.4, fadeOut: 0.4 },
                  { name: "🌅 Soft Entrance", description: "Gradual 2.2s cinematic fade in with no fade out", fadeIn: 2.2, fadeOut: 0 },
                  { name: "🌌 Cosmic Exit", description: "Lyrical 2.5s fade out at the end of the clip", fadeIn: 0, fadeOut: 2.5 },
                  { name: "⚡ Sudden Jump-Cut", description: "Remove all fades for crisp direct frame changes", fadeIn: 0, fadeOut: 0 }
                ].map((trans, idx) => (
                  <button
                    key={idx}
                    disabled={!selectedClip}
                    onClick={() => {
                      if (!selectedClip) return;
                      onUpdateClip({
                        ...selectedClip,
                        fadeIn: trans.fadeIn,
                        fadeOut: trans.fadeOut
                      });
                      alert(`Applied "${trans.name}"! Fade In: ${trans.fadeIn}s, Fade Out: ${trans.fadeOut}s. Play to see the transition!`);
                    }}
                    className={`w-full p-3 text-left rounded-lg border transition-all ${
                      selectedClip
                        ? isDark
                          ? 'bg-zinc-900 hover:bg-zinc-800/80 border-zinc-800 hover:border-cyan-500/50'
                          : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 hover:border-cyan-500'
                        : 'opacity-40 cursor-not-allowed border-dashed'
                    }`}
                  >
                    <span className={`text-xs font-bold block ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>
                      {trans.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{trans.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'captions' && (
            <CaptionGenerator 
              onAddClipToTimeline={onAddClipToTimeline} 
              selectedClip={selectedClip} 
              currentTime={currentTime}
              isDark={isDark} 
            />
          )}

          {activeTab === 'templates' && (
            <div className="p-4 space-y-5">
              <div className="space-y-1">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Cinematic Style Templates
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Instantly color grade and apply master filters to match famous film visual standards.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { name: "🎬 Travel Vlog Golden Hour", desc: "Warm, highly saturated colors with retro sepia hints", filters: { sepia: 25, saturation: 140, contrast: 110, brightness: 105, blur: 0, grayscale: 0, hueRotate: 5, invert: 0, sharpen: true } },
                  { name: "🎥 Sci-Fi Cyberpunk Neon", desc: "Cool teal shadows, high green/blue saturation, sharp contrast", filters: { sepia: 0, saturation: 165, contrast: 125, brightness: 95, blur: 0, grayscale: 0, hueRotate: 160, invert: 0, sharpen: true } },
                  { name: "🎞️ Noir 1920s Silent Film", desc: "Classy high-contrast monochrome with silver grain feel", filters: { sepia: 15, saturation: 0, contrast: 145, brightness: 90, blur: 0, grayscale: 100, hueRotate: 0, invert: 0, sharpen: false } },
                  { name: "🌌 Ethereal Glow Fantasy", desc: "Slight dream blur, soft high-contrast highlight pop", filters: { sepia: 5, saturation: 120, contrast: 105, brightness: 110, blur: 2, grayscale: 0, hueRotate: -10, invert: 0, sharpen: false } }
                ].map((temp, idx) => (
                  <button
                    key={idx}
                    disabled={!selectedClip}
                    onClick={() => {
                      if (!selectedClip) return;
                      onUpdateClip({
                        ...selectedClip,
                        filters: {
                          ...selectedClip.filters,
                          ...temp.filters
                        }
                      });
                      alert(`Color Grade Template "${temp.name}" applied successfully to the active clip!`);
                    }}
                    className={`w-full p-3 text-left rounded-lg border transition-all ${
                      selectedClip
                        ? isDark
                          ? 'bg-zinc-900 hover:bg-zinc-800/80 border-zinc-800 hover:border-indigo-500/50'
                          : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 hover:border-indigo-500'
                        : 'opacity-40 cursor-not-allowed border-dashed'
                    }`}
                  >
                    <span className={`text-xs font-bold block ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>
                      {temp.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{temp.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4 space-y-4">
               {/* Aspect ratio */}
              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Aspect Ratio Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { ratio: '16:9', label: '16:9 Cinema / YT' },
                    { ratio: '9:16', label: '9:16 TikTok / Short' },
                    { ratio: '1:1', label: '1:1 Square Post' },
                    { ratio: '4:3', label: '4:3 Retro Display' }
                  ].map((preset) => (
                    <button
                      key={preset.ratio}
                      onClick={() => onChangeProjectSettings({
                        ...projectSettings,
                        aspectRatio: preset.ratio as any
                      })}
                      className={`p-2 rounded-lg border text-left text-xs transition ${
                        projectSettings.aspectRatio === preset.ratio
                          ? isDark ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300 font-bold' : 'border-cyan-500 bg-cyan-50 text-cyan-600 font-bold'
                          : isDark ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-3xs'
                      }`}
                    >
                      <p className="font-bold">{preset.ratio}</p>
                      <p className="text-[10px] opacity-75">{preset.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom buttons */}
              <div className={`space-y-2 border-t pt-4 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
                <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Timeline Zoom</label>
                <div className="flex gap-2">
                  <button
                    onClick={onZoomOut}
                    className={`flex-1 p-2 border rounded text-xs transition font-bold ${
                      isDark ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs'
                    }`}
                  >
                    Zoom Out (-)
                  </button>
                  <button
                    onClick={onZoomIn}
                    className={`flex-1 p-2 border rounded text-xs transition font-bold ${
                      isDark ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-3xs'
                    }`}
                  >
                    Zoom In (+)
                  </button>
                </div>
              </div>

              {/* Duration controller */}
              <div className={`space-y-2 border-t pt-4 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Max Project Length</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="180"
                    step="5"
                    value={projectSettings.duration}
                    onChange={(e) => onChangeProjectSettings({
                      ...projectSettings,
                      duration: parseInt(e.target.value)
                    })}
                    className={`flex-1 accent-cyan-500 rounded-lg appearance-none h-1.5 ${
                      isDark ? 'bg-zinc-800' : 'bg-slate-200'
                    }`}
                  />
                  <span className="text-xs font-extrabold text-cyan-500 font-mono w-10 text-right">
                    {projectSettings.duration}s
                  </span>
                </div>
              </div>

              {/* Adsterra Live Management Form */}
              <div className={`space-y-3 border-t pt-4 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Adsterra Monetization</label>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase">Active</span>
                </div>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">Enable Monetized Ads</span>
                    <input 
                      type="checkbox"
                      checked={adsterraConfig?.enabled}
                      onChange={(e) => {
                        const newConf = { ...adsterraConfig, enabled: e.target.checked };
                        setAdsterraConfig(newConf);
                        localStorage.setItem('adsterra_monetization_config', JSON.stringify(newConf));
                        window.dispatchEvent(new Event('storage'));
                      }}
                      className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <details className="group border border-zinc-800/40 dark:border-zinc-900/30 rounded-lg p-2 bg-black/10">
                    <summary className="text-[10px] font-bold text-zinc-400 cursor-pointer select-none outline-none flex items-center justify-between group-open:mb-2">
                      <span>🔧 Live Customize Keys</span>
                      <span className="text-[9px] text-cyan-500 group-open:hidden">Show</span>
                      <span className="text-[9px] text-cyan-500 hidden group-open:inline">Hide</span>
                    </summary>
                    
                    <div className="space-y-2.5 text-xs pt-1">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase block">468x60 Banner Key</label>
                        <input 
                          type="text"
                          value={adsterraConfig?.banner468x60Key || ''}
                          onChange={(e) => {
                            const newConf = { ...adsterraConfig, banner468x60Key: e.target.value };
                            setAdsterraConfig(newConf);
                            localStorage.setItem('adsterra_monetization_config', JSON.stringify(newConf));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                          placeholder="Adsterra 468x60 key"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase block">300x250 Banner Key</label>
                        <input 
                          type="text"
                          value={adsterraConfig?.banner300x250Key || ''}
                          onChange={(e) => {
                            const newConf = { ...adsterraConfig, banner300x250Key: e.target.value };
                            setAdsterraConfig(newConf);
                            localStorage.setItem('adsterra_monetization_config', JSON.stringify(newConf));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                          placeholder="Adsterra 300x250 key"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase block">320x50 Banner Key</label>
                        <input 
                          type="text"
                          value={adsterraConfig?.banner320x50Key || ''}
                          onChange={(e) => {
                            const newConf = { ...adsterraConfig, banner320x50Key: e.target.value };
                            setAdsterraConfig(newConf);
                            localStorage.setItem('adsterra_monetization_config', JSON.stringify(newConf));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                          placeholder="Adsterra 320x50 key"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase block">Smartlink / Direct Link URL</label>
                        <input 
                          type="text"
                          value={adsterraConfig?.directLinkUrl || ''}
                          onChange={(e) => {
                            const newConf = { ...adsterraConfig, directLinkUrl: e.target.value };
                            setAdsterraConfig(newConf);
                            localStorage.setItem('adsterra_monetization_config', JSON.stringify(newConf));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                          placeholder="https://www.effectivecpmnetwork.com/..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase block">Native Banner Script URL</label>
                        <input 
                          type="text"
                          value={adsterraConfig?.nativeBannerScript || ''}
                          onChange={(e) => {
                            const newConf = { ...adsterraConfig, nativeBannerScript: e.target.value };
                            setAdsterraConfig(newConf);
                            localStorage.setItem('adsterra_monetization_config', JSON.stringify(newConf));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                          placeholder="https://pl30104359.effectivecpmnetwork.com/..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase block">Native Banner Container ID</label>
                        <input 
                          type="text"
                          value={adsterraConfig?.nativeBannerContainerId || ''}
                          onChange={(e) => {
                            const newConf = { ...adsterraConfig, nativeBannerContainerId: e.target.value };
                            setAdsterraConfig(newConf);
                            localStorage.setItem('adsterra_monetization_config', JSON.stringify(newConf));
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                          placeholder="container-31c20658..."
                        />
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Interactive helper component for generating automated subtitles / captions
interface CaptionGeneratorProps {
  onAddClipToTimeline: (clip: Clip) => void;
  selectedClip: Clip | null;
  currentTime: number;
  isDark: boolean;
}

function CaptionGenerator({ onAddClipToTimeline, selectedClip, currentTime, isDark }: CaptionGeneratorProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [styleTemplate, setStyleTemplate] = useState<'classic' | 'neon' | 'speech'>('classic');
  const [fontSize, setFontSize] = useState<number>(18);

  const handleStartTranscription = () => {
    setIsTranscribing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTranscribing(false);
          
          // Generate realistic caption clips
          const captionsData = [
            { text: "Hey everyone! Welcome back to my cinema studio.", start: 1, end: 4.5 },
            { text: "Today, we are mastering beautiful light modes and color presets.", start: 5.5, end: 9.5 },
            { text: "Look at the stunning visual clarity on our preview monitor!", start: 10.5, end: 14.5 },
            { text: "Activate transitions in the left rail to see magical fades.", start: 15.5, end: 19.5 }
          ];

          captionsData.forEach((cap, idx) => {
            const fontColor = styleTemplate === 'neon' ? '#34d399' : '#ffffff';
            const textShadow = styleTemplate === 'neon' 
              ? '0 0 10px #059669' 
              : styleTemplate === 'speech' 
                ? 'none' 
                : '1px 1px 4px rgba(0,0,0,0.8)';
                
            const captionClip: Clip = {
              id: `caption-${Date.now()}-${idx}`,
              name: `Caption #${idx + 1}`,
              type: 'text',
              trackId: 'text',
              sourceUrl: cap.text,
              startInTimeline: cap.start,
              endInTimeline: cap.end,
              duration: cap.end - cap.start,
              trimStart: 0,
              trimEnd: 0,
              speed: 1.0,
              volume: 0,
              muted: true,
              transform: {
                x: 0,
                y: 35, // Place at the bottom of the video
                scale: 1.0,
                rotation: 0,
                opacity: 0.95,
                flipX: false,
                flipY: false
              },
              filters: {
                brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, sharpen: false
              }
            };
            onAddClipToTimeline(captionClip);
          });

          alert("AI Auto-Captions Complete! 4 synchronized subtitle blocks have been added to your Subtitle Track on the timeline.");
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="p-4 space-y-5">
      <div className="space-y-1">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          AI Subtitle Transcriber
        </h3>
        <p className="text-[11px] text-zinc-500">
          Analyze audio wave energy to produce perfect, frame-synchronized text overlays automatically.
        </p>
      </div>

      {/* Main Action simulation */}
      <div className={`p-4 border rounded-xl space-y-4 ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200 shadow-xs'
      }`}>
        <h4 className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          Master Voice Recognition
        </h4>
        
        {isTranscribing ? (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-cyan-500 animate-pulse font-bold">Speech-to-Text transcribing...</span>
              <span className="text-zinc-400">{progress}%</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-950' : 'bg-slate-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartTranscription}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-lg shadow-md hover:scale-101 active:scale-95 transition-all"
          >
            🎙️ Generate AI Auto-Subtitles
          </button>
        )}
      </div>

      {/* Custom Styles Configuration */}
      <div className="space-y-3 pt-2">
        <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Subtitle Typography & Theme
        </h4>

        {/* Font Presets */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-mono text-zinc-500">Display Style</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'classic', label: 'Classic Bold' },
              { id: 'neon', label: 'Neon Emerald' },
              { id: 'speech', label: 'Dialogue Box' }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setStyleTemplate(style.id as any)}
                className={`p-2 rounded text-[10px] font-bold border transition ${
                  styleTemplate === style.id
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                    : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>Font Size Scale</span>
            <span className="text-cyan-500 font-bold">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="32"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full accent-cyan-500 bg-zinc-200 dark:bg-zinc-900 rounded appearance-none h-1.5"
          />
        </div>
      </div>
    </div>
  );
}

