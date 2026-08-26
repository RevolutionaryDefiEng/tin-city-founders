import { useEffect, useState } from "react";

const MEM: Record<string, string> = {};

function getCached(src: string): string | null {
  if (MEM[src]) return MEM[src];
  try { return sessionStorage.getItem("tcf_logo_" + src); } catch { return null; }
}

function setCached(src: string, dataUrl: string): void {
  MEM[src] = dataUrl;
  try { sessionStorage.setItem("tcf_logo_" + src, dataUrl); } catch {}
}

function stripWhiteBackground(src: string, threshold = 240): Promise<string> {
  const cached = getCached(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (r >= threshold && g >= threshold && b >= threshold) {
          d[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const result = canvas.toDataURL("image/png");
      setCached(src, result);
      resolve(result);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function useTransparentLogo(src: string): string {
  // Initialise from cache synchronously so there is no flash on reload
  const [result, setResult] = useState<string>(() => getCached(src) ?? src);

  useEffect(() => {
    const cached = getCached(src);
    if (cached) { setResult(cached); return; }
    stripWhiteBackground(src).then(setResult).catch(() => setResult(src));
  }, [src]);

  return result;
}