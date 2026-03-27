import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { PropertyType } from "../backend.d";
import { globalCities, propertyTypeLabels } from "../data/sampleListings";

export interface FiltersState {
  city: string;
  propertyTypes: PropertyType[];
  minRent: number;
  maxRent: number;
}

interface FiltersSidebarProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onReset: () => void;
}

const cities = ["All Cities", ...globalCities];

const allPropertyTypes = Object.values(PropertyType) as PropertyType[];

export default function FiltersSidebar({
  filters,
  onChange,
  onReset,
}: FiltersSidebarProps) {
  const toggleType = (type: PropertyType) => {
    const updated = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter((t) => t !== type)
      : [...filters.propertyTypes, type];
    onChange({ ...filters, propertyTypes: updated });
  };

  return (
    <aside className="card-surface rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal" />
          <h3 className="font-semibold text-foreground">Filters</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground gap-1"
          data-ocid="filters.reset.button"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </Button>
      </div>

      {/* City */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-2 block">
          City
        </Label>
        <Select
          value={filters.city}
          onValueChange={(v) => onChange({ ...filters, city: v })}
        >
          <SelectTrigger
            className="bg-surface border-border"
            data-ocid="filters.city.select"
          >
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            {cities.map((c) => (
              <SelectItem key={c} value={c} className="hover:bg-muted">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Types */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Property Type
        </Label>
        <div className="space-y-2.5">
          {allPropertyTypes.map((type) => (
            <div key={type} className="flex items-center gap-2.5">
              <Checkbox
                id={`type-${type}`}
                checked={filters.propertyTypes.includes(type)}
                onCheckedChange={() => toggleType(type)}
                className="border-border"
                data-ocid={`filters.type.${type}.checkbox`}
              />
              <label
                htmlFor={`type-${type}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
              >
                {propertyTypeLabels[type]}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Rent Range */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-1 block">
          Rent Range
        </Label>
        <div className="flex justify-between text-xs text-muted-foreground mb-3">
          <span>{filters.minRent.toLocaleString()}</span>
          <span>{filters.maxRent.toLocaleString()}</span>
        </div>
        <Slider
          min={500}
          max={500000}
          step={500}
          value={[filters.minRent, filters.maxRent]}
          onValueChange={([min, max]) =>
            onChange({ ...filters, minRent: min, maxRent: max })
          }
          className="[&_[role=slider]]:bg-teal [&_[role=slider]]:border-teal"
          data-ocid="filters.rent_range.toggle"
        />
      </div>

      {/* Beds shortcut */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Bedrooms
        </Label>
        <div className="flex gap-2 flex-wrap">
          {["Any", "1", "2", "3+"].map((b) => (
            <button
              type="button"
              key={b}
              className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-teal hover:text-teal transition-colors"
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
