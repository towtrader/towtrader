import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Search, Truck, Building } from "lucide-react";
import { useLocation } from "wouter";
import { bodyManufacturers, TRAILER_MANUFACTURERS } from "@shared/dropdown-data";
import type { SearchFilters } from "@shared/schema";

interface SearchFormProps {
  onSearch?: (filters: SearchFilters) => void;
  compact?: boolean;
}

export default function SearchForm({ onSearch, compact = false }: SearchFormProps) {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchType, setSearchType] = useState<'trucks' | 'trailers'>('trucks');

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // If we're on the search page (onSearch callback exists), trigger search immediately
    if (onSearch) {
      onSearch(newFilters);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to search page with filters and search type
      const searchParams = new URLSearchParams();
      searchParams.set('type', searchType);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          if (Array.isArray(value) && value.length > 0) {
            searchParams.set(key, value[0]);
          } else if (!Array.isArray(value)) {
            searchParams.set(key, value.toString());
          }
        }
      });
      setLocation(`/search?${searchParams.toString()}`);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <NativeSelect 
          value={filters.truckType || "all"} 
          onChange={(e) => {
            handleFiltersChange({...filters, truckType: e.target.value === "all" ? undefined : e.target.value});
          }}
          className="w-full sm:w-40 h-11"
        >
          <option value="all">All Types</option>
          <option value="heavy-duty">Heavy Duty</option>
          <option value="industrial-carriers">Industrial Carriers</option>
          <option value="integrated">Integrated</option>
          <option value="light-duty">Light Duty</option>
          <option value="rollbacks">Rollbacks</option>
          <option value="rotators">Rotators</option>
        </NativeSelect>
        <NativeSelect 
          value={
            filters.bodyManufacturer && filters.bodyManufacturer.length > 0 
              ? filters.bodyManufacturer[0] 
              : ""
          } 
          onChange={(e) => {
            const value = e.target.value;
            handleFiltersChange({
              ...filters, 
              bodyManufacturer: value === "" ? undefined : [value]
            });
          }}
          className="w-full sm:w-40 h-11"
        >
          <option value="">Body Manufacturer</option>
          {(searchType === 'trucks' ? bodyManufacturers : TRAILER_MANUFACTURERS).map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </NativeSelect>
        <NativeSelect 
          value={filters.condition || ""} 
          onChange={(e) => {
            handleFiltersChange({...filters, condition: (e.target.value === "" || e.target.value === "all") ? undefined : e.target.value as "new" | "used"});
          }}
          className="w-full sm:w-32 h-11"
        >
          <option value="">Condition</option>
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </NativeSelect>
        <NativeSelect 
          value={filters.state || ""} 
          onChange={(e) => {
            handleFiltersChange({...filters, state: e.target.value === "" ? undefined : e.target.value});
          }}
          className="w-full sm:w-40 h-11"
        >
          <option value="">State</option>
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
        <Button type="submit" className="bg-secondary-orange hover:bg-orange-600 h-11 px-6">
          <Search className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Type Toggle */}
      <div className="flex justify-center mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex">
          <Button
            type="button"
            variant={searchType === 'trucks' ? 'default' : 'ghost'}
            className={`px-4 py-2 rounded ${searchType === 'trucks' 
              ? 'bg-white text-primary-blue shadow-md' 
              : 'text-white hover:bg-white/20'}`}
            onClick={() => setSearchType('trucks')}
          >
            <Truck className="w-4 h-4 mr-2" />
            Trucks
          </Button>
          <Button
            type="button"
            variant={searchType === 'trailers' ? 'default' : 'ghost'}
            className={`px-4 py-2 rounded ${searchType === 'trailers' 
              ? 'bg-white text-primary-blue shadow-md' 
              : 'text-white hover:bg-white/20'}`}
            onClick={() => setSearchType('trailers')}
          >
            <Building className="w-4 h-4 mr-2" />
            Trailers
          </Button>
        </div>
      </div>
      
      {/* Mobile-first responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <NativeSelect 
            value={filters.truckType || "all"} 
            onChange={(e) => {
              handleFiltersChange({...filters, truckType: e.target.value === "all" ? undefined : e.target.value});
            }}
            className="h-11"
          >
            {searchType === 'trucks' ? (
              <>
                <option value="all">All Types</option>
                <option value="heavy-duty">Heavy Duty</option>
                <option value="industrial-carriers">Industrial Carriers</option>
                <option value="integrated">Integrated</option>
                <option value="light-duty">Light Duty</option>
                <option value="rollbacks">Rollbacks</option>
                <option value="rotators">Rotators</option>
              </>
            ) : (
              <>
                <option value="all">All Types</option>
                <option value="deckover">Deckover</option>
                <option value="equipment">Equipment</option>
                <option value="flatbed">Flatbed</option>
                <option value="gooseneck">Gooseneck</option>
                <option value="lowboy">Lowboy</option>
                <option value="stepdeck">Step Deck</option>
              </>
            )}
          </NativeSelect>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <NativeSelect 
            value={
              filters.bodyManufacturer && filters.bodyManufacturer.length > 0 
                ? filters.bodyManufacturer[0] 
                : ""
            } 
            onChange={(e) => {
              const value = e.target.value;
              handleFiltersChange({
                ...filters, 
                bodyManufacturer: value === "" ? undefined : [value]
              });
            }}
            className="h-11"
          >
            <option value="">Body Manufacturer</option>
            {(searchType === 'trucks' ? bodyManufacturers : TRAILER_MANUFACTURERS).map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <NativeSelect 
            value={
              filters.priceMax === 50000 && !filters.priceMin ? "50000" :
              filters.priceMin === 50000 && filters.priceMax === 100000 ? "100000" :
              filters.priceMin === 100000 && filters.priceMax === 200000 ? "200000" :
              filters.priceMin === 200000 && !filters.priceMax ? "999999" :
              "any"
            } 
            onChange={(e) => {
              const value = e.target.value;
              if (value === "50000") {
                handleFiltersChange({...filters, priceMin: undefined, priceMax: 50000});
              } else if (value === "100000") {
                handleFiltersChange({...filters, priceMin: 50000, priceMax: 100000});
              } else if (value === "200000") {
                handleFiltersChange({...filters, priceMin: 100000, priceMax: 200000});
              } else if (value === "999999") {
                handleFiltersChange({...filters, priceMin: 200000, priceMax: undefined});
              } else {
                handleFiltersChange({...filters, priceMin: undefined, priceMax: undefined});
              }
            }}
            className="h-11"
          >
            <option value="any">Any Price</option>
            <option value="50000">Under $50K</option>
            <option value="100000">$50K - $100K</option>
            <option value="200000">$100K - $200K</option>
            <option value="999999">Over $200K</option>
          </NativeSelect>
        </div>
        <div className="sm:col-span-1 lg:col-span-1">
          <NativeSelect 
            value={filters.condition || ""} 
            onChange={(e) => {
              handleFiltersChange({...filters, condition: (e.target.value === "" || e.target.value === "all") ? undefined : e.target.value as "new" | "used"});
            }}
            className="h-11"
          >
            <option value="">Condition</option>
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </NativeSelect>
        </div>
        <div className="sm:col-span-1 lg:col-span-1">
          <NativeSelect 
            value={filters.state || ""} 
            onChange={(e) => {
              handleFiltersChange({...filters, state: e.target.value === "" ? undefined : e.target.value});
            }}
            className="h-11"
          >
            <option value="">State</option>
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
        <div className="sm:col-span-2 lg:col-span-1">
          <Button onClick={handleSubmit} className="w-full bg-secondary-orange text-white font-bold hover:bg-orange-600 h-11">
            <Search className="w-4 h-4 mr-2" />
            <span className="sm:hidden lg:inline">Search</span>
            <span className="hidden sm:inline lg:hidden">Search Trucks</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
