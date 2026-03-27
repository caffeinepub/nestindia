import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Home,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { SearchFilters } from "../backend.d";
import AISearchBar from "../components/AISearchBar";
import MapPanel from "../components/MapPanel";
import PropertyCard from "../components/PropertyCard";
import { sampleListings } from "../data/sampleListings";
import {} from "../hooks/useQueries";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchLoading, setSearchLoading] = useState(false);

  const displayedAll = sampleListings.slice(0, 4);

  const handleSearch = (filters: SearchFilters, query: string) => {
    setSearchLoading(true);
    setTimeout(() => {
      setSearchLoading(false);
      navigate({
        to: "/explore",
        search: {
          q: query,
          city: filters.city,
          type: filters.propertyType,
        },
      });
    }, 600);
  };

  const stats = [
    {
      icon: Home,
      label: "Active Listings",
      value: `${sampleListings.length}+`,
    },
    { icon: Users, label: "Happy Tenants", value: "12,000+" },
    { icon: Building2, label: "Cities Covered", value: "200+" },
    { icon: Star, label: "Average Rating", value: "4.6" },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-16 pb-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(ellipse, oklch(0.68 0.12 185), transparent 70%)",
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-teal/20 text-teal border-teal/30 mb-6 px-4 py-1.5">
              <Zap className="w-3 h-3 mr-1" /> AI-Powered Global Property Search
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl font-bold text-foreground leading-tight mb-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Find Your Perfect Home —
            <span className="block text-teal">Anywhere in the World</span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Browse PGs, apartments, studios and rooms across India and globally.
            Connect directly with owners — no brokerage, no hassle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <AISearchBar onSearch={handleSearch} isLoading={searchLoading} />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="card-surface rounded-xl p-5 text-center"
            >
              <stat.icon className="w-5 h-5 text-teal mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured + Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Featured Properties
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Handpicked listings across India
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-teal text-teal hover:bg-teal/10 gap-2"
            onClick={() => navigate({ to: "/explore" })}
            data-ocid="home.explore_all.button"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listings grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedAll.map((listing, i) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                index={i}
                onClick={() => navigate({ to: `/property/${listing.id}` })}
              />
            ))}
          </div>

          {/* Map */}
          <div className="lg:col-span-1">
            <MapPanel className="h-full" />
          </div>
        </div>
      </section>

      {/* More Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Popular Near You
          </h2>
          <Badge className="bg-orange-cta/20 text-orange-cta border-orange-cta/30">
            <TrendingUp className="w-3 h-3 mr-1" /> Trending
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleListings.slice(4, 8).map((listing, i) => (
            <PropertyCard
              key={listing.id}
              listing={listing}
              index={i}
              onClick={() => navigate({ to: `/property/${listing.id}` })}
            />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div
          className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.25 0.06 185) 0%, oklch(0.20 0.04 220) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "url('/assets/generated/hero-apartment.dim_1200x600.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Own a Property?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              List your property on NestIndia and reach thousands of verified
              tenants. No brokerage. Direct connections.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                className="bg-orange-cta hover:bg-orange-ctadark text-white rounded-full px-8 py-3"
                onClick={() => navigate({ to: "/dashboard" })}
                data-ocid="home.list_property.primary_button"
              >
                List Your Property
              </Button>
              <Button
                variant="outline"
                className="border-teal text-teal hover:bg-teal/10 rounded-full px-8 py-3"
                onClick={() => navigate({ to: "/explore" })}
                data-ocid="home.browse.secondary_button"
              >
                Browse Listings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          Why NestIndia?
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Modern tools for modern house hunters
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: "AI-Powered Search",
              desc: "Describe what you want in plain language and let our AI find the perfect match across thousands of listings.",
            },
            {
              icon: Shield,
              title: "Verified Listings",
              desc: "Every property is verified by our team. Chat directly with owners — no middlemen, no hidden charges.",
            },
            {
              icon: MapPin,
              title: "Interactive Maps",
              desc: "Explore properties on a live map, check locality amenities, and see commute times to your workplace.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-surface rounded-xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-teal/20 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-teal" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
