// src/components/space/Label3D.tsx
//
// Bilingual 3D Billboard Label for Planets, Moons, and Surface Markers.
// - In English ('en'): Uses @react-three/drei <Text> with the original Inter font, letterSpacing, and styling.
// - In Arabic ('ar'): Uses the browser's native RTL text shaper (DirectWrite / CoreText / HarfBuzz)
//   rendered to a high-DPI 4x supersampled THREE.CanvasTexture plane scaled to the exact same 3D world fontSize,
//   guaranteeing properly connected Arabic cursive ligatures and RTL direction with zero external font failures.

import { useEffect, useMemo, useState, memo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const LABEL_FONT =
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff';

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

interface Label3DProps {
  text: string;
  fontSize: number;
  color: string;
  opacity?: number;
  letterSpacing?: number;
  depthTest?: boolean;
}

const Label3D = memo(function Label3D({
  text,
  fontSize,
  color,
  opacity = 0.95,
  letterSpacing = 0.12,
  depthTest = true,
}: Label3DProps) {
  const isArabic = ARABIC_CHAR_REGEX.test(text);
  const [fontsLoadedTick, setFontsLoadedTick] = useState(0);

  // Re-render the Arabic canvas once Google Fonts ('Cairo' / 'IBM Plex Sans Arabic') finish loading
  useEffect(() => {
    if (!isArabic || typeof document === 'undefined' || !('fonts' in document)) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) {
        setFontsLoadedTick((t) => t + 1);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isArabic, text]);

  const arabicTextureData = useMemo(() => {
    if (!isArabic || typeof document === 'undefined') return null;
    void fontsLoadedTick;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const fontPx = 96;
    const fontStack = `700 ${fontPx}px "Cairo", "IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif`;
    ctx.font = fontStack;
    ctx.direction = 'rtl';

    const measured = ctx.measureText(text);
    const padX = Math.ceil(fontPx * 0.55);
    const padY = Math.ceil(fontPx * 0.42);
    const width = Math.max(128, Math.ceil(measured.width + padX * 2));
    const height = Math.ceil(fontPx + padY * 2);

    canvas.width = width;
    canvas.height = height;

    // Context state resets after resizing canvas
    ctx.clearRect(0, 0, width, height);
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = fontStack;

    // Subtle dark halo for crisp legibility against bright planet atmospheres or starfields
    ctx.shadowColor = 'rgba(0, 4, 16, 0.75)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, width / 2, height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    const aspect = width / height;
    const planeHeight = fontSize * 1.55;
    const planeWidth = planeHeight * aspect;

    return {
      texture,
      planeWidth,
      planeHeight,
    };
  }, [isArabic, text, fontSize, fontsLoadedTick]);

  useEffect(() => {
    return () => {
      arabicTextureData?.texture.dispose();
    };
  }, [arabicTextureData]);

  if (!isArabic) {
    return (
      <Text
        fontSize={fontSize}
        color={color}
        font={LABEL_FONT}
        letterSpacing={letterSpacing}
        fillOpacity={opacity}
        renderOrder={10}
        material-toneMapped={false}
        material-depthWrite={false}
        material-depthTest={depthTest}
      >
        {text}
      </Text>
    );
  }

  if (!arabicTextureData) return null;

  return (
    <mesh renderOrder={10} raycast={() => null}>
      <planeGeometry args={[arabicTextureData.planeWidth, arabicTextureData.planeHeight]} />
      <meshBasicMaterial
        map={arabicTextureData.texture}
        color={color}
        transparent
        opacity={opacity}
        toneMapped={false}
        depthWrite={false}
        depthTest={depthTest}
      />
    </mesh>
  );
});

export default Label3D;

