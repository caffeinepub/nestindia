import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Crosshair,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { PropertyStatus, PropertyType } from "../backend.d";
import type { SearchFilters } from "../backend.d";
import AISearchBar from "../components/AISearchBar";
import FiltersSidebar, {
  type FiltersState,
} from "../components/FiltersSidebar";
import MapPanel from "../components/MapPanel";
import PropertyCard from "../components/PropertyCard";
import { sampleListings } from "../data/sampleListings";
import { useGetAllListings } from "../hooks/useQueries";

const defaultFilters: FiltersState = {
  city: "All Cities",
  propertyTypes: [],
  minRent: 5000,
  maxRent: 500000,
};

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as any;
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [activeSearch, setActiveSearch] = useState(searchParams?.q ?? "");
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const { data: backendListings, isLoading } = useGetAllListings();

  const allListings = useMemo(() => {
    const backend = backendListings ?? [];
    const backendIds = new Set(backend.map((l) => l.id));
    const samples = sampleListings.filter((s) => !backendIds.has(s.id));
    return [...backend, ...samples];
  }, [backendListings]);

  const filteredListings = useMemo(() => {
    const filtered = allListings.filter((listing) => {
      const rent =
        typeof listing.rentPerMonth === "bigint"
          ? Number(listing.rentPerMonth)
          : (listing.rentPerMonth as number);
      const city = listing.city.toLowerCase();
      const filterCity = filters.city.toLowerCase();

      if (filters.city !== "All Cities" && city !== filterCity) return false;
      if (rent < filters.minRent || rent > filters.maxRent) return false;
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(listing.propertyType)
      )
        return false;
      if (activeSearch) {
        const q = activeSearch.toLowerCase();
        const matchesCity = city.includes(q);
        const matchesTitle = listing.title.toLowerCase().includes(q);
        const matchesArea = listing.area.toLowerCase().includes(q);
        if (!matchesCity && !matchesTitle && !matchesArea) return false;
      }
      return true;
    });

    if (userCoords) {
      return [...filtered].sort((a, b) => {
        const aLat = (a as any).lat ?? 0;
        const aLng = (a as any).lng ?? 0;
        const bLat = (b as any).lat ?? 0;
        const bLng = (b as any).lng ?? 0;
        const distA = haversineDistance(
          userCoords.lat,
          userCoords.lng,
          aLat,
          aLng,
        );
        const distB = haversineDistance(
          userCoords.lat,
          userCoords.lng,
          bLat,
          bLng,
        );
        return distA - distB;
      });
    }

    return filtered;
  }, [allListings, filters, activeSearch, userCoords]);

  const handleSearch = (_: SearchFilters, query: string) => {
    setIsSearching(true);
    setActiveSearch(query);
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      () => {
        setLocationError(
          "Unable to access location. Please allow location access.",
        );
        setIsLocating(false);
      },
    );
  };

  const clearNearMe = () => {
    setUserCoords(null);
    setLocationError("");
  };

  const activeFilterCount = [
    filters.city !== "All Cities",
    filters.propertyTypes.length > 0,
    filters.minRent > 5000 || filters.maxRent < 500000,
  ].filter(Boolean).length;

  const NearMeButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleNearMe}
      disabled={isLocating}
      className="gap-2 border-teal text-teal hover:bg-teal/10"
      data-ocid="explore.near_me.button"
    >
      {isLocating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Crosshair className="w-4 h-4" />
      )}
      Near Me
    </Button>
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="bg-surface border-b border-border px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Explore Properties
          </h1>
          <AISearchBar onSearch={handleSearch} isLoading={isSearching} />
        </div>
      </section>

      {/* Location error toast */}
      {locationError && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm"
            data-ocid="explore.location.error_state"
          >
            <span>{locationError}</span>
            <button
              type="button"
              onClick={() => setLocationError("")}
              className="ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile controls */}
        <div className="flex items-center gap-2 mb-4 lg:hidden flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 border-border"
            data-ocid="explore.toggle_filters.button"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="bg-teal text-white border-0 text-xs w-5 h-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="gap-2 border-border"
            data-ocid="explore.toggle_map.button"
          >
            <MapPin className="w-4 h-4" />
            {showMap ? "Hide Map" : "Show Map"}
          </Button>
          {NearMeButton}
          {userCoords && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNearMe}
              className="gap-1 text-muted-foreground"
              data-ocid="explore.clear_near_me.button"
            >
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
          <div className="ml-auto text-sm text-muted-foreground">
            {filteredListings.length} listings
            {userCoords && (
              <span className="ml-2 text-teal text-xs font-medium">
                📍 Near you
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <div
            className={`lg:block lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden"}`}
          >
            <FiltersSidebar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="items-center justify-between mb-4 hidden lg:flex">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {filteredListings.length}
                </span>{" "}
                properties found
                {activeSearch && (
                  <>
                    {" "}
                    for <span className="text-teal">"{activeSearch}"</span>
                  </>
                )}
                {userCoords && (
                  <span className="ml-2 inline-flex items-center gap-1 bg-teal/10 text-teal text-xs font-medium px-2 py-0.5 rounded-full">
                    <Crosshair className="w-3 h-3" /> Sorted by distance
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                {userCoords && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNearMe}
                    className="gap-1 text-muted-foreground text-xs"
                    data-ocid="explore.clear_near_me_desktop.button"
                  >
                    <X className="w-3 h-3" /> Clear Near Me
                  </Button>
                )}
                {NearMeButton}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="gap-2 border-border"
                  data-ocid="explore.map_toggle.button"
                >
                  <MapPin className="w-4 h-4" />
                  {showMap ? "Hide Map" : "Show Map"}
                </Button>
              </div>
            </div>

            {/* Map panel */}
            {showMap && (
              <div className="mb-6">
                <MapPanel className="h-72" />
              </div>
            )}

            {/* Listings */}
            {isLoading || isSearching ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="explore.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin text-teal" />
                <span className="ml-3 text-muted-foreground">
                  Finding best matches…
                </span>
              </div>
            ) : filteredListings.length === 0 ? (
              <div
                className="text-center py-20"
                data-ocid="explore.empty_state"
              >
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No properties found
                </h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your filters or search query.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-teal text-teal"
                  onClick={() => {
                    setFilters(defaultFilters);
                    setActiveSearch("");
                  }}
                  data-ocid="explore.clear_filters.button"
                >
                  <X className="w-4 h-4 mr-2" /> Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredListings.map((listing, i) => (
                  <PropertyCard
                    key={listing.id}
                    listing={listing as any}
                    index={i}
                    onClick={() => navigate({ to: `/property/${listing.id}` })}
                    data-ocid={`explore.property.item.${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
