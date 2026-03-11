import { Users, Calendar, Coins, BookOpen, RefreshCw } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const reasons = [
  {
    icon: Users,
    title: "Designed for Normal Employees",
    description: "No technical jargon. Simple language everyone understands.",
  },
  {
    icon: Calendar,
    title: "Simple Weekly Learning",
    description: "Just 2-3 minutes per week. No disruption to work.",
  },
  {
    icon: Coins,
    title: "Affordable for SMEs",
    description: "Pricing that works for small and medium businesses.",
  },
  {
    icon: BookOpen,
    title: "Practical, Real-World Examples",
    description: "Learn from actual scams targeting Indian businesses.",
  },
  {
    icon: RefreshCw,
    title: "Ongoing Protection",
    description: "Continuous learning, not forgotten one-time training.",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="section-container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built specifically for Indian SMEs and their unique challenges.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {reasons.map((reason, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <div className="flex items-start gap-5 p-6 bg-background rounded-lg border border-border">
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-md border border-foreground">
                    <reason.icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {reason.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
