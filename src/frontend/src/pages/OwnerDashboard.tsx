import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CheckCircle,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PropertyListingInput } from "../backend";
import { ExternalBlob } from "../backend";
import { PropertyStatus, PropertyType } from "../backend.d";
import { globalCities, propertyTypeLabels } from "../data/sampleListings";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateListing,
  useDeleteListing,
  useGetCallerUserProfile,
  useGetListingsByOwner,
  useMarkListingAvailable,
  useMarkListingRented,
} from "../hooks/useQueries";

const amenityOptions = [
  "WiFi",
  "AC",
  "Parking",
  "Gym",
  "Pool",
  "Security",
  "Meals",
  "Laundry",
  "TV",
  "Water",
  "Lift",
  "Power Backup",
  "Study Room",
];

interface ListingFormData {
  title: string;
  ownerName: string;
  propertyType: PropertyType;
  area: string;
  city: string;
  description: string;
  address: string;
  rentPerMonth: string;
  contactPhone: string;
  amenities: string[];
  imageFiles: File[];
}

const defaultForm: ListingFormData = {
  title: "",
  ownerName: "",
  propertyType: PropertyType.bhk2,
  area: "",
  city: "Hyderabad",
  description: "",
  address: "",
  rentPerMonth: "",
  contactPhone: "",
  amenities: [],
  imageFiles: [],
};

export default function OwnerDashboard() {
  const { identity } = useInternetIdentity();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ListingFormData>(defaultForm);
  const [uploadProgress, setUploadProgress] = useState(0);

  const ownerId = identity?.getPrincipal().toString();
  const { data: profile } = useGetCallerUserProfile();
  const { data: listings, isLoading } = useGetListingsByOwner(ownerId);
  const createListing = useCreateListing();
  const deleteListing = useDeleteListing();
  const markRented = useMarkListingRented();
  const markAvailable = useMarkListingAvailable();

  const handleAmenity = (a: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setForm((prev) => ({ ...prev, imageFiles: files }));
  };

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.area ||
      !form.city ||
      !form.rentPerMonth ||
      !form.contactPhone
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setUploadProgress(0);
      const images: ExternalBlob[] = await Promise.all(
        form.imageFiles.map(async (file) => {
          const bytes = new Uint8Array(await file.arrayBuffer());
          return ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
            setUploadProgress(pct),
          );
        }),
      );

      const input: PropertyListingInput = {
        title: form.title,
        ownerName: form.ownerName || profile?.name || "Owner",
        propertyType: form.propertyType,
        area: form.area,
        city: form.city,
        description: form.description,
        address: form.address,
        rentPerMonth: BigInt(Number.parseInt(form.rentPerMonth, 10)),
        contactPhone: form.contactPhone,
        amenities: form.amenities,
        images,
      };

      await createListing.mutateAsync(input);
      toast.success("Property listed successfully!");
      setShowForm(false);
      setForm(defaultForm);
    } catch {
      toast.error("Failed to create listing. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteListing.mutateAsync(deleteId);
      toast.success("Listing deleted.");
    } catch {
      toast.error("Failed to delete listing.");
    } finally {
      setDeleteId(null);
    }
  };

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">
          Sign In to Manage Listings
        </h2>
        <p className="text-muted-foreground">
          Log in to add and manage your property listings.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your property listings
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-teal hover:bg-teal-dark text-white rounded-xl gap-2"
            data-ocid="dashboard.add_listing.primary_button"
          >
            <Plus className="w-4 h-4" /> Add Listing
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total",
              value: listings?.length ?? 0,
              color: "text-foreground",
            },
            {
              label: "Available",
              value:
                listings?.filter((l) => l.status === PropertyStatus.available)
                  .length ?? 0,
              color: "text-teal",
            },
            {
              label: "Rented",
              value:
                listings?.filter((l) => l.status === PropertyStatus.rented)
                  .length ?? 0,
              color: "text-orange-cta",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-surface rounded-xl p-5 text-center"
            >
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Listings */}
        {isLoading ? (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="dashboard.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-teal" />
          </div>
        ) : !listings || listings.length === 0 ? (
          <div
            className="text-center py-20 card-surface rounded-xl"
            data-ocid="dashboard.listings.empty_state"
          >
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">
              No listings yet
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your first property to start attracting tenants.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-teal text-white gap-2"
              data-ocid="dashboard.first_listing.button"
            >
              <Plus className="w-4 h-4" /> Add Your First Listing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-surface rounded-xl p-5 flex gap-4"
                data-ocid={`dashboard.listing.item.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground truncate">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {listing.area}, {listing.city}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={
                        listing.status === PropertyStatus.available
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {listing.status === PropertyStatus.available
                        ? "Available"
                        : "Rented"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-teal" />
                      <span className="text-sm font-semibold text-teal">
                        {Number(listing.rentPerMonth).toLocaleString("en-IN")}
                        /mo
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {propertyTypeLabels[listing.propertyType]}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-col sm:flex-row">
                  {listing.status === PropertyStatus.available ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-cta/50 text-orange-cta hover:bg-orange-cta/10 text-xs"
                      onClick={() => markRented.mutate(listing.id)}
                      disabled={markRented.isPending}
                      data-ocid={`dashboard.mark_rented.button.${i + 1}`}
                    >
                      <Clock className="w-3.5 h-3.5 mr-1" /> Mark Rented
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-teal/50 text-teal hover:bg-teal/10 text-xs"
                      onClick={() => markAvailable.mutate(listing.id)}
                      disabled={markAvailable.isPending}
                      data-ocid={`dashboard.mark_available.button.${i + 1}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark
                      Available
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 text-xs"
                    onClick={() => setDeleteId(listing.id)}
                    data-ocid={`dashboard.delete.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Listing Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="bg-surface border-border max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="dashboard.add_listing.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              List a New Property
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="form-title"
                  className="text-foreground mb-1.5 block"
                >
                  Title *
                </Label>
                <Input
                  id="form-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g., Spacious 2BHK in Banjara Hills"
                  className="bg-surface-raised border-border"
                  data-ocid="listing_form.title.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="form-owner"
                  className="text-foreground mb-1.5 block"
                >
                  Owner Name
                </Label>
                <Input
                  id="form-owner"
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ownerName: e.target.value }))
                  }
                  placeholder={profile?.name ?? "Your name"}
                  className="bg-surface-raised border-border"
                  data-ocid="listing_form.owner_name.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="form-type"
                  className="text-foreground mb-1.5 block"
                >
                  Property Type *
                </Label>
                <Select
                  value={form.propertyType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, propertyType: v as PropertyType }))
                  }
                >
                  <SelectTrigger
                    id="form-type"
                    className="bg-surface-raised border-border"
                    data-ocid="listing_form.type.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    {Object.values(PropertyType).map((t) => (
                      <SelectItem key={t} value={t}>
                        {propertyTypeLabels[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="form-city"
                  className="text-foreground mb-1.5 block"
                >
                  City *
                </Label>
                <Select
                  value={form.city}
                  onValueChange={(v) => setForm((p) => ({ ...p, city: v }))}
                >
                  <SelectTrigger
                    id="form-city"
                    className="bg-surface-raised border-border"
                    data-ocid="listing_form.city.select"
                  >
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    {globalCities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="form-area"
                  className="text-foreground mb-1.5 block"
                >
                  Area *
                </Label>
                <Input
                  id="form-area"
                  value={form.area}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, area: e.target.value }))
                  }
                  placeholder="e.g., Banjara Hills"
                  className="bg-surface-raised border-border"
                  data-ocid="listing_form.area.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="form-rent"
                  className="text-foreground mb-1.5 block"
                >
                  Rent/Month *
                </Label>
                <Input
                  id="form-rent"
                  type="number"
                  value={form.rentPerMonth}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rentPerMonth: e.target.value }))
                  }
                  placeholder="15000"
                  className="bg-surface-raised border-border"
                  data-ocid="listing_form.rent.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="form-phone"
                  className="text-foreground mb-1.5 block"
                >
                  Contact Phone *
                </Label>
                <Input
                  id="form-phone"
                  value={form.contactPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contactPhone: e.target.value }))
                  }
                  placeholder="+1 555 000 0000 or +91 98765 43210"
                  className="bg-surface-raised border-border"
                  data-ocid="listing_form.phone.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="form-address"
                  className="text-foreground mb-1.5 block"
                >
                  Address
                </Label>
                <Input
                  id="form-address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Full address"
                  className="bg-surface-raised border-border"
                  data-ocid="listing_form.address.input"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="form-desc"
                className="text-foreground mb-1.5 block"
              >
                Description
              </Label>
              <Textarea
                id="form-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Describe your property..."
                rows={3}
                className="bg-surface-raised border-border"
                data-ocid="listing_form.description.textarea"
              />
            </div>

            <div>
              <Label className="text-foreground mb-3 block">Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((a) => (
                  <label
                    key={a}
                    htmlFor={`amenity-${a}`}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <Checkbox
                      id={`amenity-${a}`}
                      checked={form.amenities.includes(a)}
                      onCheckedChange={() => handleAmenity(a)}
                      className="border-border"
                      data-ocid={`listing_form.amenity.${a.toLowerCase().replace(/ /g, "_")}.checkbox`}
                    />
                    <span className="text-sm text-muted-foreground">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-foreground mb-1.5 block">
                Property Photos
              </Label>
              <button
                type="button"
                className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-teal/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("photo-upload")?.click()}
                data-ocid="listing_form.photos.dropzone"
              >
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  data-ocid="listing_form.photos.upload_button"
                />
                {form.imageFiles.length > 0 ? (
                  <p className="text-sm text-teal">
                    {form.imageFiles.length} photo(s) selected
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click to upload photos (optional)
                  </p>
                )}
              </button>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => {
                  setShowForm(false);
                  setForm(defaultForm);
                }}
                data-ocid="listing_form.cancel.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-teal hover:bg-teal-dark text-white"
                onClick={handleSubmit}
                disabled={createListing.isPending}
                data-ocid="listing_form.submit.submit_button"
              >
                {createListing.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Listing…
                  </>
                ) : (
                  "List Property"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent
          className="bg-surface border-border"
          data-ocid="dashboard.delete_confirm.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Listing?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. The listing will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border"
              data-ocid="dashboard.delete_confirm.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/80 text-white"
              data-ocid="dashboard.delete_confirm.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
