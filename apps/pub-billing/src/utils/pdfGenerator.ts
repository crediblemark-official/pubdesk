import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generateInvoicePDFBytes(elementId: string): Promise<Uint8Array> {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    throw new Error(`Elemen pratinjau dengan ID "${elementId}" tidak ditemukan di DOM.`);
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.width = '595px';
  container.style.height = '842px';
  container.style.overflow = 'hidden';
  container.style.background = '#ffffff';
  document.body.appendChild(container);

  try {
    const clonedElement = originalElement.cloneNode(true) as HTMLDivElement;

    clonedElement.style.transform = 'none';
    clonedElement.style.top = '0';
    clonedElement.style.left = '0';
    clonedElement.style.position = 'static';
    clonedElement.style.margin = '0';
    clonedElement.style.boxShadow = 'none';
    clonedElement.style.borderRadius = '0';

    // Hapus <img>, SVG <image> + nonaktifkan CSS backgroundImage yang pakai url()
    // (watermark pakai data:image/svg+xml — di WebKitGTK bikin canvas taint)
    clonedElement.querySelectorAll('*').forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'img' || tag === 'image') {
        el.remove();
      }
      const htmlEl = el as HTMLElement;
      if (htmlEl.style?.backgroundImage && htmlEl.style.backgroundImage.includes('url(')) {
        htmlEl.style.backgroundImage = 'none';
      }
    });

    container.appendChild(clonedElement);
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Watermark: teks 100% putih; background, border, shadow ikut opacity profil
    clonedElement.querySelectorAll<HTMLElement>('*').forEach(el => {
      const pos = (el.style.position || getComputedStyle(el).position);
      if (pos === 'absolute' && el.style.opacity && parseFloat(el.style.opacity) < 1) {
        const wmOpacity = parseFloat(el.style.opacity);
        el.style.opacity = '1';

        const rgbToRGBA = (str: string, alpha: number): string | null => {
          const m = str.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
          if (m) return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
          return null;
        };
        const isWhiteRGB = (str: string): boolean => {
          const m = str.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
          return !!m && m[1] === '255' && m[2] === '255' && m[3] === '255';
        };

        el.querySelectorAll<HTMLElement>('*').forEach(inner => {
          const cs = getComputedStyle(inner);
          const bg = cs.backgroundColor;
          if (bg && bg !== 'transparent' && !bg.includes('rgba(0,0,0,0)') && !bg.includes('rgba(0, 0, 0, 0)')) {
            const rgba = rgbToRGBA(bg, wmOpacity);
            if (rgba) inner.style.backgroundColor = rgba;
          }
          const bc = cs.borderColor;
          const bw = cs.borderWidth;
          if (bc && bw && bw !== '0px' && bc !== 'transparent' && !bc.includes('rgba(0,0,0,0)') && !isWhiteRGB(bc)) {
            const rgba = rgbToRGBA(bc, wmOpacity);
            if (rgba) inner.style.borderColor = rgba;
          }
          const sh = cs.boxShadow;
          if (sh && sh !== 'none') {
            inner.style.boxShadow = sh.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, (_, r, g, b) => {
              if (r === '255' && g === '255' && b === '255') return `rgb(${r},${g},${b})`;
              return `rgba(${r},${g},${b},${wmOpacity})`;
            });
          }
          inner.style.opacity = '1';
        });
      }
    });

    const captureCanvas = await html2canvas(clonedElement, {
      scale: 2.5,
      useCORS: false,
      allowTaint: false,
      backgroundColor: '#ffffff',
    });

    const imgData = captureCanvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 595, 842);

    const arrayBuffer = pdf.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    console.error('[PDF Gen] Gagal memproses html2canvas:', err);
    throw err;
  } finally {
    document.body.removeChild(container);
  }
}
