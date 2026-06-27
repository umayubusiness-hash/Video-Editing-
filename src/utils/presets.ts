/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clip } from '../types';

export interface PresetMedia {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  sourceUrl: string;
  duration: number; // in seconds
  thumbnail: string; // inline data URL or color gradient
}

// Generate a high-contrast inline SVG or CSS gradient as base thumbnails
const getGradientThumb = (from: string, to: string) => 
  `linear-gradient(135deg, ${from}, ${to})`;

export const PRESET_VIDEOS: PresetMedia[] = [
  {
    id: 'vid-neon-grid',
    name: 'Cyber Neon Grid',
    type: 'video',
    sourceUrl: 'procedural-neon-grid',
    duration: 30,
    thumbnail: 'linear-gradient(135deg, #0f0c1b, #240b36)'
  },
  {
    id: 'vid-cosmic-dust',
    name: 'Cosmic Starfield',
    type: 'video',
    sourceUrl: 'procedural-starfield',
    duration: 30,
    thumbnail: 'linear-gradient(135deg, #050508, #1a0b2e)'
  },
  {
    id: 'vid-golden-sunset',
    name: 'Liquid Amber Sunset',
    type: 'video',
    sourceUrl: 'procedural-sunset',
    duration: 30,
    thumbnail: 'linear-gradient(135deg, #fc4a1a, #f7b733)'
  },
  {
    id: 'vid-matrix-rain',
    name: 'Matrix Code Rain',
    type: 'video',
    sourceUrl: 'procedural-matrix',
    duration: 30,
    thumbnail: 'linear-gradient(135deg, #020b02, #001f00)'
  }
];

export const PRESET_AUDIOS: PresetMedia[] = [
  {
    id: 'aud-synth-beat',
    name: 'Synthwave Electro Bass',
    type: 'audio',
    sourceUrl: 'procedural-synth-beat',
    duration: 45,
    thumbnail: 'linear-gradient(135deg, #ec008c, #fc6767)'
  },
  {
    id: 'aud-lofi-chill',
    name: 'Lofi Chords Loop',
    type: 'audio',
    sourceUrl: 'procedural-lofi-chill',
    duration: 60,
    thumbnail: 'linear-gradient(135deg, #11998e, #38ef7d)'
  },
  {
    id: 'aud-sci-fi-drone',
    name: 'Sci-Fi Ambient Drone',
    type: 'audio',
    sourceUrl: 'procedural-scifi-drone',
    duration: 60,
    thumbnail: 'linear-gradient(135deg, #3a7bd5, #3a6073)'
  }
];

export const PRESET_IMAGES: PresetMedia[] = [
  {
    id: 'img-sticker-star',
    name: 'Golden Sparkle Star',
    type: 'image',
    sourceUrl: 'procedural-img-star',
    duration: 10,
    thumbnail: 'linear-gradient(135deg, #fce38a, #f38181)'
  },
  {
    id: 'img-sticker-heart',
    name: 'Neon Love Heart',
    type: 'image',
    sourceUrl: 'procedural-img-heart',
    duration: 10,
    thumbnail: 'linear-gradient(135deg, #f857a6, #ff5858)'
  },
  {
    id: 'img-sticker-rocket',
    name: 'Space Rocket Adventure',
    type: 'image',
    sourceUrl: 'procedural-img-rocket',
    duration: 10,
    thumbnail: 'linear-gradient(135deg, #4facfe, #00f2fe)'
  },
  {
    id: 'img-sticker-arrow',
    name: 'Neon Pointer Arrow',
    type: 'image',
    sourceUrl: 'procedural-img-arrow',
    duration: 10,
    thumbnail: 'linear-gradient(135deg, #11998e, #38ef7d)'
  },
  {
    id: 'img-sticker-sparkles',
    name: 'Aesthetic Magic Sparkles',
    type: 'image',
    sourceUrl: 'procedural-img-sparkles',
    duration: 10,
    thumbnail: 'linear-gradient(135deg, #a8c0ff, #3f2b96)'
  },
  {
    id: 'img-sticker-youtube',
    name: 'YT Subscribe Button',
    type: 'image',
    sourceUrl: 'procedural-img-youtube',
    duration: 10,
    thumbnail: 'linear-gradient(135deg, #ff0844, #ffb199)'
  },
  {
    id: 'img-sticker-fire',
    name: 'Animated Lit Fire',
    type: 'image',
    sourceUrl: 'procedural-img-fire',
    duration: 10,
    thumbnail: 'linear-gradient(135deg, #f857a6, #ff5858)'
  },
  {
    id: 'img-sticker-thumbs-up',
    name: 'Social Thumbs Up',
    type: 'image',
    sourceUrl: 'procedural-img-thumbs-up',
    duration: 10,
    thumbnail: 'linear-gradient(135deg, #2193b0, #6dd5ed)'
  },
  {
    id: 'img-sticker-arcade',
    name: '8-Bit Retro Ghost',
    type: 'image',
    sourceUrl: 'procedural-img-arcade',
    duration: 10,
    thumbnail: 'linear-gradient(135deg, #8a2be2, #4169e1)'
  },
  {
    id: 'img-bg-vaporwave',
    name: 'Vaporwave Gridscape',
    type: 'image',
    sourceUrl: 'procedural-img-vaporwave',
    duration: 15,
    thumbnail: 'linear-gradient(135deg, #ff0844, #ffb199)'
  }
];

// Helper to render procedural video frames on a canvas
export function drawProceduralVideo(
  ctx: CanvasRenderingContext2D,
  type: string,
  time: number,
  width: number,
  height: number
) {
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  if (type === 'procedural-neon-grid') {
    // Cyber Neon Grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;
    
    // Draw Perspective Grid Lines
    const gridCount = 20;
    const horizonY = height * 0.4;
    const speed = 40;
    const offset = (time * speed) % 50;

    // Horizontal moving grid lines
    for (let i = 0; i < gridCount; i++) {
      const progress = i / gridCount;
      const py = horizonY + (height - horizonY) * Math.pow(progress, 2.5);
      
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }

    // Vertical lines spreading from horizon
    for (let i = -10; i <= 20; i++) {
      const sx = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(width / 2, horizonY);
      ctx.lineTo(sx + offset * (i - 5) * 0.2, height);
      ctx.stroke();
    }

    // Draw glowing neon sun in the center horizon
    const gradient = ctx.createRadialGradient(width / 2, horizonY, 5, width / 2, horizonY, 120);
    gradient.addColorStop(0, 'rgba(255, 0, 128, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 0, 128, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(width / 2, horizonY, 120, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Adding neon scanlines
    ctx.fillStyle = 'rgba(255, 0, 128, 0.05)';
    for (let y = 0; y < height; y += 6) {
      ctx.fillRect(0, y + (time * 10) % 6, width, 2);
    }

  } else if (type === 'procedural-starfield') {
    // Starfield animation
    const starCount = 120;
    ctx.fillStyle = '#ffffff';
    
    for (let i = 0; i < starCount; i++) {
      // Use pseudo-random calculations stable with index i
      const xSeed = Math.sin(i * 12345.67) * 0.5 + 0.5;
      const ySeed = Math.cos(i * 6789.01) * 0.5 + 0.5;
      
      const speed = 0.05 + 0.15 * (i % 5) / 5;
      const size = 0.5 + 1.5 * (i % 3);
      
      // Compute traveling coordinates
      let sx = (xSeed * width + time * speed * width) % width;
      let sy = ySeed * height;
      
      // Star glow based on sine
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * 2 + i));
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw a big purple galaxy swirl in the top-right
    const galaxyGrad = ctx.createRadialGradient(width * 0.8, height * 0.3, 0, width * 0.8, height * 0.3, 200);
    galaxyGrad.addColorStop(0, 'rgba(128, 0, 255, 0.25)');
    galaxyGrad.addColorStop(0.5, 'rgba(0, 128, 255, 0.1)');
    galaxyGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = galaxyGrad;
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.3, 200, 0, 2 * Math.PI);
    ctx.fill();

  } else if (type === 'procedural-sunset') {
    // Liquid Amber Sunset
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1c0024');
    grad.addColorStop(0.4, '#e03a3e');
    grad.addColorStop(0.7, '#f5af19');
    grad.addColorStop(1, '#f12711');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing sun reflecting on waves
    const sunY = height * 0.55 + Math.sin(time * 0.2) * 15;
    ctx.fillStyle = '#fff7e6';
    ctx.shadowColor = '#f5af19';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(width / 2, sunY, 65, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Draw silhouette mountains
    ctx.fillStyle = 'rgba(28, 0, 36, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * 0.65);
    for (let x = 0; x <= width; x += 40) {
      const my = height * 0.65 + Math.sin(x * 0.01 + 10) * 20 + Math.cos(x * 0.005) * 15;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Draw floating spark particles
    for (let i = 0; i < 30; i++) {
      const px = (Math.sin(i * 456.78) * 0.5 + 0.5) * width;
      const startY = (Math.cos(i * 123.45) * 0.5 + 0.5) * height * 0.5 + height * 0.3;
      const py = (startY - time * (15 + (i % 5) * 5)) % height;
      if (py > 0) {
        ctx.fillStyle = `rgba(255, 230, 100, ${0.4 + 0.5 * Math.abs(Math.sin(time + i))})`;
        ctx.beginPath();
        ctx.arc(px, py, 2 + (i % 3), 0, 2 * Math.PI);
        ctx.fill();
      }
    }

  } else if (type === 'procedural-matrix') {
    // Matrix code rain
    ctx.font = '14px monospace';
    ctx.fillStyle = 'rgba(0, 255, 70, 0.8)';
    
    const cols = 28;
    const colWidth = width / cols;
    
    for (let i = 0; i < cols; i++) {
      const seed = Math.sin(i * 43.12);
      const speed = 100 + Math.abs(seed) * 150;
      const yOffset = (time * speed) % (height + 200) - 100;
      
      // Draw vertical trail of characters
      const trailLength = 8 + (i % 6);
      for (let j = 0; j < trailLength; j++) {
        const charY = yOffset - j * 16;
        if (charY > 0 && charY < height) {
          const charCode = 33 + Math.floor(Math.abs(Math.sin(i * 10 + j + Math.floor(time * 5))) * 93);
          const char = String.fromCharCode(charCode);
          
          const alpha = 1 - (j / trailLength);
          ctx.fillStyle = j === 0 ? '#ffffff' : `rgba(0, 255, 70, ${alpha * 0.9})`;
          ctx.fillText(char, i * colWidth + colWidth / 4, charY);
        }
      }
    }
  }

  ctx.restore();
}

// Helper to draw images or overlays
export function drawProceduralImage(
  ctx: CanvasRenderingContext2D,
  type: string,
  time: number,
  width: number,
  height: number
) {
  ctx.save();
  
  if (type === 'procedural-img-star') {
    // Shiny Gold Star
    const cx = width / 2;
    const cy = height / 2;
    const spikes = 5;
    const outerRadius = 80 + Math.sin(time * 3) * 5;
    const innerRadius = 35;
    
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = 20;

    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, outerRadius);
    grad.addColorStop(0, '#fff3a1');
    grad.addColorStop(0.5, '#ffd700');
    grad.addColorStop(1, '#ff8c00');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();

  } else if (type === 'procedural-img-heart') {
    // Red glowing heart
    const cx = width / 2;
    const cy = height / 2 + 10;
    const size = 65 + Math.sin(time * 4) * 4;

    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 25;
    
    const grad = ctx.createLinearGradient(cx - size, cy - size, cx + size, cy + size);
    grad.addColorStop(0, '#ff416c');
    grad.addColorStop(1, '#ff4b2b');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.4);
    // Draw left curve
    ctx.bezierCurveTo(cx - size * 0.9, cy - size * 0.5, cx - size * 1.3, cy + size * 0.1, cx, cy + size * 0.9);
    // Draw right curve
    ctx.bezierCurveTo(cx + size * 1.3, cy + size * 0.1, cx + size * 0.9, cy - size * 0.5, cx, cy + size * 0.4);
    ctx.closePath();
    ctx.fill();

  } else if (type === 'procedural-img-rocket') {
    // Fire rocket sticker
    const cx = width / 2;
    const cy = height / 2;
    
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 4 + Math.sin(time * 5) * 0.05);

    // Rocket thruster fire
    const fireGrad = ctx.createLinearGradient(0, 30, 0, 70);
    fireGrad.addColorStop(0, '#ff0000');
    fireGrad.addColorStop(0.5, '#ff8000');
    fireGrad.addColorStop(1, 'rgba(255, 255, 0, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.moveTo(-15, 30);
    ctx.lineTo(0, 55 + Math.sin(time * 15) * 10);
    ctx.lineTo(15, 30);
    ctx.closePath();
    ctx.fill();

    // Rocket body
    ctx.fillStyle = '#f3f4f6';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.bezierCurveTo(-20, -20, -20, 20, -20, 30);
    ctx.lineTo(20, 30);
    ctx.bezierCurveTo(20, 20, 20, -20, 0, -60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rocket fins
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-20, 10);
    ctx.lineTo(-40, 35);
    ctx.lineTo(-20, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(20, 10);
    ctx.lineTo(40, 35);
    ctx.lineTo(20, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Nose cone
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.bezierCurveTo(-11, -38, -15, -25, -14, -20);
    ctx.lineTo(14, -20);
    ctx.bezierCurveTo(15, -25, 11, -38, 0, -60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Window
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

  } else if (type === 'procedural-img-vaporwave') {
    // Vaporwave backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#ff758c');
    grad.addColorStop(1, '#ff7eb3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing retro sun
    const sunCx = width / 2;
    const sunCy = height * 0.6;
    const sunR = 80;
    
    ctx.fillStyle = '#f5af19';
    ctx.beginPath();
    ctx.arc(sunCx, sunCy, sunR, 0, 2 * Math.PI);
    ctx.fill();

    // Sunset scanline cuts
    ctx.fillStyle = '#ff7eb3';
    for (let i = 0; i < 6; i++) {
      const cutY = sunCy + 10 + i * 12;
      const cutH = 2 + i * 1.5;
      ctx.fillRect(sunCx - sunR - 10, cutY, (sunR + 10) * 2, cutH);
    }
  } else if (type === 'procedural-img-arrow') {
    // Neon green glowing pointer arrow
    const cx = width / 2;
    const cy = height / 2;
    const bob = Math.sin(time * 6) * 15;
    
    ctx.translate(cx, cy + bob);
    ctx.rotate(Math.PI / 4); // Points downward-left

    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#39ff14';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;

    // Draw Arrow shape
    ctx.beginPath();
    ctx.moveTo(-15, -45);
    ctx.lineTo(15, -45);
    ctx.lineTo(15, -10);
    ctx.lineTo(35, -10);
    ctx.lineTo(0, 35);
    ctx.lineTo(-35, -10);
    ctx.lineTo(-15, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (type === 'procedural-img-sparkles') {
    // Elegant Twinkling Gold Sparkles
    const cx = width / 2;
    const cy = height / 2;
    
    ctx.shadowColor = '#ffdf00';
    ctx.shadowBlur = 15;

    const drawSparkleSingle = (x: number, y: number, scale: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.bezierCurveTo(0, 0, 10, 25, 0, 30);
        ctx.bezierCurveTo(0, 0, -10, 25, 0, 30);
      }
      ctx.fill();
      ctx.restore();
    };

    // Sparkle 1 (Main center)
    const s1 = 0.9 + Math.sin(time * 5) * 0.15;
    drawSparkleSingle(cx, cy, s1, time);

    // Sparkle 2 (Top right)
    const s2 = 0.5 + Math.cos(time * 4) * 0.1;
    drawSparkleSingle(cx + 45, cy - 35, s2, -time * 0.8);

    // Sparkle 3 (Bottom left)
    const s3 = 0.4 + Math.sin(time * 3) * 0.1;
    drawSparkleSingle(cx - 50, cy + 30, s3, time * 1.5);

  } else if (type === 'procedural-img-youtube') {
    // Red subscribe button sticker with standard YouTube logo and white bold typography
    const cx = width / 2;
    const cy = height / 2;
    const pulse = 1 + Math.sin(time * 3) * 0.03;

    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);

    ctx.shadowColor = 'rgba(255, 0, 0, 0.4)';
    ctx.shadowBlur = 15;

    // Red button base
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.roundRect(-100, -35, 200, 70, 16);
    ctx.fill();

    // YouTube white triangle play logo
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-65, -15);
    ctx.lineTo(-65, 15);
    ctx.lineTo(-40, 0);
    ctx.closePath();
    ctx.fill();

    // SUBSCRIBE Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUBSCRIBE', -25, 2);

  } else if (type === 'procedural-img-fire') {
    // Beautiful shifting organic campfire flame sticker
    const cx = width / 2;
    const cy = height / 2 + 25;
    const fScale = 1.0 + Math.sin(time * 8) * 0.05;

    ctx.translate(cx, cy);
    ctx.scale(fScale, fScale);

    ctx.shadowColor = '#ff4500';
    ctx.shadowBlur = 25;

    // Outer Dark Red / Orange Flame
    ctx.fillStyle = '#ff3c00';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-50, -20, -60, -70, -20, -110);
    ctx.bezierCurveTo(-35, -80, -15, -60, 0, -130); // Center apex
    ctx.bezierCurveTo(15, -60, 35, -80, 20, -110);
    ctx.bezierCurveTo(60, -70, 50, -20, 0, 0);
    ctx.closePath();
    ctx.fill();

    // Inner bright yellow fire core
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.bezierCurveTo(-30, -15, -35, -50, -10, -80);
    ctx.bezierCurveTo(-15, -60, -5, -45, 0, -95);
    ctx.bezierCurveTo(5, -45, 15, -60, 10, -80);
    ctx.bezierCurveTo(35, -50, 30, -15, 0, -5);
    ctx.closePath();
    ctx.fill();

    // Hot center core white flame
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.bezierCurveTo(-15, -15, -15, -35, 0, -60);
    ctx.bezierCurveTo(15, -35, 15, -15, 0, -10);
    ctx.closePath();
    ctx.fill();

  } else if (type === 'procedural-img-thumbs-up') {
    // Cool animated modern Blue Like/Thumbs Up button sticker
    const cx = width / 2;
    const cy = height / 2 + 10;
    const heartBeat = 1 + (Math.sin(time * 4) > 0.8 ? 0.08 : 0);

    ctx.translate(cx, cy);
    ctx.scale(heartBeat, heartBeat);

    ctx.shadowColor = '#0084ff';
    ctx.shadowBlur = 20;

    // Blue fill and outline
    ctx.fillStyle = '#0084ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    ctx.beginPath();
    // Hand cuff
    ctx.roundRect(-55, -10, 20, 40, 4);
    // Main palm/fist
    ctx.roundRect(-30, 0, 65, 30, 8);
    ctx.fill();
    ctx.stroke();

    // Draw thumb pointing up
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.bezierCurveTo(-25, -35, -10, -45, 5, -45);
    ctx.bezierCurveTo(15, -45, 15, -30, 5, -20);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Redo Hand cuff border detail
    ctx.fillStyle = '#0052cc';
    ctx.fillRect(-55, -10, 20, 40);
    ctx.strokeRect(-55, -10, 20, 40);

  } else if (type === 'procedural-img-arcade') {
    // 8-Bit Pacman Style Retro Ghost Sticker
    const cx = width / 2;
    const cy = height / 2;
    const float = Math.sin(time * 5) * 8;

    ctx.translate(cx, cy + float);
    
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 20;
    
    // Magenta Retro Ghost Pixel Body
    ctx.fillStyle = '#d946ef';
    ctx.beginPath();
    // Round head top
    ctx.arc(0, -15, 45, Math.PI, 0, false);
    // Vertical body sides
    ctx.lineTo(45, 35);
    // Bottom 8-bit spikes
    const waveOffset = Math.floor(time * 10) % 2 === 0 ? 0 : 6;
    ctx.lineTo(30, 25 + waveOffset);
    ctx.lineTo(15, 35 - waveOffset);
    ctx.lineTo(0, 25 + waveOffset);
    ctx.lineTo(-15, 35 - waveOffset);
    ctx.lineTo(-30, 25 + waveOffset);
    ctx.lineTo(-45, 35);
    ctx.closePath();
    ctx.fill();

    // Two big white pixelated eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-24, -24, 18, 18);
    ctx.fillRect(8, -24, 18, 18);

    // Dynamic pupils shifting side-to-side
    ctx.fillStyle = '#2563eb';
    const shiftX = Math.sin(time * 3.5) > 0 ? 6 : -2;
    ctx.fillRect(-24 + shiftX, -18, 10, 10);
    ctx.fillRect(8 + shiftX, -18, 10, 10);
  }

  ctx.restore();
}

// Procedural Synth Sound Generator using standard Web Audio API
let audioCtx: AudioContext | null = null;
let currentSynthNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let beatInterval: any = null;

export function playProceduralAudio(type: string, time: number, isPlaying: boolean, volume: number) {
  if (!isPlaying) {
    stopProceduralAudio();
    return;
  }

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Stop current beat loops if changing or re-syncing
    if (beatInterval) {
      clearInterval(beatInterval);
      beatInterval = null;
    }

    if (type === 'procedural-synth-beat') {
      // Periodic electro drum loop + bass note
      const playStep = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        // Kick Drum
        const kickOsc = audioCtx.createOscillator();
        const kickGain = audioCtx.createGain();
        kickOsc.connect(kickGain);
        kickGain.connect(audioCtx.destination);

        kickOsc.frequency.setValueAtTime(150, now);
        kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
        kickGain.gain.setValueAtTime(volume * 0.8, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        kickOsc.start(now);
        kickOsc.stop(now + 0.3);

        // Hi-Hat on off-beats
        setTimeout(() => {
          if (!audioCtx || !isPlaying) return;
          const hatNow = audioCtx.currentTime;
          const bufferSize = audioCtx.sampleRate * 0.05;
          const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = audioCtx.createBufferSource();
          noise.buffer = buffer;

          const filter = audioCtx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 7000;

          const noiseGain = audioCtx.createGain();
          noiseGain.gain.setValueAtTime(volume * 0.15, hatNow);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, hatNow + 0.05);

          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(audioCtx.destination);
          
          noise.start(hatNow);
          noise.stop(hatNow + 0.05);
        }, 250);

        // Cyber Synth Bass Note
        const notes = [55, 65.41, 73.42, 82.41]; // A1, C2, D2, E2 in Hz
        const stepIndex = Math.floor(time * 2) % notes.length;
        const bassFreq = notes[stepIndex];

        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        // Low pass filter
        const bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(300, now);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(audioCtx.destination);

        bassGain.gain.setValueAtTime(volume * 0.35, now);
        bassGain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.1);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        bassOsc.start(now);
        bassOsc.stop(now + 0.45);
      };

      playStep();
      beatInterval = setInterval(playStep, 500);

    } else if (type === 'procedural-lofi-chill') {
      // Warm dreamy electric piano chords
      const playChords = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        // Lofi pad triads: Cmaj7, Am7, Fmaj7, G7
        const chordCycles = [
          [130.81, 164.81, 196.00, 246.94], // Cmaj7
          [110.00, 130.81, 164.81, 196.00], // Am7
          [87.31, 130.81, 174.61, 220.00],  // Fmaj7
          [98.00, 146.83, 196.00, 246.94]   // G7
        ];
        const index = Math.floor(time / 2) % chordCycles.length;
        const chord = chordCycles[index];

        chord.forEach((freq) => {
          if (!audioCtx) return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = 'sine'; // soft sound
          osc.frequency.setValueAtTime(freq, now);

          const lpf = audioCtx.createBiquadFilter();
          lpf.type = 'lowpass';
          lpf.frequency.value = 600;

          osc.connect(lpf);
          lpf.connect(gain);
          gain.connect(audioCtx.destination);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.3); // Slow attack
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.9); // Slow decay

          osc.start(now);
          osc.stop(now + 2.0);
        });
      };

      playChords();
      beatInterval = setInterval(playChords, 2000);

    } else if (type === 'procedural-scifi-drone') {
      // Heavy modulating sub space drone
      const playDrone = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        // Sub Oscillator
        const subOsc = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(65.41, now); // C2

        // Modulating LFO
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.5, now); // 0.5Hz modulation
        lfoGain.gain.setValueAtTime(15, now); // modulate freq by +/- 15Hz

        lfo.connect(lfoGain);
        lfoGain.connect(subOsc.frequency);

        subOsc.connect(subGain);
        subGain.connect(audioCtx.destination);

        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.5);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.9);

        lfo.start(now);
        subOsc.start(now);

        lfo.stop(now + 3.0);
        subOsc.stop(now + 3.0);
      };

      playDrone();
      beatInterval = setInterval(playDrone, 3000);
    }

  } catch (err) {
    console.error('Failed to play procedural audio:', err);
  }
}

export function stopProceduralAudio() {
  if (beatInterval) {
    clearInterval(beatInterval);
    beatInterval = null;
  }
  currentSynthNodes.forEach(({ osc, gain }) => {
    try {
      osc.stop();
    } catch(e){}
  });
  currentSynthNodes = [];
}
