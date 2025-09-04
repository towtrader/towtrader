import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Calendar, Gauge, Wrench, Share2, Building2, User } from "lucide-react";
import { Link } from "wouter";
import OptimizedImage from "./optimized-image";
import CertifiedDealerBadge from "./CertifiedDealerBadge";
import { useToast } from "@/hooks/use-toast";
import { useSaveListings } from "@/hooks/useSaveListings";
import { getTruckTypeLabel } from "@shared/dropdown-data";
import type { TowTruckWithDealer } from "@shared/schema";

interface TruckCardProps {
  truck: TowTruckWithDealer;
  currentPage?: number;
  itemsPerPage?: number;
}

export default function TruckCard({ truck, currentPage, itemsPerPage }: TruckCardProps) {
  const { toast } = useToast();

  // Use the save listings hook
  const { isSaved, handleSaveToggle, isPending: savePending } = useSaveListings({
    truckId: truck.id,
    listingType: 'truck',
    title: truck.title,
    isIndividual: truck.dealerId === null // Individual trucks have dealerId: null
  });

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use the same logic as routing to determine correct URL
    const listingPath = truck.dealerId ? `/trucks/${truck.id}` : `/individual-listings/${truck.id}`;
    const truckUrl = `${window.location.origin}${listingPath}`;
    const shareData = {
      title: truck.title,
      text: `Check out this ${truck.title} for ${formatPrice(truck.price)}`,
      url: truckUrl
    };

    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(truckUrl);
        toast({
          title: "Link copied!",
          description: "The truck listing link has been copied to your clipboard.",
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
        await navigator.clipboard.writeText(truckUrl);
        toast({
          title: "Link copied!",
          description: "The truck listing link has been copied to your clipboard.",
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
    
    // Convert from cents to dollars for individual listings (dealerId is null)
    const finalPrice = truck.dealerId === null ? numPrice / 100 : numPrice;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(finalPrice);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  const handleCardClick = () => {
    console.log('🔵 TruckCard: Card clicked, storing state for restoration');
    // Store current scroll position for when user returns to marketplace
    sessionStorage.setItem('marketplace-scroll-position', window.scrollY.toString());
    sessionStorage.setItem('marketplace-search-type', 'trucks');
    sessionStorage.setItem('marketplace-return-url', window.location.href);
    
    console.log('🔵 TruckCard: Stored sessionStorage data:', {
      scrollPosition: sessionStorage.getItem('marketplace-scroll-position'),
      searchType: sessionStorage.getItem('marketplace-search-type'),
      returnUrl: sessionStorage.getItem('marketplace-return-url')
    });
    
    // Store pagination state in localStorage for better persistence
    console.log('🔵 TruckCard: Storing pagination state:', { currentPage, itemsPerPage });
    if (currentPage !== undefined) {
      localStorage.setItem('marketplace-pagination-page', currentPage.toString());
    }
    if (itemsPerPage !== undefined) {
      localStorage.setItem('marketplace-pagination-itemsPerPage', itemsPerPage === -1 ? 'all' : itemsPerPage.toString());
    }
    localStorage.setItem('marketplace-pagination-timestamp', Date.now().toString());
    console.log('🔵 TruckCard: Stored in localStorage:', {
      page: localStorage.getItem('marketplace-pagination-page'),
      itemsPerPage: localStorage.getItem('marketplace-pagination-itemsPerPage'),
      timestamp: localStorage.getItem('marketplace-pagination-timestamp')
    });
  };

  // Route to different pages based on whether it's a dealer truck or individual listing
  const routePath = truck.dealerId ? `/trucks/${truck.id}` : `/individual-listings/${truck.id}`;

  return (
    <Link href={routePath} onClick={handleCardClick}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative">
          <OptimizedImage
            src={truck.imageUrls?.[0] || '/api/placeholder/400/300'}
            alt={truck.title}
            className="w-full h-64"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => console.log(`Failed to load image for truck: ${truck.title}`)}
          />
          {truck.imageUrls && truck.imageUrls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
              +{truck.imageUrls.length - 1} more
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
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 leading-tight">{truck.title}</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center">
            <Gauge className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary-blue flex-shrink-0" />
            <span className="truncate">{formatMileage(truck.mileage)} miles</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary-blue flex-shrink-0" />
            <span>{truck.year}</span>
            <span className={`ml-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
              truck.condition === 'new' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {truck.condition === 'new' ? 'New' : 'Used'}
            </span>
          </div>
          <div className="flex items-center col-span-2">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary-blue flex-shrink-0" />
            <span className="truncate">{truck.location}</span>
          </div>
          <div className="flex items-center">
            <Wrench className="w-4 h-4 mr-1 text-primary-blue" />
            {truck.bodyManufacturer}
          </div>
          <div className="flex items-center col-span-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500 flex-shrink-0" />
            <span className="text-gray-500">
              Listed {new Date(truck.listedAt || truck.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
        <div className="mb-4 flex gap-2 flex-wrap">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
            {getTruckTypeLabel(truck.truckType)}
          </span>
          {truck.stockNumber && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full border border-gray-300">
              Stock #{truck.stockNumber}
            </span>
          )}
          {truck.dealerId ? (
            <>
              <span className="inline-block bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                Dealer
              </span>
              <CertifiedDealerBadge isVerified={truck.dealerIsVerified} />
            </>
          ) : (
            <span className="inline-block bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              Individual
            </span>
          )}
        </div>
        
        {/* Seller Profile Link */}
        <div className="mb-3 text-sm">
          {truck.dealerId ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/dealer/profile/${truck.dealerId}`;
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-2 bg-transparent border-none cursor-pointer"
            >
              {truck.dealerProfilePictureUrl ? (
                <img 
                  src={truck.dealerProfilePictureUrl} 
                  alt={truck.dealerCompanyName || 'Dealer'}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-blue-600" />
                </div>
              )}
              {truck.dealerCompanyName || 'View Dealer Profile'}
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/user/profile/${encodeURIComponent(truck.sellerEmail || '')}`;
              }}
              className="text-green-600 hover:text-green-800 hover:underline font-medium flex items-center gap-2 bg-transparent border-none cursor-pointer"
            >
              {truck.dealerProfilePictureUrl ? (
                <img 
                  src={truck.dealerProfilePictureUrl} 
                  alt={truck.sellerName || 'Individual Seller'}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-green-600" />
                </div>
              )}
              {truck.sellerName || 'View Seller Profile'}
            </button>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-primary-blue">
            {formatPrice(truck.price)}
          </span>
          <Button 
            className="bg-primary-blue hover:bg-dark-blue"
            onClick={(e) => {
              e.stopPropagation();
              // Navigate programmatically instead of using nested Link
              const listingPath = truck.dealerId ? `/trucks/${truck.id}` : `/individual-listings/${truck.id}`;
              window.location.href = listingPath;
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
