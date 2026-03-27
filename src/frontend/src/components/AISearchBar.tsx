import { Button } from "@/components/ui/button";
import { Loader2, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { PropertyType } from "../backend.d";
import type { SearchFilters } from "../backend.d";

interface AISearchBarProps {
  onSearch: (filters: SearchFilters, query: string) => void;
  isLoading?: boolean;
  className?: string;
}

function parseQueryToFilters(query: string): SearchFilters {
  const q = query.toLowerCase();
  const filters: SearchFilters = {};

  // City detection
  const cities = [
    "hyderabad",
    "bangalore",
    "bengaluru",
    "mumbai",
    "delhi",
    "chennai",
    "pune",
    "kolkata",
    "ahmedabad",
    "jaipur",
    "lucknow",
    "noida",
    "gurgaon",
    "secunderabad",
  ];
  for (const city of cities) {
    if (q.includes(city)) {
      filters.city = city.charAt(0).toUpperCase() + city.slice(1);
      if (city === "bengaluru") filters.city = "Bangalore";
      if (city === "secunderabad") filters.city = "Hyderabad";
      break;
    }
  }

  // Property type detection
  if (q.includes("2bhk") || q.includes("2 bhk") || q.includes("two bhk"))
    filters.propertyType = PropertyType.bhk2;
  else if (q.includes("1bhk") || q.includes("1 bhk") || q.includes("one bhk"))
    filters.propertyType = PropertyType.bhk1;
  else if (q.includes("pg") || q.includes("paying guest"))
    filters.propertyType = PropertyType.pg;
  else if (q.includes("studio")) filters.propertyType = PropertyType.studio;
  else if (q.includes("bachelor"))
    filters.propertyType = PropertyType.bachelorRoom;
  else if (q.includes("hostel")) filters.propertyType = PropertyType.hostel;

  // Rent detection
  const rentMatches = q.match(/(\d+)\s*k/g);
  if (rentMatches) {
    const rents = rentMatches.map((m) => Number.parseInt(m) * 1000);
    if (rents.length >= 2) {
      filters.minRent = BigInt(Math.min(...rents));
      filters.maxRent = BigInt(Math.max(...rents));
    } else if (
      q.includes("under") ||
      q.includes("below") ||
      q.includes("less than")
    ) {
      filters.maxRent = BigInt(rents[0]);
    } else if (
      q.includes("above") ||
      q.includes("more than") ||
      q.includes("over")
    ) {
      filters.minRent = BigInt(rents[0]);
    } else {
      filters.maxRent = BigInt(rents[0]);
    }
  }

  // Keyword fallback
  if (!filters.city && !filters.propertyType) {
    filters.keyword = query.trim();
  }

  return filters;
}

export default function AISearchBar({
  onSearch,
  isLoading,
  className = "",
}: AISearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    const filters = parseQueryToFilters(query);
    onSearch(filters, query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const suggestions = [
    "2BHK in Hyderabad under 25k",
    "PG near Koramangala",
    "Bachelor rooms Delhi",
    "Studio apartment Mumbai",
  ];

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="relative glow-teal rounded-2xl">
        <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3 focus-within:border-teal transition-colors">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by City, Area, or Property Type… (e.g., Hyderabad, 2BHK, PG)"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none min-w-0"
            data-ocid="search.input"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="flex-shrink-0 rounded-xl bg-orange-cta hover:bg-orange-ctadark text-white font-medium px-5 py-2 text-sm gap-2"
            data-ocid="search.primary_button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Search with AI
          </Button>
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {suggestions.map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => {
              setQuery(s);
              onSearch(parseQueryToFilters(s), s);
            }}
            className="text-xs px-3 py-1.5 rounded-full bg-surface border border-border text-muted-foreground hover:border-teal hover:text-teal transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
