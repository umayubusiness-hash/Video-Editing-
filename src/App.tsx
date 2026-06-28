/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderOpen, 
  Settings, 
  Download, 
  HelpCircle, 
  Moon, 
  Sun, 
  FileVideo, 
  Plus, 
  Play, 
  Video,
  Info,
  Sliders,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  Heart,
  Palette,
  DollarSign
} from 'lucide-react';

export interface ThemeConfig {
  id: string;
  name: string;
  emoji: string;
  isDark: boolean;
  bgMain: string;
  bgPanel: string;
  bgSidebar: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  buttonActive: string;
  headerBg: string;
  timelineBg: string;
  adBg: string;
  sidebarRailBg: string;
}

export const THEME_CONFIGS: Record<string, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Midnight Slate',
    emoji: '🖤',
    isDark: true,
    bgMain: 'bg-zinc-955',
    bgPanel: 'bg-zinc-900/40 border-zinc-850',
    bgSidebar: 'bg-zinc-950 border-zinc-900',
    border: 'border-zinc-800',
    textPrimary: 'text-zinc-100',
    textSecondary: 'text-zinc-400',
    accent: 'bg-cyan-500 hover:bg-cyan-600',
    accentText: 'text-cyan-400',
    buttonActive: 'bg-zinc-900 text-cyan-400 border border-zinc-800',
    headerBg: 'border-zinc-900 bg-zinc-950/85',
    timelineBg: 'bg-zinc-900/60 border-zinc-850',
    adBg: 'from-cyan-500/10 to-indigo-500/10 border-cyan-500/30',
    sidebarRailBg: 'border-zinc-900 bg-zinc-950'
  },
  light: {
    id: 'light',
    name: 'Nordic Light',
    emoji: '🤍',
    isDark: false,
    bgMain: 'bg-slate-50',
    bgPanel: 'bg-white border-slate-200 shadow-3xs',
    bgSidebar: 'bg-slate-50 border-slate-200',
    border: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-500',
    accent: 'bg-cyan-600 hover:bg-cyan-700',
    accentText: 'text-cyan-600',
    buttonActive: 'bg-white text-cyan-600 border border-slate-200 shadow-sm',
    headerBg: 'border-slate-200 bg-white/95 shadow-xs',
    timelineBg: 'bg-slate-50 border-slate-200',
    adBg: 'from-slate-100 to-slate-200 border-slate-300',
    sidebarRailBg: 'border-slate-250 bg-slate-100/90'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    emoji: '👾',
    isDark: true,
    bgMain: 'bg-[#0a0214]',
    bgPanel: 'bg-[#150428]/60 border-pink-500/35 shadow-[0_0_15px_rgba(255,0,127,0.05)]',
    bgSidebar: 'bg-[#0f041d] border-purple-900/40',
    border: 'border-purple-950/80',
    textPrimary: 'text-[#39ff14]',
    textSecondary: 'text-fuchsia-400',
    accent: 'bg-fuchsia-600 hover:bg-fuchsia-550 shadow-[0_0_10px_rgba(240,46,170,0.4)]',
    accentText: 'text-[#39ff14]',
    buttonActive: 'bg-[#1e073c] text-[#39ff14] border border-[#ff007f]/50 shadow-[0_0_8px_rgba(57,255,20,0.2)]',
    headerBg: 'border-purple-900/40 bg-[#0a0215]/95 shadow-[0_4px_20px_rgba(0,0,0,0.5)]',
    timelineBg: 'bg-[#150428]/80 border-purple-900/50',
    adBg: 'from-fuchsia-500/10 to-purple-500/10 border-fuchsia-500/20',
    sidebarRailBg: 'border-purple-950/80 bg-[#080210]'
  },
  warm: {
    id: 'warm',
    name: 'Warm Amber',
    emoji: '🍂',
    isDark: false,
    bgMain: 'bg-[#fbfaf5]',
    bgPanel: 'bg-[#faf6ee] border-[#e6dec9] shadow-[0_2px_8px_rgba(140,115,85,0.05)]',
    bgSidebar: 'bg-[#fbfaf5] border-[#e6dec9]',
    border: 'border-[#eae2cc]',
    textPrimary: 'text-[#433422]',
    textSecondary: 'text-[#8c7355]',
    accent: 'bg-amber-700 hover:bg-amber-800 text-white',
    accentText: 'text-amber-700',
    buttonActive: 'bg-[#faf3e0] text-[#a16207] border border-[#eae2cc] shadow-2xs',
    headerBg: 'border-[#eae2cc] bg-[#faf6ee]/95 shadow-sm',
    timelineBg: 'bg-[#faf6ee] border-[#eae2cc]',
    adBg: 'from-amber-100/30 to-orange-100/30 border-amber-200',
    sidebarRailBg: 'border-[#eae2cc] bg-[#fdfaf5]'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Violet',
    emoji: '🌅',
    isDark: true,
    bgMain: 'bg-[#0c0824]',
    bgPanel: 'bg-[#18113c]/60 border-indigo-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
    bgSidebar: 'bg-[#130d33] border-indigo-950',
    border: 'border-indigo-900/60',
    textPrimary: 'text-rose-100',
    textSecondary: 'text-indigo-300',
    accent: 'bg-rose-500 hover:bg-rose-600 shadow-[0_2px_10px_rgba(244,63,94,0.3)]',
    accentText: 'text-rose-400',
    buttonActive: 'bg-[#1e154a] text-rose-400 border border-indigo-500/50 shadow-xs',
    headerBg: 'border-indigo-950 bg-[#130d33]/95 shadow-md',
    timelineBg: 'bg-[#18113c]/80 border-indigo-900/50',
    adBg: 'from-rose-500/10 to-indigo-500/10 border-rose-500/20',
    sidebarRailBg: 'border-indigo-950 bg-[#0e0729]'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Gold',
    emoji: '🌲',
    isDark: true,
    bgMain: 'bg-[#061a12]',
    bgPanel: 'bg-[#0a261c]/70 border-emerald-500/25 shadow-xs',
    bgSidebar: 'bg-[#051610] border-emerald-950',
    border: 'border-emerald-900/45',
    textPrimary: 'text-emerald-100',
    textSecondary: 'text-emerald-400',
    accent: 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold',
    accentText: 'text-amber-400',
    buttonActive: 'bg-[#0d3326] text-amber-300 border border-emerald-500/40 shadow-xs',
    headerBg: 'border-emerald-950 bg-[#051610]/95 shadow-md',
    timelineBg: 'bg-[#0a261c]/80 border-emerald-900/45',
    adBg: 'from-emerald-500/10 to-amber-500/10 border-emerald-500/20',
    sidebarRailBg: 'border-emerald-950 bg-[#03110c]'
  },
  royal: {
    id: 'royal',
    name: 'Royal Velvet',
    emoji: '👑',
    isDark: true,
    bgMain: 'bg-[#0f071e]',
    bgPanel: 'bg-[#180d2d]/70 border-indigo-500/25 shadow-xs',
    bgSidebar: 'bg-[#0c051a] border-[#200e3a]',
    border: 'border-[#220f3c]',
    textPrimary: 'text-indigo-100',
    textSecondary: 'text-indigo-300',
    accent: 'bg-amber-550 hover:bg-amber-600 text-zinc-950 font-extrabold',
    accentText: 'text-amber-400',
    buttonActive: 'bg-[#220e3a] text-amber-300 border border-[#441a75]/50 shadow-xs',
    headerBg: 'border-[#1e0a35] bg-[#0c051a]/95 shadow-md',
    timelineBg: 'bg-[#180d2d]/80 border-indigo-900/40',
    adBg: 'from-purple-500/10 to-amber-500/10 border-purple-500/20',
    sidebarRailBg: 'border-[#200e3a] bg-[#080312]'
  }
};

export const THEMES = [
  { id: 'dark', name: 'Midnight Slate', emoji: '🖤', desc: 'Deep zinc & cyan cinema edit' },
  { id: 'light', name: 'Nordic Light', emoji: '🤍', desc: 'Minimal clean slate & white sky' },
  { id: 'cyberpunk', name: 'Neon Cyberpunk', emoji: '👾', desc: 'Volt green & magenta retro wave' },
  { id: 'warm', name: 'Warm Amber', emoji: '🍂', desc: 'Cozy bookish cream & terracotta' },
  { id: 'sunset', name: 'Sunset Violet', emoji: '🌅', desc: 'Indi-space dreamy horizon gradient' },
  { id: 'emerald', name: 'Emerald Gold', emoji: '🌲', desc: 'Deep forest green & rich amber gold' },
  { id: 'royal', name: 'Royal Velvet', emoji: '👑', desc: 'Imperial violet velvet & golden accents' }
];

import { Clip, ProjectSettings } from './types';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';
import Timeline from './components/Timeline';
import PropertiesPanel from './components/PropertiesPanel';
import MediaLibrary from './components/MediaLibrary';
import ExportModal from './components/ExportModal';
import { useAdsterra, AdsterraBanner } from './components/AdsterraMonetizer';

import { 
  getSavedProjects, 
  saveSingleProject, 
  seedDefaultProject 
} from './utils/db';

export default function App() {
  // --- STATE ---
  const { config: adsterraConfig } = useAdsterra();

  const [clips, setClips] = useState<Clip[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  
  // Custom imported asset cache
  const [importedClips, setImportedClips] = useState<Clip[]>([]);
  
  // Layout scaling and parameters
  const [zoom, setZoom] = useState<number>(20); // timeline pixels per second
  const [playbackVolume, setPlaybackVolume] = useState<number>(0.8);
  const [projectName, setProjectName] = useState<string>('My Awesome First Video');
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    aspectRatio: '16:9',
    duration: 30
  });

  // Modal controls
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  
  // Custom theme state - stored in localStorage for core data persistence
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem('studio_theme') || 'dark';
  });

  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>(() => {
    return (localStorage.getItem('studio_layout_mode') as 'vertical' | 'horizontal') || 'horizontal';
  });

  const isDark = currentTheme !== 'light' && currentTheme !== 'warm';

  useEffect(() => {
    localStorage.setItem('studio_theme', currentTheme);
  }, [currentTheme]);

  // Undo / Redo Stacks
  const [history, setHistory] = useState<Clip[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Timer Ref for timeline playback
  const playbackIntervalRef = useRef<any>(null);
  const lastTickRef = useRef<number>(0);

  // --- INITIAL SEEDING ---
  useEffect(() => {
    // Load or seed default demo project
    let projects = getSavedProjects();
    let currentProj = projects[0];
    if (!currentProj) {
      currentProj = seedDefaultProject();
    }

    setClips(currentProj.clips);
    setProjectSettings(currentProj.settings);
    setProjectName(currentProj.name);

    // Seed initial history
    setHistory([currentProj.clips]);
    setHistoryIndex(0);
  }, []);

  // --- PLAYBACK SEEK ENGINE ---
  useEffect(() => {
    if (isPlaying) {
      lastTickRef.current = performance.now();
      
      const tick = () => {
        const now = performance.now();
        const delta = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= projectSettings.duration) {
            // Loop or reset to start
            setIsPlaying(false);
            return 0;
          }
          return next;
        });

        playbackIntervalRef.current = requestAnimationFrame(tick);
      };

      playbackIntervalRef.current = requestAnimationFrame(tick);
    } else {
      if (playbackIntervalRef.current) {
        cancelAnimationFrame(playbackIntervalRef.current);
      }
    }

    return () => {
      if (playbackIntervalRef.current) {
        cancelAnimationFrame(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, projectSettings.duration]);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts triggering while typing in textareas or input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          handleDeleteClip(selectedClipId);
        }
      } else if (e.ctrlKey && e.code === 'KeyZ') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.code === 'KeyY') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, clips, historyIndex, history]);

  // --- UTILITY ACTION HANDLERS ---

  // Commit dynamic state updates and log to history
  const updateClipsState = (newClips: Clip[]) => {
    setClips(newClips);
    
    // Save to local persistence instantly
    saveSingleProject('proj-welcome', projectName, newClips, projectSettings);

    // Push state into undo stack
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newClips]);
    setHistoryIndex(updatedHistory.length);
  };

  // Add imported clip to user catalog
  const handleImportClip = (newClip: Clip) => {
    setImportedClips((prev) => [newClip, ...prev]);
  };

  // Add a clip directly onto the active timeline track lane
  const handleAddClipToTimeline = (newClip: Clip) => {
    // Snap clip start to current playhead seekhead time
    const duration = newClip.endInTimeline - newClip.startInTimeline;
    let finalStart = currentTime;
    
    // Safety boundaries
    if (finalStart + duration > projectSettings.duration) {
      finalStart = Math.max(0, projectSettings.duration - duration);
    }

    const positionedClip: Clip = {
      ...newClip,
      startInTimeline: finalStart,
      endInTimeline: finalStart + duration
    };

    const updated = [...clips, positionedClip];
    updateClipsState(updated);
    setSelectedClipId(positionedClip.id);
  };

  // Split selected clip at current playhead position
  const handleSplitClip = () => {
    const selected = clips.find((c) => c.id === selectedClipId);
    if (!selected) {
      alert('Please select a clip on the timeline first to split.');
      return;
    }

    const splitTime = currentTime;
    // Verify playhead cuts inside the clip bounds
    if (splitTime <= selected.startInTimeline || splitTime >= selected.endInTimeline) {
      alert('Move the timeline playhead inside the selected clip boundary to split.');
      return;
    }

    // Clip A bounds
    const lengthA = splitTime - selected.startInTimeline;
    const clipA: Clip = {
      ...selected,
      id: `${selected.id}-partA`,
      name: `${selected.name} (Part 1)`,
      endInTimeline: splitTime,
      trimEnd: selected.trimEnd + (selected.endInTimeline - splitTime) * selected.speed
    };

    // Clip B bounds
    const lengthB = selected.endInTimeline - splitTime;
    const clipB: Clip = {
      ...selected,
      id: `${selected.id}-partB`,
      name: `${selected.name} (Part 2)`,
      startInTimeline: splitTime,
      trimStart: selected.trimStart + (splitTime - selected.startInTimeline) * selected.speed
    };

    // Replace old clip with split siblings
    const filtered = clips.filter((c) => c.id !== selected.id);
    const updated = [...filtered, clipA, clipB];
    updateClipsState(updated);
    setSelectedClipId(clipA.id);
  };

  // Delete clip from timeline
  const handleDeleteClip = (id: string) => {
    const updated = clips.filter((c) => c.id !== id);
    updateClipsState(updated);
    if (selectedClipId === id) {
      setSelectedClipId(null);
    }
  };

  // Delete uploaded media source
  const handleDeleteImportedClip = (id: string) => {
    setImportedClips((prev) => prev.filter((c) => c.id !== id));
  };

  // Handle direct updates from Properties slider panels
  const handleUpdateClip = (updatedClip: Clip) => {
    const updated = clips.map((c) => (c.id === updatedClip.id ? updatedClip : c));
    setClips(updated);
    // save to DB but throttle heavy history triggers
    saveSingleProject('proj-welcome', projectName, updated, projectSettings);
  };

  // Undo / Redo mechanics
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIdx = historyIndex - 1;
      setHistoryIndex(targetIdx);
      setClips(history[targetIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIdx = historyIndex + 1;
      setHistoryIndex(targetIdx);
      setClips(history[targetIdx]);
    }
  };

  // Project Aspect ratio/duration controls
  const handleProjectSettingsChange = (newSettings: ProjectSettings) => {
    setProjectSettings(newSettings);
    saveSingleProject('proj-welcome', projectName, clips, newSettings);
  };

  // Capture current playhead canvas frame and prompt file download
  const handleSnapshot = () => {
    const canvas = document.getElementById('preview-studio-canvas') as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = `studio_snapshot_${Date.now()}.png`;
      anchor.click();
    }
  };

  const selectedClip = clips.find((c) => c.id === selectedClipId) || null;

  // Rotate some high-quality mock creative advertisements in the footer
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const ads = [
    {
      sponsor: "GEMINI PRO CINEMATIC",
      text: "Transform raw footage into edited vlogs with AI auto-cutting & voiceover. Get 500 free generation tokens today!",
      linkText: "Activate AI Copilot",
      bgColor: "from-cyan-500/10 to-indigo-500/10 border-cyan-500/30",
      textColor: "text-cyan-700 dark:text-cyan-400",
      badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300"
    },
    {
      sponsor: "CANVA CREATIVE SUITE",
      text: "Import 10M+ high-definition premium vector overlays, templates, stickers and royalty-free soundtracks instantly.",
      linkText: "Link Canva Account",
      bgColor: "from-purple-500/10 to-pink-500/10 border-purple-500/30",
      textColor: "text-purple-700 dark:text-purple-400",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300"
    },
    {
      sponsor: "UNSPLASH ROYALTY-FREE",
      text: "Stuck with no assets? Unlock 10,000+ cinematic 4K stock video background plates and aesthetic high-resolution images.",
      linkText: "Browse Stocks",
      bgColor: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30",
      textColor: "text-emerald-700 dark:text-emerald-400",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
    }
  ];

  useEffect(() => {
    const adInterval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 7000);
    return () => clearInterval(adInterval);
  }, []);

  const activeAd = ads[currentAdIndex];

  const activeThemeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.dark;

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-all duration-300 ${activeThemeConfig.bgMain} ${activeThemeConfig.textPrimary}`}>
      
      {/* 1. Global Navigation Header */}
      <header 
        id="studio-header" 
        className={`h-14 border-b px-4 flex items-center justify-between z-40 select-none transition-all duration-300 ${activeThemeConfig.headerBg}`}
      >
        
        {/* Logo and Renaming Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-cyan-500/20">
              VE
            </div>
            {isRenaming ? (
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => {
                  setIsRenaming(false);
                  saveSingleProject('proj-welcome', projectName, clips, projectSettings);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsRenaming(false);
                    saveSingleProject('proj-welcome', projectName, clips, projectSettings);
                  }
                }}
                autoFocus
                className={`border rounded px-2.5 py-0.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-slate-100 border-slate-300 text-zinc-800'
                }`}
              />
            ) : (
              <h1 
                onDoubleClick={() => setIsRenaming(true)}
                className={`text-sm font-bold hover:text-cyan-500 cursor-pointer transition flex items-center gap-1 ${
                  isDark ? 'text-zinc-100' : 'text-zinc-800'
                }`}
                title="Double-click to rename"
              >
                {projectName}
              </h1>
            )}
          </div>
          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-wider ${
            isDark ? 'bg-zinc-900 text-zinc-500 border border-zinc-800/80' : 'bg-slate-200 text-slate-600 border border-slate-300'
          }`}>
            V1.2 CINEMATIC
          </span>
        </div>

        {/* Dynamic Theme Selection Toolbar - Interactive Craft */}
        <div className={`hidden md:flex items-center gap-1.5 p-1 px-2.5 rounded-full border transition-all duration-300 ${
          isDark ? 'bg-zinc-900/50 border-zinc-800/80' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mr-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-500" />
            <span>Select Design:</span>
          </div>
          <div className="flex items-center gap-1">
            {THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setCurrentTheme(theme.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-550 to-indigo-600 text-white shadow-xs scale-102 font-extrabold'
                      : isDark
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        : 'text-slate-650 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  title={theme.desc}
                >
                  <span>{theme.emoji}</span>
                  <span className="hidden xl:inline text-[11px]">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Toolbar and Export Trigger */}
        <div className="flex items-center gap-3">
          {/* Quick tips panel */}
          <div className={`hidden lg:flex items-center gap-1.5 text-xs p-1.5 px-3.5 rounded-full border transition ${
            isDark ? 'text-zinc-300 bg-zinc-900/60 border-zinc-850' : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
            <span>Try dragging edge of any clip to crop/trim it!</span>
          </div>

          <button
            onClick={() => {
              const themeIds = THEMES.map(t => t.id);
              const nextIdx = (themeIds.indexOf(currentTheme) + 1) % themeIds.length;
              setCurrentTheme(themeIds[nextIdx]);
            }}
            className={`p-2 rounded-lg transition-all active:scale-90 flex items-center gap-1.5 border ${
              isDark 
                ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-cyan-400 hover:bg-zinc-800' 
                : 'bg-slate-150 text-slate-700 border-slate-250 hover:bg-slate-200 hover:text-cyan-600'
            }`}
            title="Cycle visual styles"
          >
            <Palette className="w-4 h-4 text-cyan-500 animate-spin-slow" />
            <span className="text-xs font-bold font-mono">Theme: {activeThemeConfig.emoji}</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-4.5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-cyan-500/10 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export Studio Movie
          </button>
        </div>
      </header>

      {/* Dynamic Horizontal Design Swapper Dock - Premium Craft */}
      <div className={`px-4 py-2.5 border-b flex flex-col lg:flex-row lg:items-center justify-between transition-all duration-300 gap-3 select-none shrink-0 ${
        currentTheme === 'cyberpunk' 
          ? 'bg-[#0f041d]/90 border-purple-900/40' 
          : currentTheme === 'warm' 
            ? 'bg-[#faf6ee] border-[#eae2cc]' 
            : currentTheme === 'sunset' 
              ? 'bg-[#130d33]/90 border-indigo-950' 
              : currentTheme === 'emerald'
                ? 'bg-[#0a261c]/90 border-emerald-950'
                : currentTheme === 'royal'
                  ? 'bg-[#180d2d]/90 border-[#220f3c]'
                  : isDark 
                    ? 'bg-zinc-950/90 border-zinc-900' 
                    : 'bg-white/95 border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-wrap items-center justify-between lg:justify-start gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/10 animate-pulse">
              <Palette className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-black tracking-wider uppercase text-cyan-600 dark:text-cyan-400">Select Studio Theme Design</h2>
                <span className="text-[9px] bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-extrabold px-1.5 py-0.25 rounded-md uppercase tracking-wider font-mono">Row active</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-medium">Click on any template row card to instantly change visual layouts & canvas borders</p>
            </div>
          </div>

          <div className="border-l pl-4 border-zinc-800/20 dark:border-zinc-700/30 flex items-center gap-2">
            <button
              onClick={() => {
                const next = layoutMode === 'vertical' ? 'horizontal' : 'vertical';
                setLayoutMode(next);
                localStorage.setItem('studio_layout_mode', next);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-3xs cursor-pointer active:scale-95 ${
                layoutMode === 'horizontal'
                  ? isDark 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-400' 
                    : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Toggle layout design between Horizontal stacked row mode & Vertical columns"
            >
              <Sliders className="w-3.5 h-3.5 rotate-90" />
              <span>Body: <strong className="uppercase">{layoutMode} row</strong></span>
            </button>
          </div>
        </div>

        {/* The Horizontal Row of Designs */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1 max-w-full lg:max-w-[75%] scroll-smooth">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            
            // Extract swatches based on the theme
            let swatches: string[] = [];
            if (theme.id === 'dark') swatches = ['bg-zinc-950', 'bg-zinc-900', 'bg-cyan-500'];
            else if (theme.id === 'light') swatches = ['bg-slate-50', 'bg-white', 'bg-cyan-600'];
            else if (theme.id === 'cyberpunk') swatches = ['bg-[#0a0214]', 'bg-[#150428]', 'bg-fuchsia-600'];
            else if (theme.id === 'warm') swatches = ['bg-[#fbfaf5]', 'bg-[#faf6ee]', 'bg-amber-700'];
            else if (theme.id === 'sunset') swatches = ['bg-[#0c0824]', 'bg-[#18113c]', 'bg-rose-500'];
            else if (theme.id === 'emerald') swatches = ['bg-[#061a12]', 'bg-[#0a261c]', 'bg-amber-500'];
            else if (theme.id === 'royal') swatches = ['bg-[#0f071e]', 'bg-[#180d2d]', 'bg-amber-550'];

            // Calculate dynamic selection theme colors/glows
            const getGlowStyle = (id: string) => {
              switch (id) {
                case 'dark': return 'border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.25)] bg-zinc-900/90';
                case 'light': return 'border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-white';
                case 'cyberpunk': return 'border-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.3)] bg-[#1e073c]/90';
                case 'warm': return 'border-[#b45309]/80 shadow-[0_0_15px_rgba(180,83,9,0.2)] bg-[#faf3e0]';
                case 'sunset': return 'border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.3)] bg-[#1e154a]/90';
                case 'emerald': return 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-[#0d3326]/90';
                case 'royal': return 'border-[#a855f7]/80 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-[#220e3a]/90';
                default: return 'border-cyan-500 bg-zinc-900';
              }
            };

            return (
              <button
                key={theme.id}
                onClick={() => setCurrentTheme(theme.id)}
                className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-left transition-all duration-300 cursor-pointer shrink-0 hover:scale-103 active:scale-97 ${
                  isSelected
                    ? getGlowStyle(theme.id)
                    : isDark
                      ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/80 text-slate-700 shadow-2xs'
                }`}
              >
                {/* Visual state indicator */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-inner transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${
                  isSelected ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white' : 'bg-zinc-800 text-zinc-350'
                }`}>
                  {theme.emoji}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className={`text-[11px] font-black ${
                      isSelected 
                        ? 'text-cyan-500 dark:text-cyan-400' 
                        : isDark ? 'text-zinc-200' : 'text-slate-800'
                    }`}>
                      {theme.name}
                    </p>
                    {isSelected && (
                      <span className="text-[8px] bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-extrabold px-1.5 py-0.25 rounded-md uppercase tracking-wider animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-500 font-medium truncate max-w-[130px]">{theme.desc}</p>
                </div>

                {/* Color Swatch Circles */}
                <div className="flex items-center gap-1.5 ml-1 bg-black/20 dark:bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-500/10">
                  {swatches.map((colorBg, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2.5 h-2.5 rounded-full border border-white/20 transition-transform group-hover:scale-110 ${colorBg}`}
                      title={`Palette color ${idx + 1}`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Work Stage (Sidebar, Preview Monitor, Property sliders) */}
      <div className={`flex-1 ${layoutMode === 'horizontal' ? 'flex flex-col overflow-y-auto no-scrollbar' : 'flex overflow-hidden'}`}>
        
        {/* Left Side toolbox layout */}
        <div className={layoutMode === 'horizontal' ? 'w-full h-auto flex flex-col shrink-0 mb-1' : 'flex h-full'}>
          <Sidebar
            selectedClip={selectedClip}
            currentTime={currentTime}
            onSplitClip={handleSplitClip}
            onDeleteClip={handleDeleteClip}
            onUpdateClip={handleUpdateClip}
            onAddClipToTimeline={handleAddClipToTimeline}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            projectSettings={projectSettings}
            onChangeProjectSettings={handleProjectSettingsChange}
            onSnapshot={handleSnapshot}
            onZoomIn={() => setZoom(prev => Math.min(60, prev + 5))}
            onZoomOut={() => setZoom(prev => Math.max(8, prev - 5))}
            isDark={isDark}
            theme={currentTheme}
            layoutMode={layoutMode}
          >
            <MediaLibrary
              importedClips={importedClips}
              onImportClip={handleImportClip}
              onAddClipToTimeline={handleAddClipToTimeline}
              onDeleteImportedClip={handleDeleteImportedClip}
              isDark={isDark}
              theme={currentTheme}
              layoutMode={layoutMode}
            />
          </Sidebar>
        </div>

        {/* Center Canvas Monitor Board */}
        <div className={layoutMode === 'horizontal' ? `w-full h-[480px] shrink-0 flex flex-col justify-center p-4 border-b ${
          currentTheme === 'cyberpunk' 
            ? 'bg-[#06010c] border-purple-950/40' 
            : currentTheme === 'warm' 
              ? 'bg-[#f7f2e5] border-[#eae2cc]' 
              : currentTheme === 'sunset' 
                ? 'bg-[#08041c] border-indigo-950' 
                : isDark 
                  ? 'bg-zinc-950 border-zinc-900' 
                  : 'bg-slate-100/50 border-slate-200'
        }` : `flex-1 flex flex-col justify-center p-4 overflow-y-auto transition-all duration-300 ${
          currentTheme === 'cyberpunk' 
            ? 'bg-[#06010c]' 
            : currentTheme === 'warm' 
              ? 'bg-[#f7f2e5]' 
              : currentTheme === 'sunset' 
                ? 'bg-[#08041c]' 
                : isDark 
                  ? 'bg-zinc-950' 
                  : 'bg-slate-100/50'
        }`}>
          <PreviewArea
            clips={clips}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            onStop={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            projectSettings={projectSettings}
            playbackVolume={playbackVolume}
            onVolumeChange={setPlaybackVolume}
            isDark={isDark}
            theme={currentTheme}
          />
        </div>

        {/* Right properties dashboard */}
        <PropertiesPanel
          selectedClip={selectedClip}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          isDark={isDark}
          theme={currentTheme}
          layoutMode={layoutMode}
        />
      </div>

      {/* 3. Horizontal Multi-track Timeline */}
      <div className={`border-t transition-all duration-300 ${activeThemeConfig.border}`}>
        <Timeline
          clips={clips}
          currentTime={currentTime}
          selectedClip={selectedClip}
          onSelectClip={(clip) => setSelectedClipId(clip ? clip.id : null)}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          onSplitClip={handleSplitClip}
          onTimeUpdate={setCurrentTime}
          projectSettings={projectSettings}
          zoom={zoom}
          onZoomIn={() => setZoom(prev => Math.min(60, prev + 5))}
          onZoomOut={() => setZoom(prev => Math.max(8, prev - 5))}
          isDark={isDark}
          theme={currentTheme}
        />
      </div>

      {/* 4. Highly Polished Sponsors / Interactive Advertisements Footer Banner */}
      <footer 
        id="studio-footer-ads" 
        className={`border-t px-4 flex items-center justify-between select-none transition-all duration-300 py-3 ${
          adsterraConfig.enabled ? 'min-h-[84px]' : 'h-14'
        } ${activeThemeConfig.border} ${
          currentTheme === 'cyberpunk' 
            ? 'bg-[#070110] text-[#39ff14]/80' 
            : currentTheme === 'warm' 
              ? 'bg-[#f7f2e5] text-[#8c7355]' 
              : currentTheme === 'sunset' 
                ? 'bg-[#0c0824] text-rose-200/80' 
                : isDark 
                  ? 'bg-zinc-950 text-zinc-400' 
                  : 'bg-white text-slate-600 shadow-inner'
        }`}
      >
        {adsterraConfig.enabled ? (
          <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest bg-amber-500 text-zinc-950 animate-pulse">
                Adsterra Active
              </span>
              <p className="text-[10px] text-zinc-500 hidden sm:block">Footer Banner (468x60 px) is live on your public site</p>
            </div>
            
            <div className="flex-1 max-w-[468px] w-full hidden md:block">
              <AdsterraBanner 
                zoneKey={adsterraConfig.banner468x60Key} 
                width={468} 
                height={60} 
              />
            </div>
            
            <div className="flex-1 max-w-[320px] w-full block md:hidden">
              <AdsterraBanner 
                zoneKey={adsterraConfig.banner320x50Key} 
                width={320} 
                height={50} 
              />
            </div>

            <div className="text-[10px] text-zinc-500 font-medium italic text-right hidden lg:block max-w-[150px]">
              Earn CPM on every visitor impression!
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full max-w-5xl mx-auto">
            {/* Animated visual ad badge */}
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest animate-pulse font-sans ${activeAd.badgeColor}`}>
              SPONSOR
            </span>

            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
              <p className="text-xs font-medium truncate">
                <strong className={`font-bold uppercase tracking-wider mr-2 ${activeAd.textColor}`}>{activeAd.sponsor}:</strong>
                {activeAd.text}
              </p>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => alert(`Redirecting to sponsored workspace integrate flow: ${activeAd.sponsor}`)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border hover:scale-102 transition-all active:scale-95 flex items-center gap-1 bg-gradient-to-r ${
                    isDark
                      ? 'from-zinc-900 to-zinc-800 border-zinc-700 hover:border-cyan-500 text-cyan-400'
                      : 'from-slate-100 to-white border-slate-300 hover:border-cyan-500 text-cyan-600'
                  }`}
                >
                  <span>{activeAd.linkText}</span>
                  <Sparkles className="w-3 h-3" />
                </button>

                <button
                  onClick={() => setCurrentAdIndex((prev) => (prev + 1) % ads.length)}
                  className={`p-1.5 rounded-md border text-[10px] ${
                    isDark ? 'border-zinc-850 hover:bg-zinc-900' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Next Sponsor Offer"
                >
                  Next ➔
                </button>
              </div>
            </div>
          </div>
        )}
      </footer>

      {/* Exporter Dialog Frame */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        clips={clips}
        projectSettings={projectSettings}
      />
    </div>
  );
}
