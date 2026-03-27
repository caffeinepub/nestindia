import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  Home,
  Info,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavbarProps {
  userProfile: UserProfile | null;
}

export default function Navbar({ userProfile }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (err: any) {
        if (err?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/explore", label: "Explore", icon: Search },
    { to: "/about", label: "About Us", icon: Info },
    { to: "/resources", label: "Resources", icon: BookOpen },
  ];

  const initials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Nest<span className="text-teal">India</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-ocid={`nav.${link.label.toLowerCase().replace(/ /g, "_")}.link`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="nav.dashboard.link"
              >
                Become a Host
              </Link>
            )}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:border-teal transition-colors"
                    data-ocid="nav.user.dropdown_menu"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-teal text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground">
                      {userProfile?.name ?? "Account"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-surface border-border"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="cursor-pointer"
                      data-ocid="nav.profile.link"
                    >
                      <User className="w-4 h-4 mr-2" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/dashboard"
                      className="cursor-pointer"
                      data-ocid="nav.owner_dashboard.link"
                    >
                      <Building2 className="w-4 h-4 mr-2" /> My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleAuth}
                    className="text-destructive cursor-pointer"
                    data-ocid="nav.logout.button"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAuth}
                  disabled={isLoggingIn}
                  className="text-muted-foreground hover:text-foreground"
                  data-ocid="nav.signup.button"
                >
                  Sign Up
                </Button>
                <Button
                  size="sm"
                  onClick={handleAuth}
                  disabled={isLoggingIn}
                  className="rounded-full bg-teal hover:bg-teal-dark text-white px-5"
                  data-ocid="nav.login.button"
                >
                  {isLoggingIn ? "Logging in..." : "Log In"}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-ocid="nav.mobile_menu.button"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground py-2"
              onClick={() => setMobileOpen(false)}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border flex gap-3">
            <Button
              className="flex-1 rounded-full bg-teal hover:bg-teal-dark text-white"
              onClick={() => {
                handleAuth();
                setMobileOpen(false);
              }}
              disabled={isLoggingIn}
              data-ocid="nav.mobile_login.button"
            >
              {isAuthenticated
                ? "Sign Out"
                : isLoggingIn
                  ? "Logging in..."
                  : "Log In"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
