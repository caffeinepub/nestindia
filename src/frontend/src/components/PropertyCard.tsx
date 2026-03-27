import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, Locate, MapPin, MessageCircle, Star } from "lucide-react";
import { motion } from "motion/react";
import type { PropertyListing } from "../backend.d";
import { PropertyStatus, PropertyType } from "../backend.d";
import type { SampleListing } from "../data/sampleListings";
import { formatRent, propertyTypeLabels } from "../data/sampleListings";

const typeColors: Record<PropertyType, string> = {
  [PropertyType.bhk2]: "bg-teal/20 text-teal border-teal/30",
  [PropertyType.bhk1]: "bg-teal/20 text-teal border-teal/30",
  [PropertyType.pg]: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  [PropertyType.studio]: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  [PropertyType.bachelorRoom]:
    "bg-orange-500/20 text-orange-300 border-orange-500/30",
  [PropertyType.hostel]: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

interface PropertyCardProps {
  listing: SampleListing | PropertyListing;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  index?: number;
}

function getImage(listing: SampleListing | PropertyListing): string {
  if ("images" in listing && listing.images.length > 0) {
    const img = listing.images[0];
    if (typeof img === "string") return img;
    if (img && typeof (img as any).getDirectURL === "function") {
      return (img as any).getDirectURL();
    }
  }
  return `https://picsum.photos/seed/${listing.id}/600/400`;
}

function formatCoord(val: number, posLabel: string, negLabel: string): string {
  return `${Math.abs(val).toFixed(4)}°${val >= 0 ? posLabel : negLabel}`;
}

export default function PropertyCard({
  listing,
  onClick,
  isFavorite,
  onToggleFavorite,
  index = 0,
}: PropertyCardProps) {
  const imageUrl = getImage(listing);
  const rent =
    typeof listing.rentPerMonth === "bigint"
      ? Number(listing.rentPerMonth)
      : (listing.rentPerMonth as number);
  const isAvailable =
    listing.status === PropertyStatus.available ||
    (listing.status as any) === "available";
  const rating = (listing as SampleListing).rating ?? 4.0;
  const reviewCount = (listing as SampleListing).reviewCount ?? 0;
  const contactPhone = (listing as SampleListing).contactPhone ?? "";
  const lat = (listing as any).lat as number | undefined;
  const lng = (listing as any).lng as number | undefined;

  const whatsappHref = contactPhone
    ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in your property: ${listing.title}`)}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group cursor-pointer card-surface rounded-xl overflow-hidden hover:border-teal/50 hover:shadow-glow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
      onClick={onClick}
      data-ocid="property.card"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium border",
              typeColors[listing.propertyType],
            )}
          >
            {propertyTypeLabels[listing.propertyType]}
          </Badge>
        </div>
        {/* Availability */}
        {!isAvailable && (
          <div className="absolute top-3 right-10">
            <Badge className="bg-red-500/80 text-white border-0 text-xs">
              Rented
            </Badge>
          </div>
        )}
        {/* Favorite */}
        {onToggleFavorite && (
          <button
            type="button"
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            data-ocid="property.favorite.button"
          >
            <Heart
              className={cn(
                "w-4 h-4",
                isFavorite ? "fill-red-500 text-red-500" : "text-white",
              )}
            />
          </button>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm leading-snug truncate">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {listing.area}, {listing.city}
          </span>
        </div>
        {/* GPS coordinates */}
        {lat !== undefined && lng !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <Locate className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
            <span className="text-[10px] text-muted-foreground/60 font-mono tracking-tight">
              {formatCoord(lat, "N", "S")}, {formatCoord(lng, "E", "W")}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-teal font-bold text-base">
              {formatRent(rent, listing.city)}
            </span>
            <span className="text-muted-foreground text-xs">/month</span>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-foreground">
                {rating.toFixed(1)}
              </span>
              {reviewCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
        {/* WhatsApp button */}
        {whatsappHref && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              data-ocid="property.whatsapp.button"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat on WhatsApp
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
