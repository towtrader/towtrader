import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRUCK_BRANDS, bodyManufacturers } from "@shared/dropdown-data";
import type { SearchFilters } from "@shared/schema";

interface FiltersSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function FiltersSidebar({ filters, onFiltersChange }: FiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleMileageChange = (range: string, checked: boolean) => {
    if (!checked) {
      setLocalFilters({...localFilters, mileageMax: undefined});
      return;
    }

    switch (range) {
      case "25000":
        setLocalFilters({...localFilters, mileageMax: 25000});
        break;
      case "50000":
        setLocalFilters({...localFilters, mileageMax: 50000});
        break;
      case "100000":
        setLocalFilters({...localFilters, mileageMax: 100000});
        break;
      default:
        setLocalFilters({...localFilters, mileageMax: undefined});
    }
  };

  const handleChassisManufacturerChange = (manufacturer: string, checked: boolean) => {
    const currentManufacturers = localFilters.chassisManufacturer || [];
    if (checked) {
      setLocalFilters({
        ...localFilters,
        chassisManufacturer: [...currentManufacturers, manufacturer]
      });
    } else {
      setLocalFilters({
        ...localFilters,
        chassisManufacturer: currentManufacturers.filter(m => m !== manufacturer)
      });
    }
  };

  const handleBodyManufacturerChange = (manufacturer: string, checked: boolean) => {
    const currentManufacturers = localFilters.bodyManufacturer || [];
    if (checked) {
      setLocalFilters({
        ...localFilters,
        bodyManufacturer: [...currentManufacturers, manufacturer]
      });
    } else {
      setLocalFilters({
        ...localFilters,
        bodyManufacturer: currentManufacturers.filter(m => m !== manufacturer)
      });
    }
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Refine Your Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Truck Type */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Truck Type</Label>
          <NativeSelect 
            value={localFilters.truckType || "all"} 
            onChange={(e) => {
              const newFilters = {
                ...localFilters,
                truckType: e.target.value === "all" ? undefined : e.target.value
              };
              setLocalFilters(newFilters);
              onFiltersChange(newFilters);
            }}
          >
            <option value="all">All Types</option>
            <option value="heavy-duty">Heavy Duty</option>
            <option value="industrial-carriers">Industrial Carriers</option>
            <option value="integrated">Integrated</option>
            <option value="light-duty">Light Duty</option>
            <option value="rollbacks">Rollbacks</option>
            <option value="rotators">Rotators</option>
          </NativeSelect>
        </div>

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

        {/* Price Range */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.priceMin || ""}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                priceMin: e.target.value ? parseInt(e.target.value) : undefined
              })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.priceMax || ""}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                priceMax: e.target.value ? parseInt(e.target.value) : undefined
              })}
            />
          </div>
        </div>

        {/* Year Range */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Year</Label>
          <div className="grid grid-cols-2 gap-2">
            <NativeSelect 
              value={localFilters.yearMin ? `${localFilters.yearMin}` : "any"} 
              onChange={(e) => setLocalFilters({
                ...localFilters,
                yearMin: e.target.value === "any" ? undefined : parseInt(e.target.value)
              })}
              placeholder="Min Year"
            >
              <option value="any">Any</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
              <option value="2017">2017</option>
              <option value="2016">2016</option>
              <option value="2015">2015</option>
            </NativeSelect>
            <NativeSelect 
              value={localFilters.yearMax ? `${localFilters.yearMax}` : "any"} 
              onChange={(e) => setLocalFilters({
                ...localFilters,
                yearMax: e.target.value === "any" ? undefined : parseInt(e.target.value)
              })}
              placeholder="Max Year"
            >
              <option value="any">Any</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
            </NativeSelect>
          </div>
        </div>

        {/* Mileage */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Mileage</Label>
          <div className="space-y-2">
            {[
              { value: "25000", label: "Under 25,000" },
              { value: "50000", label: "25,000 - 50,000" },
              { value: "100000", label: "50,000 - 100,000" },
              { value: "999999", label: "Over 100,000" }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`mileage-${option.value}`}
                  checked={
                    option.value === "25000" && localFilters.mileageMax === 25000 ||
                    option.value === "50000" && localFilters.mileageMax === 50000 ||
                    option.value === "100000" && localFilters.mileageMax === 100000 ||
                    option.value === "999999" && (localFilters.mileageMax === undefined || localFilters.mileageMax > 100000)
                  }
                  onCheckedChange={(checked) => handleMileageChange(option.value, checked as boolean)}
                />
                <Label htmlFor={`mileage-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Chassis Manufacturer */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Chassis Manufacturer</Label>
          <div className="space-y-2">
            {["Chevrolet", "Ford", "Freightliner", "International", "Isuzu", "Kenworth", "Mack", "Peterbilt", "RAM"].map((manufacturer) => (
              <div key={manufacturer} className="flex items-center space-x-2">
                <Checkbox
                  id={`chassis-manufacturer-${manufacturer}`}
                  checked={localFilters.chassisManufacturer?.includes(manufacturer) || false}
                  onCheckedChange={(checked) => handleChassisManufacturerChange(manufacturer, checked as boolean)}
                />
                <Label htmlFor={`chassis-manufacturer-${manufacturer}`} className="text-sm">
                  {manufacturer}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* State */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">State</Label>
          <NativeSelect 
            value={localFilters.state || ""} 
            onChange={(e) => {
              const newFilters = {
                ...localFilters,
                state: e.target.value === "" ? undefined : e.target.value
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

        {/* Body Manufacturer */}
        <div>
          <Label className="font-medium text-gray-900 mb-3 block">Body Manufacturer</Label>
          <div className="space-y-2">
            {TRUCK_BRANDS.map((manufacturer) => (
              <div key={manufacturer} className="flex items-center space-x-2">
                <Checkbox
                  id={`body-manufacturer-${manufacturer}`}
                  checked={localFilters.bodyManufacturer?.includes(manufacturer) || false}
                  onCheckedChange={(checked) => handleBodyManufacturerChange(manufacturer, checked as boolean)}
                />
                <Label htmlFor={`body-manufacturer-${manufacturer}`} className="text-sm">
                  {manufacturer}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleApplyFilters}
          className="w-full bg-primary-blue hover:bg-dark-blue"
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
