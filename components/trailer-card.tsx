import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Calendar, Truck, Ruler, Share2, Building2, User } from "lucide-react";
import { Link } from "wouter";
import OptimizedImage from "./optimized-image";
import CertifiedDealerBadge from "./CertifiedDealerBadge";
import { useToast } from "@/hooks/use-toast";
import { useSaveListings } from "@/hooks/useSaveListings";
import { getTrailerTypeLabel } from "@shared/dropdown-data";
import type { TrailerWithDealer } from "@shared/schema";

interface TrailerCardProps {
  trailer: TrailerWithDealer;
  currentPage?: number;
  itemsPerPage?: number;
}

export default function TrailerCard({ trailer, currentPage, itemsPerPage }: TrailerCardProps) {
  const { toast } = useToast();

  // Use the save listings hook
  const { isSaved, handleSaveToggle, isPending: savePending } = useSaveListings({
    trailerId: trailer.id,
    listingType: 'trailer',
    title: trailer.title
  });

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const trailerUrl = `${window.location.origin}/trailers/${trailer.id}`;
    const shareData = {
      title: trailer.title,
      text: `Check out this ${trailer.year} ${trailer.title} for ${formatPrice(trailer.price)}`,
      url: trailerUrl
    };

    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(trailerUrl);
        toast({
          title: "Link copied!",
          description: "The trailer listing link has been copied to your clipboard.",
        });
      }
    } catch (error: any) {
      // If user cancelled the share dialog, don't show error
      if (error.name === 'AbortError') {
        return;
      }
      
      console.error('Error sharing:', error);
      // Final fallback - try to copy to clipboard
      try {
        await navigator.clipboard.writeText(trailerUrl);
        toast({
          title: "Link copied!",
          description: "The trailer listing link has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy the link. Please copy the URL manually.",
          variant: "destructive"
        });
      }
    }
  };

  const formatPrice = (price: string | null) => {
    // Handle null, undefined, empty string, or invalid numbers
    if (!price || price === 'null' || price === '0') {
      return 'Contact for Pricing';
    }
    
    const trimmedPrice = price.toString().trim();
    if (!trimmedPrice) {
      return 'Contact for Pricing';
    }
    
    const numPrice = parseFloat(trimmedPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      return 'Contact for Pricing';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatCapacity = (capacity: number) => {
    return new Intl.NumberFormat('en-US').format(capacity);
  };

  const formatDimensions = (length: string | null, width: string | null) => {
    if (length && width) {
      return `${length}' × ${width}'`;
    } else if (length) {
      return `${length}' long`;
    }
    return 'N/A';
  };

  const handleCardClick = () => {
    console.log('🟢 TrailerCard: Card clicked, storing state for restoration');
    // Store current scroll position for when user returns to marketplace
    sessionStorage.setItem('marketplace-scroll-position', window.scrollY.toString());
    sessionStorage.setItem('marketplace-search-type', 'trailers');
    sessionStorage.setItem('marketplace-return-url', window.location.href);
    
    console.log('🟢 TrailerCard: Stored sessionStorage data:', {
      scrollPosition: sessionStorage.getItem('marketplace-scroll-position'),
      searchType: sessionStorage.getItem('marketplace-search-type'),
      returnUrl: sessionStorage.getItem('marketplace-return-url')
    });
    
    // Store pagination state in localStorage for better persistence
    console.log('🟢 TrailerCard: Storing pagination state:', { currentPage, itemsPerPage });
    if (currentPage !== undefined) {
      localStorage.setItem('marketplace-pagination-page', currentPage.toString());
    }
    if (itemsPerPage !== undefined) {
      localStorage.setItem('marketplace-pagination-itemsPerPage', itemsPerPage === -1 ? 'all' : itemsPerPage.toString());
    }
    localStorage.setItem('marketplace-pagination-timestamp', Date.now().toString());
    console.log('🟢 TrailerCard: Stored in localStorage:', {
      page: localStorage.getItem('marketplace-pagination-page'),
      itemsPerPage: localStorage.getItem('marketplace-pagination-itemsPerPage'),
      timestamp: localStorage.getItem('marketplace-pagination-timestamp')
    });
  };

  // Route to different paths based on whether it's a dealer trailer or individual listing
  const routePath = trailer.dealerId ? `/trailers/${trailer.id}` : `/individual-listings/${trailer.id}`;

  return (
    <Link href={routePath} onClick={handleCardClick}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative">
          <OptimizedImage
            src={trailer.imageUrls?.[0] || '/api/placeholder/400/300'}
            alt={trailer.title}
            className="w-full h-64"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => console.log(`Failed to load image for trailer: ${trailer.title}`)}
          />
          {trailer.imageUrls && trailer.imageUrls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
              +{trailer.imageUrls.length - 1} more
            </div>
          )}

          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveToggle();
              }}
              disabled={savePending}
              className="text-white hover:text-red-500 bg-black bg-opacity-50 rounded-full p-2"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="text-white hover:text-blue-400 bg-black bg-opacity-50 rounded-full p-2"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 leading-tight">{trailer.title}</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center">
            <Truck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary-blue flex-shrink-0" />
            <span className="truncate">{formatCapacity(trailer.capacity)} lbs</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary-blue flex-shrink-0" />
            <span>{trailer.year}</span>
            <span className={`ml-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
              trailer.condition === 'new' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {trailer.condition === 'new' ? 'New' : 'Used'}
            </span>
          </div>
          <div className="flex items-center col-span-2">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary-blue flex-shrink-0" />
            <span className="truncate">{trailer.location}</span>
          </div>
          <div className="flex items-center">
            <Ruler className="w-4 h-4 mr-1 text-primary-blue" />
            {formatDimensions(trailer.length, trailer.width)}
          </div>
          <div className="flex items-center">
            <span className="text-gray-600">{trailer.axles} axles</span>
          </div>
          <div className="flex items-center col-span-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500 flex-shrink-0" />
            <span className="text-gray-500">
              Listed {new Date(trailer.listedAt || trailer.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
        <div className="mb-4 flex gap-2 flex-wrap">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {getTrailerTypeLabel(trailer.trailerType || '')}
          </span>
          {trailer.stockNumber && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full border border-gray-300">
              Stock #{trailer.stockNumber}
            </span>
          )}
          {trailer.dealerId ? (
            <>
              <span className="inline-block bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                Dealer
              </span>
              <CertifiedDealerBadge isVerified={trailer.dealerIsVerified} />
            </>
          ) : (
            <span className="inline-block bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              Individual
            </span>
          )}
        </div>
        
        {/* Seller Profile Link */}
        <div className="mb-3 text-sm">
          {trailer.dealerId ? (
            <Link 
              href={`/dealer/profile/${trailer.dealerId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-2"
            >
              {trailer.dealerProfilePictureUrl ? (
                <img 
                  src={trailer.dealerProfilePictureUrl} 
                  alt={trailer.dealerCompanyName || 'Dealer'}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-blue-600" />
                </div>
              )}
              {trailer.dealerCompanyName || 'View Dealer Profile'}
            </Link>
          ) : (
            <Link 
              href={`/user/profile/${encodeURIComponent(trailer.sellerEmail || '')}`}
              onClick={(e) => e.stopPropagation()}
              className="text-green-600 hover:text-green-800 hover:underline font-medium flex items-center gap-2"
            >
              {trailer.dealerProfilePictureUrl ? (
                <img 
                  src={trailer.dealerProfilePictureUrl} 
                  alt={trailer.sellerName || 'Individual Seller'}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-green-600" />
                </div>
              )}
              {trailer.sellerName || 'View Seller Profile'}
            </Link>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-primary-blue">
            {formatPrice(trailer.price)}
          </span>
          <Button 
            className="bg-primary-blue hover:bg-dark-blue"
            onClick={(e) => {
              e.stopPropagation();
              // Navigate programmatically to correct route based on trailer type
              const targetPath = trailer.dealerId ? `/trailers/${trailer.id}` : `/individual-listings/${trailer.id}`;
              window.location.href = targetPath;
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}