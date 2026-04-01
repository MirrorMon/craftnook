let heic2anyPromise: Promise<any> | null = null;

/**
 * 预加载 heic2any 库
 */
function getHeic2Any() {
  if (!heic2anyPromise) {
    heic2anyPromise = import('heic2any').then(m => m.default);
  }
  return heic2anyPromise;
}

/**
 * 对图片进行缩放和压缩，长边限制在 1800px，输出为 jpeg 格式
 */
async function resizeAndCompress(file: Blob | File): Promise<string> {
  const MAX_WIDTH = 1800;
  const MAX_HEIGHT = 1800;
  
  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 Canvas 上下文'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        const endTime = performance.now();
        console.log(`[ImageUtils] Resize/Compress took: ${(endTime - startTime).toFixed(1)}ms`);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

export async function processImageFile(file: File): Promise<string> {
  let currentBlob: Blob | File = file;

  if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
    const startTime = performance.now();
    try {
      console.log(`[ImageUtils] Starting HEIC conversion for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      const heic2any = await getHeic2Any();
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.7
      });
      currentBlob = Array.isArray(converted) ? converted[0] : converted;
      const endTime = performance.now();
      console.log(`[ImageUtils] HEIC conversion took: ${(endTime - startTime).toFixed(1)}ms`);
    } catch (err) {
      console.error('[ImageUtils] HEIC conversion Error:', err);
      throw new Error('无法处理HEIC图片，请尝试其他格式');
    }
  }

  return await resizeAndCompress(currentBlob);
}
