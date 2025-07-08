
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadOptions {
  maxSizeBytes?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const useImageUpload = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const compressImage = (file: File, options: ImageUploadOptions = {}): Promise<File> => {
    return new Promise((resolve) => {
      const {
        maxSizeBytes = 500000, // 500KB default
        quality = 0.8,
        maxWidth = 1024,
        maxHeight = 1024
      } = options;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadToStorage = async (file: File, bucket: string, path: string): Promise<string | null> => {
    try {
      setUploading(true);

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)."
        });
        return null;
      }

      // Compress image
      const compressedFile = await compressImage(file);
      
      console.log(`Original size: ${file.size} bytes, compressed size: ${compressedFile.size} bytes`);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again."
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadToStorage,
    uploading,
    compressImage
  };
};
