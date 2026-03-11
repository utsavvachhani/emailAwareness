import { ShieldCheck, Bell, Clock, Coins, Building, Download } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Reduced Fraud Risk",
    description: "Employees spot threats before damage is done.",
  },
  {
    icon: Bell,
    title: "Employees Become Alert",
    description: "Security awareness becomes second nature.",
  },
  {
    icon: Clock,
    title: "HR & IT Save Time",
    description: "No need to organize training sessions.",
  },
  {
    icon: Coins,
    title: "Low Cost, High Impact",
    description: "Affordable for any size business.",
  },
  {
    icon: Building,
    title: "Improves Security Culture",
    description: "Builds a company-wide security mindset.",
  },
  {
    icon: Download,
    title: "No Tools, No Installations",
    description: "Works with existing email systems.",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="section-padding bg-secondary">
      <div className="section-container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Benefits for Your Company
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Why leading businesses choose our awareness program.
          </p>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 80}>
                <div className="flex items-start gap-4 p-5 bg-background rounded-lg border border-border h-full">
                  <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-md border border-foreground">
                    <benefit.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {benefit.description}
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

export default BenefitsSection;
