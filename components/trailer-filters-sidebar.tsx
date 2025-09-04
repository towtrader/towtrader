import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { NativeSelect } from '@/components/ui/native-select';
import { X } from 'lucide-react';
import type { TrailerSearchFilters } from '@shared/schema';
import { TRAILER_MANUFACTURERS } from '@shared/dropdown-data';

interface TrailerFiltersSidebarProps {
  filters: TrailerSearchFilters;
  onFiltersChange: (filters: TrailerSearchFilters) => void;
}

export default function TrailerFiltersSidebar({ filters, onFiltersChange }: TrailerFiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState<TrailerSearchFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: TrailerSearchFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleManufacturerChange = (manufacturer: string, checked: boolean) => {
    const currentManufacturers = localFilters.manufacturer || [];
    let newManufacturers;
    
    if (checked) {
      newManufacturers = [...currentManufacturers, manufacturer];
    } else {
      newManufacturers = currentManufacturers.filter(m => m !== manufacturer);
    }
    
    const newFilters = {
      ...localFilters,
      manufacturer: newManufacturers.length > 0 ? newManufacturers : undefined
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Filter Trailers</CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trailer Type */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Trailer Type</Label>
          <NativeSelect 
            value={localFilters.trailerType || "all"} 
            onChange={(e) => {
              const newFilters = {
                ...localFilters,
                trailerType: e.target.value === "all" ? undefined : e.target.value
              };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }}
          >
            <option value="all">All Types</option>
            <option value="flatbed">Flatbed</option>
            <option value="lowboy">Lowboy</option>
            <option value="car-carrier">Car Carrier</option>
            <option value="equipment">Equipment</option>
            <option value="gooseneck">Gooseneck</option>
            <option value="utility">Utility</option>
          </NativeSelect>
        </div>

        <Separator />

        {/* Condition */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Condition</Label>
          <NativeSelect 
            value={localFilters.condition || ""} 
            onChange={(e) => {
              const newFilters = {
                ...localFilters,
                condition: (e.target.value === "" || e.target.value === "all") ? undefined : e.target.value as "new" | "used"
              };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }}
          >
            <option value="">Select Condition</option>
            <option value="all">All Conditions</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </NativeSelect>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Min Price</Label>
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.priceMin || ""}
                onChange={(e) => {
                  const newFilters = {
                    ...localFilters,
                    priceMin: e.target.value ? parseInt(e.target.value) : undefined
                  };
                  setLocalFilters(newFilters);
                }}
                onBlur={handleApplyFilters}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Max Price</Label>
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.priceMax || ""}
                onChange={(e) => {
                  const newFilters = {
                    ...localFilters,
                    priceMax: e.target.value ? parseInt(e.target.value) : undefined
                  };
                  setLocalFilters(newFilters);
                }}
                onBlur={handleApplyFilters}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Year Range */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Year Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">From</Label>
              <Input
                type="number"
                placeholder="2000"
                value={localFilters.yearMin || ""}
                onChange={(e) => {
                  const newFilters = {
                    ...localFilters,
                    yearMin: e.target.value ? parseInt(e.target.value) : undefined
                  };
                  setLocalFilters(newFilters);
                }}
                onBlur={handleApplyFilters}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">To</Label>
              <Input
                type="number"
                placeholder="2024"
                value={localFilters.yearMax || ""}
                onChange={(e) => {
                  const newFilters = {
                    ...localFilters,
                    yearMax: e.target.value ? parseInt(e.target.value) : undefined
                  };
                  setLocalFilters(newFilters);
                }}
                onBlur={handleApplyFilters}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Axles */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Number of Axles</Label>
          <NativeSelect 
            value={localFilters.axles?.toString() || "all"} 
            onChange={(e) => {
              const newFilters = {
                ...localFilters,
                axles: e.target.value === "all" ? undefined : parseInt(e.target.value)
              };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }}
          >
            <option value="all">Any</option>
            <option value="2">2 Axles</option>
            <option value="3">3 Axles</option>
            <option value="4">4 Axles</option>
            <option value="5">5+ Axles</option>
          </NativeSelect>
        </div>

        <Separator />

        {/* State */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">State</Label>
          <NativeSelect 
            value={localFilters.location || ""} 
            onChange={(e) => {
              const newFilters = {
                ...localFilters,
                location: e.target.value === "" ? undefined : e.target.value
              };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }}
          >
            <option value="">Select State</option>
            <option value="Alabama">Alabama</option>
            <option value="Alaska">Alaska</option>
            <option value="Arizona">Arizona</option>
            <option value="Arkansas">Arkansas</option>
            <option value="California">California</option>
            <option value="Colorado">Colorado</option>
            <option value="Connecticut">Connecticut</option>
            <option value="Delaware">Delaware</option>
            <option value="Florida">Florida</option>
            <option value="Georgia">Georgia</option>
            <option value="Hawaii">Hawaii</option>
            <option value="Idaho">Idaho</option>
            <option value="Illinois">Illinois</option>
            <option value="Indiana">Indiana</option>
            <option value="Iowa">Iowa</option>
            <option value="Kansas">Kansas</option>
            <option value="Kentucky">Kentucky</option>
            <option value="Louisiana">Louisiana</option>
            <option value="Maine">Maine</option>
            <option value="Maryland">Maryland</option>
            <option value="Massachusetts">Massachusetts</option>
            <option value="Michigan">Michigan</option>
            <option value="Minnesota">Minnesota</option>
            <option value="Mississippi">Mississippi</option>
            <option value="Missouri">Missouri</option>
            <option value="Montana">Montana</option>
            <option value="Nebraska">Nebraska</option>
            <option value="Nevada">Nevada</option>
            <option value="New Hampshire">New Hampshire</option>
            <option value="New Jersey">New Jersey</option>
            <option value="New Mexico">New Mexico</option>
            <option value="New York">New York</option>
            <option value="North Carolina">North Carolina</option>
            <option value="North Dakota">North Dakota</option>
            <option value="Ohio">Ohio</option>
            <option value="Oklahoma">Oklahoma</option>
            <option value="Oregon">Oregon</option>
            <option value="Pennsylvania">Pennsylvania</option>
            <option value="Rhode Island">Rhode Island</option>
            <option value="South Carolina">South Carolina</option>
            <option value="South Dakota">South Dakota</option>
            <option value="Tennessee">Tennessee</option>
            <option value="Texas">Texas</option>
            <option value="Utah">Utah</option>
            <option value="Vermont">Vermont</option>
            <option value="Virginia">Virginia</option>
            <option value="Washington">Washington</option>
            <option value="West Virginia">West Virginia</option>
            <option value="Wisconsin">Wisconsin</option>
            <option value="Wyoming">Wyoming</option>
          </NativeSelect>
        </div>

        <Separator />

        {/* Manufacturer */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Manufacturer</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {TRAILER_MANUFACTURERS.map((manufacturer) => (
              <div key={manufacturer} className="flex items-center space-x-2">
                <Checkbox
                  id={`manufacturer-${manufacturer}`}
                  checked={localFilters.manufacturer?.includes(manufacturer) || false}
                  onCheckedChange={(checked) => handleManufacturerChange(manufacturer, checked as boolean)}
                />
                <Label htmlFor={`manufacturer-${manufacturer}`} className="text-sm">
                  {manufacturer}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}