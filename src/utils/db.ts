/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clip, ProjectSettings } from '../types';

interface SavedProject {
  id: string;
  name: string;
  clips: Clip[];
  settings: ProjectSettings;
  lastModified: number;
}

const STORAGE_KEY = 'video_editing_studio_projects';

// Retrieve all saved projects
export function getSavedProjects(): SavedProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load saved projects from localStorage:', e);
  }
  return [];
}

// Save projects list
export function saveProjects(projects: SavedProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
  }
}

// Save a single project (create or update)
export function saveSingleProject(
  id: string,
  name: string,
  clips: Clip[],
  settings: ProjectSettings
): void {
  const projects = getSavedProjects();
  const existingIndex = projects.findIndex((p) => p.id === id);

  const updatedProject: SavedProject = {
    id,
    name,
    clips,
    settings,
    lastModified: Date.now(),
  };

  if (existingIndex > -1) {
    projects[existingIndex] = updatedProject;
  } else {
    projects.push(updatedProject);
  }

  saveProjects(projects);
}

// Delete a project
export function deleteProject(id: string): void {
  const projects = getSavedProjects();
  const filtered = projects.filter((p) => p.id !== id);
  saveProjects(filtered);
}

// Seed helper: Creates a default welcome project if none exists
export function seedDefaultProject(): SavedProject {
  const defaultClips: Clip[] = [
    {
      id: 'clip-neon-init',
      name: 'Cyber Neon Grid (Intro)',
      type: 'video',
      sourceUrl: 'procedural-neon-grid',
      trackId: 'video',
      startInTimeline: 0,
      endInTimeline: 12,
      duration: 30,
      trimStart: 0,
      trimEnd: 18,
      speed: 1,
      volume: 0.5,
      muted: false,
      transform: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        flipX: false,
        flipY: false,
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
        sharpen: false,
      },
    },
    {
      id: 'clip-sunset-init',
      name: 'Liquid Sunset (Outro)',
      type: 'video',
      sourceUrl: 'procedural-sunset',
      trackId: 'video',
      startInTimeline: 12,
      endInTimeline: 24,
      duration: 30,
      trimStart: 0,
      trimEnd: 18,
      speed: 1,
      volume: 0.5,
      muted: false,
      transform: {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 0.9,
        flipX: false,
        flipY: false,
      },
      filters: {
        brightness: 110,
        contrast: 100,
        saturation: 120,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        invert: 0,
        sharpen: false,
      },
    },
    {
      id: 'clip-beat-init',
      name: 'Synthwave Electro Loop',
      type: 'audio',
      sourceUrl: 'procedural-synth-beat',
      trackId: 'audio',
      startInTimeline: 0,
      endInTimeline: 24,
      duration: 45,
      trimStart: 0,
      trimEnd: 21,
      speed: 1,
      volume: 0.4,
      muted: false,
      transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, flipX: false, flipY: false },
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, sharpen: false },
    },
    {
      id: 'clip-star-init',
      name: 'Golden Sparkle Sticker',
      type: 'image',
      sourceUrl: 'procedural-img-star',
      trackId: 'image',
      startInTimeline: 4,
      endInTimeline: 10,
      duration: 10,
      trimStart: 0,
      trimEnd: 4,
      speed: 1,
      volume: 0,
      muted: true,
      transform: {
        x: 30,
        y: -25,
        scale: 0.4,
        rotation: 15,
        opacity: 1,
        flipX: false,
        flipY: false,
      },
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, sharpen: false },
    },
    {
      id: 'clip-heart-init',
      name: 'Neon Love Heart',
      type: 'image',
      sourceUrl: 'procedural-img-heart',
      trackId: 'image',
      startInTimeline: 14,
      endInTimeline: 22,
      duration: 10,
      trimStart: 0,
      trimEnd: 2,
      speed: 1,
      volume: 0,
      muted: true,
      transform: {
        x: -30,
        y: 20,
        scale: 0.5,
        rotation: -10,
        opacity: 0.95,
        flipX: false,
        flipY: false,
      },
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, sharpen: false },
    },
    {
      id: 'clip-text-init',
      name: 'Intro Heading Text',
      type: 'text',
      sourceUrl: 'text',
      trackId: 'text',
      startInTimeline: 1.5,
      endInTimeline: 8.5,
      duration: 7,
      trimStart: 0,
      trimEnd: 0,
      speed: 1,
      volume: 0,
      muted: true,
      transform: {
        x: 0,
        y: 35,
        scale: 1,
        rotation: 0,
        opacity: 1,
        flipX: false,
        flipY: false,
      },
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, sharpen: false },
      textStyle: {
        content: 'NEON CYBER CITY',
        fontSize: 32,
        color: '#ffffff',
        backgroundColor: 'rgba(255, 0, 128, 0.4)',
        fontFamily: 'Inter',
        textAlign: 'center',
        shadowColor: '#ff0080',
        shadowBlur: 10,
      },
    },
    {
      id: 'clip-text-outro',
      name: 'Outro Title Text',
      type: 'text',
      sourceUrl: 'text',
      trackId: 'text',
      startInTimeline: 13,
      endInTimeline: 23,
      duration: 10,
      trimStart: 0,
      trimEnd: 0,
      speed: 1,
      volume: 0,
      muted: true,
      transform: {
        x: 0,
        y: -10,
        scale: 1.2,
        rotation: 5,
        opacity: 1,
        flipX: false,
        flipY: false,
      },
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0, invert: 0, sharpen: false },
      textStyle: {
        content: 'Thanks For Watching!',
        fontSize: 36,
        color: '#ffd700',
        backgroundColor: 'transparent',
        fontFamily: 'Inter',
        textAlign: 'center',
        shadowColor: '#ff4b2b',
        shadowBlur: 15,
      },
    },
  ];

  const defaultSettings: ProjectSettings = {
    aspectRatio: '16:9',
    duration: 30,
  };

  const welcomeProject: SavedProject = {
    id: 'proj-welcome',
    name: 'My Awesome First Video',
    clips: defaultClips,
    settings: defaultSettings,
    lastModified: Date.now(),
  };

  saveProjects([welcomeProject]);
  return welcomeProject;
}
