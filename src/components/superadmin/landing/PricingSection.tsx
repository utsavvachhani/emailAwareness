import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const tiers = [
  {
    name: "Starter",
    price: "₹4,999",
    period: "/month",
    highlight: "Up to 25 employees",
    popular: false,
    features: [
      "Weekly awareness emails",
      "Real scam examples",
      "Basic quiz questions",
      "Monthly summary report",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    name: "Growth",
    price: "₹199",
    period: "/employee/month",
    highlight: "26–200 employees",
    popular: true,
    features: [
      "Everything in Starter",
      "Custom branding",
      "Department-wise tracking",
      "Detailed analytics",
      "Priority support",
      "Quarterly review calls",
    ],
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    price: "₹399",
    period: "/employee/month",
    highlight: "200+ employees",
    popular: false,
    features: [
      "Everything in Growth",
      "Phishing simulations",
      "Advanced reporting",
      "Dedicated account manager",
      "Custom content options",
      "API integration",
    ],
    cta: "Contact Sales",
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="section-padding">
      <div className="section-container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent pricing for businesses of all sizes.
          </p>
        </AnimatedSection>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <AnimatedSection
                key={tier.name}
                animation="fade-up"
                delay={index * 150}
              >
                <div
                  className={`relative h-full flex flex-col rounded-lg border-2 p-6 transition-all ${tier.popular
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background"
                    }`}
                >
                  {/* Popular badge */}
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-background text-foreground text-xs font-semibold rounded-full border border-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-4">
                    <h3 className={`text-lg font-bold mb-1 ${tier.popular ? "text-background" : "text-foreground"}`}>
                      {tier.name}
                    </h3>
                    <p className={`text-xs ${tier.popular ? "text-background/70" : "text-muted-foreground"}`}>
                      {tier.highlight}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold ${tier.popular ? "text-background" : "text-foreground"}`}>
                        {tier.price}
                      </span>
                      <span className={`text-sm ${tier.popular ? "text-background/70" : "text-muted-foreground"}`}>
                        {tier.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-grow">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.popular ? "text-background" : "text-foreground"}`} strokeWidth={2} />
                        <span className={`text-sm ${tier.popular ? "text-background/90" : "text-foreground"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    variant={tier.popular ? "outline" : "default"}
                    className={`w-full ${tier.popular ? "border-background text-black hover:bg-black hover:text-white" : ""}`}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Note */}
          <AnimatedSection className="text-center mt-8" delay={500}>
            <p className="text-sm text-muted-foreground">
              Annual discounts available. Contact us for custom requirements.
            </p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
