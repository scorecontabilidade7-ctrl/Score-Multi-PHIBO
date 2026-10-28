import { supabase } from '../integrations/supabase/client';

/**
 * Redimensiona e comprime uma imagem para um avatar circular leve (máx 300x300px)
 */
export async function processAndUploadAvatar(
  file: File | Blob,
  vendedorNome?: string
): Promise<string> {
  // 1. Redimensiona e otimiza via Canvas local
  const base64DataUrl = await compressImage(file, 300, 300, 0.85);

  // 2. Tenta fazer upload para o bucket público do Supabase Storage
  try {
    const cleanName = vendedorNome
      ? vendedorNome.toLowerCase().replace(/[^a-z0-9]/g, '_')
      : 'vendedor';
    const fileName = `${cleanName}_${Date.now()}.jpg`;

    // Converte DataURL para Blob para o Supabase
    const res = await fetch(base64DataUrl);
    const blob = await res.blob();

    const { data, error } = await supabase.storage
      .from('phibo_vendedores')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage
        .from('phibo_vendedores')
        .getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Storage indisponível, utilizando DataURL local otimizada:', err);
  }

  // Fallback garantido: retorna Base64 DataURL (funciona perfeitamente em <img> e Postgres TEXT)
  return base64DataUrl;
}

function compressImage(
  file: File | Blob,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const image = new Image();
      image.onload = () => {
        let width = image.width;
        let height = image.height;

        // Mantém a proporção cortando para quadrado centralizado
        const minDimension = Math.min(width, height);
        const startX = (width - minDimension) / 2;
        const startY = (height - minDimension) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = Math.min(minDimension, maxWidth);
        canvas.height = Math.min(minDimension, maxHeight);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(
          image,
          startX,
          startY,
          minDimension,
          minDimension,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      image.onerror = reject;
      image.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
