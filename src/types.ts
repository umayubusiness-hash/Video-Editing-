/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClipType = 'video' | 'audio' | 'text' | 'image';

export interface FilterProperties {
  brightness: number; // percentage, e.g., 100
  contrast: number; // percentage, e.g., 100
  saturation: number; // percentage, e.g., 100
  blur: number; // px, e.g., 0
  grayscale: number; // percentage, e.g., 0
  sepia: number; // percentage, e.g., 0
  hueRotate: number; // degrees, e.g., 0
  invert: number; // percentage, e.g., 0
  sharpen: boolean; // boolean filter helper
}

export interface TransformProperties {
  x: number; // percentage offset from center, e.g. 0
  y: number; // percentage offset from center, e.g. 0
  scale: number; // scale multiplier, e.g., 1.0
  rotation: number; // degrees, e.g., 0
  opacity: number; // 0 to 1
  flipX: boolean;
  flipY: boolean;
}

export interface TextProperties {
  content: string;
  fontSize: number; // px
  color: string;
  backgroundColor: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  shadowColor: string;
  shadowBlur: number;
}

export interface Clip {
  id: string;
  name: string;
  type: ClipType;
  sourceUrl: string;
  thumbUrl?: string; // small thumb preview
  trackId: 'video' | 'audio' | 'text' | 'image';
  
  // Timing properties (in seconds)
  startInTimeline: number;
  endInTimeline: number;
  duration: number; // original media duration
  trimStart: number; // trim offset from start
  trimEnd: number; // trim offset from end
  speed: number; // playback rate multiplier

  // Audio properties
  volume: number; // 0 to 1
  muted: boolean;
  fadeIn?: number; // fade in duration in seconds
  fadeOut?: number; // fade out duration in seconds

  // Visual transforms and filters
  transform: TransformProperties;
  filters: FilterProperties;

  // Text specific properties
  textStyle?: TextProperties;
}

export interface Track {
  id: 'video' | 'audio' | 'text' | 'image';
  name: string;
  clips: Clip[];
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif';
  resolution: '480p' | '720p' | '1080p';
  fps: 24 | 30 | 60;
}

export interface ProjectSettings {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  duration: number; // Max timeline duration, e.g., 60 seconds default
}

export interface ToolItem {
  id: string;
  label: string;
  icon: string;
  category: 'media' | 'edit' | 'overlay' | 'audio' | 'canvas' | 'settings';
}
