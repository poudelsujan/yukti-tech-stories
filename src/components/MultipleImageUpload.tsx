
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';

interface MultipleImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const MultipleImageUpload = ({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  disabled = false 
}: MultipleImageUploadProps) => {
  const { toast } = useToast();
  const { uploadToStorage, uploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + pendingFiles.length + files.length > maxImages) {
      toast({
        variant: "destructive",
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`
      });
      return;
    }

    // Add to pending files for preview
    setPendingFiles(prev => [...prev, ...files]);
  };

  const uploadPendingFiles = async () => {
    if (pendingFiles.length === 0) return images;

    const uploadPromises = pendingFiles.map(async (file) => {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
      const filePath = `products/${fileName}`;
      return await uploadToStorage(file, 'product-images', filePath);
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      const newImages = [...images, ...validUrls];
      onImagesChange(newImages);
      setPendingFiles([]);
      return newImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Some images failed to upload"
      });
      return images;
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Product Images ({images.length + pendingFiles.length}/{maxImages})</Label>
        <div className="flex items-center gap-2 mt-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading || images.length + pendingFiles.length >= maxImages}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading || images.length + pendingFiles.length >= maxImages}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Add Images
          </Button>
          {pendingFiles.length > 0 && (
            <span className="text-sm text-orange-600">
              {pendingFiles.length} files ready to upload
            </span>
          )}
        </div>
      </div>

      {(images.length > 0 || pendingFiles.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Uploaded images */}
          {images.map((image, index) => (
            <div key={`uploaded-${index}`} className="relative group">
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Pending files preview */}
          {pendingFiles.map((file, index) => (
            <div key={`pending-${index}`} className="relative group">
              <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500 truncate block max-w-full px-2">
                    {file.name}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePendingFile(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-2 left-2">
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  Pending
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        First image will be used as the main product image. You can upload up to {maxImages} images.
      </p>
    </div>
  );
};

export { MultipleImageUpload, uploadPendingFiles: (component: any) => component.uploadPendingFiles };
export default MultipleImageUpload;
