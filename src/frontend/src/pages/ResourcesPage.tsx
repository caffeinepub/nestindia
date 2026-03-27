import { BookOpen, FileText, HelpCircle, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

const articles = [
  {
    title: "How to Find the Perfect PG in Hyderabad",
    category: "Guide",
    readTime: "5 min",
    desc: "A complete guide to finding paying guest accommodations in Hyderabad, covering neighborhoods, price ranges, and what to look for.",
  },
  {
    title: "Tenant Rights in India: What You Should Know",
    category: "Legal",
    readTime: "8 min",
    desc: "Understanding your rights as a tenant under Indian rental law, including security deposits, notice periods, and dispute resolution.",
  },
  {
    title: "2BHK vs 1BHK: Which is Right for You?",
    category: "Guide",
    readTime: "4 min",
    desc: "A practical comparison to help you decide between a 1BHK and 2BHK apartment based on budget, lifestyle, and location.",
  },
  {
    title: "Renting Tips for Working Professionals in Bangalore",
    category: "Tips",
    readTime: "6 min",
    desc: "Essential advice for IT professionals moving to Bangalore, from navigating neighborhoods to negotiating rent with landlords.",
  },
  {
    title: "Understanding Rental Agreements in India",
    category: "Legal",
    readTime: "7 min",
    desc: "Everything you need to know about rental agreements, including key clauses, registration requirements, and common pitfalls to avoid.",
  },
  {
    title: "Moving to Mumbai on a Budget",
    category: "Tips",
    readTime: "5 min",
    desc: "Practical strategies for finding affordable accommodation in Mumbai without compromising on safety or connectivity.",
  },
];

const categoryColors: Record<string, string> = {
  Guide: "bg-teal/20 text-teal border-teal/30",
  Legal: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Tips: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Resources</h1>
          <p className="text-muted-foreground">
            Guides, tips, and legal information for tenants and property owners
            in India.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, i) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card-surface rounded-xl p-5 cursor-pointer hover:border-teal/50 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[article.category] ?? ""}`}
                >
                  {article.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {article.readTime} read
                </span>
              </div>
              <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 group-hover:text-teal transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {article.desc}
              </p>
            </motion.article>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-12 card-surface rounded-2xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is NestIndia free to use?",
                a: "Yes! Browsing and contacting owners is completely free for tenants. Owners can list properties for free too.",
              },
              {
                q: "How do I verify a listing is genuine?",
                a: "All listings go through our verification process. Look for the Verified badge on listings.",
              },
              {
                q: "Can I visit a property before committing?",
                a: "Absolutely! We encourage direct visits. Use the contact button to reach the owner and schedule a visit.",
              },
              {
                q: "Is there a security deposit?",
                a: "Deposits are between you and the owner. NestIndia does not handle financial transactions.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <p className="font-medium text-foreground text-sm mb-1">
                  {faq.q}
                </p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
