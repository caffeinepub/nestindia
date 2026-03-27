import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Bath,
  Car,
  CheckCircle2,
  ChevronLeft,
  Dumbbell,
  ExternalLink,
  Heart,
  Loader2,
  Locate,
  MapPin,
  Phone,
  Share2,
  Shield,
  Star,
  Utensils,
  Wifi,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PropertyStatus, PropertyType } from "../backend.d";
import PropertyCard from "../components/PropertyCard";
import {
  amenityIcons,
  propertyTypeLabels,
  sampleListings,
} from "../data/sampleListings";
import { useGetListing } from "../hooks/useQueries";

const amenityIconMap: Record<string, React.ComponentType<any>> = {
  WiFi: Wifi,
  AC: Zap,
  Parking: Car,
  Security: Shield,
  Gym: Dumbbell,
  Meals: Utensils,
  Water: Bath,
};

function formatCoord(val: number, posLabel: string, negLabel: string): string {
  return `${Math.abs(val).toFixed(4)}°${val >= 0 ? posLabel : negLabel}`;
}

export default function PropertyDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const sampleListing = sampleListings.find((s) => s.id === id);
  const { data: backendListing, isLoading } = useGetListing(
    id && !id.startsWith("sample-") ? id : "",
  );

  const listing = backendListing ?? sampleListing;

  if (isLoading && !sampleListing) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="property_detail.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        data-ocid="property_detail.error_state"
      >
        <h2 className="text-xl font-bold text-foreground mb-2">
          Property Not Found
        </h2>
        <p className="text-muted-foreground mb-4">
          This listing may have been removed or is no longer available.
        </p>
        <Button
          onClick={() => navigate({ to: "/explore" })}
          className="bg-teal text-white"
        >
          Browse Other Properties
        </Button>
      </div>
    );
  }

  const images: string[] =
    "images" in listing && listing.images.length > 0
      ? listing.images.map((img: any) =>
          typeof img === "string" ? img : (img.getDirectURL?.() ?? ""),
        )
      : [
          "/assets/generated/listing-1.dim_600x400.jpg",
          "/assets/generated/listing-4.dim_600x400.jpg",
        ];

  const rent =
    typeof listing.rentPerMonth === "bigint"
      ? Number(listing.rentPerMonth)
      : (listing.rentPerMonth as number);
  const rating = (listing as any).rating ?? 4.5;
  const reviewCount = (listing as any).reviewCount ?? 0;
  const isAvailable =
    listing.status === PropertyStatus.available ||
    (listing.status as any) === "available";

  const lat = (listing as any).lat as number | undefined;
  const lng = (listing as any).lng as number | undefined;
  const hasGps = lat !== undefined && lng !== undefined;

  const similar = sampleListings
    .filter(
      (s) =>
        s.id !== id &&
        (s.propertyType === listing.propertyType || s.city === listing.city),
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen">
      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/explore" })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
          data-ocid="property_detail.back.button"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Explore
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Gallery + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="aspect-video rounded-2xl overflow-hidden">
                <img
                  src={images[activeImg]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      type="button"
                      key={img}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        activeImg === i ? "border-teal" : "border-border"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Title + Meta */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {listing.address}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFav(!isFav);
                      toast(
                        isFav ? "Removed from favorites" : "Added to favorites",
                      );
                    }}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-teal transition-colors"
                    data-ocid="property_detail.favorite.button"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      toast.success("Link copied!");
                    }}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:border-teal transition-colors"
                    data-ocid="property_detail.share.button"
                  >
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="bg-teal/20 text-teal border-teal/30">
                  {propertyTypeLabels[listing.propertyType]}
                </Badge>
                <Badge
                  className={`${isAvailable ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                >
                  {isAvailable ? "Available" : "Rented"}
                </Badge>
                {rating > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-300">
                      {rating.toFixed(1)}
                    </span>
                    {reviewCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="card-surface rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3">
                About this property
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="card-surface rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => {
                  const IconComp = amenityIconMap[amenity];
                  const emoji = amenityIcons[amenity];
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-raised border border-border text-sm text-foreground"
                    >
                      {IconComp ? (
                        <IconComp className="w-4 h-4 text-teal" />
                      ) : emoji ? (
                        <span>{emoji}</span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-teal" />
                      )}
                      {amenity}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Contact + Price card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="card-surface rounded-xl p-5">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-teal">
                    ₹{rent.toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>

                <div className="space-y-2 mb-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City</span>
                    <span className="text-foreground font-medium">
                      {listing.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area</span>
                    <span className="text-foreground font-medium">
                      {listing.area}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground font-medium">
                      {propertyTypeLabels[listing.propertyType]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="text-foreground font-medium">
                      {listing.ownerName}
                    </span>
                  </div>
                  {/* GPS row */}
                  {hasGps && (
                    <div className="flex justify-between items-center pt-1 border-t border-border/40">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Locate className="w-3 h-3" /> GPS
                      </span>
                      <span className="text-foreground font-mono text-xs">
                        {formatCoord(lat!, "N", "S")},&nbsp;
                        {formatCoord(lng!, "E", "W")}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-orange-cta hover:bg-orange-ctadark text-white rounded-xl py-3 gap-2"
                  onClick={() => {
                    toast.success(`Connecting you with ${listing.ownerName}…`);
                  }}
                  data-ocid="property_detail.contact_owner.primary_button"
                >
                  <Phone className="w-4 h-4" /> Contact Owner
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Free, direct contact. No brokerage.
                </p>
              </div>

              {/* Phone */}
              <div className="card-surface rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal/20 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-teal" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">
                    {listing.contactPhone}
                  </p>
                </div>
              </div>

              {/* Embedded map */}
              {hasGps && (
                <div className="card-surface rounded-xl overflow-hidden">
                  <div className="relative">
                    <iframe
                      title="Property Location"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng! - 0.005},${lat! - 0.005},${lng! + 0.005},${lat! + 0.005}&layer=mapnik&marker=${lat},${lng}`}
                      style={{
                        width: "100%",
                        height: "200px",
                        border: "none",
                        filter:
                          "invert(1) hue-rotate(180deg) brightness(0.7) contrast(1.1)",
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Exact location
                    </span>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal hover:text-teal/80 flex items-center gap-1 transition-colors"
                      data-ocid="property_detail.map.link"
                    >
                      View on Map <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-5">
              Similar Properties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similar.map((s, i) => (
                <PropertyCard
                  key={s.id}
                  listing={s}
                  index={i}
                  onClick={() => navigate({ to: `/property/${s.id}` })}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
