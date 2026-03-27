import { Building2, MapPin, Shield, Star, Users, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About NestIndia
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We’re on a mission to make finding accommodation in India simple,
            transparent, and affordable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {[
            {
              icon: Zap,
              title: "AI-Powered Matching",
              desc: "Our AI understands natural language queries and matches you with the perfect property based on your needs.",
            },
            {
              icon: Shield,
              title: "Verified Listings",
              desc: "Every listing is verified by our team to ensure accuracy and protect both owners and tenants.",
            },
            {
              icon: MapPin,
              title: "Pan-India Coverage",
              desc: "From Hyderabad to Mumbai, Delhi to Chennai — we cover all major cities and are expanding to tier-2 cities.",
            },
            {
              icon: Users,
              title: "Direct Connections",
              desc: "Connect directly with property owners. No middlemen, no brokerage, no hidden charges.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
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

        <div className="card-surface rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Our Numbers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: Building2, value: "10,000+", label: "Listings" },
              { icon: Users, value: "50,000+", label: "Users" },
              { icon: MapPin, value: "50+", label: "Cities" },
              { icon: Star, value: "4.8", label: "Avg Rating" },
            ].map((s) => (
              <div key={s.label}>
                <s.icon className="w-6 h-6 text-teal mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
