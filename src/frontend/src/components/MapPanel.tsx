import { MapPin } from "lucide-react";
import { cityCoordinates } from "../data/sampleListings";

interface MapMarker {
  city: string;
  rent: number;
  count: number;
  lat: number;
  lng: number;
}

interface MapPanelProps {
  markers?: MapMarker[];
  className?: string;
}

// India bounding box approx: lat 8–37, lng 68–97
const mapBounds = { minLat: 6, maxLat: 38, minLng: 66, maxLng: 98 };

function latLngToPercent(lat: number, lng: number) {
  const x =
    ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
  const y =
    ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
  return { x, y };
}

const defaultMarkers: MapMarker[] = Object.entries(cityCoordinates).map(
  ([city, coords], i) => ({
    city,
    rent:
      [28000, 12500, 35000, 11000, 22000, 9500, 18000, 15000, 14000, 8500][i] ??
      15000,
    count: [42, 87, 65, 38, 51, 29, 33, 22, 17, 44][i] ?? 20,
    ...coords,
  }),
);

export default function MapPanel({
  markers = defaultMarkers,
  className = "",
}: MapPanelProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-border bg-surface-sunken ${className}`}
    >
      {/* Dark map background with India outline using CSS gradients */}
      <div className="relative w-full h-full" style={{ minHeight: 380 }}>
        {/* Map background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 60%, oklch(0.18 0.025 230) 0%, oklch(0.12 0.012 220) 70%)
            `,
          }}
        />
        {/* OpenStreetMap iframe with dark tiles */}
        <iframe
          title="NestIndia Map"
          className="absolute inset-0 w-full h-full opacity-60"
          src="https://www.openstreetmap.org/export/embed.html?bbox=66,6,98,38&layer=mapnik&marker=20.5937,78.9629"
          style={{
            border: 0,
            filter:
              "invert(1) hue-rotate(180deg) brightness(0.7) contrast(1.1)",
          }}
          loading="lazy"
        />
        {/* Overlay for contrast */}
        <div className="absolute inset-0 bg-background/30 pointer-events-none" />

        {/* City Markers */}
        {markers.map((marker) => {
          const { x, y } = latLngToPercent(marker.lat, marker.lng);
          return (
            <div
              key={marker.city}
              className="absolute transform -translate-x-1/2 -translate-y-full group"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Price badge */}
              <div className="bg-orange-cta text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap cursor-pointer hover:scale-110 transition-transform">
                ₹
                {marker.rent >= 1000
                  ? `${Math.round(marker.rent / 1000)}k`
                  : marker.rent}
              </div>
              {/* Pin */}
              <div className="flex justify-center">
                <div className="w-2 h-2 bg-orange-cta rounded-full shadow-md" />
              </div>
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg z-10">
                <div className="font-semibold text-foreground">
                  {marker.city}
                </div>
                <div className="text-muted-foreground">
                  {marker.count} listings
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-surface/90 border border-border rounded-lg px-3 py-2 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-orange-cta" />
            <span className="text-muted-foreground">Available listings</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-teal" />
            <span className="text-muted-foreground">
              Tap marker for details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
