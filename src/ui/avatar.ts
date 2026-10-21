// Managerens profilbillede: gemmes i browseren (følger dig på tværs af spil) og vises på den offentlige profil.
const KEY = 'cm0102.avatar';

export function getAvatar(): string {
  try { return localStorage.getItem(KEY) ?? ''; } catch { return ''; }
}

export function setAvatar(dataUrl: string) {
  try { if (dataUrl) localStorage.setItem(KEY, dataUrl); else localStorage.removeItem(KEY); } catch { /* fuld eller blokeret */ }
}

/** Skær billedet til et kvadrat og skaler det ned til 192×192 (JPEG, ca. 10–25 kB) */
export function resizeImage(file: File, size = 192): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas')); return; }
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}
