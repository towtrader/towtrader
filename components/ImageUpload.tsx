import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';

// Image compression function - much more aggressive compression
async function compressImage(file: File, maxSizeBytes: number): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions to reduce file size - much smaller
      let { width, height } = img;
      const ratio = Math.min(800 / width, 800 / height); // Reduced from 2048 to 800
      
      if (ratio < 1) {
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, 0.4); // Much lower quality: 40% instead of 80%
    };
    
    img.src = URL.createObjectURL(file);
  });
}

interface ImageUploadProps {
  onImageChange: (imageUrl: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export default function ImageUpload({ onImageChange, currentImageUrl, className }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Always compress images for better performance
    console.log(`Compressing ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    let processedFile = await compressImage(file, 2 * 1024 * 1024); // Target 2MB max
    console.log(`Compressed ${file.name} to ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
    
    // Skip if file is still too large after compression
    if (processedFile.size > 3 * 1024 * 1024) {
      alert(`File ${file.name} could not be compressed enough. Please use a smaller image.`);
      return;
    }

    setUploading(true);

    try {
      // Create object URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Convert image to base64 for storage
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(processedFile);
      });

      // Store base64 string (which works universally)
      onImageChange(base64String);
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onImageChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      
      {previewUrl ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Truck preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileExplorer}
                disabled={uploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${uploading ? 'opacity-50' : 'hover:border-gray-400'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-gray-600">Uploading image...</p>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    Drop truck photos here
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports JPG, PNG, WebP up to 10MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={openFileExplorer}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Photo
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}