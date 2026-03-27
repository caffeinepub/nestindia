import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Edit,
  Heart,
  Loader2,
  LogOut,
  Phone,
  Save,
  Star,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PropertyCard from "../components/PropertyCard";
import { sampleListings } from "../data/sampleListings";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetListingsByOwner,
  useGetUserFavorites,
  useSaveUserProfile,
} from "../hooks/useQueries";

export default function ProfilePage() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const saveProfile = useSaveUserProfile();
  const { data: favorites } = useGetUserFavorites();

  const ownerId = identity?.getPrincipal().toString();
  const { data: myListings } = useGetListingsByOwner(ownerId);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        role: profile?.role ?? "tenant",
      });
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/" });
  };

  const favListings = sampleListings.filter((s) => favorites?.includes(s.id));

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <User className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">
          Sign In to View Profile
        </h2>
        <p className="text-muted-foreground">
          Log in to access your profile and favorites.
        </p>
      </div>
    );
  }

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile card */}
          <div className="card-surface rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-2xl bg-teal text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!editing ? (
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      {profileLoading
                        ? "Loading..."
                        : (profile?.name ?? "Anonymous")}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {profile?.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {profile.phone}
                        </span>
                      ) : (
                        "No phone set"
                      )}
                    </p>
                    <Badge className="mt-2 bg-teal/20 text-teal border-teal/30 capitalize text-xs">
                      {profile?.role ?? "tenant"}
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Name
                      </Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-surface-raised border-border mt-1"
                        data-ocid="profile.name.input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Phone
                      </Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-surface-raised border-border mt-1"
                        placeholder="+91 ..."
                        data-ocid="profile.phone.input"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                {editing ? (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saveProfile.isPending}
                    className="bg-teal text-white gap-2"
                    data-ocid="profile.save.save_button"
                  >
                    {saveProfile.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(true)}
                    className="gap-2 border-border"
                    data-ocid="profile.edit.edit_button"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                  data-ocid="profile.logout.button"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            </div>

            {/* Principal */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Principal ID</p>
              <p className="text-xs font-mono text-foreground/60 mt-0.5 truncate">
                {ownerId}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon: Building2,
                label: "Listings",
                value: myListings?.length ?? 0,
              },
              { icon: Heart, label: "Favorites", value: favListings.length },
              { icon: Star, label: "Reviews", value: 0 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-surface rounded-xl p-4 text-center"
              >
                <stat.icon className="w-5 h-5 text-teal mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Favorites */}
          {favListings.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Saved Properties
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favListings.map((l, i) => (
                  <PropertyCard
                    key={l.id}
                    listing={l}
                    index={i}
                    onClick={() => navigate({ to: `/property/${l.id}` })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* My Listings */}
          {myListings && myListings.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">
                My Listings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myListings.slice(0, 4).map((l, i) => (
                  <PropertyCard
                    key={l.id}
                    listing={l as any}
                    index={i}
                    onClick={() => navigate({ to: `/property/${l.id}` })}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
