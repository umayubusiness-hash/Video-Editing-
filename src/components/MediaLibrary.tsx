/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  Video, 
  Music, 
  Image as ImageIcon, 
  Plus, 
  Upload, 
  Sparkles,
  Info,
  Layers,
  Trash2
} from 'lucide-react';
import { PRESET_VIDEOS, PRESET_AUDIOS, PRESET_IMAGES, PresetMedia } from '../utils/presets';
import { Clip, ClipType } from '../types';

interface MediaLibraryProps {
  importedClips: Clip[];
  onImportClip: (clip: Clip) => void;
  onAddClipToTimeline: (clip: Clip) => void;
  onDeleteImportedClip: (id: string) => void;
  isDark?: boolean;
  theme?: string;
  layoutMode?: 'vertical' | 'horizontal';
}

export default function MediaLibrary({
  importedClips,
  onImportClip,
  onAddClipToTimeline,
  onDeleteImportedClip,
  isDark = false,
  theme = 'dark',
  layoutMode = 'vertical'
}: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert files to project Clips
  const handleFiles = (files: FileList, forcedType?: ClipType) => {
    Array.from(files).forEach((file) => {
      let type: ClipType = file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('audio/')
        ? 'audio'
        : file.type.startsWith('image/')
        ? 'image'
        : 'text';

      if (forcedType) {
        type = forcedType;
      }

      if (type === 'text') {
        alert('Unsupported file type. Please upload video, audio, or image files.');
        return;
      }

      const url = URL.createObjectURL(file);
      
      // Determine track layer based on type
      const trackId = type === 'image' ? 'image' : type;

      const durationEstimate = type === 'audio' ? 60 : type === 'image' ? 5 : 10; // defaults

      const newClip: Clip = {
        id: `imported-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: file.name,
        type,
        sourceUrl: url,
        trackId: trackId as any,
        startInTimeline: 0,
        endInTimeline: durationEstimate,
        duration: durationEstimate,
        trimStart: 0,
        trimEnd: 0,
        speed: 1.0,
        volume: type === 'audio' || type === 'video' ? 0.8 : 0,
        muted: type === 'image',
        transform: {
          x: 0,
          y: 0,
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
        }
      };

      // For videos/audios, retrieve exact duration
      if (type === 'video' || type === 'audio') {
        const mediaEl = document.createElement(type);
        mediaEl.src = url;
        mediaEl.onloadedmetadata = () => {
          newClip.duration = mediaEl.duration || 10;
          newClip.endInTimeline = newClip.duration;
          onImportClip(newClip);
        };
      } else {
        onImportClip(newClip);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const triggerUpload = (acceptType: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
  };

  const handleAddPresetToTimeline = (preset: PresetMedia) => {
    const trackId = preset.type === 'image' ? 'image' : preset.type;
    const clip: Clip = {
      id: `preset-clip-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: preset.name,
      type: preset.type as ClipType,
      sourceUrl: preset.sourceUrl,
      trackId: trackId as any,
      startInTimeline: 0,
      endInTimeline: preset.duration,
      duration: preset.duration,
      trimStart: 0,
      trimEnd: 0,
      speed: 1.0,
      volume: preset.type === 'audio' || preset.type === 'video' ? 0.8 : 0,
      muted: preset.type === 'image',
      transform: {
        x: 0,
        y: 0,
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
      }
    };
    onAddClipToTimeline(clip);
  };

  const handleAddImportedToTimeline = (imported: Clip) => {
    // Clone clip to generate unique timeline instance
    const clone: Clip = {
      ...imported,
      id: `clip-inst-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    onAddClipToTimeline(clone);
  };

  // Filter items
  const filterMatches = (type: string) => {
    if (activeTab === 'all') return true;
    return activeTab === type;
  };

  return (
    <div 
      id="media-library-panel" 
      className="flex flex-col h-full overflow-hidden"
    >
      
      {/* Three Explicit Import Triggers */}
      <div className={`p-4 pb-1 border-b transition-colors duration-300 ${
        theme === 'cyberpunk' 
          ? 'border-purple-900/40 bg-purple-950/10' 
          : theme === 'warm' 
            ? 'border-[#eae2cc] bg-[#faf6ee]' 
            : theme === 'sunset' 
              ? 'border-indigo-950 bg-indigo-950/20' 
              : theme === 'emerald'
                ? 'border-emerald-950 bg-emerald-950/10'
                : theme === 'royal'
                  ? 'border-[#220f3c] bg-[#1a0c35]/20'
                  : isDark 
                    ? 'border-zinc-900' 
                    : 'border-slate-100 bg-slate-50/30'
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
          isDark ? 'text-zinc-400' : 'text-slate-600'
        }`}>
          <Upload className="w-3.5 h-3.5 text-cyan-500" />
          Import Project Assets
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => triggerUpload('video/*')}
            className={`flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-lg border transition-all text-[11px] font-medium ${
              isDark 
                ? 'border-zinc-800 bg-zinc-900/60 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-400' 
                : 'border-slate-200 bg-slate-50 hover:bg-cyan-500/5 hover:border-cyan-500 text-slate-700 hover:text-cyan-650 hover:shadow-2xs'
            }`}
            title="Import Video File"
          >
            <Video className="w-4 h-4 text-cyan-500" />
            <span>+ Video</span>
          </button>
          
          <button
            onClick={() => triggerUpload('audio/*')}
            className={`flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-lg border transition-all text-[11px] font-medium ${
              isDark 
                ? 'border-zinc-800 bg-zinc-900/60 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-400' 
                : 'border-slate-200 bg-slate-50 hover:bg-emerald-500/5 hover:border-emerald-500 text-slate-700 hover:text-emerald-650 hover:shadow-2xs'
            }`}
            title="Import Audio File (MP3/WAV)"
          >
            <Music className="w-4 h-4 text-emerald-500" />
            <span className="font-bold">+ Audio</span>
          </button>

          <button
            onClick={() => triggerUpload('image/*')}
            className={`flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-lg border transition-all text-[11px] font-medium ${
              isDark 
                ? 'border-zinc-800 bg-zinc-900/60 hover:bg-rose-500/10 hover:border-rose-500/50 text-zinc-300 hover:text-rose-400' 
                : 'border-slate-200 bg-slate-50 hover:bg-rose-500/5 hover:border-rose-500 text-slate-700 hover:text-rose-650 hover:shadow-2xs'
            }`}
            title="Import Image Asset"
          >
            <ImageIcon className="w-4 h-4 text-rose-500" />
            <span>+ Image</span>
          </button>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        id="media-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative mx-4 my-3 p-4 border border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
          dragOver 
            ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/5' 
            : isDark 
              ? 'border-zinc-850 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/40' 
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          multiple
          accept="video/*,audio/*,image/*"
          className="hidden"
        />
        <p className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-slate-750'}`}>Drag & drop files here to upload</p>
        <p className={`text-[9px] mt-0.5 ${isDark ? 'text-zinc-650' : 'text-slate-500'}`}>Supports MP4, WebM, MP3, WAV, PNG, JPG</p>
      </div>

      {/* Tabs */}
      <div className={`flex border-b px-4 gap-2 transition-colors duration-300 ${
        theme === 'cyberpunk' 
          ? 'border-purple-900/40 bg-purple-950/10' 
          : theme === 'warm' 
            ? 'border-[#eae2cc] bg-[#faf6ee]' 
            : theme === 'sunset' 
              ? 'border-indigo-950 bg-indigo-950/20' 
              : theme === 'emerald'
                ? 'border-emerald-950 bg-emerald-950/15'
                : theme === 'royal'
                  ? 'border-[#220f3c] bg-[#1a0c35]/20'
                  : isDark 
                    ? 'border-zinc-900/60' 
                    : 'border-slate-100 bg-slate-50/50'
      }`}>
        {(['all', 'video', 'audio', 'image'] as const).map((tab) => (
          <button
            key={tab}
            id={`media-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider border-b-2 transition-all capitalize ${
              activeTab === tab
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : isDark 
                  ? 'border-transparent text-zinc-500 hover:text-zinc-300' 
                  : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            {tab}s
          </button>
        ))}
      </div>

      {/* Assets List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Procedural High-Fidelity Presets */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <h3 className={`text-xs font-black tracking-wider uppercase ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Procedural Stock presets</h3>
          </div>
          <div className={layoutMode === 'horizontal' ? 'flex flex-row overflow-x-auto gap-3.5 py-1.5 w-full no-scrollbar' : 'grid grid-cols-2 gap-3'}>
            {/* Videos */}
            {filterMatches('video') && PRESET_VIDEOS.map((preset) => (
              <div 
                key={preset.id} 
                className={`group relative rounded-lg overflow-hidden border p-2 flex flex-col justify-between h-28 transition ${
                  layoutMode === 'horizontal' ? 'shrink-0 w-36' : ''
                } ${
                  isDark 
                    ? 'border-zinc-850 bg-zinc-900/60 hover:border-cyan-500/50' 
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-cyan-500 hover:shadow-xs text-slate-800'
                }`}
              >
                <div 
                  className="w-full h-14 rounded overflow-hidden relative flex items-center justify-center" 
                  style={{ background: preset.thumbnail }}
                >
                  <Video className="w-5 h-5 text-white/85 drop-shadow" />
                  <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] px-1 rounded text-white font-mono font-bold">
                    {preset.duration}s
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-[11px] font-bold truncate ${layoutMode === 'horizontal' ? 'w-20' : 'w-24'} ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{preset.name}</span>
                  <button 
                    onClick={() => handleAddPresetToTimeline(preset)}
                    className={`p-1 rounded transition ${
                      isDark ? 'bg-zinc-800 hover:bg-cyan-500 text-zinc-300 hover:text-white' : 'bg-slate-200 hover:bg-cyan-550 text-slate-700 hover:text-white'
                    }`}
                    title="Add to Timeline"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Audios */}
            {filterMatches('audio') && PRESET_AUDIOS.map((preset) => (
              <div 
                key={preset.id} 
                className={`group relative rounded-lg overflow-hidden border p-2 flex flex-col justify-between h-28 transition ${
                  layoutMode === 'horizontal' ? 'shrink-0 w-36' : ''
                } ${
                  isDark 
                    ? 'border-zinc-850 bg-zinc-900/60 hover:border-cyan-500/50' 
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-cyan-500 hover:shadow-xs text-slate-800'
                }`}
              >
                <div 
                  className="w-full h-14 rounded overflow-hidden relative flex items-center justify-center" 
                  style={{ background: preset.thumbnail }}
                >
                  <Music className="w-5 h-5 text-white/85 drop-shadow" />
                  <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] px-1 rounded text-white font-mono font-bold">
                    {preset.duration}s
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-[11px] font-bold truncate ${layoutMode === 'horizontal' ? 'w-20' : 'w-24'} ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{preset.name}</span>
                  <button 
                    onClick={() => handleAddPresetToTimeline(preset)}
                    className={`p-1 rounded transition ${
                      isDark ? 'bg-zinc-800 hover:bg-cyan-500 text-zinc-300 hover:text-white' : 'bg-slate-200 hover:bg-cyan-550 text-slate-700 hover:text-white'
                    }`}
                    title="Add to Timeline"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Images */}
            {filterMatches('image') && PRESET_IMAGES.map((preset) => (
              <div 
                key={preset.id} 
                className={`group relative rounded-lg overflow-hidden border p-2 flex flex-col justify-between h-28 transition ${
                  layoutMode === 'horizontal' ? 'shrink-0 w-36' : ''
                } ${
                  isDark 
                    ? 'border-zinc-850 bg-zinc-900/60 hover:border-cyan-500/50' 
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-cyan-500 hover:shadow-xs text-slate-800'
                }`}
              >
                <div 
                  className="w-full h-14 rounded overflow-hidden relative flex items-center justify-center" 
                  style={{ background: preset.thumbnail }}
                >
                  <ImageIcon className="w-5 h-5 text-white/85 drop-shadow" />
                  <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] px-1 rounded text-white font-mono font-bold">
                    {preset.duration}s
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-[11px] font-bold truncate ${layoutMode === 'horizontal' ? 'w-20' : 'w-24'} ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{preset.name}</span>
                  <button 
                    onClick={() => handleAddPresetToTimeline(preset)}
                    className={`p-1 rounded transition ${
                      isDark ? 'bg-zinc-800 hover:bg-cyan-500 text-zinc-300 hover:text-white' : 'bg-slate-200 hover:bg-cyan-550 text-slate-700 hover:text-white'
                    }`}
                    title="Add to Timeline"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Imported Media */}
        <div>
          <div className={`flex items-center gap-2 mb-3 border-t pt-4 ${isDark ? 'border-zinc-900' : 'border-slate-150'}`}>
            <Layers className="w-4 h-4 text-indigo-500" />
            <h3 className={`text-xs font-black tracking-wider uppercase ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Your Imports</h3>
          </div>
          
          {importedClips.length === 0 ? (
            <div className={`text-center p-6 rounded-lg border ${
              isDark ? 'bg-zinc-900/25 border-zinc-900/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-xs text-zinc-500 font-bold">No custom imports yet.</p>
              <p className="text-[10px] text-zinc-500 mt-1">Upload files at the top to see them here.</p>
            </div>
          ) : (
            <div className={layoutMode === 'horizontal' ? 'flex flex-row overflow-x-auto gap-3.5 py-1.5 w-full no-scrollbar' : 'grid grid-cols-2 gap-3'}>
              {importedClips
                .filter((c) => filterMatches(c.type))
                .map((clip) => (
                  <div 
                    key={clip.id} 
                    className={`group relative rounded-lg overflow-hidden border p-2 flex flex-col justify-between h-28 transition ${
                      layoutMode === 'horizontal' ? 'shrink-0 w-36' : ''
                    } ${
                      isDark 
                        ? 'border-zinc-850 bg-zinc-900/40 hover:border-indigo-500/50' 
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-500 hover:shadow-xs text-slate-800'
                    }`}
                  >
                    <div className={`w-full h-14 rounded overflow-hidden relative flex items-center justify-center ${
                      isDark ? 'bg-zinc-800/80' : 'bg-slate-200/80'
                    }`}>
                      {clip.type === 'video' && <Video className="w-5 h-5 text-indigo-500" />}
                      {clip.type === 'audio' && <Music className="w-5 h-5 text-emerald-500" />}
                      {clip.type === 'image' && <ImageIcon className="w-5 h-5 text-rose-500" />}
                      <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] px-1 rounded text-white font-mono font-bold">
                        {clip.duration.toFixed(1)}s
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={`text-[11px] font-bold truncate ${layoutMode === 'horizontal' ? 'w-12' : 'w-16'} ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{clip.name}</span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => onDeleteImportedClip(clip.id)}
                          className="p-1 bg-zinc-900/60 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-500 rounded transition"
                          title="Delete source"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                        <button 
                          onClick={() => handleAddImportedToTimeline(clip)}
                          className={`p-1 rounded transition ${
                            isDark ? 'bg-zinc-800 hover:bg-indigo-500 text-zinc-350 hover:text-white' : 'bg-slate-200 hover:bg-indigo-550 text-slate-700 hover:text-white'
                          }`}
                          title="Add to Timeline"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Help Note */}
      <div className={`p-3 border-t text-[10px] flex items-center gap-2 ${
        isDark ? 'bg-zinc-950/60 border-zinc-900 text-zinc-500' : 'bg-slate-100 border-slate-200 text-slate-650'
      }`}>
        <Info className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
        <span className="font-medium">Click the plus icon to add clips directly onto timeline tracks.</span>
      </div>
    </div>
  );
}
