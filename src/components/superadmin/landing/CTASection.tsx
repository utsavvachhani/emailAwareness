import { ArrowRight, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const CTASection = () => {
  return (
    <section className="section-padding bg-foreground">
      <div className="section-container">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-background mb-4">
            Protect Your Company Before a Fraud Happens
          </h2>
          <p className="text-lg text-background/70 mb-8 max-w-xl mx-auto">
            Start building a security-aware workforce today. No software, no hassle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-background/30 text-black hover:bg-black hover:text-white hover:border-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Demo
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-background/30 text-black hover:bg-black hover:text-white hover:border-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Get Pricing
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-background/30 text-black hover:bg-black hover:text-white hover:border-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Us
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTASection;
