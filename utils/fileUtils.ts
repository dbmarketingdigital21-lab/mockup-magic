
import type { ImageFile } from './types';

export const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
        return reject(new Error('File is not an image.'));
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:image/jpeg;base64,..."
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
