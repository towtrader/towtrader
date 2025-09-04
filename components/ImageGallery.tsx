import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export default function ImageGallery({ images, title, className = "" }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const lastPanX = useRef<number>(0);
  const lastPanY = useRef<number>(0);
  const minSwipeDistance = 50;

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openModal = () => {
    setShowModal(true);
    // Reset zoom when opening modal
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const closeModal = () => {
    setShowModal(false);
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      lastPanX.current = e.clientX - panX;
      lastPanY.current = e.clientY - panY;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanX(e.clientX - lastPanX.current);
      setPanY(e.clientY - lastPanY.current);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    
    // Only register horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      e.preventDefault();
      if (deltaX > 0) {
        // Swiped left, go to next image
        goToNext();
      } else {
        // Swiped right, go to previous image
        goToPrevious();
      }
    }
    
    touchStartX.current = 0;
    touchStartY.current = 0;
  };

  return (
    <>
      {/* Main Gallery */}
      <div className={`relative ${className}`}>
        {/* Main Image */}
        <div 
          className="relative overflow-hidden rounded-lg cursor-pointer touch-pan-y" 
          onClick={openModal}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img 
            src={images[selectedIndex]} 
            alt={`${title} - Image ${selectedIndex + 1}`}
            className="w-full h-96 object-cover transition-transform hover:scale-105"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
            loading="eager"
            decoding="async"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                data-testid="image-gallery-prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                data-testid="image-gallery-next"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                  index === selectedIndex 
                    ? 'border-primary-blue shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedIndex(index)}
                data-testid={`thumbnail-${index}`}
              >
                <img
                  src={image}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-Screen Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative max-w-5xl max-h-full p-4">
            {/* Close Button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute top-6 right-6 z-10 bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={closeModal}
              data-testid="modal-close"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Zoom Controls */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                data-testid="zoom-in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                data-testid="zoom-out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                onClick={resetZoom}
                data-testid="reset-zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Image */}
            <div 
              className="relative overflow-hidden rounded-lg flex items-center justify-center"
              style={{ maxWidth: '90vw', maxHeight: '90vh', minHeight: '60vh' }}
            >
              <img
                src={images[selectedIndex]}
                alt={`${title} - Full Size ${selectedIndex + 1}`}
                className="transition-transform duration-200 select-none max-w-full max-h-full object-contain"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`,
                  cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                  transformOrigin: 'center center'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                draggable={false}
              />
            </div>

            {/* Modal Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={goToPrevious}
                  data-testid="modal-prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={goToNext}
                  data-testid="modal-next"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Modal Counter and Zoom Level */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded flex items-center gap-3">
                  <span>{selectedIndex + 1} / {images.length}</span>
                  {zoomLevel !== 1 && (
                    <span className="text-xs">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}