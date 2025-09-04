import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon, Info, ChevronDown, ChevronUp } from 'lucide-react';

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

interface MultipleImageUploadProps {
  onImagesChange: (images: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
  className?: string;
  listingType?: 'truck' | 'trailer';
}

export default function MultipleImageUpload({ 
  onImagesChange, 
  currentImages = [], 
  maxImages = 10,
  className = "",
  listingType = 'truck'
}: MultipleImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages);
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const newImages: string[] = [];

      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) {
          console.warn('Skipping non-image file:', file.name);
          continue;
        }

        // Always compress images for better performance
        console.log(`Compressing ${file.name} from ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        let processedFile = await compressImage(file, 2 * 1024 * 1024); // Target 2MB max
        console.log(`Compressed ${file.name} to ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
        
        // Skip if file is still too large after compression  
        if (processedFile.size > 3 * 1024 * 1024) {
          console.log(`File ${file.name} still too large after compression: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
          alert(`File ${file.name} could not be compressed enough. Please use a smaller image.`);
          continue;
        }

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

        newImages.push(base64String);
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process some images. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

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
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  }, [handleFiles]);

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  data-testid={`remove-image-${index}`}
                >
                  <X className="w-3 h-3" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileExplorer}
        >
          <div className="p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              data-testid="file-input"
            />
            
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm text-gray-600">Processing images...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {images.length === 0 ? (
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                )}
                <p className="text-lg font-medium text-gray-700 mb-1">
                  {images.length === 0 ? 'Upload truck photos' : 'Add more photos'}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Drag and drop or click to select ({images.length}/{maxImages})
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG up to 5MB each
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Upload Button (alternative to drag/drop) */}
      {images.length > 0 && images.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={openFileExplorer}
          disabled={uploading}
          className="w-full mt-2"
          data-testid="add-more-button"
        >
          <Upload className="w-4 h-4 mr-2" />
          Add More Photos ({images.length}/{maxImages})
        </Button>
      )}

      {/* Photo Requirements - Only show for trucks */}
      {listingType === 'truck' && (
        <Card className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-md">
          <div className="text-sm">
            <div className="flex items-center mb-3">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              <h4 className="font-bold text-blue-900 text-base">📸 Required Photos for Listings</h4>
            </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                🚚 Exterior Photos:
              </h5>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Front:</strong> Straight-on and three-quarter angle</li>
                <li>• <strong>Rear:</strong> Straight-on and rear three-quarter angle</li>
                <li>• <strong>Sides:</strong> Full length shots of both sides</li>
                <li>• <strong>Engine:</strong> Complete engine bay with hood open</li>
              </ul>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                🏠 Interior Photos:
              </h5>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Dashboard:</strong> Wide-angle with steering wheel</li>
                <li>• <strong>Mileage:</strong> Clear odometer reading</li>
                <li>• <strong>Front seats:</strong> Both seats, focus on driver</li>
                <li>• <strong>Rear seats:</strong> Back seat condition</li>
                <li>• <strong>Console:</strong> Controls and audio system</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800 font-medium">
              💡 <strong>Important:</strong> Take photos in good lighting. First photo becomes your main listing image!
            </p>
          </div>
        </div>
      </Card>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-2">
        {images.length === 0 
          ? `Upload up to ${maxImages} high-quality photos.${listingType === 'truck' ? ' Follow the guide above for best results.' : ''}`
          : `You can upload ${maxImages - images.length} more photo${maxImages - images.length !== 1 ? 's' : ''}.`
        }
      </p>
    </div>
  );
}