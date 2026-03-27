import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useQueries";

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"tenant" | "owner">("tenant");
  const saveProfile = useSaveUserProfile();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        role,
      });
      toast.success("Profile saved! Welcome to NestIndia.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-surface border-border max-w-md"
        data-ocid="profile_setup.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">
            Welcome to NestIndia! 🏠
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up your profile to get personalized recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div>
            <Label
              htmlFor="setup-name"
              className="text-foreground mb-1.5 block"
            >
              Your Name
            </Label>
            <Input
              id="setup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ramesh Kumar"
              className="bg-surface-raised border-border"
              data-ocid="profile_setup.name.input"
            />
          </div>

          <div>
            <Label
              htmlFor="setup-phone"
              className="text-foreground mb-1.5 block"
            >
              Phone Number (optional)
            </Label>
            <Input
              id="setup-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="bg-surface-raised border-border"
              data-ocid="profile_setup.phone.input"
            />
          </div>

          <div>
            <Label className="text-foreground mb-3 block">I am a…</Label>
            <RadioGroup
              value={role}
              onValueChange={(v) => setRole(v as "tenant" | "owner")}
              className="grid grid-cols-2 gap-3"
            >
              <label
                htmlFor="role-tenant"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-colors ${
                  role === "tenant"
                    ? "border-teal bg-teal/10"
                    : "border-border hover:border-teal/50"
                }`}
                data-ocid="profile_setup.tenant.radio"
              >
                <RadioGroupItem
                  value="tenant"
                  id="role-tenant"
                  className="sr-only"
                />
                <User
                  className={`w-6 h-6 ${role === "tenant" ? "text-teal" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-sm font-medium ${role === "tenant" ? "text-teal" : "text-muted-foreground"}`}
                >
                  Tenant
                </span>
                <span className="text-xs text-center text-muted-foreground">
                  Looking for a place
                </span>
              </label>
              <label
                htmlFor="role-owner"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-colors ${
                  role === "owner"
                    ? "border-teal bg-teal/10"
                    : "border-border hover:border-teal/50"
                }`}
                data-ocid="profile_setup.owner.radio"
              >
                <RadioGroupItem
                  value="owner"
                  id="role-owner"
                  className="sr-only"
                />
                <Building2
                  className={`w-6 h-6 ${role === "owner" ? "text-teal" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-sm font-medium ${role === "owner" ? "text-teal" : "text-muted-foreground"}`}
                >
                  Owner
                </span>
                <span className="text-xs text-center text-muted-foreground">
                  Listing a property
                </span>
              </label>
            </RadioGroup>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full bg-teal hover:bg-teal-dark text-white rounded-xl py-2.5"
            data-ocid="profile_setup.submit.button"
          >
            {saveProfile.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
